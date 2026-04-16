
import { useState, useEffect } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import {
  Bell,
  Send,
  Users,
  User,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  MessageSquare,
  Crown,
  UserCheck,
  Briefcase,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface NotifUsuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

interface Notificacion {
  id: string;
  tipo: string;
  canal: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  usuario_destino?: NotifUsuario;
}

interface Estadisticas {
  total: number;
  leidas: number;
  no_leidas: number;
}

const TIPO_OPTIONS = ['manual', 'sistema', 'recordatorio', 'confirmacion', 'pago', 'pqrs'];
const CANAL_OPTIONS = ['in_app', 'email', 'ambos'];
const ROL_OPTIONS = ['cliente', 'empleada', 'admin'];

function AdminNotificaciones() {
  const { t } = useTranslation();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Formulario de envío
  const [form, setForm] = useState({
    mensaje: '',
    tipo: 'manual',
    canal: 'in_app',
    destinatario_tipo: 'rol' as 'rol' | 'usuario',
    destinatario_rol: 'cliente',
    destinatario_id: '',
  });

  const token = () => localStorage.getItem('access_token');

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/api/notificaciones/admin/todas`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setNotificaciones(data.notificaciones || []);
      setEstadisticas(data.estadisticas || null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotificaciones(); }, []);

  const handleSend = async () => {
    if (!form.mensaje.trim()) {
      setSendError(t('admin.notifications.form.errors.emptyMessage'));
      return;
    }
    if (form.destinatario_tipo === 'usuario' && !form.destinatario_id.trim()) {
      setSendError(t('admin.notifications.form.errors.emptyUserId'));
      return;
    }

    try {
      setSendLoading(true);
      setSendError(null);
      const payload: Record<string, string> = {
        mensaje: form.mensaje,
        tipo: form.tipo,
        canal: form.canal,
        destinatario_tipo: form.destinatario_tipo,
      };
      if (form.destinatario_tipo === 'rol') {
        payload.destinatario_rol = form.destinatario_rol;
      } else {
        payload.destinatario_id = form.destinatario_id;
      }

      const resp = await fetch(`${API_BASE_URL}/api/notificaciones/admin/enviar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || `HTTP ${resp.status}`);

      setSendSuccess(data.message);
      setForm(prev => ({ ...prev, mensaje: '' }));
      setMostrarFormulario(false);
      await fetchNotificaciones();
      setTimeout(() => setSendSuccess(null), 4000);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setSendLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.notifications.confirmDelete'))) return;
    try {
      await fetch(`${API_BASE_URL}/api/notificaciones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch { /* silently fail */ }
  };

  const getRolIcon = (rol?: string) => {
    switch (rol) {
      case 'admin': return <Crown className="h-3 w-3 text-purple-600" />;
      case 'cliente': return <UserCheck className="h-3 w-3 text-blue-600" />;
      case 'empleada': return <Briefcase className="h-3 w-3 text-green-600" />;
      default: return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'sistema': return 'bg-gray-100 text-gray-800';
      case 'recordatorio': return 'bg-yellow-100 text-yellow-800';
      case 'confirmacion': return 'bg-green-100 text-green-800';
      case 'pago': return 'bg-orange-100 text-orange-800';
      case 'pqrs': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return iso; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#195083]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-[#195083] to-[#4894AD] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E7] mb-1 flex items-center gap-2">
              <Bell className="h-7 w-7" />
              {t('admin.notifications.title')}
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm">{t('admin.notifications.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchNotificaciones}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t('common.retry')}
            </button>
            <button
              onClick={() => setMostrarFormulario(v => !v)}
              className="bg-white text-[#195083] hover:bg-[#F5F0E7] px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Send className="h-4 w-4" />
              {t('admin.notifications.send')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {estadisticas && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('common.total')}</p>
            <p className="text-2xl font-bold text-[#195083]">{estadisticas.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('admin.notifications.stats.read')}</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.leidas}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('admin.notifications.stats.unread')}</p>
            <p className="text-2xl font-bold text-orange-500">{estadisticas.no_leidas}</p>
          </div>
        </div>
      )}

      {/* Feedback messages */}
      {sendSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-800">
          <Check className="h-5 w-5 text-green-600" />
          {sendSuccess}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5 text-red-500" />
          {error}
        </div>
      )}

      {/* Formulario de envío */}
      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-[#195083]" />
              {t('admin.notifications.form.title')}
            </h2>
            <button onClick={() => setMostrarFormulario(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Destinatario tipo */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="rol"
                  checked={form.destinatario_tipo === 'rol'}
                  onChange={() => setForm(p => ({ ...p, destinatario_tipo: 'rol' }))}
                  className="text-[#195083]"
                />
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t('admin.notifications.form.byRole')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="usuario"
                  checked={form.destinatario_tipo === 'usuario'}
                  onChange={() => setForm(p => ({ ...p, destinatario_tipo: 'usuario' }))}
                  className="text-[#195083]"
                />
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t('admin.notifications.form.byUser')}</span>
              </label>
            </div>

            {/* Selector según tipo */}
            {form.destinatario_tipo === 'rol' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.notifications.form.role')}</label>
                <select
                  value={form.destinatario_rol}
                  onChange={e => setForm(p => ({ ...p, destinatario_rol: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                >
                  {ROL_OPTIONS.map(r => (
                    <option key={r} value={r}>{t(`common.roles.${r}`)}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.notifications.form.userId')}</label>
                <input
                  type="text"
                  value={form.destinatario_id}
                  onChange={e => setForm(p => ({ ...p, destinatario_id: e.target.value }))}
                  placeholder="UUID del usuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                />
              </div>
            )}

            {/* Tipo y Canal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.notifications.form.tipo')}</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                >
                  {TIPO_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.notifications.form.canal')}</label>
                <select
                  value={form.canal}
                  onChange={e => setForm(p => ({ ...p, canal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                >
                  {CANAL_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.notifications.form.message')}</label>
              <textarea
                value={form.mensaje}
                onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
                rows={3}
                maxLength={500}
                placeholder={t('admin.notifications.form.messagePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{form.mensaje.length}/500</p>
            </div>

            {sendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {sendError}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setMostrarFormulario(false); setSendError(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSend}
                disabled={sendLoading}
                className="px-5 py-2 bg-[#195083] text-white rounded-lg text-sm font-medium hover:bg-[#0f3a5f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {sendLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t('admin.notifications.form.sendBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-[#195083]" />
          <h2 className="text-lg font-bold text-gray-900">{t('admin.notifications.history')}</h2>
          <span className="text-sm font-normal text-gray-500">({notificaciones.length})</span>
        </div>

        {notificaciones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('admin.notifications.empty')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notificaciones.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 border rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] cursor-pointer ${n.leida ? 'bg-white border-gray-100' : 'bg-blue-50/40 border-blue-200'}`}
                onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
              >
                {/* Indicador leída */}
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${n.leida ? 'bg-gray-300' : 'bg-blue-500'}`} />

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${getTipoColor(n.tipo)}`}>{n.tipo}</span>
                    <span className="text-[10px] text-gray-400">{n.canal}</span>
                    {n.usuario_destino && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {getRolIcon(n.usuario_destino.rol)}
                        {n.usuario_destino.nombre} {n.usuario_destino.apellido}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-1">{n.mensaje}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(n.created_at)}</p>

                  {expandedId === n.id && n.usuario_destino && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
                      <p><span className="font-medium">{t('common.email')}:</span> {n.usuario_destino.correo}</p>
                      <p><span className="font-medium">{t('admin.notifications.userId')}:</span> <span className="font-mono text-xs">{n.usuario_destino.id}</span></p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === n.id ? null : n.id); }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedId === n.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminRole(AdminNotificaciones);
