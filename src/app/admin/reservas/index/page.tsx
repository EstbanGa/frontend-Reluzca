"use client";

import { useState, useEffect } from "react";
import { withAdminRole } from "@/hoc/withRole";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/lib/dateUtils";
import { 
  Calendar, 
  Clock,
  MapPin,
  User,
  Edit3,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Star,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Bath,
  Layers,
  Ruler,
  Mail,
  Phone,
  Square,
  CheckSquare,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  fecha_registro?: string;
}

interface Empleada {
  id: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  ranking?: number;
}

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracion?: number;
  descripcion?: string;
}

interface Lugar {
  id: string;
  nombre?: string;
  direccion?: string;
  tipo_lugar?: string;
  ubicacion?: {
    lat?: number;
    lng?: number;
    formatted_address?: string;
  };
}

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
  cliente?: Cliente;
  empleada?: Empleada;
  plan?: Plan;
  lugar?: Lugar;
}

interface ReservasData {
  message: string;
  reservas: Reserva[];
  estadisticas: {
    total: number;
    total_filtradas: number;
    activas: number;
    completadas: number;
    canceladas: number;
    pendientes: number;
  };
  paginacion: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
    next_page?: number;
    previous_page?: number;
  };
  filtros_aplicados: {
    search: string;
    estado: string;
  };
}

// Opciones de estado para el filtro
const ESTADOS_RESERVA = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' }
];

