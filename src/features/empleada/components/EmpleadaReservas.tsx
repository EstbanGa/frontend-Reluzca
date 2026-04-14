
import { useState, useEffect, useRef } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  Filter,
  Home,
  Building2,
  Briefcase,
  Store,
  AlertCircle,
  RefreshCw,
  Eye,
  Bath,
  Layers,
  Ruler,
  CheckCircle,
  XCircle,
  Loader2,
  Map,
  Phone,
  Mail,
  FileText,
  Package,
  X
} from "lucide-react";

// Tipos predefinidos de ubicaciones (values only, labels translated at render)
const TIPOS_LUGAR_VALUES = [
  { value: 'casa', key: 'house', icon: Home },
  { value: 'apartamento', key: 'apartment', icon: Building2 },
  { value: 'oficina', key: 'office', icon: Briefcase },
  { value: 'local_comercial', key: 'commercial', icon: Store },
  { value: 'otro', key: 'other', icon: MapPin }
];

// Estados de servicio con colores (labels translated at render)
const ESTADOS_SERVICIO_VALUES = {
  'PENDIENTE': { key: 'pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'EN_PROGRESO': { key: 'inProgress', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  'COMPLETADO': { key: 'completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'CANCELADO': { key: 'cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
};

interface ClienteInfo {
  nombre: string;
  telefono: string;
  correo: string;
}

interface PlanInfo {
  id: string;
  nombre: string;
  descripcion: string | null;
  servicios_asociados: string[];
  precio: number | null;
}

interface UbicacionInfo {
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
  descripcion: string | null;
}

interface Servicio {
  id: string;
  cliente: ClienteInfo;
  plan: PlanInfo | null;
  ubicacion: UbicacionInfo | null;
  fecha: string | null;
  hora_inicio: string | null;
  hora_final: string | null;
  estado: string | null;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ServiciosData {
  message: string;
  servicios: Servicio[];
  estadisticas: {
    total: number;
    por_estado: {
      pendientes: number;
      en_progreso: number;
      completados: number;
      cancelados: number;
    };
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
      setLoadError('Error loading Google Maps');
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
const InteractiveMap = ({ ubicacion }: { ubicacion: UbicacionInfo['ubicacion'] }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const { t } = useTranslation();
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
        gestureHandling: 'greedy',
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
        draggable: true,
      });

      mapRef.current = map;

      // Crear el marcador fijo
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        draggable: false,
        title: ubicacion.formatted_address || ubicacion.direccion || t('empleada.services.modal.serviceLocation'),
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="#D95B26" stroke="white" stroke-width="2"/>
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
              <strong style="color: #D95B26;">${t('empleada.services.modal.serviceLocation')}</strong><br/>
              <span style="font-size: 14px; color: #666;">${address}</span>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        setTimeout(() => {
          infoWindow.open(map, marker);
        }, 1000);
      }

      setMapInitialized(true);

    } catch (err) {
      console.error('Error inicializando mapa interactivo:', err);
    }
  }, [isLoaded, mapInitialized, ubicacion]);

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{t('empleada.services.errorLoadingMap')}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t('empleada.services.loadingMap')}</span>
        </div>
      </div>
    );
  }

  if (!ubicacion?.lat || !ubicacion?.lng) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{t('empleada.services.coordinatesUnavailable')}</p>
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

