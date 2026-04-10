
import { useState, useEffect, useRef } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
import { API_BASE_URL } from "@/config/env";
import { 
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Home,
  Building2,
  Briefcase,
  Store,
  AlertCircle,
  RefreshCw,
  Eye,
  Square,
  CheckSquare,
  X,
  Check,
  Bath,
  Layers,
  Ruler,
  Calendar,
  Map,
  Loader2,
  Save
} from "lucide-react";

// Tipos predefinidos de ubicaciones
const TIPOS_LUGAR = [
  'Casa',
  'Apartamento',
  'Oficina',
  'Local Comercial',
  'Bodega',
  'Otro'
];

interface Ubicacion {
  id: string;
  nombre: string;
  tamaño: {
    categoria: string | null;
    metros: number | null;
    unidad: string | null;
    display: string;
  } | null;
  baños: number | null;
  pisos: number | null;
  ubicacion: {
    lat?: number;
    lng?: number;
    direccion?: string;
    formatted_address?: string;
  } | null;
  nombre_lugar: string | null;
  tipo_lugar: string | null;
  estado: boolean | null;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UbicacionesData {
  message: string;
  ubicaciones: Ubicacion[];
  estadisticas: {
    total: number;
    activas: number;
    inactivas: number;
    por_tamano?: Record<string, number>;
  };
}

// Hook personalizado para Google Maps
const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptsLoadedRef.current) {
      setIsLoaded(true);
      return;
    }

    if (typeof window !== 'undefined' && window.google?.maps) {
      setIsLoaded(true);
      scriptsLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      scriptsLoadedRef.current = true;
    };

    script.onerror = () => {
      setLoadError('Error cargando Google Maps');
    };

    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    }

    return () => {
      // No remover el script para evitar recargas
    };
  }, []);

  return { isLoaded, loadError };
};

