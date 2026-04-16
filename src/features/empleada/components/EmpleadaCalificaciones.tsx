
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{t('empleada.ratings.recentTitle')}</h2>
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
                        {t('empleada.ratings.serviceRating', { n: calificacion.calificacion_servicio })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-green-500" />
                        {t('empleada.ratings.employeeRating', { n: calificacion.calificacion_empleada })}
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
                    {t('empleada.ratings.empty.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('empleada.ratings.empty.message')}
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