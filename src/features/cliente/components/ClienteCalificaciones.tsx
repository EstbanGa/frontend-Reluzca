
import { useState, useEffect } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { 
  Star, Plus, Trash2, RefreshCw, AlertCircle,
  Calendar, User, MessageSquare, X, Check
} from "lucide-react";
import { API_BASE_URL } from "@/config/env";

interface Calificacion {
  id: string;
  calificacion_servicio: number;
  calificacion_empleada: number | null;
  comentario: string | null;
  created_at: string | null;
  reserva: {
    id: string;
    fecha: string;
    plan: { nombre: string; } | null;
    empleada: { nombre: string; apellido: string; } | null;
  } | null;
}

interface CalificacionesData {
  message: string;
  calificaciones: Calificacion[];
  estadisticas: {
    total: number;
    promedio_servicio: number;
    promedio_empleada: number;
    por_calificacion: Record<string, number>;
  };
}

interface ReservaPendiente {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  plan: { nombre: string; } | null;
  empleada: { id: string; nombre: string; apellido: string; } | null;
  lugar: { nombre: string; } | null;
}

function CalificacionesPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<CalificacionesData | null>(null);
  const [reservasPendientes, setReservasPendientes] = useState<ReservaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<ReservaPendiente | null>(null);
  const [calificacionServicio, setCalificacionServicio] = useState(0);
  const [calificacionEmpleada, setCalificacionEmpleada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const fetchCalificaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const userDataString = localStorage.getItem('user');
      if (!userDataString) throw new Error("No hay datos de usuario");
      const userData = JSON.parse(userDataString);
      const response = await fetch(`${API_BASE_URL}/api/calificaciones/usuario/${userData.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchReservasPendientes = async () => {
    setLoadingPendientes(true);
    try {
      const userDataString = localStorage.getItem('user');
      if (!userDataString) throw new Error("No hay datos de usuario");
      const userData = JSON.parse(userDataString);
      const response = await fetch(`${API_BASE_URL}/api/calificaciones/reservas-pendientes/${userData.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setReservasPendientes(result.reservas || []);
    } catch (err) {
      // Error al cargar reservas pendientes
    } finally {
      setLoadingPendientes(false);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchReservasPendientes();
    setSelectedReserva(null);
    setCalificacionServicio(0);
    setCalificacionEmpleada(0);
    setComentario("");
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedReserva(null);
    setCalificacionServicio(0);
    setCalificacionEmpleada(0);
    setComentario("");
  };

  const handleSubmitCalificacion = async () => {
    if (!selectedReserva || calificacionServicio === 0) {
      alert(t('cliente.ratings.alerts.selectRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const userDataString = localStorage.getItem('user');
      if (!userDataString) throw new Error("No hay datos de usuario");
      const userData = JSON.parse(userDataString);
      const payload = {
        id_reserva: selectedReserva.id,
        id_usuario: userData.id,
        id_empleada: selectedReserva.empleada?.id || null,
        calificacion_servicio: calificacionServicio,
        calificacion_empleada: calificacionEmpleada > 0 ? calificacionEmpleada : null,
        comentario: comentario.trim() || null
      };
      const response = await fetch(`${API_BASE_URL}/api/calificaciones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear calificación');
      }
      alert(t('cliente.ratings.alerts.created'));
      handleCloseCreateModal();
      fetchCalificaciones();
    } catch (err) {
      alert(err instanceof Error ? err.message : t('cliente.pqrs.errors.createError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCalificacion = async (calificacionId: string) => {
    if (!confirm(t('cliente.ratings.alerts.confirmDelete'))) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/calificaciones/${calificacionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(t('cliente.pqrs.errors.deleteError'));
      alert(t('cliente.ratings.alerts.deleted'));
      fetchCalificaciones();
    } catch (err) {
      alert(t('cliente.pqrs.errors.deleteError'));
    }
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={onChange ? 24 : 20}
            className={`${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} ${
              onChange ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''
            }`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-[#4894AD] mx-auto animate-spin mb-4" />
          <p className="text-lg text-gray-600">{t('cliente.ratings.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cliente.ratings.errorLoading')}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchCalificaciones}
          className="bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw size={16} />
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4894AD] to-[#D95B26] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FCF7F0] mb-2">
              {t('cliente.ratings.title')}
            </h1>
            <p className="text-[#FCF7F0]/80 text-sm sm:text-base">
              {t('cliente.ratings.subtitle')}
            </p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-white text-[#4894AD] px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={18} />
            {t('cliente.ratings.newRating')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.ratings.stats.total')}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#4894AD]">
              {data.estadisticas.total}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.ratings.stats.service')}</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-600">
                {data.estadisticas.promedio_servicio.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.ratings.stats.employees')}</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-600">
                {data.estadisticas.promedio_empleada.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('cliente.ratings.stats.fiveStars')}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
              {data.estadisticas.por_calificacion[5] || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Calificaciones */}
      <div className="space-y-3 sm:space-y-4">
        {data.calificaciones.length > 0 ? (
          data.calificaciones.map((cal) => (
            <div key={cal.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="bg-[#4894AD]/10 p-2 rounded-lg flex-shrink-0">
                      <Calendar className="h-5 w-5 text-[#4894AD]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                        {cal.reserva?.fecha ? formatDate(cal.reserva.fecha) : t('cliente.ratings.noDate')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {cal.reserva?.plan?.nombre || t('cliente.ratings.noPlanAssigned')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCalificacion(cal.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Eliminar calificación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Calificación del Servicio */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-yellow-600 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">{t('cliente.ratings.stats.service')}</p>
                      {renderStars(cal.calificacion_servicio)}
                    </div>
                  </div>

                  {/* Calificación de la Empleada */}
                  {cal.calificacion_empleada && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#4894AD] to-[#D95B26] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {cal.reserva?.empleada ? `${cal.reserva.empleada.nombre} ${cal.reserva.empleada.apellido}` : 'Empleada'}
                        </p>
                        {renderStars(cal.calificacion_empleada)}
                      </div>
                    </div>
                  )}

                  {/* Empleada sin calificación */}
                  {!cal.calificacion_empleada && cal.reserva?.empleada && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#4894AD] to-[#D95B26] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {`${cal.reserva.empleada.nombre} ${cal.reserva.empleada.apellido}`}
                        </p>
                        <p className="text-xs text-gray-500">{t('cliente.ratings.unrated')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comentario */}
                {cal.comentario && (
                  <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">{cal.comentario}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cliente.ratings.empty')}</h3>
            <p className="text-gray-600 mb-4">{t('cliente.ratings.emptyMessage')}</p>
            <button 
              onClick={handleOpenCreateModal}
              className="bg-[#4894AD] text-white px-6 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus size={18} />
              {t('cliente.ratings.newRating')}
            </button>
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('cliente.ratings.modal.title')}</h2>
              <button onClick={handleCloseCreateModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {loadingPendientes ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-[#4894AD] mx-auto animate-spin mb-4" />
                <p className="text-gray-600">{t('cliente.ratings.loadingReservations')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selección de Reserva */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cliente.ratings.modal.selectReservation')}
                  </label>
                  {reservasPendientes.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {reservasPendientes.map((reserva) => (
                        <div
                          key={reserva.id}
                          onClick={() => setSelectedReserva(reserva)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedReserva?.id === reserva.id ? 'border-[#4894AD] bg-[#4894AD]/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedReserva?.id === reserva.id ? 'border-[#4894AD] bg-[#4894AD]' : 'border-gray-300'
                            }`}>
                              {selectedReserva?.id === reserva.id && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">
                                {formatDate(reserva.fecha)} - {formatTime(reserva.hora_inicio)}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {reserva.plan?.nombre || t('cliente.ratings.noPlan')} • {reserva.lugar?.nombre || t('cliente.ratings.noLocation')}
                              </p>
                              {reserva.empleada && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {t('cliente.ratings.employeeLabel')} {reserva.empleada.nombre} {reserva.empleada.apellido}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">{t('cliente.ratings.noPending')}</p>
                    </div>
                  )}
                </div>

                {/* Calificación del Servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('cliente.ratings.modal.rateService')}</label>
                  <div className="flex items-center gap-2">
                    {renderStars(calificacionServicio, setCalificacionServicio)}
                    {calificacionServicio > 0 && (
                      <span className="text-sm text-gray-600 ml-2">{t('cliente.ratings.modal.starsOf5', { n: calificacionServicio })}</span>
                    )}
                  </div>
                </div>

                {/* Calificación de la Empleada */}
                {selectedReserva?.empleada && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('cliente.ratings.modal.rateEmployee', { name: `${selectedReserva.empleada.nombre} ${selectedReserva.empleada.apellido}` })}
                    </label>
                    <div className="flex items-center gap-2">
                      {renderStars(calificacionEmpleada, setCalificacionEmpleada)}
                      {calificacionEmpleada > 0 && (
                        <span className="text-sm text-gray-600 ml-2">{t('cliente.ratings.modal.starsOf5', { n: calificacionEmpleada })}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Comentario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('cliente.ratings.modal.commentLabel')}</label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder={t('cliente.ratings.modal.commentPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseCreateModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={submitting}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSubmitCalificacion}
                    disabled={!selectedReserva || calificacionServicio === 0 || submitting}
                    className="flex-1 px-4 py-2 bg-[#4894AD] text-white rounded-lg hover:bg-[#195083] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        {t('cliente.ratings.saving')}
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        {t('cliente.ratings.saveRating')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withClienteRole(CalificacionesPage);