// Componente de mapa interactivo con marcador fijo
const InteractiveMap = ({ ubicacion }: { ubicacion: Ubicacion['ubicacion'] }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded || mapInitialized || !mapContainerRef.current || !ubicacion?.lat || !ubicacion?.lng) {
      return;
    }

    try {
      const position = { lat: ubicacion.lat, lng: ubicacion.lng };

      // Crear el mapa interactivo
      const map = new google.maps.Map(mapContainerRef.current, {
        center: position,
        zoom: 15,
        gestureHandling: 'greedy', // Permitir todas las interacciones
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        mapTypeControl: true,
        rotateControl: false,
        scaleControl: true,
        panControl: true,
        clickableIcons: true,
        draggable: true, // Permitir arrastrar el mapa
      });

      mapRef.current = map;

      // Crear el marcador fijo (no se puede mover)
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        draggable: false, // El marcador no se puede mover
        title: ubicacion.formatted_address || ubicacion.direccion || 'Ubicación guardada',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="#4894AD" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      markerRef.current = marker;

      // Crear InfoWindow con la dirección
      const address = ubicacion.formatted_address || ubicacion.direccion;
      if (address) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <strong style="color: #4894AD;">Ubicación guardada</strong><br/>
              <span style="font-size: 14px; color: #666;">${address}</span>
            </div>
          `
        });

        // Mostrar InfoWindow al hacer clic en el marcador
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Mostrar InfoWindow automáticamente al cargar
        setTimeout(() => {
          infoWindow.open(map, marker);
        }, 1000);
      }

      setMapInitialized(true);

    } catch (err) {
      // Error inicializando mapa interactivo
    }
  }, [isLoaded, mapInitialized, ubicacion]);

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Error cargando el mapa</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Cargando mapa...</span>
        </div>
      </div>
    );
  }

  if (!ubicacion?.lat || !ubicacion?.lng) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Coordenadas no disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[400px] rounded-lg border border-gray-200"
      style={{ minHeight: '400px' }}
    />
  );
};

function ClienteUbicaciones() {
  const [data, setData] = useState<UbicacionesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState<Ubicacion[]>([]);
  const [selectedUbicaciones, setSelectedUbicaciones] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    tipo_lugar: '',
    tamaño: '',
    baños: '',
    pisos: '',
    descripcion: '',
    estado: true
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Función auxiliar para mostrar el tamaño
  const formatTamano = (tamano: Ubicacion['tamaño']) => {
    if (!tamano) return 'No especificado';
    return tamano.display || 'No especificado';
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  useEffect(() => {
    if (data) {
      filtrarUbicaciones();
    }
  }, [data, filtroTipo, filtroEstado, busqueda]);

  const fetchUbicaciones = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario_id del localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("No se encontró información del usuario");
      }
      
      const user = JSON.parse(userStr);
      const usuario_id = user.id;
      
      const response = await fetch(`${API_BASE_URL}/api/ubicaciones/cliente/${usuario_id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

  const filtrarUbicaciones = () => {
    if (!data) return;

    let ubicaciones = [...data.ubicaciones];

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      ubicaciones = ubicaciones.filter(ubicacion => ubicacion.tipo_lugar === filtroTipo);
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      const estadoBool = filtroEstado === 'activas';
      ubicaciones = ubicaciones.filter(ubicacion => ubicacion.estado === estadoBool);
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      ubicaciones = ubicaciones.filter(ubicacion => 
        ubicacion.nombre.toLowerCase().includes(searchTerm) ||
        ubicacion.nombre_lugar?.toLowerCase().includes(searchTerm) ||
        ubicacion.descripcion?.toLowerCase().includes(searchTerm) ||
        ubicacion.ubicacion?.direccion?.toLowerCase().includes(searchTerm) ||
        ubicacion.ubicacion?.formatted_address?.toLowerCase().includes(searchTerm)
      );
    }

    setUbicacionesFiltradas(ubicaciones);
  };

  const handleSelectUbicacion = (id: string) => {
    setSelectedUbicaciones(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUbicaciones.length === ubicacionesFiltradas.length) {
      setSelectedUbicaciones([]);
    } else {
      setSelectedUbicaciones(ubicacionesFiltradas.map(u => u.id));
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${ids.length} ubicación(es)?`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/clientes/ubicaciones/`, {
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
      await fetchUbicaciones();
      setSelectedUbicaciones([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar ubicaciones");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEditModal = (ubicacion: Ubicacion) => {
    setEditingUbicacion(ubicacion);
    setEditFormData({
      nombre: ubicacion.nombre,
      tipo_lugar: ubicacion.tipo_lugar || '',
      tamaño: ubicacion.tamaño?.metros?.toString() || '',
      baños: ubicacion.baños?.toString() || '',
      pisos: ubicacion.pisos?.toString() || '',
      descripcion: ubicacion.descripcion || '',
      estado: ubicacion.estado !== false
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUbicacion(null);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUbicacion) return;

    // Validaciones
    if (!editFormData.nombre.trim()) {
      setEditError('El nombre es obligatorio');
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);

      // Preparar campo tamaño con el formato correcto
      let tamañoData = null;
      if (editFormData.tamaño) {
        const metros = Number(editFormData.tamaño);
        let categoria = 'pequeño';
        if (metros > 150) categoria = 'grande';
        else if (metros > 80) categoria = 'mediano';

        tamañoData = {
          metros: metros,
          unidad: 'm²',
          categoria: categoria,
          display: `${metros} m² (${categoria.charAt(0).toUpperCase() + categoria.slice(1)})`
        };
      }

      const payload = {
        nombre: editFormData.nombre.trim(),
        tipo_lugar: editFormData.tipo_lugar || null,
        tamaño: tamañoData,
        baños: editFormData.baños ? parseInt(editFormData.baños) : null,
        pisos: editFormData.pisos ? parseInt(editFormData.pisos) : null,
        descripcion: editFormData.descripcion.trim() || null,
        estado: editFormData.estado
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ubicaciones/cliente/${editingUbicacion.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || 'Error al actualizar ubicación');
      }

      // Refrescar datos
      await fetchUbicaciones();
      handleCloseEditModal();
      
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al actualizar ubicación');
    } finally {
      setEditLoading(false);
    }
  };

  const getTipoInfo = (tipo: string) => {
    const tipoInfo = TIPOS_LUGAR.find(t => t === tipo);
    return tipoInfo ? { value: tipo, label: tipo, icon: MapPin } : { value: tipo, label: tipo, icon: MapPin };
  };

  const openModal = (ubicacion: Ubicacion) => {
    setSelectedUbicacion(ubicacion);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUbicacion(null);
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error al cargar ubicaciones</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchUbicaciones}
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
              Mis Ubicaciones
            </h1>
            <p className="text-[#FCF7F0]/80 text-sm sm:text-base">
              Gestiona los lugares donde necesitas servicios de limpieza
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button 
              onClick={() => navigate('/cliente/ubicaciones/crear')}
              className="bg-white text-[#4894AD] px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
            >
              <Plus size={18} />
              Nueva Ubicación
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
              {data.estadisticas.activas}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Inactivas</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">
              {data.estadisticas.inactivas}
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
              placeholder="Buscar por nombre, lugar, descripción..."
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Segunda fila: Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              <option value="todos">Todos los tipos</option>
              {TIPOS_LUGAR.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acciones de selección múltiple */}
      {selectedUbicaciones.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              {selectedUbicaciones.length} ubicación(es) seleccionada(s)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedUbicaciones([])}
              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm"
            >
              Limpiar selección
            </button>
            <button
              onClick={() => handleDelete(selectedUbicaciones)}
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

      {/* Lista de Ubicaciones */}
      <div className="space-y-3 sm:space-y-4">
        {ubicacionesFiltradas.length > 0 ? (
          <>
            {/* Header de tabla con selección múltiple */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {selectedUbicaciones.length === ubicacionesFiltradas.length ? (
                  <CheckSquare className="h-5 w-5 text-[#4894AD]" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Seleccionar todas
              </span>
            </div>

            {ubicacionesFiltradas.map((ubicacion) => {
              const tipoInfo = getTipoInfo(ubicacion.tipo_lugar || 'otro');
              const TipoIcon = tipoInfo.icon;
              const isSelected = selectedUbicaciones.includes(ubicacion.id);
              
              return (
                <div key={ubicacion.id} className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm border transition-all ${isSelected ? 'border-[#4894AD] bg-blue-50' : 'border-gray-100 hover:shadow-md'}`}>
                  <div className="space-y-4">
                    {/* Header de la ubicación - Responsive mejorado */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleSelectUbicacion(ubicacion.id)}
                          className="p-1 hover:bg-gray-200 rounded mt-1 flex-shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-[#4894AD]" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="bg-[#4894AD]/10 p-2 rounded-lg flex-shrink-0">
                          <TipoIcon className="h-5 w-5 text-[#4894AD]" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">
                            {ubicacion.nombre}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 flex-wrap">
                            <span className="capitalize">{tipoInfo.label}</span>
                            {ubicacion.nombre_lugar && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="break-words">{ubicacion.nombre_lugar}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Botones - Debajo del nombre en móvil, al lado en desktop */}
                      <div className="flex items-center gap-2 flex-shrink-0 sm:mt-0 mt-2 justify-start sm:justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${ubicacion.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {ubicacion.estado ? 'Activa' : 'Inactiva'}
                        </span>
                        
                        <button
                          onClick={() => openModal(ubicacion)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEditModal(ubicacion)}
                          className="p-2 text-gray-400 hover:text-[#4894AD] hover:bg-[#4894AD]/10 rounded-lg transition-colors"
                          title="Editar ubicación"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete([ubicacion.id])}
                          disabled={deleteLoading}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar ubicación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Información resumida */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {ubicacion.tamaño && formatTamano(ubicacion.tamaño) !== 'No especificado' && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Ruler className="h-4 w-4" />
                          <span>{formatTamano(ubicacion.tamaño)}</span>
                        </div>
                      )}
                      
                      {ubicacion.baños && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bath className="h-4 w-4" />
                          <span>{ubicacion.baños} baño{ubicacion.baños !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {ubicacion.pisos && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Layers className="h-4 w-4" />
                          <span>{ubicacion.pisos} piso{ubicacion.pisos !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(ubicacion.created_at)}</span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {ubicacion.descripcion && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {ubicacion.descripcion}
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
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {busqueda || filtroTipo !== 'todos' || filtroEstado !== 'todos' 
                ? 'No se encontraron ubicaciones' 
                : 'No tienes ubicaciones registradas'
              }
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {busqueda || filtroTipo !== 'todos' || filtroEstado !== 'todos'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Registra tu primera ubicación para comenzar a programar servicios'
              }
            </p>
            {(!busqueda && filtroTipo === 'todos' && filtroEstado === 'todos') && (
              <button 
                onClick={() => navigate('/cliente/ubicaciones/crear')}
                className="bg-[#4894AD] text-white px-6 py-3 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Crear Primera Ubicación
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalles con fondo completamente transparente */}
      {showModal && selectedUbicacion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Overlay completamente transparente */}
          <div 
            className="absolute inset-0" 
            onClick={closeModal}
          ></div>
          
          {/* Modal content */}
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4894AD]/10 p-3 rounded-lg">
                    {(() => {
                      const TipoIcon = getTipoInfo(selectedUbicacion.tipo_lugar || 'otro').icon;
                      return <TipoIcon className="h-6 w-6 text-[#4894AD]" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUbicacion.nombre}</h2>
                    <p className="text-gray-600 capitalize">{getTipoInfo(selectedUbicacion.tipo_lugar || 'otro').label}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="space-y-6">
                {/* Estado */}
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${selectedUbicacion.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedUbicacion.estado ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {selectedUbicacion.estado ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedUbicacion.nombre_lugar && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Nombre del lugar
                      </h4>
                      <p className="text-gray-700">{selectedUbicacion.nombre_lugar}</p>
                    </div>
                  )}

                  {selectedUbicacion.tamaño && formatTamano(selectedUbicacion.tamaño) !== 'No especificado' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Tamaño
                      </h4>
                      <p className="text-gray-700">{formatTamano(selectedUbicacion.tamaño)}</p>
                      {selectedUbicacion.tamaño.metros && selectedUbicacion.tamaño.categoria && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>• Área: {selectedUbicacion.tamaño.metros} {selectedUbicacion.tamaño.unidad}</p>
                          <p>• Categoría: {selectedUbicacion.tamaño.categoria.charAt(0).toUpperCase() + selectedUbicacion.tamaño.categoria.slice(1)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedUbicacion.baños && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        Baños
                      </h4>
                      <p className="text-gray-700">{selectedUbicacion.baños} baño{selectedUbicacion.baños !== 1 ? 's' : ''}</p>
                    </div>
                  )}

                  {selectedUbicacion.pisos && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Pisos
                      </h4>
                      <p className="text-gray-700">{selectedUbicacion.pisos} piso{selectedUbicacion.pisos !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>

                {/* Ubicación geográfica con mapa interactivo */}
                {selectedUbicacion.ubicacion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      Ubicación
                    </h4>
                    
                    {/* Dirección usando formatted_address */}
                    {(selectedUbicacion.ubicacion.formatted_address || selectedUbicacion.ubicacion.direccion) && (
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-700 font-medium">
                          📍 {selectedUbicacion.ubicacion.formatted_address || selectedUbicacion.ubicacion.direccion}
                        </p>
                      </div>
                    )}
                    
                    {/* Mapa interactivo integrado */}
                    <div className="mb-4">
                      <InteractiveMap ubicacion={selectedUbicacion.ubicacion} />
                    </div>
                    
                    {/* Información técnica */}
                    {selectedUbicacion.ubicacion.lat && selectedUbicacion.ubicacion.lng && (
                      <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                        <p className="font-medium mb-1">Información técnica:</p>
                        <p className="mt-2 text-xs text-gray-500">
                          💡 Puedes hacer zoom y moverte por el mapa. El marcador azul muestra la ubicación exacta guardada.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Descripción */}
                {selectedUbicacion.descripcion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedUbicacion.descripcion}</p>
                  </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de creación
                    </h4>
                    <p className="text-gray-700">{formatDate(selectedUbicacion.created_at)}</p>
                  </div>

                  {selectedUbicacion.updated_at && selectedUbicacion.updated_at !== selectedUbicacion.created_at && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Última actualización
                      </h4>
                      <p className="text-gray-700">{formatDate(selectedUbicacion.updated_at)}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      closeModal();
                      handleOpenEditModal(selectedUbicacion);
                    }}
                    className="flex-1 bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      handleDelete([selectedUbicacion.id]);
                    }}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && editingUbicacion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black/20" 
            onClick={handleCloseEditModal}
          ></div>
          
          <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4894AD]/10 p-3 rounded-lg">
                    <Edit3 className="h-6 w-6 text-[#4894AD]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Editar Ubicación</h2>
                    <p className="text-sm text-gray-600 mt-1">{editingUbicacion.nombre}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                {/* Error */}
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{editError}</p>
                  </div>
                )}

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la ubicación *
                  </label>
                  <input
                    type="text"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent placeholder:text-gray-700 text-gray-900"
                    placeholder="Ej: Casa Principal"
                  />
                </div>

                {/* Tipo de lugar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de lugar
                  </label>
                  <select
                    value={editFormData.tipo_lugar}
                    onChange={(e) => setEditFormData({...editFormData, tipo_lugar: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900"
                  >
                    <option value="">Selecciona un tipo</option>
                    {TIPOS_LUGAR.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid de campos numéricos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tamaño */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño (m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.tamaño}
                      onChange={(e) => setEditFormData({...editFormData, tamaño: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent placeholder:text-gray-700 text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  {/* Baños */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Baños
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.baños}
                      onChange={(e) => setEditFormData({...editFormData, baños: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent placeholder:text-gray-700 text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  {/* Pisos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pisos
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.pisos}
                      onChange={(e) => setEditFormData({...editFormData, pisos: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent placeholder:text-gray-700 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editFormData.descripcion}
                    onChange={(e) => setEditFormData({...editFormData, descripcion: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent resize-none placeholder:text-gray-700 text-gray-900"
                    placeholder="Agrega detalles adicionales sobre esta ubicación..."
                  />
                </div>

                {/* Estado */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="editEstado"
                    checked={editFormData.estado}
                    onChange={(e) => setEditFormData({...editFormData, estado: e.target.checked})}
                    className="w-4 h-4 text-[#4894AD] border-gray-300 rounded focus:ring-[#4894AD]"
                  />
                  <label htmlFor="editEstado" className="text-sm font-medium text-gray-700">
                    Ubicación activa
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleCloseEditModal}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                    className="flex-1 bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083] transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {editLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withClienteRole(ClienteUbicaciones);