function AdminReservas() {
  const [data, setData] = useState<ReservasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [reservasFiltradas, setReservasFiltradas] = useState<Reserva[]>([]);
  const [selectedReservas, setSelectedReservas] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchReservas();
  }, [currentPage]);

  useEffect(() => {
    if (data) {
      filtrarReservas();
    }
  }, [data, filtroEstado, busqueda]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const params = new URLSearchParams({
        page: currentPage.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/api/reservas?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const filtrarReservas = () => {
    if (!data) return;

    let reservas = [...data.reservas];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      reservas = reservas.filter(reserva => reserva.estado === filtroEstado);
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      reservas = reservas.filter(reserva => 
        reserva.id.toLowerCase().includes(searchTerm) ||
        reserva.cliente?.nombre?.toLowerCase().includes(searchTerm) ||
        reserva.cliente?.apellido?.toLowerCase().includes(searchTerm) ||
        reserva.cliente?.correo?.toLowerCase().includes(searchTerm) ||
        reserva.empleada?.nombre?.toLowerCase().includes(searchTerm) ||
        reserva.empleada?.apellido?.toLowerCase().includes(searchTerm) ||
        reserva.lugar?.nombre?.toLowerCase().includes(searchTerm) ||
        reserva.lugar?.direccion?.toLowerCase().includes(searchTerm) ||
        reserva.plan?.nombre?.toLowerCase().includes(searchTerm) ||
        reserva.descripcion?.toLowerCase().includes(searchTerm)
      );
    }

    setReservasFiltradas(reservas);
  };

  const handleSearch = (searchTerm: string) => {
    setBusqueda(searchTerm);
  };

  const handleEstadoFilter = (estado: string) => {
    setFiltroEstado(estado);
  };

  const handleSelectReserva = (id: string) => {
    setSelectedReservas(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedReservas.length === reservasFiltradas.length) {
      setSelectedReservas([]);
    } else {
      setSelectedReservas(reservasFiltradas.map(r => r.id));
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${ids.length} reserva(s)?`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/admin/reservas/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      alert(result.message);
      
      // Refrescar datos
      await fetchReservas();
      setSelectedReservas([]);
    } catch (err) {
      console.error('Error al eliminar reservas:', err);
      alert(err instanceof Error ? err.message : "Error al eliminar reservas");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Agrupar reservas por usuario
  const groupReservasByUser = (reservas: Reserva[]) => {
    const grouped = new Map<string, { cliente: Cliente; reservas: Reserva[] }>();
    
    reservas.forEach(reserva => {
      if (reserva.cliente) {
        const userId = reserva.cliente.id;
        if (!grouped.has(userId)) {
          grouped.set(userId, {
            cliente: reserva.cliente,
            reservas: []
          });
        }
        grouped.get(userId)!.reservas.push(reserva);
      }
    });
    
    return Array.from(grouped.entries()).map(([userId, data]) => ({
      userId,
      cliente: data.cliente,
      reservas: data.reservas
    }));
  };

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'completada':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Completada'
        };
      case 'confirmada':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          label: 'Confirmada'
        };
      case 'en_proceso':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'En Proceso'
        };
      case 'cancelada':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Cancelada'
        };
      case 'pendiente':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: 'Pendiente'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: estado
        };
    }
  };

  const openModal = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReserva(null);
  };

  const handleEditReserva = (id: string) => {
    // router.push(`/admin/reservas/editar/${id}`);
    router.push(`/admin/reservas/editar`);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#195083]"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error al cargar reservas</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchReservas}
          className="bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
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
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F0E7] mb-2">
              Gestión de Reservas
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
              Administra todas las reservas del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#195083]">
              {data?.estadisticas.total || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Activas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600">
              {data?.estadisticas.activas || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Completadas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
              {data?.estadisticas.completadas || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Canceladas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">
              {data?.estadisticas.canceladas || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Filtradas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600">
              {reservasFiltradas.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda - Mejorados con select */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Primera fila: Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, empleada, ubicación, plan..."
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
              value={busqueda}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Segunda fila: Filtro por Estado */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filtroEstado}
              onChange={(e) => handleEstadoFilter(e.target.value)}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              {ESTADOS_RESERVA.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Acciones de selección múltiple */}
      {selectedReservas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              {selectedReservas.length} reserva(s) seleccionada(s)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedReservas([])}
              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm"
            >
              Limpiar selección
            </button>
            <button
              onClick={() => handleDelete(selectedReservas)}
              disabled={deleteLoading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {deleteLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Reservas Agrupadas por Usuario */}
      <div className="space-y-3 sm:space-y-4">
        {reservasFiltradas.length > 0 ? (
          <>
            {/* Header de tabla con selección múltiple */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {selectedReservas.length === reservasFiltradas.length ? (
                  <CheckSquare className="h-5 w-5 text-[#195083]" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Seleccionar todas
              </span>
            </div>

            {groupReservasByUser(reservasFiltradas).map(({ userId, cliente, reservas }) => {
              const totalReservas = reservas.length;
              const totalPrecio = reservas.reduce((sum, r) => sum + (r.precio_total || 0), 0);
              const isUserExpanded = expandedUsers.has(userId);

              return (
                <div key={userId} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header del Usuario */}
                  <button
                    onClick={() => toggleUser(userId)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-[#195083] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {cliente.nombre} {cliente.apellido}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          ID: {userId.slice(-8)} • {cliente.correo}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {totalReservas} reserva{totalReservas !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-bold text-[#195083]">
                          {formatCurrency(totalPrecio)}
                        </p>
                      </div>
                      
                      {isUserExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Reservas del Usuario (Colapsable) */}
                  {isUserExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-4 space-y-3">
                      {reservas.map((reserva) => {
              const estadoConfig = getEstadoConfig(reserva.estado);
              const StatusIcon = estadoConfig.icon;
              const isSelected = selectedReservas.includes(reserva.id);
              
              return (
                <div key={reserva.id} className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm border transition-all ${isSelected ? 'border-[#195083] bg-blue-50' : 'border-gray-100 hover:shadow-md'}`}>
                  <div className="space-y-4">
                    {/* Header de la reserva */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleSelectReserva(reserva.id)}
                          className="p-1 hover:bg-gray-200 rounded mt-1 flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-[#195083]" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="bg-[#195083]/10 p-2 rounded-lg flex-shrink-0">
                          <Calendar className="h-5 w-5 text-[#195083]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              ID: {reserva.id.slice(-8)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {estadoConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatDate(reserva.fecha)} • {formatTime(reserva.hora_inicio)} - {formatTime(reserva.hora_final)}
                          </p>
                          
                          {/* Cliente info */}
                          {reserva.cliente && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {reserva.cliente.nombre} {reserva.cliente.apellido}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span>{reserva.cliente.correo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openModal(reserva)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditReserva(reserva.id)}
                          className="p-2 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-colors"
                          title="Editar reserva"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete([reserva.id])}
                          disabled={deleteLoading}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar reserva"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Detalles compactos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Empleada */}
                      {reserva.empleada && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-[#195083] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reserva.empleada.nombre} {reserva.empleada.apellido}
                            </p>
                            {reserva.empleada.ranking && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">{reserva.empleada.ranking}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ubicación */}
                      {reserva.lugar && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3 w-3 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reserva.lugar.nombre || 'Ubicación'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {reserva.lugar.tipo_lugar}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Plan */}
                      {reserva.plan && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reserva.plan.nombre}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatCurrency(reserva.plan.precio)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Precio Total */}
                      {reserva.precio_total && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Total
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                              {formatCurrency(reserva.precio_total)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    {reserva.descripcion && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <span className="font-medium">Descripción:</span> {reserva.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {(busqueda || filtroEstado !== 'todos') ? 'No se encontraron reservas' : 'No hay reservas'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {(busqueda || filtroEstado !== 'todos') 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Aún no se han registrado reservas en el sistema'
              }
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {data && data.paginacion.total_pages > 1 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((data.paginacion.current_page - 1) * 10) + 1} - {Math.min(data.paginacion.current_page * 10, data.paginacion.total_items)} de {data.paginacion.total_items} reservas
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(data.paginacion.previous_page!)}
                disabled={!data.paginacion.has_previous || loading}
                className="p-2 text-gray-400 hover:text-[#195083] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.paginacion.total_pages) }, (_, i) => {
                  const startPage = Math.max(1, data.paginacion.current_page - 2);
                  const pageNumber = startPage + i;
                  
                  if (pageNumber > data.paginacion.total_pages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      disabled={loading}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        pageNumber === data.paginacion.current_page
                          ? 'bg-[#195083] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(data.paginacion.next_page!)}
                disabled={!data.paginacion.has_next || loading}
                className="p-2 text-gray-400 hover:text-[#195083] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles con fondo transparente */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Overlay transparente */}
          <div 
            className="absolute inset-0" 
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#195083]/10 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-[#195083]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Reserva #{selectedReserva.id.slice(-8)}</h2>
                    <p className="text-gray-600">Detalles completos de la reserva</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Estado y fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estado y Horario
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const estadoConfig = getEstadoConfig(selectedReserva.estado);
                        const StatusIcon = estadoConfig.icon;
                        return (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${estadoConfig.color} flex items-center gap-1`}>
                            <StatusIcon className="h-4 w-4" />
                            {estadoConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-gray-700">{formatDate(selectedReserva.fecha)}</p>
                    <p className="text-sm text-gray-700">{formatTime(selectedReserva.hora_inicio)} - {formatTime(selectedReserva.hora_final)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Registro del Sistema</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Creada: {formatDateForModal(selectedReserva.created_at)}</p>
                    {selectedReserva.updated_at !== selectedReserva.created_at && (
                      <p>Actualizada: {formatDateForModal(selectedReserva.updated_at)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              {selectedReserva.cliente && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información del Cliente
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre completo</p>
                      <p className="font-medium text-gray-900">
                        {selectedReserva.cliente.nombre} {selectedReserva.cliente.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Correo electrónico
                      </p>
                      <p className="font-medium text-gray-900">{selectedReserva.cliente.correo}</p>
                    </div>
                    {selectedReserva.cliente.telefono && (
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Teléfono
                        </p>
                        <p className="font-medium text-gray-900">{selectedReserva.cliente.telefono}</p>
                      </div>
                    )}
                    {selectedReserva.cliente.fecha_registro && (
                      <div>
                        <p className="text-sm text-gray-600">Cliente desde</p>
                        <p className="font-medium text-gray-900">{formatDateForModal(selectedReserva.cliente.fecha_registro)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información del servicio */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Empleada */}
                {selectedReserva.empleada && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Empleada Asignada
                    </h4>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {selectedReserva.empleada.nombre} {selectedReserva.empleada.apellido}
                      </p>
                      {selectedReserva.empleada.telefono && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedReserva.empleada.telefono}
                        </p>
                      )}
                      {selectedReserva.empleada.ranking && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">Calificación: {selectedReserva.empleada.ranking}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Plan */}
                {selectedReserva.plan && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Plan de Servicio
                    </h4>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">{selectedReserva.plan.nombre}</p>
                      <p className="text-sm text-gray-700">{formatCurrency(selectedReserva.plan.precio)}</p>
                      {selectedReserva.plan.duracion && (
                        <p className="text-sm text-gray-600">Duración: {selectedReserva.plan.duracion} minutos</p>
                      )}
                      {selectedReserva.plan.descripcion && (
                        <p className="text-sm text-gray-600 mt-2">{selectedReserva.plan.descripcion}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ubicación */}
              {selectedReserva.lugar && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación del Servicio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedReserva.lugar.nombre && (
                      <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium text-gray-900">{selectedReserva.lugar.nombre}</p>
                      </div>
                    )}
                    {selectedReserva.lugar.tipo_lugar && (
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="font-medium text-gray-900 capitalize">{selectedReserva.lugar.tipo_lugar}</p>
                      </div>
                    )}
                    {selectedReserva.lugar.ubicacion?.formatted_address && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600">Dirección</p>
                        <p className="font-medium text-gray-900">{selectedReserva.lugar.ubicacion.formatted_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descripción y precio total */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {selectedReserva.descripcion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedReserva.descripcion}</p>
                  </div>
                )}

                {selectedReserva.precio_total && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precio Total
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedReserva.precio_total)}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    closeModal();
                    handleEditReserva(selectedReserva.id);
                  }}
                  className="flex-1 bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Reserva
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminReservas);