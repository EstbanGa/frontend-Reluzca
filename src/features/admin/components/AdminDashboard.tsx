import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/dateUtils";
import { API_BASE_URL } from "@/config/env";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  UserCheck,
  XCircle,
  ChevronDown,
  ChevronRight,
  MapPin,
  Home,
  TrendingUp,
  Activity,
  Zap,
  ArrowRight
} from "lucide-react";

interface AdminData {
  message: string;
  admin_info: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  estadisticas_usuarios: {
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_pendientes: number;
    admin_count: number;
    empleadas_count: number;
    clientes_count: number;
    nuevos_usuarios_mes: number;
    nuevos_usuarios_semana: number;
  };
  estadisticas_reservas: {
    total_reservas: number;
    reservas_activas: number;
    reservas_completadas: number;
    reservas_canceladas: number;
    reservas_hoy: number;
    reservas_por_estado: Array<{estado: string, count: number}>;
  };
  estadisticas_financieras: {
    ingresos_totales: number;
    ingresos_mes: number;
  };
  estadisticas_planes: {
    planes_activos: number;
    planes_inactivos: number;
    planes_populares: Array<{id_plan__nombre: string, count: number}>;
  };
  estadisticas_sistema: {
    total_ubicaciones: number;
    ubicaciones_activas: number;
    total_pqrs: number;
    pqrs_pendientes: number;
    pqrs_resueltas: number;
    descuentos_activos: number;
    notificaciones_no_leidas: number;
  };
  datos_recientes: {
    ultimas_empleadas: Array<{
      id: string;
      nombre: string;
      apellido: string;
      correo: string;
      telefono?: string;
      rol: string;
      estado: string;
      calificacion_promedio?: number;
    }>;
    ultimos_clientes: Array<{
      id: string;
      nombre: string;
      apellido: string;
      correo: string;
      [key: string]: unknown;
    }>;
    reservas_recientes: Array<{
      id: string;
      fecha: string;
      estado: string;
      precio_total?: number;
      hora_inicio?: string;
      cliente?: {
        nombre: string;
        apellido?: string;
      };
      [key: string]: unknown;
    }>;
    pqrs_recientes: Array<{
      id: string;
      tipo: string;
      estado: string;
      [key: string]: unknown;
    }>;
    top_empleadas: Array<{
      id: string;
      nombre: string;
      apellido: string;
      telefono?: string;
      calificacion_promedio?: number;
      total_servicios?: number;
      ranking?: number | string;
    }>;
  };
  fecha_consulta: string;
}

