
import { useState, useEffect } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
import { 
  Calendar, 
  Clock,
  DollarSign,
  User,
  Edit3,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Star,
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Square,
  CheckSquare,
  Trash2,
  Plus,
  Package,
  FileText,
  Tag,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface Plan {
  id: string;
  estado: boolean;
  nombre: string;
  servicios_asociados?: string[] | string | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  descripcion?: string | null;
  hora_inicio?: string | null;
  hora_final?: string | null;
  precio?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PlanesResponse {
  success: boolean;
  planes: Plan[];
  estadisticas: {
    total: number;
    activos: number;
    inactivos: number;
    precio_promedio: number;
    precio_min: number;
    precio_max: number;
  };
}

function AdminPlanes() {
  const [data, setData] = useState<PlanesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [planesFiltrados, setPlanesFiltrados] = useState<Plan[]>([]);
  const [selectedPlanes, setSelectedPlanes] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  // Opciones de estado para el filtro
  const ESTADOS_PLAN = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' }
  ];

  useEffect(() => {
    fetchPlanes();
  }, []);

  useEffect(() => {
    if (data) {
      filtrarPlanes();
    }
  }, [data, filtroEstado, busqueda]);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${API_BASE_URL}/api/planes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // El backend devuelve directamente la lista de planes
      let planes: Plan[] = [];
      
      if (Array.isArray(result)) {
        planes = result;
      } else if (result.success && Array.isArray(result.planes)) {
        planes = result.planes;
      } else {
        throw new Error(result.error || 'Error al cargar planes');
      }

      // Calcular estadísticas localmente
      const activos = planes.filter(p => p.estado).length;
      const inactivos = planes.filter(p => !p.estado).length;
      const precios = planes.map(p => p.precio || 0).filter(p => p > 0);
      const precio_promedio = precios.length > 0 
        ? precios.reduce((a, b) => a + b, 0) / precios.length 
        : 0;
      const precio_min = precios.length > 0 ? Math.min(...precios) : 0;
      const precio_max = precios.length > 0 ? Math.max(...precios) : 0;

      setData({
        success: true,
        planes,
        estadisticas: {
          total: planes.length,
          activos,
          inactivos,
          precio_promedio,
          precio_min,
          precio_max
        }
      });
      setError(null);
    } catch (err) {
      console.error('Error al cargar planes:', err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const filtrarPlanes = () => {
    if (!data) return;

    let planes = [...data.planes];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      planes = planes.filter(plan => {
        if (filtroEstado === 'activo') return plan.estado === true;
        if (filtroEstado === 'inactivo') return plan.estado === false;
        return true;
      });
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      planes = planes.filter(plan => 
        plan.id.toLowerCase().includes(searchTerm) ||
        plan.nombre?.toLowerCase().includes(searchTerm) ||
        plan.descripcion?.toLowerCase().includes(searchTerm) ||
        (typeof plan.servicios_asociados === 'string' && plan.servicios_asociados.toLowerCase().includes(searchTerm)) ||
        (Array.isArray(plan.servicios_asociados) && plan.servicios_asociados.some(s => s.toLowerCase().includes(searchTerm))) ||
        plan.precio?.toString().includes(searchTerm)
      );
    }

    setPlanesFiltrados(planes);
  };

  const handleSearch = (searchTerm: string) => {
    setBusqueda(searchTerm);
  };

  const handleEstadoFilter = (estado: string) => {
    setFiltroEstado(estado);
  };

  const handleSelectPlan = (id: string) => {
    setSelectedPlanes(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlanes.length === planesFiltrados.length) {
      setSelectedPlanes([]);
    } else {
      setSelectedPlanes(planesFiltrados.map(p => p.id));
    }
  };

  const handleToggleEstado = async (id: string, currentEstado: boolean) => {
    try {
      setToggleLoading(id);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${API_BASE_URL}/api/planes`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: id,
          estado: !currentEstado 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Refrescar datos
        await fetchPlanes();
      } else {
        throw new Error(result.error || 'Error al actualizar plan');
      }
    } catch (err) {
      console.error('Error al cambiar estado del plan:', err);
      alert(err instanceof Error ? err.message : "Error al cambiar estado del plan");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${ids.length} plan(es)?`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${API_BASE_URL}/api/planes`, {
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
      if (result.success) {
        alert(result.message);
        // Refrescar datos
        await fetchPlanes();
        setSelectedPlanes([]);
      } else {
        throw new Error(result.error || 'Error al eliminar planes');
      }
    } catch (err) {
      console.error('Error al eliminar planes:', err);
      alert(err instanceof Error ? err.message : "Error al eliminar planes");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'No especificado';
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    } catch {
      return 'Precio inválido';
    }
  };

  const formatServicios = (servicios: string[] | string | null | undefined) => {
    if (!servicios) return 'Sin servicios';
    if (Array.isArray(servicios)) {
      return servicios.join(', ');
    }
    return servicios;
  };

  const openModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  const handleEditPlan = (id: string) => {
    // navigate(`/admin/planes/editar/${id}`);
    navigate(`/admin/planes/editar`);
  };

  const handleCreatePlan = () => {
    navigate('/admin/planes/crear');
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error al cargar planes</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchPlanes}
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
              Gestión de Planes
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
              Administra todos los planes de servicio
            </p>
          </div>
          <button
            onClick={handleCreatePlan}
            className="bg-[#D95B26] hover:bg-[#b8491f] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-base flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Crear Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Activos</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
              {data?.estadisticas.activos || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Inactivos</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">
              {data?.estadisticas.inactivos || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Filtrados</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600">
              {planesFiltrados.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Primera fila: Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción, servicios, precio..."
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
              {ESTADOS_PLAN.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Acciones de selección múltiple */}
      {selectedPlanes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              {selectedPlanes.length} plan(es) seleccionado(s)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPlanes([])}
              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm"
            >
              Limpiar selección
            </button>
            <button
              onClick={() => handleDelete(selectedPlanes)}
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

      {/* Lista de Planes */}
      <div className="space-y-3 sm:space-y-4">
        {planesFiltrados.length > 0 ? (
          <>
            {/* Header de tabla con selección múltiple */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {selectedPlanes.length === planesFiltrados.length ? (
                  <CheckSquare className="h-5 w-5 text-[#195083]" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Seleccionar todos
              </span>
            </div>

            {planesFiltrados.map((plan) => {
              const isSelected = selectedPlanes.includes(plan.id);
              
              return (
                <div key={plan.id} className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm border transition-all ${isSelected ? 'border-[#195083] bg-blue-50' : 'border-gray-100 hover:shadow-md'}`}>
                  <div className="space-y-4">
                    {/* Header del plan */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleSelectPlan(plan.id)}
                          className="p-1 hover:bg-gray-200 rounded mt-1 flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-[#195083]" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="bg-[#195083]/10 p-2 rounded-lg flex-shrink-0">
                          <Package className="h-5 w-5 text-[#195083]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {plan.nombre}
                            </h3>
                            <button
                              onClick={() => handleToggleEstado(plan.id, plan.estado)}
                              disabled={toggleLoading === plan.id}
                              className="flex items-center gap-1"
                            >
                              {toggleLoading === plan.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                              ) : plan.estado ? (
                                <ToggleRight className="h-5 w-5 text-green-500 hover:text-green-600" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-red-500 hover:text-red-600" />
                              )}
                              <span className={`text-xs font-medium ${plan.estado ? 'text-green-600' : 'text-red-600'}`}>
                                {plan.estado ? 'Activo' : 'Inactivo'}
                              </span>
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            ID: {plan.id.slice(-8)}
                          </p>
                          
                          {/* Precio */}
                          {plan.precio && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-bold text-green-600">
                                {formatCurrency(plan.precio)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openModal(plan)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditPlan(plan.id)}
                          className="p-2 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-colors"
                          title="Editar plan"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete([plan.id])}
                          disabled={deleteLoading}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Detalles compactos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Fechas */}
                      {(plan.fecha_inicio || plan.fecha_final) && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Vigencia</p>
                            <p className="text-xs text-gray-600">
                              {formatDate(plan.fecha_inicio)} - {formatDate(plan.fecha_final)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Horarios */}
                      {(plan.hora_inicio || plan.hora_final) && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-3 w-3 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Horario</p>
                            <p className="text-xs text-gray-600">
                              {formatTime(plan.hora_inicio)} - {formatTime(plan.hora_final)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Servicios */}
                      {plan.servicios_asociados && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Tag className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">Servicios</p>
                            <p className="text-xs text-gray-600 truncate">
                              {formatServicios(plan.servicios_asociados)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    {plan.descripcion && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <span className="font-medium">Descripción:</span> {plan.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {(busqueda || filtroEstado !== 'todos') ? 'No se encontraron planes' : 'No hay planes'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {(busqueda || filtroEstado !== 'todos') 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Aún no se han creado planes en el sistema'
              }
            </p>
            {!(busqueda || filtroEstado !== 'todos') && (
              <button
                onClick={handleCreatePlan}
                className="mt-4 bg-[#195083] text-white px-6 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Crear Primer Plan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#195083]/10 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-[#195083]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPlan.nombre}</h2>
                    <p className="text-gray-600">Detalles completos del plan</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Estado y precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Estado y Precio
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        selectedPlan.estado 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {selectedPlan.estado ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {selectedPlan.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    {selectedPlan.precio && (
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedPlan.precio)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Registro del Sistema</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Creado: {formatDateForModal(selectedPlan.created_at)}</p>
                    {selectedPlan.updated_at !== selectedPlan.created_at && (
                      <p>Actualizado: {formatDateForModal(selectedPlan.updated_at)}</p>
                    )}
                    <p className="text-xs text-gray-500">ID: {selectedPlan.id}</p>
                  </div>
                </div>
              </div>

              {/* Vigencia y horarios */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Vigencia */}
                {(selectedPlan.fecha_inicio || selectedPlan.fecha_final) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Vigencia del Plan
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Fecha de inicio</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedPlan.fecha_inicio)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fecha de finalización</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedPlan.fecha_final)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Horarios */}
                {(selectedPlan.hora_inicio || selectedPlan.hora_final) && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horarios de Servicio
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Hora de inicio</p>
                        <p className="font-medium text-gray-900">{formatTime(selectedPlan.hora_inicio)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hora de finalización</p>
                        <p className="font-medium text-gray-900">{formatTime(selectedPlan.hora_final)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Servicios asociados */}
              {selectedPlan.servicios_asociados && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Servicios Asociados
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{formatServicios(selectedPlan.servicios_asociados)}</p>
                </div>
              )}

              {/* Descripción */}
              {selectedPlan.descripcion && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción del Plan
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedPlan.descripcion}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    closeModal();
                    handleEditPlan(selectedPlan.id);
                  }}
                  className="flex-1 bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Plan
                </button>
                <button
                  onClick={() => handleToggleEstado(selectedPlan.id, selectedPlan.estado)}
                  disabled={toggleLoading === selectedPlan.id}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                    selectedPlan.estado 
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {toggleLoading === selectedPlan.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : selectedPlan.estado ? (
                    <ToggleLeft className="h-4 w-4" />
                  ) : (
                    <ToggleRight className="h-4 w-4" />
                  )}
                  {selectedPlan.estado ? 'Desactivar' : 'Activar'}
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

export default withAdminRole(AdminPlanes);