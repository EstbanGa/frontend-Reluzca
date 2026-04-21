
import { useState, useEffect, useRef } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime } from "@/utils/dateUtils";
import { API_BASE_URL } from "@/config/env";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";
import { uploadFotoServicio, deleteFotoServicio } from "@/lib/storage";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  Home,
  Building2,
  Briefcase,
  Store,
  AlertCircle,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  Mail,
  FileText,
  Package,
  X,
  ListChecks,
  Image,
  Trash2,
  Play,
  Upload,
  Camera,
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
  'PENDIENTE':   { key: 'pending',    color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'CONFIRMADA':  { key: 'confirmed',  color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle },
  'PROGRAMADA':  { key: 'scheduled',  color: 'bg-blue-100 text-blue-800',    icon: Calendar },
  'EN_PROGRESO': { key: 'inProgress', color: 'bg-orange-100 text-orange-800', icon: Play },
  'COMPLETADO':  { key: 'completed',  color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  'COMPLETADA':  { key: 'completed',  color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  'CANCELADO':   { key: 'cancelled',  color: 'bg-red-100 text-red-800',       icon: XCircle },
  'CANCELADA':   { key: 'cancelled',  color: 'bg-red-100 text-red-800',       icon: XCircle },
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

interface ChecklistItem {
  id: string;
  id_actividad: string;
  nombre_actividad?: string;
  programada: boolean;
  ejecutada: boolean;
  notas?: string | null;
}

interface FotoItem {
  id: string;
  url_foto: string;
  descripcion?: string | null;
  tipo?: string | null;
}

interface ServiciosData {
  message: string;
  servicios: Servicio[];
  estadisticas: {
    total: number;
    por_estado: {
      pendientes: number;
      confirmadas: number;
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
  const navigate = useNavigate();
  const [data, setData] = useState<ServiciosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [serviciosFiltrados, setServiciosFiltrados] = useState<Servicio[]>([]);
  const [empleadaId, setEmpleadaId] = useState<string | null>(null);

  // Vista: 'list' | 'detail'
  const [viewState, setViewState] = useState<'list' | 'detail'>('list');
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'checklist' | 'photos'>('details');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [newFotoTipo, setNewFotoTipo] = useState('durante');
  const [newFotoDesc, setNewFotoDesc] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [iniciandoServicio, setIniciandoServicio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función auxiliar para mostrar el tamaño
  const formatTamano = (tamano: UbicacionInfo['tamaño']) => {
    if (!tamano) return t('empleada.services.notSpecified');
    return tamano.display || t('empleada.services.notSpecified');
  };

  // Detecta si hay una reserva en curso ahora mismo
  const getReservaEnCurso = (servicios: Servicio[]): Servicio | null => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    return servicios.find(s => {
      if (s.fecha !== todayStr) return false;
      if (!s.hora_inicio || !s.hora_final) return false;
      const activos = ['en_proceso', 'confirmada', 'programada', 'pendiente'];
      if (!activos.includes((s.estado || '').toLowerCase())) return false;
      return s.hora_inicio <= currentTime && currentTime <= s.hora_final;
    }) ?? null;
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
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay sesión activa');

      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) throw new Error('No se pudo obtener la sesión');
      const me = await meRes.json();
      setEmpleadaId(me.id ?? null);

      const res = await fetch(`${API_BASE_URL}/api/reservas/empleada/${me.id}/detalle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar los servicios`);
      const result: ServiciosData = await res.json();
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

    // Excluir la reserva en curso de la lista general
    const enCursoId = getReservaEnCurso(data.servicios)?.id;
    let servicios = data.servicios.filter(s => s.id !== enCursoId);

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      servicios = servicios.filter(servicio => (servicio.estado || '').toLowerCase() === filtroEstado.toLowerCase());
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
    const normalized = (estado || '').toUpperCase();
    // Normalizar alias del backend al key del mapa
    const estadoKey = normalized === 'EN_PROCESO' ? 'EN_PROGRESO' : normalized;
    const info = ESTADOS_SERVICIO_VALUES[estadoKey as keyof typeof ESTADOS_SERVICIO_VALUES];
    if (!info) return { label: estado, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    // Buscar la clave de traducción; si no existe caer a labels directos
    const labelMap: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      scheduled: 'Programada',
      inProgress: 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return { ...info, label: t(`empleada.services.status.${info.key}`, { defaultValue: labelMap[info.key] }) };
  };

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  });

  const fetchChecklist = async (reservaId: string) => {
    setChecklistLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservas/${reservaId}/actividades`, { headers: authHeader() });
      if (res.ok) {
        const json = await res.json();
        // El backend devuelve { actividades: [...] }
        const items = Array.isArray(json) ? json : (json.actividades ?? []);
        setChecklist(items.map((item: { id: string; id_actividad: string; nombre?: string; nombre_actividad?: string; programada: boolean; ejecutada: boolean; notas?: string | null }) => ({
          ...item,
          nombre_actividad: item.nombre || item.nombre_actividad || item.id_actividad,
        })));
      }
    } catch { /* ignore */ } finally {
      setChecklistLoading(false);
    }
  };

  const fetchFotos = async (reservaId: string) => {
    setFotosLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservas/${reservaId}/fotos`, { headers: authHeader() });
      if (res.ok) {
        const json = await res.json();
        setFotos(Array.isArray(json) ? json : (json.fotos ?? []));
      }
    } catch { /* ignore */ } finally {
      setFotosLoading(false);
    }
  };

  const toggleActividad = async (reservaId: string, item: ChecklistItem) => {
    const nuevoEstado = !item.ejecutada;
    const res = await fetch(
      `${API_BASE_URL}/api/reservas/${reservaId}/actividades/${item.id}/toggle`,
      {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ ejecutada: nuevoEstado }),
      }
    );
    if (res.ok) {
      setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, ejecutada: nuevoEstado } : c));
    }
  };

  const uploadFoto = async (reservaId: string, file: File) => {
    if (!empleadaId) return;
    setUploadingFoto(true);
    setUploadError(null);
    try {
      // 1. Subir a Supabase Storage
      const { url } = await uploadFotoServicio(file, empleadaId, reservaId);

      // 2. Guardar URL en la DB via backend
      const res = await fetch(`${API_BASE_URL}/api/reservas/${reservaId}/fotos`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          url_foto: url,
          tipo: newFotoTipo,
          descripcion: newFotoDesc.trim() || null,
          subida_por: empleadaId,
        }),
      });
      if (res.ok) {
        const foto: FotoItem = await res.json();
        setFotos(prev => [...prev, foto]);
        setNewFotoDesc('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error('Error guardando foto en la base de datos');
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir la foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  const deleteFoto = async (reservaId: string, fotoId: string) => {
    const fotoToDelete = fotos.find(f => f.id === fotoId);
    const res = await fetch(`${API_BASE_URL}/api/reservas/${reservaId}/fotos/${fotoId}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    if (res.ok || res.status === 204) {
      setFotos(prev => prev.filter(f => f.id !== fotoId));
      // Borrar de Supabase Storage si la URL es de Supabase
      if (fotoToDelete?.url_foto) {
        deleteFotoServicio(fotoToDelete.url_foto).catch(() => {/* ignore storage errors */});
      }
    }
  };

  const openDetail = (servicio: Servicio, tab: 'details' | 'checklist' | 'photos' = 'details') => {
    setSelectedServicio(servicio);
    setDetailTab(tab);
    setChecklist([]);
    setFotos([]);
    setViewState('detail');
    fetchChecklist(servicio.id);
    fetchFotos(servicio.id);
  };

  const closeDetail = () => {
    setViewState('list');
    setSelectedServicio(null);
    setChecklist([]);
    setFotos([]);
  };

  const iniciarServicio = async (reservaId: string) => {
    setIniciandoServicio(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservas/${reservaId}/estado`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ estado: 'en_proceso' }),
      });
      if (res.ok) {
        // Recargar datos y navegar a la página de reserva activa
        await fetchServicios();
        closeDetail();
        navigate('/empleada/reserva-activa');
      }
    } catch { /* ignore */ } finally {
      setIniciandoServicio(false);
    }
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

  const reservaEnCurso = getReservaEnCurso(data.servicios);

  // ─── VISTA DETALLE ─────────────────────────────────────────────────────────
  if (viewState === 'detail' && selectedServicio) {
    const esEnCurso = reservaEnCurso?.id === selectedServicio.id;
    const tipoInfo = getTipoInfo(selectedServicio.ubicacion?.tipo_lugar || 'otro');
    const TipoIcon = tipoInfo.icon;
    const estadoInfo = getEstadoInfo(selectedServicio.estado || 'pendiente');
    const EstadoIcon = estadoInfo.icon;

    const TABS = [
      { key: 'details',   label: 'Detalles',   icon: FileText },
      { key: 'checklist', label: 'Checklist',  icon: ListChecks },
      { key: 'photos',    label: 'Fotos',      icon: Camera },
    ] as const;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white ${esEnCurso ? 'bg-linear-to-r from-[#195083] to-[#4894AD]' : 'bg-linear-to-r from-[#D95B26] to-[#4894AD]'}`}>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={closeDetail} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors shrink-0">
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#FCF7F0] truncate">
                {selectedServicio.ubicacion?.nombre || 'Servicio de limpieza'}
              </h1>
              <p className="text-[#FCF7F0]/80 text-sm">
                {tipoInfo.label}
                {esEnCurso && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">● En curso</span>}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white/15 rounded-lg p-2 text-center">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-[#FCF7F0]/80" />
              <p className="text-[#FCF7F0] font-medium text-xs">{formatDate(selectedServicio.fecha)}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-2 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-[#FCF7F0]/80" />
              <p className="text-[#FCF7F0] font-medium text-xs">{formatTime(selectedServicio.hora_inicio)} — {formatTime(selectedServicio.hora_final)}</p>
            </div>
            <div className={`rounded-lg p-2 text-center ${estadoInfo.color} bg-opacity-90`}>
              <EstadoIcon className="h-4 w-4 mx-auto mb-1" />
              <p className="font-medium text-xs">{estadoInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = detailTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                    active
                      ? 'border-[#D95B26] text-[#D95B26]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.key === 'checklist' && checklist.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-[#D95B26]/10 text-[#D95B26]' : 'bg-gray-100 text-gray-600'}`}>
                      {checklist.filter(c => c.ejecutada).length}/{checklist.length}
                    </span>
                  )}
                  {tab.key === 'photos' && fotos.length > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-[#D95B26]/10 text-[#D95B26]' : 'bg-gray-100 text-gray-600'}`}>
                      {fotos.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── TAB: DETALLES ── */}
          {detailTab === 'details' && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-blue-600" />
                  {t('empleada.services.modal.clientInfo')}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{selectedServicio.cliente.nombre}</span>
                  </div>
                  {selectedServicio.cliente.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <a href={`tel:${selectedServicio.cliente.telefono}`} className="text-sm text-blue-600 hover:underline">
                        {selectedServicio.cliente.telefono}
                      </a>
                    </div>
                  )}
                  {selectedServicio.cliente.correo && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <a href={`mailto:${selectedServicio.cliente.correo}`} className="text-sm text-blue-600 hover:underline truncate">
                        {selectedServicio.cliente.correo}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan */}
              {selectedServicio.plan && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-[#D95B26]" />
                    {t('empleada.services.modal.cleaningPlan')}
                  </h4>
                  <p className="font-medium text-gray-900 text-sm">{selectedServicio.plan.nombre}</p>
                  {selectedServicio.plan.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{selectedServicio.plan.descripcion}</p>
                  )}
                  {selectedServicio.plan.servicios_asociados?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedServicio.plan.servicios_asociados.map((srv, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700">
                          {srv}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ubicación */}
              {selectedServicio.ubicacion && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#D95B26]" />
                    {t('empleada.services.modal.locationDetails')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedServicio.ubicacion.nombre_lugar && (
                      <div>
                        <p className="text-xs text-gray-500">{t('empleada.services.modal.place')}</p>
                        <p className="font-medium text-gray-900">{selectedServicio.ubicacion.nombre_lugar}</p>
                      </div>
                    )}
                    {selectedServicio.ubicacion.tamaño && formatTamano(selectedServicio.ubicacion.tamaño) !== t('empleada.services.notSpecified') && (
                      <div>
                        <p className="text-xs text-gray-500">{t('empleada.services.size')}</p>
                        <p className="font-medium text-gray-900">{formatTamano(selectedServicio.ubicacion.tamaño)}</p>
                      </div>
                    )}
                    {selectedServicio.ubicacion.baños != null && (
                      <div>
                        <p className="text-xs text-gray-500">{t('empleada.services.bathrooms')}</p>
                        <p className="font-medium text-gray-900">{selectedServicio.ubicacion.baños}</p>
                      </div>
                    )}
                    {selectedServicio.ubicacion.pisos != null && (
                      <div>
                        <p className="text-xs text-gray-500">{t('empleada.services.floors')}</p>
                        <p className="font-medium text-gray-900">{selectedServicio.ubicacion.pisos}</p>
                      </div>
                    )}
                  </div>
                  {selectedServicio.ubicacion.descripcion && (
                    <p className="text-sm text-gray-600 mt-3">{selectedServicio.ubicacion.descripcion}</p>
                  )}
                  {selectedServicio.ubicacion.ubicacion && (
                    <div className="mt-3">
                      {(selectedServicio.ubicacion.ubicacion.formatted_address || selectedServicio.ubicacion.ubicacion.direccion) && (
                        <p className="text-sm text-gray-700 mb-3">
                          📍 {selectedServicio.ubicacion.ubicacion.formatted_address || selectedServicio.ubicacion.ubicacion.direccion}
                        </p>
                      )}
                      <InteractiveMap ubicacion={selectedServicio.ubicacion.ubicacion} />
                    </div>
                  )}
                </div>
              )}

              {selectedServicio.descripcion && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    {t('empleada.services.modal.additionalNotes')}
                  </h4>
                  <p className="text-sm text-gray-700">{selectedServicio.descripcion}</p>
                </div>
              )}

              {/* Botón iniciar servicio */}
              {['confirmada', 'programada'].includes((selectedServicio.estado || '').toLowerCase()) && (
                <button
                  onClick={() => iniciarServicio(selectedServicio.id)}
                  disabled={iniciandoServicio}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#195083] hover:bg-[#143f69] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {iniciandoServicio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  Iniciar servicio
                </button>
              )}
            </div>
          )}

          {/* ── TAB: CHECKLIST ── */}
          {detailTab === 'checklist' && (
            <div className="p-4 sm:p-6">
              {checklistLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#D95B26]" />
                </div>
              ) : checklist.length === 0 ? (
                <div className="text-center py-10">
                  <ListChecks className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No hay actividades en el checklist de esta reserva.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Progreso */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      {checklist.filter(c => c.ejecutada).length} de {checklist.length} completadas
                    </span>
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D95B26] rounded-full transition-all"
                        style={{ width: `${(checklist.filter(c => c.ejecutada).length / checklist.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  {checklist.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleActividad(selectedServicio.id, item)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        item.ejecutada
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.ejecutada ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {item.ejecutada && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm font-medium flex-1 ${item.ejecutada ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                        {item.nombre_actividad}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: FOTOS ── */}
          {detailTab === 'photos' && (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Subir foto
                </p>

                {/* File input oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFoto(selectedServicio.id, file);
                  }}
                />

                <div className="flex gap-2">
                  <select
                    value={newFotoTipo}
                    onChange={e => setNewFotoTipo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D95B26]/40"
                  >
                    <option value="antes">Antes</option>
                    <option value="durante">Durante</option>
                    <option value="despues">Después</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={newFotoDesc}
                    onChange={e => setNewFotoDesc(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D95B26]/40"
                  />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D95B26] text-white rounded-lg text-sm font-medium hover:bg-[#B8491F] disabled:opacity-50 transition-colors"
                >
                  {uploadingFoto
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
                    : <><Camera className="h-4 w-4" /> Seleccionar foto</>
                  }
                </button>

                {uploadError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Galería */}
              {fotosLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#D95B26]" />
                </div>
              ) : fotos.length === 0 ? (
                <div className="text-center py-10">
                  <Image className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aún no hay fotos para este servicio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotos.map(foto => (
                    <div key={foto.id} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square bg-gray-50">
                      <img
                        src={foto.url_foto}
                        alt={foto.descripcion ?? 'Foto servicio'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay con tipo y botón eliminar */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                        <span className="self-end">
                          <button
                            onClick={() => deleteFoto(selectedServicio.id, foto.id)}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Eliminar foto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                        <span className="px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full self-start capitalize">
                          {foto.tipo ?? 'durante'}
                        </span>
                      </div>
                      {foto.descripcion && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[10px] text-white truncate">
                          {foto.descripcion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── VISTA LISTA ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.empleada}
        title={t('empleada.services.title')}
        subtitle={t('empleada.services.subtitle')}
        icon={<Calendar className="h-7 w-7" />}
        actions={
          <button
            onClick={fetchServicios}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Recargar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        }
      />

      {/* ── BANNER EN CURSO (Rappi style) ── */}
      {reservaEnCurso && (
        <div className="bg-gradient-to-r from-[#195083] to-[#4894AD] rounded-xl p-4 sm:p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Servicio en curso ahora</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-[#FCF7F0] truncate">
                {reservaEnCurso.ubicacion?.nombre || 'Servicio de limpieza'}
              </h2>
              <p className="text-[#FCF7F0]/80 text-sm mt-0.5">
                <User className="h-3.5 w-3.5 inline mr-1" />
                {reservaEnCurso.cliente.nombre}
              </p>
              <p className="text-[#FCF7F0]/70 text-sm mt-0.5">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                {formatTime(reservaEnCurso.hora_inicio)} — {formatTime(reservaEnCurso.hora_final)}
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/empleada/reserva-activa')}
                className="px-3 py-1.5 bg-white text-[#195083] hover:bg-white/90 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ListChecks className="h-3.5 w-3.5" />
                Ver actividad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <ListStatsGrid
        columns={4}
        stats={[
          { label: t('empleada.services.stats.total'), value: data.estadisticas.total, color: '#D95B26' },
          { label: t('empleada.services.stats.pending'), value: data.estadisticas.por_estado.pendientes, color: '#ca8a04' },
          { label: 'Confirmadas', value: data.estadisticas.por_estado.confirmadas ?? 0, color: '#4f46e5' },
          { label: t('empleada.services.stats.completed'), value: data.estadisticas.por_estado.completados, color: '#16a34a' },
        ]}
      />

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
              <option value="confirmada">Confirmada</option>
              <option value="programada">Programada</option>
              <option value="en_proceso">En progreso</option>
              <option value="completada">{t('empleada.services.filters.completed')}</option>
              <option value="cancelada">{t('empleada.services.filters.cancelled')}</option>
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
            const estadoInfo = getEstadoInfo(servicio.estado || 'pendiente');
            const EstadoIcon = estadoInfo.icon;

            return (
              <SlideRevealCard
                key={servicio.id}
                buttonCount={1}
                actions={
                  <SlideButton
                    icon={<Eye className="h-4 w-4" />}
                    onClick={() => openDetail(servicio)}
                    title={t('empleada.services.viewDetails')}
                    hoverColor="hover:bg-[#D95B26]/10 hover:text-[#D95B26]"
                  />
                }
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-[#D95B26]/10 p-2 rounded-lg flex-shrink-0">
                        <TipoIcon className="h-5 w-5 text-[#D95B26]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {servicio.ubicacion?.nombre || t('empleada.services.noName')}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t('empleada.services.clientLabel')} <span className="font-medium text-gray-700">{servicio.cliente.nombre}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estadoInfo.color}`}>
                        <EstadoIcon className="h-3 w-3" />
                        {estadoInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(servicio.fecha)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(servicio.hora_inicio)} — {formatTime(servicio.hora_final)}
                    </span>
                    {servicio.plan && (
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {servicio.plan.nombre}
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
    </div>
  );
}

export default withEmpleadaRole(EmpleadaServicios);
