import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/dateUtils";
import { API_BASE_URL } from "@/config/env";
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
  XCircle
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
  const { t } = useTranslation();

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
        const [usuariosRes, reservasRes, planesRes, pqrsRes] = await Promise.all([
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
          })
        ]);

        const usuarios = usuariosRes.ok ? await usuariosRes.json() : [];
        const reservasData = reservasRes.ok ? await reservasRes.json() : { reservas: [] };
        const planesData = planesRes.ok ? await planesRes.json() : [];
        const pqrsData = pqrsRes.ok ? await pqrsRes.json() : { pqrs: [], estadisticas: {} };

        // Procesar usuarios
        const usuariosArray = Array.isArray(usuarios) ? usuarios : usuarios.usuarios || [];
        const empleadas = usuariosArray.filter((u: { rol: string }) => u.rol === 'empleada');
        const clientes = usuariosArray.filter((u: { rol: string }) => u.rol === 'cliente');
        const activos = usuariosArray.filter((u: { estado: string }) => u.estado === 'activo');
        
        // Procesar reservas
        const reservasArray = Array.isArray(reservasData) ? reservasData : reservasData.reservas || [];
        const hoy = new Date().toISOString().split('T')[0];
        const reservasHoy = reservasArray.filter((r: { fecha?: string }) => r.fecha?.startsWith(hoy));
        const reservasActivas = reservasArray.filter((r: { estado: string }) => r.estado === 'pendiente' || r.estado === 'confirmada');
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
              { estado: 'pendiente', count: reservasArray.filter((r: { estado: string }) => r.estado === 'pendiente').length },
              { estado: 'confirmada', count: reservasArray.filter((r: { estado: string }) => r.estado === 'confirmada').length },
              { estado: 'completada', count: reservasCompletadas.length },
              { estado: 'cancelada', count: reservasCanceladas.length }
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
            total_ubicaciones: 0,
            ubicaciones_activas: 0,
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#4894AD] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F0E7] mb-2">
              {t('admin.dashboard.greeting', { name: data.admin_info.nombre })}
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
              {t('admin.dashboard.summary')}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs sm:text-sm text-[#F5F0E7]/60">{t('admin.dashboard.lastUpdate')}</p>
            <p className="text-[#F5F0E7] font-semibold text-sm sm:text-base">
              {new Date(data.fecha_consulta).toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Usuarios */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('admin.dashboard.totalUsers')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#195083]">
                {data.estadisticas_usuarios.total_usuarios}
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">
                +{data.estadisticas_usuarios.nuevos_usuarios_semana} {t('admin.dashboard.thisWeek')}
              </p>
            </div>
            <div className="bg-[#195083] p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Reservas Totales */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('admin.dashboard.totalReservations')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#4894AD]">
                {data.estadisticas_reservas.total_reservas}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                {data.estadisticas_reservas.reservas_hoy} {t('admin.dashboard.today')}
              </p>
            </div>
            <div className="bg-[#4894AD] p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('admin.dashboard.totalRevenue')}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 truncate">
                {formatCurrency(data.estadisticas_financieras.ingresos_totales)}
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-1 truncate">
                {formatCurrency(data.estadisticas_financieras.ingresos_mes)} {t('admin.dashboard.thisMonth')}
              </p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>

        {/* PQRS Pendientes */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('admin.dashboard.pendingPqrs')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                {data.estadisticas_sistema.pqrs_pendientes}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {t('admin.dashboard.ofTotal', { total: data.estadisticas_sistema.total_pqrs })}
              </p>
            </div>
            <div className="bg-orange-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Usuarios por Rol */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-[#195083] mb-4">{t('admin.dashboard.usersByRole')}</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#195083] flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{t('common.roles.admin')}</span>
              </div>
              <span className="font-bold text-[#195083] text-sm sm:text-base flex-shrink-0">
                {data.estadisticas_usuarios.admin_count}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[#4894AD] flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{t('common.roles.empleada')}</span>
              </div>
              <span className="font-bold text-[#4894AD] text-sm sm:text-base flex-shrink-0">
                {data.estadisticas_usuarios.empleadas_count}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{t('common.roles.cliente')}</span>
              </div>
              <span className="font-bold text-green-600 text-sm sm:text-base flex-shrink-0">
                {data.estadisticas_usuarios.clientes_count}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de Reservas */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-[#195083] mb-4">{t('admin.dashboard.reservationStatus')}</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{t('admin.dashboard.active')}</span>
              </div>
              <span className="font-bold text-blue-600 text-sm sm:text-base flex-shrink-0">
                {data.estadisticas_reservas.reservas_activas}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{t('admin.dashboard.completed')}</span>
              </div>
              <span className="font-bold text-green-600 text-sm sm:text-base flex-shrink-0">
                {data.estadisticas_reservas.reservas_completadas}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{t('admin.dashboard.cancelled')}</span>
              </div>
              <span className="font-bold text-red-600 text-sm sm:text-base flex-shrink-0">
                {data.estadisticas_reservas.reservas_canceladas}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Reservas Recientes */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-[#195083] mb-4">{t('admin.dashboard.recentReservations')}</h3>
          
          {data.datos_recientes.reservas_recientes.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {data.datos_recientes.reservas_recientes.slice(0, 5).map((reserva, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {reserva.cliente?.nombre || t('admin.dashboard.unknownClient')}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {reserva.fecha && formatDate(reserva.fecha)} • {reserva.hora_inicio}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reserva.estado === 'completada' ? 'bg-green-100 text-green-800' :
                        reserva.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                        reserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reserva.estado}
                      </span>
                      {reserva.precio_total && (
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mt-1">
                          {formatCurrency(reserva.precio_total)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* <button className="w-full mt-3 sm:mt-4 text-[#195083] hover:text-[#4894AD] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#195083]/20 hover:bg-[#195083]/5 transition-colors">
                Ver todas las reservas <ArrowRight size={14} />
              </button> */}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">{t('admin.dashboard.noRecentReservations')}</p>
            </div>
          )}
        </div>

        {/* Top Empleadas */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-[#195083] mb-4">{t('admin.dashboard.topEmployees')}</h3>
          
          {data.datos_recientes.top_empleadas.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {data.datos_recientes.top_empleadas.map((empleada, index) => (
                <div key={empleada.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-[#4894AD]'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {empleada.nombre} {empleada.apellido}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">{empleada.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-gray-900 text-sm sm:text-base">
                        {empleada.ranking || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* <button className="w-full mt-3 sm:mt-4 text-[#4894AD] hover:text-[#195083] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#4894AD]/20 hover:bg-[#4894AD]/5 transition-colors">
                Ver todas las empleadas <ArrowRight size={14} />
              </button> */}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <UserCheck className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">{t('admin.dashboard.noEmployees')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Cards - Full width responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sistema Info */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-bold text-[#195083] mb-3 sm:mb-4">{t('admin.dashboard.system')}</h4>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">{t('admin.dashboard.activeLocations')}</span>
              <span className="font-semibold text-sm sm:text-base">{data.estadisticas_sistema.ubicaciones_activas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">{t('admin.dashboard.activeDiscounts')}</span>
              <span className="font-semibold text-sm sm:text-base">{data.estadisticas_sistema.descuentos_activos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">{t('admin.dashboard.notifications')}</span>
              <span className="font-semibold text-sm sm:text-base text-red-600">{data.estadisticas_sistema.notificaciones_no_leidas}</span>
            </div>
          </div>
        </div>

        {/* Planes Info */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-bold text-[#195083] mb-3 sm:mb-4">{t('admin.dashboard.plans')}</h4>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">{t('admin.dashboard.activePlans')}</span>
              <span className="font-semibold text-sm sm:text-base text-green-600">{data.estadisticas_planes.planes_activos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">{t('admin.dashboard.inactivePlans')}</span>
              <span className="font-semibold text-sm sm:text-base text-red-600">{data.estadisticas_planes.planes_inactivos}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
          <h4 className="text-base sm:text-lg font-bold text-[#195083] mb-3 sm:mb-4">{t('admin.dashboard.quickActions')}</h4>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full text-left px-3 py-2 text-xs sm:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              {t('admin.dashboard.managePqrs')}
            </button>
            <button className="w-full text-left px-3 py-2 text-xs sm:text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              {t('admin.dashboard.viewReports')}
            </button>
            <button className="w-full text-left px-3 py-2 text-xs sm:text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
              {t('admin.dashboard.reviewNewUsers')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdminRole(AdminIndex);