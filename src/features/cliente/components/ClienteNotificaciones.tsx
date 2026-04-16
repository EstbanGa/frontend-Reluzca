
import { useState, useEffect } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, Check, CheckCheck, Trash2, RefreshCw, Calendar, Clock, AlertCircle, Info } from "lucide-react";
import { API_BASE_URL } from "@/config/env";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";

interface Notificacion {
  id: string;
  id_reserva: string;
  tipo_notificacion: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  reserva?: {
    id: string;
    fecha: string;
    hora_inicio: string;
    estado: string;
    plan?: {
      id: string;
      nombre: string;
    };
    empleada?: {
      id: string;
      nombre: string;
      apellido: string;
    };
  };
}

interface NotificacionesData {
  message: string;
  notificaciones: Notificacion[];
  estadisticas: {
    total: number;
    leidas: number;
    no_leidas: number;
    por_tipo: Record<string, number>;
  };
}

const TIPO_ICONS: Record<string, typeof Bell> = {
  cambio_estado: Info,
  recordatorio: Bell,
  cancelacion: AlertCircle,
  confirmacion: CheckCheck,
};

const TIPO_COLORS: Record<string, string> = {
  cambio_estado: "text-blue-600 bg-blue-50",
  recordatorio: "text-yellow-600 bg-yellow-50",
  cancelacion: "text-red-600 bg-red-50",
  confirmacion: "text-green-600 bg-green-50",
};

function ClienteNotificaciones() {
  const { t } = useTranslation();
  const [data, setData] = useState<NotificacionesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "leidas" | "no_leidas">("todas");

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("No se encontró información del usuario");
      }

      const user = JSON.parse(userStr);
      const usuario_id = user.id;

      const response = await fetch(`${API_BASE_URL}/api/notificaciones/cliente/${usuario_id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notificaciones/${notificacionId}/marcar-leida`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al marcar notificación como leída");
      }

      // Actualizar UI
      fetchNotificaciones();
    } catch (err) {
      // Error al marcar como leída
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const usuario_id = user.id;

      const response = await fetch(`${API_BASE_URL}/api/notificaciones/cliente/${usuario_id}/marcar-todas-leidas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al marcar todas como leídas");
      }

      // Actualizar UI
      fetchNotificaciones();
    } catch (err) {
      // Error al marcar todas como leídas
    }
  };

  const eliminarNotificacion = async (notificacionId: string) => {
    if (!confirm(t('cliente.notifications.confirmDelete'))) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notificaciones/${notificacionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar notificación");
      }

      // Actualizar UI
      fetchNotificaciones();
    } catch (err) {
      // Error al eliminar notificación
    }
  };

  const notificacionesFiltradas = data?.notificaciones.filter((notif) => {
    if (filtro === "leidas") return notif.leida;
    if (filtro === "no_leidas") return !notif.leida;
    return true;
  });

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return t('cliente.notifications.time.justNow');
    if (minutos < 60) return t('cliente.notifications.time.minutes', { count: minutos });
    if (horas < 24) return t('cliente.notifications.time.hours', { count: horas });
    if (dias < 7) return t('cliente.notifications.time.days', { count: dias });
    
    return fecha.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#4894AD] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('cliente.notifications.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cliente.notifications.errorLoading')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchNotificaciones}
            className="px-6 py-2 bg-[#4894AD] text-white rounded-lg hover:bg-[#3a7a8f] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.cliente}
        title={t('cliente.notifications.title')}
        subtitle={t('cliente.notifications.subtitle')}
        icon={<Bell className="h-7 w-7" />}
        actions={
          <button
            onClick={fetchNotificaciones}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        }
      />

      {/* Estadísticas */}
      {data && (
        <ListStatsGrid
          columns={3}
          stats={[
            { label: t('cliente.notifications.stats.total'), value: data.estadisticas.total, color: '#4894AD' },
            { label: t('cliente.notifications.stats.unread'), value: data.estadisticas.no_leidas, color: '#2563eb' },
            { label: t('cliente.notifications.stats.read'), value: data.estadisticas.leidas, color: '#16a34a' },
          ]}
        />
      )}

      {/* Filtros y Acciones */}
      <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFiltro("todas")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === "todas"
                    ? "bg-[#4894AD] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t('cliente.notifications.filters.all')}
              </button>
              <button
                onClick={() => setFiltro("no_leidas")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === "no_leidas"
                    ? "bg-[#4894AD] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t('cliente.notifications.filters.unread')}
              </button>
              <button
                onClick={() => setFiltro("leidas")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === "leidas"
                    ? "bg-[#4894AD] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t('cliente.notifications.filters.read')}
              </button>
            </div>

            {data && data.estadisticas.no_leidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <CheckCheck className="w-5 h-5" />
                {t('cliente.notifications.markAllRead')}
              </button>
            )}
      </div>

        {/* Lista de Notificaciones */}
        <div className="space-y-3">
          {notificacionesFiltradas && notificacionesFiltradas.length > 0 ? (
            notificacionesFiltradas.map((notificacion) => {
              const Icon = TIPO_ICONS[notificacion.tipo_notificacion] || Bell;
              const colorClass = TIPO_COLORS[notificacion.tipo_notificacion] || "text-gray-600 bg-gray-50";

              return (
                <SlideRevealCard
                  key={notificacion.id}
                  buttonCount={2}
                  actions={
                    <>
                      {!notificacion.leida && (
                        <SlideButton
                          icon={<Check className="w-4 h-4" />}
                          onClick={() => marcarComoLeida(notificacion.id)}
                          title="Marcar como leída"
                          hoverColor="hover:bg-blue-50 hover:text-blue-600"
                        />
                      )}
                      <SlideButton
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => eliminarNotificacion(notificacion.id)}
                        title="Eliminar"
                        hoverColor="hover:bg-red-50 hover:text-red-600"
                      />
                    </>
                  }
                >
                  <div className={`flex items-start gap-4 ${!notificacion.leida ? 'border-l-4 border-l-blue-500 -ml-3 pl-3' : ''}`}>
                    <div className={`p-3 rounded-full ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 capitalize">
                            {notificacion.tipo_notificacion.replace("_", " ")}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notificacion.mensaje}</p>
                        </div>
                      </div>

                      {notificacion.reserva && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(notificacion.reserva.fecha).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{notificacion.reserva.hora_inicio}</span>
                            </div>
                          </div>
                          {notificacion.reserva.plan && (
                            <div className="mt-2 text-gray-700">
                              <span className="font-medium">{t('cliente.notifications.planLabel')}</span> {notificacion.reserva.plan.nombre}
                            </div>
                          )}
                          {notificacion.reserva.empleada && (
                            <div className="mt-1 text-gray-700">
                              <span className="font-medium">{t('cliente.notifications.employeeLabel')}</span>{" "}
                              {notificacion.reserva.empleada.nombre} {notificacion.reserva.empleada.apellido}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        {formatearFecha(notificacion.created_at)}
                      </div>
                    </div>
                  </div>
                </SlideRevealCard>
              );
            })
          ) : (
            <div className="text-center py-16">
              <BellOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('cliente.notifications.empty.all')}
              </h3>
              <p className="text-gray-500">
                {filtro === "todas"
                  ? t('cliente.notifications.empty.allDetail')
                  : filtro === "no_leidas"
                  ? t('cliente.notifications.empty.unread')
                  : t('cliente.notifications.empty.read')}
              </p>
            </div>
          )}
        </div>
    </div>
  );
}

export default withClienteRole(ClienteNotificaciones);