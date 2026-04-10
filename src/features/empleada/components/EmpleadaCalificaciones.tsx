
import { useState, useEffect } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
import { 
  Star, 
  MessageSquare, 
  Calendar,
  RefreshCw,
  Award,
  TrendingUp,
  User,
  Sparkles
} from "lucide-react";

interface Calificacion {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  calificacion_servicio: number;
  calificacion_empleada: number;
  comentario: string;
  fecha_creacion: string;
  reserva: {
    fecha_servicio: string;
    plan: {
      nombre: string;
    };
  };
}

interface Data {
  calificaciones: Calificacion[];
  estadisticas: {
    promedio_general: number;
    total_calificaciones: number;
    promedio_servicio: number;
    promedio_empleada: number;
    distribucion: {
      "5": number;
      "4": number;
      "3": number;
      "2": number;
      "1": number;
    };
  };
}

function EmpleadaCalificaciones() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      
      // Por ahora datos de ejemplo hasta implementar endpoint
      const result: Data = {
        calificaciones: [],
        estadisticas: {
          promedio_general: 0,
          total_calificaciones: 0,
          promedio_servicio: 0,
          promedio_empleada: 0,
          distribucion: {
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0
          }
        }
      };
      
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 text-[#4894AD] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header con degradado */}
      <div className="bg-gradient-to-r from-[#4894AD] to-[#D95B26] rounded-2xl p-6 sm:p-8 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Mis Calificaciones
              </h1>
              <p className="text-white/90 text-sm">
                Revisa las calificaciones que han dejado tus clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Promedio General</p>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-[#4894AD]">
                {data.estadisticas.promedio_general.toFixed(1)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {renderStars(Math.round(data.estadisticas.promedio_general))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total</p>
                <MessageSquare className="h-5 w-5 text-[#D95B26]" />
              </div>
              <p className="text-3xl font-bold text-[#D95B26]">
                {data.estadisticas.total_calificaciones}
              </p>
              <p className="text-xs text-gray-500 mt-2">Calificaciones recibidas</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Servicio</p>
                <Star className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {data.estadisticas.promedio_servicio.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Calidad del servicio</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Empleada</p>
                <User className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {data.estadisticas.promedio_empleada.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Atención personal</p>
            </div>
          </div>

          {/* Lista de calificaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Calificaciones Recientes</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {data.calificaciones.length > 0 ? (
                data.calificaciones.map((calificacion) => (
                  <div key={calificacion.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4894AD] to-[#D95B26] flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {calificacion.cliente.nombre[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {calificacion.cliente.nombre} {calificacion.cliente.apellido}
                          </p>
                          <p className="text-sm text-gray-500">
                            {calificacion.reserva.plan.nombre}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {renderStars(calificacion.calificacion_empleada)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(calificacion.fecha_creacion)}
                        </p>
                      </div>
                    </div>

                    {calificacion.comentario && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700">{calificacion.comentario}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-blue-500" />
                        Servicio: {calificacion.calificacion_servicio}/5
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-green-500" />
                        Empleada: {calificacion.calificacion_empleada}/5
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aún no tienes calificaciones
                  </h3>
                  <p className="text-gray-600">
                    Las calificaciones de tus clientes aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default withEmpleadaRole(EmpleadaCalificaciones);