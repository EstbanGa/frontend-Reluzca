
import { useState, useEffect } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard from "@/components/ui/SlideRevealCard";

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
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t('empleada.dashboard.unknownError'));
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
    <div className="space-y-6">
      {/* Header con degradado */}
      <ListPageHeader
        theme={ROLE_THEMES.empleada}
        title={t('empleada.ratings.title')}
        subtitle={t('empleada.ratings.subtitle')}
        icon={<Award className="h-7 w-7" />}
      />

      {data && (
        <>
          {/* Estadísticas */}
          <ListStatsGrid
            columns={4}
            stats={[
              { label: t('empleada.ratings.stats.averageGeneral'), value: data.estadisticas.promedio_general.toFixed(1), color: '#4894AD', icon: <Sparkles className="h-4 w-4 text-yellow-500" /> },
              { label: t('empleada.ratings.stats.total'), value: data.estadisticas.total_calificaciones, color: '#D95B26', icon: <MessageSquare className="h-4 w-4 text-[#D95B26]" /> },
              { label: t('empleada.ratings.stats.service'), value: data.estadisticas.promedio_servicio.toFixed(1), color: '#2563eb', icon: <Star className="h-4 w-4 text-blue-500" /> },
              { label: t('empleada.ratings.stats.employee'), value: data.estadisticas.promedio_empleada.toFixed(1), color: '#16a34a', icon: <User className="h-4 w-4 text-green-500" /> },
            ]}
          />

          {/* Lista de calificaciones */}
          <div className="flex flex-col gap-2">
            {data.calificaciones.length > 0 ? (
              data.calificaciones.map((calificacion) => (
                <SlideRevealCard key={calificacion.id} buttonCount={1} actions={<></>}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4894AD] to-[#D95B26] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {calificacion.cliente.nombre[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {calificacion.cliente.nombre} {calificacion.cliente.apellido}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {calificacion.reserva.plan.nombre}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-0.5">
                          {renderStars(calificacion.calificacion_empleada)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(calificacion.fecha_creacion)}
                        </p>
                      </div>
                    </div>

                    {calificacion.comentario && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{calificacion.comentario}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-blue-500" />
                        {t('empleada.ratings.serviceRating', { n: calificacion.calificacion_servicio })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-green-500" />
                        {t('empleada.ratings.employeeRating', { n: calificacion.calificacion_empleada })}
                      </span>
                    </div>
                  </div>
                </SlideRevealCard>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {t('empleada.ratings.empty.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('empleada.ratings.empty.message')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default withEmpleadaRole(EmpleadaCalificaciones);