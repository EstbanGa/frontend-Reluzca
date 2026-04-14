
import { useState, useEffect } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Calendar, 
  Star, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Home,
  ArrowRight,
  Plus
} from "lucide-react";

interface ClienteData {
  message: string;
  cliente_info: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    fecha_registro: string;
  };
  estadisticas_reservas: {
    total_reservas: number;
    reservas_activas: number;
    reservas_completadas: number;
    reservas_canceladas: number;
    reservas_pendientes: number;
    reservas_por_estado: Array<{estado: string, count: number}>;
  };
  estadisticas_ubicaciones: {
    total_ubicaciones: number;
    ubicaciones_activas: number;
  };
  datos_principales: {
    reservas_recientes: Array<{
      id: string;
      fecha: string;
      estado: string;
      precio_total?: number;
      [key: string]: unknown;
    }>;
    proximas_reservas: Array<{
      id: string;
      fecha: string;
      hora_inicio?: string;
      estado: string;
      empleada?: {
        nombre: string;
        apellido?: string;
        ranking?: number;
      };
      ubicacion?: {
        nombre_lugar: string;
      };
      servicios?: Array<{ nombre: string }>;
    }>;
    empleadas_frecuentes: Array<{
      id: string;
      nombre: string;
      apellido: string;
      total_servicios?: number;
      ranking?: number;
    }>;
    ultimas_ubicaciones: Array<{
      id: string;
      nombre_lugar: string;
      nombre: string;
      tipo_lugar: string;
      estado?: boolean;
      direccion?: string;
    }>;
    descuentos_disponibles: Array<{
      id: string;
      codigo: string;
      porcentaje?: number;
      [key: string]: unknown;
    }>;
    planes_populares: Array<{
      id: string;
      nombre: string;
      precio?: number;
      [key: string]: unknown;
    }>;
  };
  sistema: {
    notificaciones_no_leidas: number;
  };
  fecha_consulta: string;
}