function AdminIndex() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEstado, setExpandedEstado] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Verificar si hay datos en caché (válidos por 5 minutos)
        const cacheKey = 'admin_dashboard_data';
        const cacheTimeKey = 'admin_dashboard_time';
        const cachedData = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(cacheTimeKey);
        
        if (cachedData && cacheTime) {
          const now = Date.now();
          const cacheAge = now - parseInt(cacheTime);
          const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
          
          if (cacheAge < CACHE_DURATION) {
            console.log('📦 Usando datos del caché');
            setData(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }
        
        console.log('🔄 Obteniendo datos frescos del servidor...');
        const token = localStorage.getItem("access_token");
        
        // Obtener datos reales de múltiples endpoints en paralelo
        const [usuariosRes, reservasRes, planesRes, pqrsRes, ubicacionesRes, ubicacionesActivasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/usuarios`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/reservas`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/planes`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/pqrs/admin/all`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/ubicaciones/?activo_only=false&limit=100`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }),
          fetch(`${API_BASE_URL}/api/ubicaciones/?activo_only=true&limit=100`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })
        ]);

        const usuarios = usuariosRes.ok ? await usuariosRes.json() : [];
        const reservasData = reservasRes.ok ? await reservasRes.json() : { reservas: [] };
        const planesData = planesRes.ok ? await planesRes.json() : [];
        const pqrsData = pqrsRes.ok ? await pqrsRes.json() : { pqrs: [], estadisticas: {} };
        const ubicacionesData = ubicacionesRes.ok ? await ubicacionesRes.json() : [];
        const ubicacionesActivasData = ubicacionesActivasRes.ok ? await ubicacionesActivasRes.json() : [];
        const totalUbicaciones = Array.isArray(ubicacionesData) ? ubicacionesData.length : 0;
        const ubicacionesActivas = Array.isArray(ubicacionesActivasData) ? ubicacionesActivasData.length : 0;

        // Procesar usuarios
        const usuariosArray = Array.isArray(usuarios) ? usuarios : usuarios.usuarios || [];
        const empleadas = usuariosArray.filter((u: { rol: string }) => u.rol === 'empleada');
        const clientes = usuariosArray.filter((u: { rol: string }) => u.rol === 'cliente');
        const activos = usuariosArray.filter((u: { estado: string }) => u.estado === 'activo');
        
        // Procesar reservas
        const reservasArray = Array.isArray(reservasData) ? reservasData : reservasData.reservas || [];
        const hoy = new Date().toISOString().split('T')[0];
        const reservasHoy = reservasArray.filter((r: { fecha?: string }) => r.fecha?.startsWith(hoy));
        const reservasActivas = reservasArray.filter((r: { estado: string }) =>
          ['pendiente', 'programada', 'confirmada', 'en_curso', 'en_proceso'].includes(r.estado));
        const reservasCompletadas = reservasArray.filter((r: { estado: string }) => r.estado === 'completada');
        const reservasCanceladas = reservasArray.filter((r: { estado: string }) => r.estado === 'cancelada');
        
        // Procesar planes
        const planesArray = Array.isArray(planesData) ? planesData : planesData.planes || [];
        const planesActivos = planesArray.filter((p: { estado: boolean }) => p.estado);
        
        // Procesar PQRS
        const pqrsArray = Array.isArray(pqrsData) ? pqrsData : pqrsData.pqrs || [];
        const pqrsStats = pqrsData.estadisticas || {};

        // Construir objeto de datos
        const result: AdminData = {
          message: "Dashboard de administrador",
          admin_info: {
            nombre: "Admin",
            apellido: "Sistema",
            correo: "admin@reluzca.com"
          },
          estadisticas_usuarios: {
            total_usuarios: usuariosArray.length,
            usuarios_activos: activos.length,
            usuarios_pendientes: usuariosArray.filter((u: { estado: string }) => u.estado === 'pendiente').length,
            admin_count: usuariosArray.filter((u: { rol: string }) => u.rol === 'admin').length,
            empleadas_count: empleadas.length,
            clientes_count: clientes.length,
            nuevos_usuarios_mes: usuariosArray.filter((u: { fecha_registro?: string; created_at?: string }) => {
              const fechaRegistro = new Date(u.fecha_registro || u.created_at || '');
              const hace30Dias = new Date();
              hace30Dias.setDate(hace30Dias.getDate() - 30);
              return fechaRegistro >= hace30Dias;
            }).length,
            nuevos_usuarios_semana: usuariosArray.filter((u: { fecha_registro?: string; created_at?: string }) => {
              const fechaRegistro = new Date(u.fecha_registro || u.created_at || '');
              const hace7Dias = new Date();
              hace7Dias.setDate(hace7Dias.getDate() - 7);
              return fechaRegistro >= hace7Dias;
            }).length
          },
          estadisticas_reservas: {
            total_reservas: reservasArray.length,
            reservas_activas: reservasActivas.length,
            reservas_completadas: reservasCompletadas.length,
            reservas_canceladas: reservasCanceladas.length,
            reservas_hoy: reservasHoy.length,
            reservas_por_estado: [
              { estado: 'pendiente',  count: reservasArray.filter((r: { estado: string }) => r.estado === 'pendiente').length },
              { estado: 'programada', count: reservasArray.filter((r: { estado: string }) => r.estado === 'programada' || r.estado === 'confirmada').length },
              { estado: 'en_curso',   count: reservasArray.filter((r: { estado: string }) => r.estado === 'en_curso' || r.estado === 'en_proceso').length },
              { estado: 'completada', count: reservasCompletadas.length },
              { estado: 'cancelada',  count: reservasCanceladas.length },
            ]
          },
          estadisticas_financieras: {
            ingresos_totales: reservasCompletadas.reduce((sum: number, r: { precio_total?: number }) => sum + (r.precio_total || 0), 0),
            ingresos_mes: reservasCompletadas.filter((r: { fecha: string }) => {
              const fechaReserva = new Date(r.fecha);
              const mesActual = new Date().getMonth();
              return fechaReserva.getMonth() === mesActual;
            }).reduce((sum: number, r: { precio_total?: number }) => sum + (r.precio_total || 0), 0)
          },
          estadisticas_planes: {
            planes_activos: planesActivos.length,
            planes_inactivos: planesArray.length - planesActivos.length,
            planes_populares: []
          },
          estadisticas_sistema: {
            total_ubicaciones: totalUbicaciones,
            ubicaciones_activas: ubicacionesActivas,
            total_pqrs: pqrsArray.length,
            pqrs_pendientes: pqrsStats.pendientes || 0,
            pqrs_resueltas: pqrsStats.resueltos || 0,
            descuentos_activos: 0,
            notificaciones_no_leidas: 0
          },
          datos_recientes: {
            ultimas_empleadas: empleadas.slice(0, 5),
            ultimos_clientes: clientes.slice(0, 5),
            reservas_recientes: reservasArray.slice(0, 5),
            pqrs_recientes: pqrsArray.slice(0, 5),
            top_empleadas: []
          },
          fecha_consulta: new Date().toISOString()
        };
        
        // Guardar en caché
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
        
        setData(result);
        setError(null);
      } catch (err) {
        console.error('💥 Error completo:', err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#4894AD]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('admin.dashboard.loadError')}</h3>
        <p className="text-sm sm:text-base text-gray-600">{error}</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fmtDateLocal = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    pendiente:  { label: 'Pendiente',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: <Clock className="h-4 w-4" /> },
    programada: { label: 'Programada', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <Calendar className="h-4 w-4" /> },
    en_curso:   { label: 'En Curso',   color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Activity className="h-4 w-4" /> },
    completada: { label: 'Completada', color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: <CheckCircle className="h-4 w-4" /> },
    cancelada:  { label: 'Cancelada',  color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: <XCircle className="h-4 w-4" /> },
  };

  const reservasPorEstado = data.estadisticas_reservas.reservas_por_estado;
  const getCount = (estado: string) => reservasPorEstado.find(e => e.estado === estado)?.count ?? 0;

  return (
    <div className="space-y-5 lg:space-y-7">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#195083] via-[#1a6399] to-[#4894AD] rounded-2xl p-5 sm:p-7 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Panel de control</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
              Bienvenido, {data.admin_info.nombre}
            </h1>
            <p className="text-white/75 text-sm">
              Visión global de procesos, reservas y usuarios del sistema
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-white/50 text-xs">Última actualización</p>
              <p className="text-white font-semibold text-sm">{new Date(data.fecha_consulta).toLocaleString('es-CO')}</p>
            </div>
          </div>
        </div>
        {/* Mini KPIs en header */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Reservas hoy', value: data.estadisticas_reservas.reservas_hoy, icon: <Zap className="h-3.5 w-3.5" /> },
            { label: 'Activas', value: data.estadisticas_reservas.reservas_activas, icon: <Activity className="h-3.5 w-3.5" /> },
            { label: 'Ubicaciones', value: data.estadisticas_sistema.ubicaciones_activas, icon: <Home className="h-3.5 w-3.5" /> },
            { label: 'PQRS pend.', value: data.estadisticas_sistema.pqrs_pendientes, icon: <FileText className="h-3.5 w-3.5" /> },
          ].map(k => (
            <div key={k.label} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">{k.icon}{k.label}</div>
              <p className="text-white text-xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fila 1: Métricas principales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/usuarios/index')}>
          <div className="flex items-start justify-between mb-3">
            <div className="bg-[#195083]/10 p-2 rounded-lg"><Users className="h-5 w-5 text-[#195083]" /></div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">+{data.estadisticas_usuarios.nuevos_usuarios_semana} sem.</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#195083]">{data.estadisticas_usuarios.total_usuarios}</p>
          <p className="text-xs text-gray-500 mt-1">Usuarios totales</p>
          <div className="mt-3 flex gap-2 text-xs text-gray-400">
            <span className="bg-gray-50 px-1.5 py-0.5 rounded">{data.estadisticas_usuarios.empleadas_count} empleadas</span>
            <span className="bg-gray-50 px-1.5 py-0.5 rounded">{data.estadisticas_usuarios.clientes_count} clientes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/reservas/index')}>
          <div className="flex items-start justify-between mb-3">
            <div className="bg-[#4894AD]/10 p-2 rounded-lg"><Calendar className="h-5 w-5 text-[#4894AD]" /></div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{data.estadisticas_reservas.reservas_hoy} hoy</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#4894AD]">{data.estadisticas_reservas.total_reservas}</p>
          <p className="text-xs text-gray-500 mt-1">Total reservas</p>
          <div className="mt-3 flex gap-2 text-xs text-gray-400">
            <span className="bg-gray-50 px-1.5 py-0.5 rounded">{data.estadisticas_reservas.reservas_completadas} completadas</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 p-2 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600 truncate">{formatCurrency(data.estadisticas_financieras.ingresos_totales)}</p>
          <p className="text-xs text-gray-500 mt-1">Ingresos totales</p>
          <p className="text-xs text-green-600 mt-2 truncate">{formatCurrency(data.estadisticas_financieras.ingresos_mes)} este mes</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/pqrs/index')}>
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-100 p-2 rounded-lg"><FileText className="h-5 w-5 text-orange-600" /></div>
            {data.estadisticas_sistema.pqrs_pendientes > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">{data.estadisticas_sistema.pqrs_pendientes}</span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600">{data.estadisticas_sistema.pqrs_pendientes}</p>
          <p className="text-xs text-gray-500 mt-1">PQRS pendientes</p>
          <p className="text-xs text-gray-400 mt-2">{data.estadisticas_sistema.total_pqrs} total</p>
        </div>
      </div>

      {/* ── Fila 2: Cards de estado de reservas (expandibles) + Ubicaciones ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Cards estado reservas — 2/3 del ancho */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Reservas por estado</h3>
            <button onClick={() => navigate('/admin/reservas/index')} className="text-xs text-[#195083] hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {(['pendiente','programada','en_curso','completada','cancelada'] as const).map(estado => {
              const cfg = ESTADO_CFG[estado];
              const count = getCount(estado);
              const isOpen = expandedEstado === estado;
              const reservasDeEste = data.datos_recientes.reservas_recientes.filter(r =>
                r.estado === estado || (estado === 'programada' && r.estado === 'confirmada') || (estado === 'en_curso' && r.estado === 'en_proceso')
              );
              return (
                <div key={estado}>
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => setExpandedEstado(isOpen ? null : estado)}
                  >
                    <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.color}`}>{cfg.icon}</div>
                    <span className="flex-1 font-medium text-gray-800 text-sm">{cfg.label}</span>
                    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{count}</span>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className={`mx-3 mb-3 rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                      {reservasDeEste.length === 0 ? (
                        <p className={`text-xs ${cfg.color} px-4 py-3 opacity-60`}>No hay reservas recientes con este estado</p>
                      ) : (
                        <div className="divide-y divide-white/50">
                          {reservasDeEste.map((r, i) => (
                            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-semibold ${cfg.color}`}>
                                  {r.cliente?.nombre ?? 'Cliente'} {(r.cliente as any)?.apellido ?? ''}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {r.fecha ? fmtDateLocal(r.fecha) : '—'} · {r.hora_inicio ?? ''}
                                </p>
                              </div>
                              {r.precio_total != null && (
                                <p className={`text-xs font-bold ${cfg.color}`}>{formatCurrency(r.precio_total)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={`px-4 py-2 border-t ${cfg.border}`}>
                        <button
                          onClick={() => navigate('/admin/reservas/index')}
                          className={`text-xs ${cfg.color} font-medium hover:underline flex items-center gap-1`}
                        >
                          Ver todas las {cfg.label.toLowerCase()} <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral derecho: Sistema + Planes + Ubicaciones */}
        <div className="space-y-4">
          {/* Ubicaciones */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[#195083]" />
              <h4 className="font-bold text-gray-900 text-sm">Ubicaciones</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Activas
                </span>
                <span className="font-bold text-green-600">{data.estadisticas_sistema.ubicaciones_activas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>Total
                </span>
                <span className="font-semibold text-gray-700">{data.estadisticas_sistema.total_ubicaciones}</span>
              </div>
              {data.estadisticas_sistema.total_ubicaciones > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.round((data.estadisticas_sistema.ubicaciones_activas / data.estadisticas_sistema.total_ubicaciones) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {Math.round((data.estadisticas_sistema.ubicaciones_activas / data.estadisticas_sistema.total_ubicaciones) * 100)}% activas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Planes */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-purple-600" />
              <h4 className="font-bold text-gray-900 text-sm">Planes</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Activos
                </span>
                <span className="font-bold text-green-600">{data.estadisticas_planes.planes_activos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>Inactivos
                </span>
                <span className="font-semibold text-gray-500">{data.estadisticas_planes.planes_inactivos}</span>
              </div>
            </div>
          </div>

          {/* Usuarios por rol */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-[#195083]" />
              <h4 className="font-bold text-gray-900 text-sm">Usuarios</h4>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Admins', count: data.estadisticas_usuarios.admin_count, color: 'bg-[#195083]' },
                { label: 'Empleadas', count: data.estadisticas_usuarios.empleadas_count, color: 'bg-[#4894AD]' },
                { label: 'Clientes', count: data.estadisticas_usuarios.clientes_count, color: 'bg-green-500' },
              ].map(u => (
                <div key={u.label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">{u.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${u.color} rounded-full`} style={{ width: `${data.estadisticas_usuarios.total_usuarios > 0 ? Math.round((u.count / data.estadisticas_usuarios.total_usuarios) * 100) : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Fila 3: Reservas recientes + Top empleadas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reservas recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Reservas recientes</h3>
            <button onClick={() => navigate('/admin/reservas/index')} className="text-xs text-[#195083] hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {data.datos_recientes.reservas_recientes.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {data.datos_recientes.reservas_recientes.slice(0, 6).map((r, i) => {
                const eConf = ESTADO_CFG[r.estado] ?? ESTADO_CFG['pendiente'];
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}
                      style={{ background: 'linear-gradient(135deg,#195083,#0f3a5f)' }}>
                      {r.fecha ? new Date(r.fecha + 'T12:00:00').getDate() : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {r.cliente?.nombre ?? 'Cliente'} {(r.cliente as any)?.apellido ?? ''}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {r.fecha ? fmtDateLocal(r.fecha) : ''} · {r.hora_inicio ?? ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${eConf.bg} ${eConf.color}`}>{eConf.label}</span>
                      {r.precio_total != null && (
                        <p className="text-xs font-bold text-gray-700 mt-1">{formatCurrency(r.precio_total)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Sin reservas recientes</p>
            </div>
          )}
        </div>

        {/* Últimas empleadas + Clientes */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Últimas empleadas</h3>
              <button onClick={() => navigate('/admin/usuarios/index')} className="text-xs text-[#195083] hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {data.datos_recientes.ultimas_empleadas.slice(0, 4).map(e => (
                <div key={e.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4894AD]/10 flex items-center justify-center text-[#4894AD] font-bold text-sm shrink-0">
                    {e.nombre[0]}{e.apellido[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.nombre} {e.apellido}</p>
                    <p className="text-xs text-gray-500 truncate">{e.correo}</p>
                  </div>
                  {e.calificacion_promedio != null && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-bold text-gray-700">{Number(e.calificacion_promedio).toFixed(1)}</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${e.estado === 'activo' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.estado}
                  </span>
                </div>
              ))}
              {data.datos_recientes.ultimas_empleadas.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">Sin empleadas</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Últimos clientes</h3>
              <button onClick={() => navigate('/admin/usuarios/index')} className="text-xs text-[#195083] hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {data.datos_recientes.ultimos_clientes.slice(0, 3).map(c => (
                <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                    {c.nombre[0]}{c.apellido[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.nombre} {c.apellido}</p>
                    <p className="text-xs text-gray-500 truncate">{c.correo}</p>
                  </div>
                </div>
              ))}
              {data.datos_recientes.ultimos_clientes.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">Sin clientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdminRole(AdminIndex);