
import { useState, useEffect } from "react";
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
  RefreshCw
} from "lucide-react";

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  estado: string;
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
  const navigate = useNavigate();

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
        throw new Error("No se encontró información del usuario");
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
      setError(err instanceof Error ? err.message : "Error desconocido");
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
          label: 'Completada'
        };
      case 'confirmada':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          label: 'Confirmada'
        };
      case 'en_proceso':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'En Proceso'
        };
      case 'cancelada':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: 'Cancelada'
        };
      case 'pendiente':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: 'Pendiente'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: estado
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error al cargar reservas</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchReservas}
          className="bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4894AD] to-[#D95B26] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FCF7F0] mb-2">
              Mis Reservas
            </h1>
            <p className="text-[#FCF7F0]/80 text-sm sm:text-base">
              Gestiona tus servicios de limpieza
            </p>
          </div>
          <button 
            onClick={handleCrearReserva}
            className="bg-white text-[#4894AD] px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={18} />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#4894AD]">
              {data.estadisticas.total}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Activas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600">
              {data.estadisticas.activas}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Completadas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
              {data.estadisticas.completadas}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Canceladas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">
              {data.estadisticas.canceladas}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
{/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por empleada, ubicación, plan..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Estado */}
          <div className="flex-shrink-0">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              <option value="todas" className="text-gray-900">Todas las reservas</option>
              <option value="pendiente" className="text-gray-900">Pendientes</option>
              <option value="confirmada" className="text-gray-900">Confirmadas</option>
              <option value="en_proceso" className="text-gray-900">En Proceso</option>
              <option value="completada" className="text-gray-900">Completadas</option>
              <option value="cancelada" className="text-gray-900">Canceladas</option>
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
              <div key={reserva.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Header de la reserva */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-[#4894AD]/10 p-2 rounded-lg flex-shrink-0">
                        <Calendar className="h-5 w-5 text-[#4894AD]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {formatDate(reserva.fecha)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(reserva.hora_inicio)} - {formatTime(reserva.hora_final)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${estadoConfig.color}`}>
                        <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        {estadoConfig.label}
                      </span>
                      
                      {puedeEditarse(reserva) && (
                        <button
                          onClick={() => handleEditarReserva(reserva.id)}
                          className="p-2 text-gray-400 hover:text-[#4894AD] hover:bg-[#4894AD]/10 rounded-lg transition-colors"
                          title="Editar reserva"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalles de la reserva */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Empleada */}
                    {reserva.empleada && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#4894AD] to-[#D95B26] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {reserva.empleada.nombre} {reserva.empleada.apellido}
                          </p>
                          {reserva.empleada.ranking && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{reserva.empleada.ranking}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ubicación */}
                    {reserva.lugar && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-[#D95B26]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-[#D95B26]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {reserva.lugar.nombre}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {reserva.lugar.tipo_lugar}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Plan y Precio */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {reserva.plan?.nombre || 'Plan personalizado'}
                        </p>
                        {reserva.precio_total && (
                          <p className="text-xs text-gray-600">
                            {formatCurrency(reserva.precio_total)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {reserva.descripcion && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Descripción:</span> {reserva.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {busqueda || filtroEstado !== 'todas' ? 'No se encontraron reservas' : 'No tienes reservas'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {busqueda || filtroEstado !== 'todas' 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Crea tu primera reserva para comenzar a disfrutar de nuestros servicios'
              }
            </p>
            {(!busqueda && filtroEstado === 'todas') && (
              <button 
                onClick={handleCrearReserva}
                className="bg-[#4894AD] text-white px-6 py-3 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Crear Primera Reserva
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withClienteRole(ClienteReservas);