function ClienteIndex() {
  const [data, setData] = useState<ClienteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el usuario_id desde el localStorage (lo guarda el HOC withRole)
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          throw new Error(t('cliente.dashboard.userNotFound'));
        }
        
        const user = JSON.parse(userStr);
        const usuario_id = user.id;
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/usuarios/cliente/dashboard?usuario_id=${usuario_id}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          throw new Error(t('cliente.dashboard.noValidJSON'));
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('cliente.dashboard.errorUnknown'));
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('cliente.dashboard.errorLoading')}</h3>
        <p className="text-sm sm:text-base text-gray-600">{error}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'confirmada':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNavigation = (section: string) => {
    navigate(`/cliente/${section}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-[#4894AD] to-[#D95B26] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2">
              {t('cliente.dashboard.greeting', { name: data.cliente_info.nombre })}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">{t('cliente.dashboard.subtitle')}</p>
          </div>
          <button
            onClick={() => handleNavigation('reservas/crear')}
            className="bg-white text-[#4894AD] hover:bg-[#F5F0E7] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t('cliente.dashboard.newReservation')}
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Reservas */}
        <div 
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => handleNavigation('reservas/index')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.dashboard.myReservations')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#4894AD]">
                {data.estadisticas_reservas.total_reservas}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                {t('cliente.dashboard.activeCount', { n: data.estadisticas_reservas.reservas_activas })}
              </p>
            </div>
            <div className="bg-[#4894AD] p-2 sm:p-3 rounded-lg group-hover:bg-[#195083] transition-colors flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <button className="w-full text-[#4894AD] hover:text-[#195083] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#4894AD]/20 hover:bg-[#4894AD]/5 transition-colors">
            {t('cliente.dashboard.viewReservations')} <ArrowRight size={14} />
          </button>
        </div>

        {/* Mis Ubicaciones */}
        <div 
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => handleNavigation('ubicaciones/index')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.dashboard.myLocations')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#D95B26]">
                {data.estadisticas_ubicaciones.total_ubicaciones}
              </p>
              <p className="text-xs sm:text-sm text-orange-600 mt-1">
                {t('cliente.dashboard.activeLocations', { n: data.estadisticas_ubicaciones.ubicaciones_activas })}
              </p>
            </div>
            <div className="bg-[#D95B26] p-2 sm:p-3 rounded-lg group-hover:bg-orange-600 transition-colors flex-shrink-0">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <button className="w-full text-[#D95B26] hover:text-orange-600 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#D95B26]/20 hover:bg-[#D95B26]/5 transition-colors">
            {t('cliente.dashboard.viewLocations')} <ArrowRight size={14} />
          </button>
        </div>

        {/* Servicios Completados */}
        <div 
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
          onClick={() => handleNavigation('reservas/index')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.dashboard.completed')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {data.estadisticas_reservas.reservas_completadas}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {t('cliente.dashboard.completedServices')}
              </p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg group-hover:bg-green-600 transition-colors flex-shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <button className="w-full text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-green-600/20 hover:bg-green-50 transition-colors">
            {t('cliente.dashboard.viewHistory')} <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Grid - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Próximas Reservas */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#4894AD]">{t('cliente.dashboard.upcomingReservations')}</h3>
          </div>
          
          {data.datos_principales.proximas_reservas.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {data.datos_principales.proximas_reservas.slice(0, 2).map((reserva, index) => (
                <div key={index} className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-[#4894AD] flex-shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {formatDate(reserva.fecha)} • {reserva.hora_inicio ? formatTime(reserva.hora_inicio) : 'N/A'}
                        </span>
                      </div>
                      
                      {reserva.empleada && (
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm truncate">{reserva.empleada.nombre}</span>
                          {reserva.empleada.ranking && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-yellow-600">{reserva.empleada.ranking}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {reserva.ubicacion && (
                        <div className="flex items-center gap-2">
                          <Home className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate">{reserva.ubicacion.nombre_lugar}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 self-start">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
                        {t(`common.statuses.${reserva.estado}`, { defaultValue: reserva.estado })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => handleNavigation('reservas/index')}
                className="w-full mt-3 sm:mt-4 text-[#4894AD] hover:text-[#195083] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#4894AD]/20 hover:bg-[#4894AD]/5 transition-colors"
              >
                {t('cliente.dashboard.viewAll')} <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">{t('cliente.dashboard.noUpcoming')}</p>
              <button 
                onClick={() => handleNavigation('reservas/crear')}
                className="bg-[#4894AD] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base"
              >
                {t('cliente.dashboard.newReservation')}
              </button>
            </div>
          )}
        </div>

        {/* Mis Ubicaciones */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#4894AD]">{t('cliente.dashboard.myLocationsSection')}</h3>
          </div>
          
          {data.datos_principales.ultimas_ubicaciones.length > 0 ? (
            <div className="space-y-3">
              {data.datos_principales.ultimas_ubicaciones.slice(0, 3).map((ubicacion, index) => (
                <div key={ubicacion.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{ubicacion.nombre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      ubicacion.estado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ubicacion.estado ? t('cliente.dashboard.active') : t('cliente.dashboard.inactive')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    {ubicacion.tipo_lugar && (
                      <p className="truncate">{t('cliente.dashboard.type')} {ubicacion.tipo_lugar}</p>
                    )}
                    {ubicacion.nombre_lugar && (
                      <p className="truncate">{t('cliente.dashboard.address')} {ubicacion.nombre_lugar}</p>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => handleNavigation('ubicaciones/index')}
                className="w-full mt-3 sm:mt-4 text-[#D95B26] hover:text-orange-600 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#D95B26]/20 hover:bg-[#D95B26]/5 transition-colors"
              >
                {t('cliente.dashboard.manageLocations')} <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">{t('cliente.dashboard.noLocations')}</p>
              <button 
                onClick={() => handleNavigation('ubicaciones/crear')}
                className="bg-[#D95B26] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base"
              >
                {t('cliente.dashboard.addLocation')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empleadas Frecuentes - Full width section */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-[#4894AD]">{t('cliente.dashboard.frequentEmployees')}</h3>
        </div>
        
        {data.datos_principales.empleadas_frecuentes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {data.datos_principales.empleadas_frecuentes.slice(0, 8).map((empleada, index) => (
                <div key={empleada.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#4894AD] to-[#D95B26] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {empleada.nombre.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{empleada.nombre}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{t('cliente.dashboard.servicesCount', { n: empleada.total_servicios || 0 })}</p>
                    </div>
                  </div>
                  
                  {empleada.ranking && (
                    <div className="flex items-center justify-center gap-1 pt-2 border-t border-gray-200">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-900 text-sm">{empleada.ranking}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* <button 
              onClick={() => handleNavigation('empleadas')}
              className="w-full mt-4 sm:mt-6 text-[#4894AD] hover:text-[#195083] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 sm:py-3 rounded-lg border border-[#4894AD]/20 hover:bg-[#4894AD]/5 transition-colors"
            >
              Ver todas las empleadas <ArrowRight size={14} />
            </button> */}
          </>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <UserCheck className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">{t('cliente.dashboard.noEmployees')}</p>
            <button 
              onClick={() => handleNavigation('reservas/crear')}
              className="bg-[#4894AD] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base"
            >
              {t('cliente.dashboard.firstReservation')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default withClienteRole(ClienteIndex);