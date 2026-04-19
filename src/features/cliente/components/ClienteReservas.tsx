
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
import { 
  Calendar, 
  Clock,
  MapPin,
  User,
  Edit3,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  Star,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Eye
} from "lucide-react";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";
import ListDetailModal from "@/components/ui/ListDetailModal";

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  estado: string;
  estado_pago?: string;
  metodo_pago?: string;
  descripcion?: string;
  precio_total?: number;
  created_at: string;
  updated_at: string;
  empleada?: {
    id: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    ranking?: number;
  };
  plan?: {
    id: string;
    nombre: string;
    precio: number;
    duracion: number;
  };
  lugar?: {
    id: string;
    nombre: string;
    direccion: string;
    tipo_lugar: string;
  };
}

interface ReservasData {
  message: string;
  reservas: Reserva[];
  estadisticas: {
    total: number;
    activas: number;
    completadas: number;
    canceladas: number;
    pendientes: number;
  };
}

function ClienteReservas() {
  const [data, setData] = useState<ReservasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [reservasFiltradas, setReservasFiltradas] = useState<Reserva[]>([]);
  const [detailReserva, setDetailReserva] = useState<Reserva | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchReservas();
  }, []);

  useEffect(() => {
    if (data) {
      filtrarReservas();
    }
  }, [data, filtroEstado, busqueda]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      
      // Obtener el usuario_id desde localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error(t('cliente.reservations.userNotFound'));
      }
      
      const user = JSON.parse(userStr);
      const usuario_id = user.id;
      
      // Obtener las reservas del cliente (sin autenticación en el backend)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reservas/cliente/${usuario_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.reservations.errorUnknown'));
    } finally {
      setLoading(false);
    }
  };

  const filtrarReservas = () => {
    if (!data) return;

    let reservas = [...data.reservas];

    // Filtro por estado
    if (filtroEstado !== 'todas') {
      reservas = reservas.filter(reserva => reserva.estado === filtroEstado);
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      reservas = reservas.filter(reserva => 
        reserva.empleada?.nombre.toLowerCase().includes(searchTerm) ||
        reserva.empleada?.apellido.toLowerCase().includes(searchTerm) ||
        reserva.lugar?.nombre.toLowerCase().includes(searchTerm) ||
        reserva.plan?.nombre.toLowerCase().includes(searchTerm) ||
        reserva.descripcion?.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar por fecha (más recientes primero)
    reservas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    setReservasFiltradas(reservas);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'completada':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: t('common.statuses.completada')
        };
      case 'confirmada':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          label: t('common.statuses.confirmada')
        };
      case 'en_proceso':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: t('common.statuses.en_proceso')
        };
      case 'cancelada':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: t('common.statuses.cancelada')
        };
      case 'pendiente':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: t('common.statuses.pendiente')
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: t(`common.statuses.${estado}`, { defaultValue: estado })
        };
    }
  };

  const puedeEditarse = (reserva: Reserva) => {
    if (reserva.estado === 'completada' || reserva.estado === 'cancelada') {
      return false;
    }
    
    const fechaReserva = new Date(`${reserva.fecha}T${reserva.hora_inicio}`);
    const ahora = new Date();
    const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return diferenciaHoras > 24;
  };

  const handleCrearReserva = () => {
    navigate('/cliente/reservas/crear');
  };

  const handleEditarReserva = (id: string) => {
    // navigate(`/cliente/reservas/editar/${id}`);
      navigate(`/cliente/reservas/editar`);
  };

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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('cliente.reservations.errorLoading')}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchReservas}
          className="bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          {t('cliente.reservations.retry')}
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.cliente}
        title={t('cliente.reservations.title')}
        subtitle={t('cliente.reservations.subtitle')}
        icon={<Calendar className="h-7 w-7" />}
        actions={
          <button 
            onClick={handleCrearReserva}
            className="bg-white text-[#4894AD] px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={18} />
            {t('cliente.reservations.newReservation')}
          </button>
        }
      />

      {/* Stats Cards */}
      <ListStatsGrid
        columns={4}
        stats={[
          { label: t('cliente.reservations.stats.total'), value: data.estadisticas.total, color: '#4894AD' },
          { label: t('cliente.reservations.stats.active'), value: data.estadisticas.activas, color: '#2563eb' },
          { label: t('cliente.reservations.stats.completed'), value: data.estadisticas.completadas, color: '#16a34a' },
          { label: t('cliente.reservations.stats.cancelled'), value: data.estadisticas.canceladas, color: '#dc2626' },
        ]}
      />

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('cliente.reservations.search')}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              <option value="todas">{t('cliente.reservations.filters.all')}</option>
              <option value="pendiente">{t('cliente.reservations.filters.pending')}</option>
              <option value="confirmada">{t('cliente.reservations.filters.confirmed')}</option>
              <option value="en_proceso">{t('cliente.reservations.filters.inProgress')}</option>
              <option value="completada">{t('cliente.reservations.filters.completed')}</option>
              <option value="cancelada">{t('cliente.reservations.filters.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="space-y-3 sm:space-y-4">
        {reservasFiltradas.length > 0 ? (
          reservasFiltradas.map((reserva) => {
            const estadoConfig = getEstadoConfig(reserva.estado);
            const StatusIcon = estadoConfig.icon;
            
            return (
              <SlideRevealCard
                key={reserva.id}
                buttonCount={puedeEditarse(reserva) ? 2 : 1}
                actions={
                  <>
                    <SlideButton
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => setDetailReserva(reserva)}
                      title={t('cliente.reservations.viewDetails')}
                      hoverColor="hover:bg-blue-50 hover:text-[#4894AD]"
                    />
                    {puedeEditarse(reserva) && (
                      <SlideButton
                        icon={<Edit3 className="h-4 w-4" />}
                        onClick={() => handleEditarReserva(reserva.id)}
                        title={t('cliente.reservations.editReservation')}
                        hoverColor="hover:bg-blue-50 hover:text-[#4894AD]"
                      />
                    )}
                  </>
                }
                onClick={() => setDetailReserva(reserva)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-[#4894AD]/10 p-2 rounded-lg flex-shrink-0">
                        <Calendar className="h-5 w-5 text-[#4894AD]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {formatDate(reserva.fecha)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {reserva.empleada ? `${reserva.empleada.nombre} ${reserva.empleada.apellido}` : ''}
                          {reserva.lugar ? ` · ${reserva.lugar.nombre}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estadoConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {estadoConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(reserva.hora_inicio)} - {formatTime(reserva.hora_final)}
                    </span>
                    {reserva.plan && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {reserva.plan.nombre}
                      </span>
                    )}
                    {reserva.precio_total && (
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        {formatCurrency(reserva.precio_total)}
                      </span>
                    )}
                    {reserva.empleada?.ranking && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                        {reserva.empleada.ranking}
                      </span>
                    )}
                    {reserva.estado_pago && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        reserva.estado_pago === 'PAGADO' ? 'bg-green-100 text-green-800' :
                        reserva.estado_pago === 'PARCIAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(`common.paymentStatus.${reserva.estado_pago}`, { defaultValue: reserva.estado_pago })}
                      </span>
                    )}
                  </div>
                </div>
              </SlideRevealCard>
            );
          })
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {busqueda || filtroEstado !== 'todas' ? t('cliente.reservations.noResults') : t('cliente.reservations.empty')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {busqueda || filtroEstado !== 'todas' 
                ? t('cliente.reservations.tryFilters')
                : t('cliente.reservations.createFirstCTA')
              }
            </p>
            {(!busqueda && filtroEstado === 'todas') && (
              <button 
                onClick={handleCrearReserva}
                className="bg-[#4894AD] text-white px-6 py-3 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                {t('cliente.reservations.createFirst')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Modal detalle reserva */}
      <ListDetailModal
        theme={ROLE_THEMES.cliente}
        open={!!detailReserva}
        onClose={() => setDetailReserva(null)}
        title={t('cliente.reservations.viewDetails')}
        subtitle={detailReserva ? `${formatDate(detailReserva.fecha)} · ${formatTime(detailReserva.hora_inicio)} – ${formatTime(detailReserva.hora_final)}` : ""}
      >
        {detailReserva && (() => {
          const estadoConfig = getEstadoConfig(detailReserva.estado);
          const StatusIcon = estadoConfig.icon;
          return (
            <>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${estadoConfig.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  {estadoConfig.label}
                </span>
                {detailReserva.precio_total != null && (
                  <span className="ml-auto font-bold text-lg text-gray-900">
                    {formatCurrency(detailReserva.precio_total)}
                  </span>
                )}
              </div>

              {detailReserva.empleada && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('cliente.reservations.employee')}</p>
                  <p className="font-semibold text-gray-900">{detailReserva.empleada.nombre} {detailReserva.empleada.apellido}</p>
                  {detailReserva.empleada.telefono && (
                    <p className="text-sm text-gray-600 mt-1">{detailReserva.empleada.telefono}</p>
                  )}
                  {detailReserva.empleada.ranking != null && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{Number(detailReserva.empleada.ranking).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {detailReserva.plan && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('cliente.reservations.plan')}</p>
                    <p className="font-semibold text-gray-900 text-sm">{detailReserva.plan.nombre}</p>
                    {detailReserva.plan.precio != null && (
                      <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(detailReserva.plan.precio)}</p>
                    )}
                  </div>
                )}
                {detailReserva.lugar && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('cliente.reservations.location')}</p>
                    <p className="font-semibold text-gray-900 text-sm">{detailReserva.lugar.nombre}</p>
                    {detailReserva.lugar.direccion && (
                      <p className="text-xs text-gray-500 mt-0.5">{detailReserva.lugar.direccion}</p>
                    )}
                  </div>
                )}
              </div>

              {detailReserva.estado_pago && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('cliente.reservations.paymentStatus')}</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{detailReserva.estado_pago}</p>
                </div>
              )}

              {detailReserva.descripcion && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t('common.notes')}</p>
                  <p className="text-gray-700 text-sm">{detailReserva.descripcion}</p>
                </div>
              )}

              {puedeEditarse(detailReserva) && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => { setDetailReserva(null); handleEditarReserva(detailReserva.id); }}
                    className="flex-1 bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {t('cliente.reservations.editReservation')}
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </ListDetailModal>
    </>
  );
}

export default withClienteRole(ClienteReservas);