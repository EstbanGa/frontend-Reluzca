
import { useState, useEffect } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
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
  Award,
  TrendingUp,
  Users,
  RefreshCw,
  Bell
} from "lucide-react";

interface EmpleadaData {
  message: string;
  empleada_info: {
    nombre: string;
    ranking: number;
    fecha_registro: string;
  };
}

function EmpleadaIndex() {
  const [data, setData] = useState<EmpleadaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/usuarios/empleada/dashboard/simple`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getRankingColor = (ranking: number) => {
    if (ranking >= 4.5) return 'text-green-600';
    if (ranking >= 4.0) return 'text-blue-600';
    if (ranking >= 3.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking >= 4.5) return { color: 'bg-green-100 text-green-800', label: 'Excelente' };
    if (ranking >= 4.0) return { color: 'bg-blue-100 text-blue-800', label: 'Muy Buena' };
    if (ranking >= 3.5) return { color: 'bg-yellow-100 text-yellow-800', label: 'Buena' };
    return { color: 'bg-orange-100 text-orange-800', label: 'En Mejora' };
  };

  const handleNavigation = (section: string) => {
    navigate(`/empleada/${section}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#195083]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  const rankingBadge = getRankingBadge(data.empleada_info.ranking);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header de Bienvenida */}
      <div className="bg-gradient-to-r from-[#195083] to-[#4894AD] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2">
              {data.message}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">Tu panel de trabajo está listo</p>
            <p className="text-white/60 text-xs sm:text-sm mt-2">
              Miembro desde: {formatDate(data.empleada_info.fecha_registro)}
            </p>
          </div>
          
          {/* Ranking Badge */}
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold">{data.empleada_info.ranking.toFixed(1)}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${rankingBadge.color}`}>
                {rankingBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Navegación Rápida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Mis Servicios */}
        <div 
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => handleNavigation('reservas')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Mis Servicios</p>
              <p className="text-lg sm:text-xl font-bold text-[#195083]">
                Pendientes
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Servicios asignados
              </p>
            </div>
            <div className="bg-[#195083] p-2 sm:p-3 rounded-lg group-hover:bg-[#0f3a5f] transition-colors flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <button className="w-full text-[#195083] hover:text-[#0f3a5f] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-[#195083]/20 hover:bg-[#195083]/5 transition-colors">
            Ver servicios <ArrowRight size={14} />
          </button>
        </div>


        {/* Horarios */}
        <div 
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
          onClick={() => handleNavigation('horarios')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Horarios</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">
                Disponible
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Gestiona tu disponibilidad
              </p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg group-hover:bg-green-600 transition-colors flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <button className="w-full text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 py-2 rounded-lg border border-green-600/20 hover:bg-green-50 transition-colors">
            Configurar horarios <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Sección de Estado y Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Mi Rendimiento */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#195083] flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mi Rendimiento
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Ranking Detallado */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Calificación Promedio</span>
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 fill-current ${getRankingColor(data.empleada_info.ranking)}`} />
                  <span className={`font-bold text-lg ${getRankingColor(data.empleada_info.ranking)}`}>
                    {data.empleada_info.ranking.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(data.empleada_info.ranking / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {data.empleada_info.ranking >= 4.5 ? '¡Excelente trabajo! Sigues siendo una de las mejores empleadas.' :
                 data.empleada_info.ranking >= 4.0 ? 'Muy buen rendimiento. Sigue así para alcanzar la excelencia.' :
                 data.empleada_info.ranking >= 3.5 ? 'Buen trabajo. Hay oportunidades de mejora.' :
                 'Enfócate en mejorar la calidad del servicio para subir tu ranking.'}
              </p>
            </div>

            {/* Métricas Básicas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-blue-600">--</p>
                <p className="text-xs text-gray-600">Servicios Mes</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-600">--</p>
                <p className="text-xs text-gray-600">Clientes Nuevos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#195083]">Accesos Rápidos</h3>
          </div>
          
          <div className="space-y-3">
            {/* Calificaciones */}
            <button 
              onClick={() => handleNavigation('calificaciones')}
              className="w-full p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Ver Calificaciones</p>
                  <p className="text-xs text-gray-600">Revisa feedback de clientes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Notificaciones */}
            <button 
              onClick={() => handleNavigation('notificaciones')}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Notificaciones</p>
                  <p className="text-xs text-gray-600">Mensajes del sistema</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            {/* Perfil */}
            <button 
              onClick={() => handleNavigation('perfil')}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Mi Perfil</p>
                  <p className="text-xs text-gray-600">Actualizar información</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje de Estado Actual */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#195083] to-[#4894AD] rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Estado: Lista para Trabajar</h4>
            <p className="text-gray-600 text-sm mb-4">
              Tu panel está configurado y listo. Puedes ver tus servicios asignados, actualizar tu ubicación 
              y gestionar tu disponibilidad desde los menús de navegación.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Perfil Activo
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Disponible para Servicios
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con Tips */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Consejos para Mejorar</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Mantén actualizada tu ubicación durante los servicios</li>
              <li>• Responde rápidamente a las asignaciones de trabajo</li>
              <li>• Brinda un servicio de calidad para mantener tu ranking alto</li>
              <li>• Configura tus horarios de disponibilidad correctamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withEmpleadaRole(EmpleadaIndex);