function EmpleadaServicios() {
  const { t } = useTranslation();
  const [data, setData] = useState<ServiciosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [serviciosFiltrados, setServiciosFiltrados] = useState<Servicio[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);

  // Función auxiliar para mostrar el tamaño
  const formatTamano = (tamano: UbicacionInfo['tamaño']) => {
    if (!tamano) return t('empleada.services.notSpecified');
    return tamano.display || t('empleada.services.notSpecified');
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  useEffect(() => {
    if (data) {
      filtrarServicios();
    }
  }, [data, filtroEstado, busqueda]);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      
      // Por ahora retornamos estructura completa con valores vacíos hasta implementar el endpoint
      const result: ServiciosData = { 
        message: "Servicios cargados",
        servicios: [],
        estadisticas: {
          total: 0,
          por_estado: {
            pendientes: 0,
            en_progreso: 0,
            completados: 0,
            cancelados: 0
          }
        }
      };
      setData(result);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError(err instanceof Error ? err.message : t('empleada.dashboard.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const filtrarServicios = () => {
    if (!data) return;

    let servicios = [...(data.servicios || [])];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      servicios = servicios.filter(servicio => servicio.estado === filtroEstado.toUpperCase());
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      servicios = servicios.filter(servicio => 
        servicio.cliente.nombre.toLowerCase().includes(searchTerm) ||
        servicio.ubicacion?.nombre.toLowerCase().includes(searchTerm) ||
        servicio.ubicacion?.nombre_lugar?.toLowerCase().includes(searchTerm) ||
        servicio.plan?.nombre.toLowerCase().includes(searchTerm) ||
        servicio.descripcion?.toLowerCase().includes(searchTerm)
      );
    }

    setServiciosFiltrados(servicios);
  };

  const getTipoInfo = (tipo: string) => {
    const tipoInfo = TIPOS_LUGAR_VALUES.find(t => t.value === tipo);
    if (!tipoInfo) return { value: tipo, label: tipo, icon: MapPin };
    return { ...tipoInfo, label: t('empleada.services.types.' + tipoInfo.key) };
  };

  const getEstadoInfo = (estado: string) => {
    const info = ESTADOS_SERVICIO_VALUES[estado as keyof typeof ESTADOS_SERVICIO_VALUES];
    if (!info) return { label: estado, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    return { ...info, label: t('empleada.services.status.' + info.key) };
  };

  const openModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedServicio(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#D95B26]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('empleada.services.errorLoading')}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchServicios}
          className="bg-[#D95B26] text-white px-4 py-2 rounded-lg hover:bg-[#B8491F] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D95B26] to-[#4894AD] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FCF7F0] mb-2">
              {t('empleada.services.title')}
            </h1>
            <p className="text-[#FCF7F0]/80 text-sm sm:text-base">
              {t('empleada.services.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('empleada.services.stats.total')}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#D95B26]">
              {data.estadisticas.total}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('empleada.services.stats.pending')}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-600">
              {data.estadisticas.por_estado.pendientes}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('empleada.services.stats.inProgress')}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600">
              {data.estadisticas.por_estado.en_progreso}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('empleada.services.stats.completed')}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
              {data.estadisticas.por_estado.completados}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('empleada.services.search')}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#D95B26] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#D95B26] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              <option value="todos">{t('empleada.services.filters.all')}</option>
              <option value="pendiente">{t('empleada.services.filters.pending')}</option>
              <option value="en_progreso">{t('empleada.services.filters.inProgress')}</option>
              <option value="completado">{t('empleada.services.filters.completed')}</option>
              <option value="cancelado">{t('empleada.services.filters.cancelled')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Servicios */}
      <div className="space-y-3 sm:space-y-4">
        {serviciosFiltrados.length > 0 ? (
          serviciosFiltrados.map((servicio) => {
            const tipoInfo = getTipoInfo(servicio.ubicacion?.tipo_lugar || 'otro');
            const TipoIcon = tipoInfo.icon;
            const estadoInfo = getEstadoInfo(servicio.estado || 'PENDIENTE');
            const EstadoIcon = estadoInfo.icon;
            
            return (
              <div key={servicio.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="space-y-4">
                  {/* Header del servicio */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-[#D95B26]/10 p-2 rounded-lg flex-shrink-0">
                        <TipoIcon className="h-5 w-5 text-[#D95B26]" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">
                          {servicio.ubicacion?.nombre || t('empleada.services.noName')}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 flex-wrap">
                          <span className="capitalize">{tipoInfo.label}</span>
                          {servicio.ubicacion?.nombre_lugar && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="break-words">{servicio.ubicacion.nombre_lugar}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {t('empleada.services.clientLabel')} <span className="font-medium">{servicio.cliente.nombre}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Estado y botón */}
                    <div className="flex items-center gap-2 flex-shrink-0 sm:mt-0 mt-2 justify-start sm:justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${estadoInfo.color}`}>
                        <EstadoIcon className="h-3 w-3" />
                        {estadoInfo.label}
                      </span>
                      
                      <button
                        onClick={() => openModal(servicio)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Información del servicio */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(servicio.fecha)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(servicio.hora_inicio)} - {formatTime(servicio.hora_final)}</span>
                    </div>
                    
                    {servicio.plan && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{servicio.plan.nombre}</span>
                      </div>
                    )}
                    
                    {servicio.ubicacion?.tamaño && formatTamano(servicio.ubicacion.tamaño) !== t('empleada.services.notSpecified') && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Ruler className="h-4 w-4" />
                        <span>{formatTamano(servicio.ubicacion.tamaño)}</span>
                      </div>
                    )}
                  </div>

                  {/* Información adicional de ubicación */}
                  {servicio.ubicacion && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {servicio.ubicacion.baños && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bath className="h-4 w-4" />
                          <span>{servicio.ubicacion.baños} {t('empleada.services.bathrooms').toLowerCase()}</span>
                        </div>
                      )}
                      
                      {servicio.ubicacion.pisos && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Layers className="h-4 w-4" />
                          <span>{servicio.ubicacion.pisos} {t('empleada.services.floors').toLowerCase()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{servicio.cliente.nombre}</span>
                      </div>
                    </div>
                  )}

                  {/* Descripción si existe */}
                  {servicio.descripcion && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {servicio.descripcion}
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
              {busqueda || filtroEstado !== 'todos' 
                ? t('empleada.services.noResults') 
                : t('empleada.services.empty')
              }
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {busqueda || filtroEstado !== 'todos'
                ? t('empleada.services.emptyFilterMessage')
                : t('empleada.services.emptyMessage')
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedServicio && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-opacity-50" 
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D95B26]/10 p-3 rounded-lg">
                    {(() => {
                      const TipoIcon = getTipoInfo(selectedServicio.ubicacion?.tipo_lugar || 'otro').icon;
                      return <TipoIcon className="h-6 w-6 text-[#D95B26]" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedServicio.ubicacion?.nombre || 'Servicio de limpieza'}
                    </h2>
                    <p className="text-gray-600">
                      {getTipoInfo(selectedServicio.ubicacion?.tipo_lugar || 'otro').label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Estado del servicio */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const estadoInfo = getEstadoInfo(selectedServicio.estado || 'PENDIENTE');
                    const EstadoIcon = estadoInfo.icon;
                    return (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${estadoInfo.color}`}>
                        <EstadoIcon className="h-4 w-4" />
                        {estadoInfo.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Información del servicio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('empleada.services.modal.scheduledDate')}
                    </h4>
                    <p className="text-gray-700">{formatDate(selectedServicio.fecha)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('empleada.services.modal.schedule')}
                    </h4>
                    <p className="text-gray-700">
                      {formatTime(selectedServicio.hora_inicio)} - {formatTime(selectedServicio.hora_final)}
                    </p>
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('empleada.services.modal.clientInfo')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('empleada.services.modal.clientName')}</p>
                      <p className="font-medium text-gray-900">{selectedServicio.cliente.nombre}</p>
                    </div>

                  </div>
                </div>

                {/* Información del plan */}
                {selectedServicio.plan && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t('empleada.services.modal.cleaningPlan')}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">{selectedServicio.plan.nombre}</p>
                        {selectedServicio.plan.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{selectedServicio.plan.descripcion}</p>
                        )}
                      </div>
                      
                      {selectedServicio.plan.servicios_asociados && selectedServicio.plan.servicios_asociados.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">{t('empleada.services.modal.servicesIncluded')}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedServicio.plan.servicios_asociados.map((servicio, index) => (
                              <span key={index} className="px-2 py-1 bg-white rounded-md text-xs text-gray-700 border border-gray-200">
                                {servicio}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información de la ubicación */}
                {selectedServicio.ubicacion && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t('empleada.services.modal.locationDetails')}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedServicio.ubicacion.nombre_lugar && (
                          <div>
                            <p className="text-sm text-gray-600">{t('empleada.services.modal.place')}</p>
                            <p className="font-medium text-gray-900">{selectedServicio.ubicacion.nombre_lugar}</p>
                          </div>
                        )}

                        {selectedServicio.ubicacion.tamaño && formatTamano(selectedServicio.ubicacion.tamaño) !== t('empleada.services.notSpecified') && (
                          <div>
                            <p className="text-sm text-gray-600">{t('empleada.services.size')}</p>
                            <p className="font-medium text-gray-900">{formatTamano(selectedServicio.ubicacion.tamaño)}</p>
                          </div>
                        )}

                        {selectedServicio.ubicacion.baños && (
                          <div>
                            <p className="text-sm text-gray-600">{t('empleada.services.bathrooms')}</p>
                            <p className="font-medium text-gray-900">{selectedServicio.ubicacion.baños}</p>
                          </div>
                        )}

                        {selectedServicio.ubicacion.pisos && (
                          <div>
                            <p className="text-sm text-gray-600">{t('empleada.services.floors')}</p>
                            <p className="font-medium text-gray-900">{selectedServicio.ubicacion.pisos}</p>
                          </div>
                        )}
                      </div>

                      {selectedServicio.ubicacion.descripcion && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">{t('empleada.services.modal.additionalDescription')}</p>
                          <p className="text-gray-700 mt-1">{selectedServicio.ubicacion.descripcion}</p>
                        </div>
                      )}
                    </div>

                    {/* Mapa de ubicación */}
                    {selectedServicio.ubicacion.ubicacion && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Map className="h-4 w-4" />
                          {t('empleada.services.modal.mapLocation')}
                        </h4>
                        
                        {(selectedServicio.ubicacion.ubicacion.formatted_address || selectedServicio.ubicacion.ubicacion.direccion) && (
                          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-700 font-medium">
                              📍 {selectedServicio.ubicacion.ubicacion.formatted_address || selectedServicio.ubicacion.ubicacion.direccion}
                            </p>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <InteractiveMap ubicacion={selectedServicio.ubicacion.ubicacion} />
                        </div>
                        

                      </div>
                    )}
                  </div>
                )}

                {/* Descripción del servicio */}
                {selectedServicio.descripcion && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('empleada.services.modal.additionalNotes')}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedServicio.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withEmpleadaRole(EmpleadaServicios);