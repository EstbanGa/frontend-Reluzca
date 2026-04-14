
import { useState, useCallback, useRef, useEffect } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  MapPin,
  Home,
  Building2,
  Briefcase,
  Store,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Navigation,
  Bath,
  Layers,
  Ruler,
  FileText,
  Building
} from "lucide-react";

// Tipos predefinidos de ubicaciones
const TIPOS_LUGAR_VALUES = [
  { value: 'casa', key: 'house', icon: Home },
  { value: 'apartamento', key: 'apartment', icon: Building2 },
  { value: 'oficina', key: 'office', icon: Briefcase },
  { value: 'local_comercial', key: 'commercial', icon: Store },
  { value: 'otro', key: 'other', icon: MapPin }
];

const defaultCenter = {
  lat: 6.2442, // Medellín
  lng: -75.5812
};

interface FormData {
  nombre: string;
  tipo_lugar: string;
  tamaño: string;
  baños: string;
  pisos: string;
  nombre_lugar: string;
  descripcion: string;
  estado: boolean;
  direccion: string;
  numero_apartamento: string;
  bloque: string;
  referencias: string;
}

interface MapPosition {
  lat: number;
  lng: number;
}

// Hook personalizado para Google Maps con manejo mejorado
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

function CrearUbicacion() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoaded: mapsLoaded, loadError } = useGoogleMaps();
  
  // Refs para manejo de Google Maps
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  // Timeouts
  const geocoderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reverseGeocoderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGeocodingFromAddress, setIsGeocodingFromAddress] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo_lugar: '',
    tamaño: '',
    baños: '',
    pisos: '',
    nombre_lugar: '',
    descripcion: '',
    estado: true,
    direccion: '',
    numero_apartamento: '',
    bloque: '',
    referencias: ''
  });

  const [markerPosition, setMarkerPosition] = useState<MapPosition>(defaultCenter);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Inicializar mapa cuando Google Maps esté cargado
  useEffect(() => {
    if (!mapsLoaded || mapInitialized || !mapContainerRef.current) return;

    try {
      // Crear el mapa
      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        gestureHandling: 'greedy',
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        mapTypeControl: false,
        rotateControl: false,
      });

      mapRef.current = map;

      // Crear el marcador
      const marker = new google.maps.Marker({
        position: defaultCenter,
        map: map,
        draggable: true,
        title: 'Ubicación seleccionada'
      });

      markerRef.current = marker;

      // Crear el geocoder
      geocoderRef.current = new google.maps.Geocoder();

      // Crear el autocomplete
      if (addressInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
          componentRestrictions: { country: 'co' },
          fields: ['formatted_address', 'geometry', 'name', 'address_components'],
          types: ['address']
        });

        autocompleteRef.current = autocomplete;

        // Listener para autocomplete
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const newPosition = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            
            setMarkerPosition(newPosition);
            marker.setPosition(newPosition);
            map.panTo(newPosition);
            map.setZoom(16);

            const nombreLugar = place.name || '';
            setFormData(prev => ({
              ...prev,
              direccion: place.formatted_address || '',
              nombre_lugar: nombreLugar
            }));
          }
        });
      }

      // Listeners del mapa
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng && !isReverseGeocoding) {
          const newPosition = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          
          setMarkerPosition(newPosition);
          marker.setPosition(newPosition);
          
          // Throttle reverse geocoding
          if (reverseGeocoderTimeoutRef.current) {
            clearTimeout(reverseGeocoderTimeoutRef.current);
          }
          
          reverseGeocoderTimeoutRef.current = setTimeout(() => {
            reverseGeocode(newPosition);
          }, 500);
        }
      });

      // Listener del marcador
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position && !isReverseGeocoding) {
          const newPosition = {
            lat: position.lat(),
            lng: position.lng()
          };
          
          setMarkerPosition(newPosition);
          
          // Throttle reverse geocoding
          if (reverseGeocoderTimeoutRef.current) {
            clearTimeout(reverseGeocoderTimeoutRef.current);
          }
          
          reverseGeocoderTimeoutRef.current = setTimeout(() => {
            reverseGeocode(newPosition);
          }, 800);
        }
      });

      setMapInitialized(true);

    } catch (err) {
      setError(t('cliente.createLocation.mapInitError'));
    }
  }, [mapsLoaded, mapInitialized, isReverseGeocoding]);

  // Geocoding con debounce
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim() || address.length < 10 || !geocoderRef.current || isGeocodingFromAddress) {
      return;
    }

    try {
      setIsGeocodingFromAddress(true);
      setMapLoading(true);

      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 500000);

        geocoderRef.current!.geocode({
          address: address.trim(),
          region: 'CO',
          componentRestrictions: { country: 'CO' }
        }, (results, status) => {
          clearTimeout(timeoutId);
          
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (results[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        const newPosition = {
          lat: location.lat(),
          lng: location.lng()
        };

        setMarkerPosition(newPosition);
        
        if (markerRef.current) {
          markerRef.current.setPosition(newPosition);
        }
        
        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
          mapRef.current.setZoom(16);
        }
      }
    } catch (error: unknown) {
      // Manejo de errores de Geocoding API
      const err = error as { message?: string };
      if (err.message?.includes('REQUEST_DENIED')) {
        // API no habilitada - usuario puede ingresar coordenadas manualmente
        setError(t('cliente.createLocation.geocodingUnavailable'));
      }
    } finally {
      setIsGeocodingFromAddress(false);
      setMapLoading(false);
    }
  }, [isGeocodingFromAddress]);

  // Reverse geocoding
  const reverseGeocode = useCallback(async (position: MapPosition) => {
    if (isGeocodingFromAddress || isReverseGeocoding || !geocoderRef.current) {
      return;
    }

    try {
      setIsReverseGeocoding(true);
      setMapLoading(true);

      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 300000);

        geocoderRef.current!.geocode({ location: position }, (results, status) => {
          clearTimeout(timeoutId);
          
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });

      if (results[0]) {
        const address = results[0].formatted_address;
        const addressComponents = results[0].address_components || [];
        
        let nombreLugar = '';
        const poiComponent = addressComponents.find(
          component => component.types.includes('point_of_interest') || 
                      component.types.includes('establishment')
        );
        
        if (poiComponent) {
          nombreLugar = poiComponent.long_name;
        }

        setFormData(prev => ({
          ...prev,
          direccion: address,
          nombre_lugar: nombreLugar || prev.nombre_lugar
        }));
      }
    } catch (error: unknown) {
      // Manejo de errores de Geocoding API
      const err = error as { message?: string };
      if (err.message?.includes('REQUEST_DENIED')) {
        // API no habilitada - silencioso, no afecta funcionalidad core
        setFormData(prev => ({
          ...prev,
          direccion: `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`
        }));
      }
    } finally {
      setIsReverseGeocoding(false);
      setMapLoading(false);
    }
  }, [isGeocodingFromAddress, isReverseGeocoding]);

  // Debounce para direcciones
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (formData.direccion && formData.direccion.length >= 10 && mapInitialized) {
      debounceTimeoutRef.current = setTimeout(() => {
        geocodeAddress(formData.direccion);
      }, 300000);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData.direccion, geocodeAddress, mapInitialized]);

  // Detectar ubicación actual
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t('cliente.createLocation.geolocation.notSupported'));
      return;
    }

    setLoading(true);
    setMapLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setMarkerPosition(newPosition);
        
        if (markerRef.current) {
          markerRef.current.setPosition(newPosition);
        }
        
        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
          mapRef.current.setZoom(16);
        }
        
        setTimeout(() => {
          reverseGeocode(newPosition);
        }, 500);
        
        setLoading(false);
        setMapLoading(false);
      },
      (error) => {
        let errorMessage = t('cliente.createLocation.geolocation.unavailable');
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('cliente.createLocation.geolocation.denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('cliente.createLocation.geolocation.unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('cliente.createLocation.geolocation.timeout');
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
        setMapLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Manejar cambio manual de dirección
  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, direccion: address }));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (geocoderTimeoutRef.current) {
        clearTimeout(geocoderTimeoutRef.current);
      }
      if (reverseGeocoderTimeoutRef.current) {
        clearTimeout(reverseGeocoderTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Enviar formulario con validaciones mejoradas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del lado del cliente
    if (!formData.nombre.trim()) {
      setError(t('cliente.createLocation.validation.nameRequired'));
      return;
    }

    if (formData.nombre.trim().length > 100) {
      setError(t('cliente.createLocation.validation.nameMaxLength'));
      return;
    }

    // Validar campos numéricos si están presentes
    if (formData.tamaño && (isNaN(Number(formData.tamaño)) || Number(formData.tamaño) <= 0 || Number(formData.tamaño) > 500)) {
      setError(t('cliente.createLocation.validation.sizeRange'));
      return;
    }

    if (formData.baños && (isNaN(Number(formData.baños)) || Number(formData.baños) < 1 || Number(formData.baños) > 5)) {
      setError(t('cliente.createLocation.validation.bathroomRange'));
      return;
    }

    if (formData.pisos && (isNaN(Number(formData.pisos)) || Number(formData.pisos) < 1 || Number(formData.pisos) > 5)) {
      setError(t('cliente.createLocation.validation.floorRange'));
      return;
    }

    // Preparar datos de ubicación según el schema de FastAPI
    const ubicacionData = {
      lat: markerPosition.lat,
      lng: markerPosition.lng,
      direccion: formData.direccion,
      detalles: {
        numero_apartamento: formData.numero_apartamento || null,
        bloque: formData.bloque || null,
        referencias: formData.referencias || null
      }
    };

    // Obtener id_usuario del localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError(t('cliente.createLocation.validation.userNotFound'));
      return;
    }
    const user = JSON.parse(userStr);

    // Preparar campo tamaño con el formato correcto
    let tamañoData = null;
    if (formData.tamaño) {
      const metros = Number(formData.tamaño);
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

    // Preparar payload según el schema UbicacionServicioCreate de FastAPI
    const payload = {
      id_usuario: user.id,
      nombre: formData.nombre.trim(),
      tipo_lugar: formData.tipo_lugar || null,
      tamaño: tamañoData,
      baños: formData.baños ? parseInt(formData.baños) : null,
      pisos: formData.pisos ? parseInt(formData.pisos) : null,
      nombre_lugar: formData.nombre_lugar.trim() || null,
      descripcion: formData.descripcion.trim() || null,
      estado: formData.estado,
      ubicacion: ubicacionData
    };

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ubicaciones/cliente/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Error HTTP ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/cliente/ubicaciones/index');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al crear la ubicación");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cliente.createLocation.success')}</h2>
          <p className="text-gray-600 mb-4">{t('cliente.createLocation.redirecting')}</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4894AD] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full mx-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cliente.createLocation.errorLoadingMap')}</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083]"
          >
            {t('cliente.createLocation.reloadPage')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4894AD] to-[#D95B26] rounded-xl p-4 sm:p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cliente/ubicaciones/index')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#FCF7F0]">
                {t('cliente.createLocation.title')}
              </h1>
              <p className="text-[#FCF7F0]/80 text-sm sm:text-base mt-1">
                {t('cliente.createLocation.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 text-sm mt-2 hover:text-red-800"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-[#4894AD]" />
              {t('cliente.createLocation.sections.basic')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cliente.createLocation.nameLabel')}
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder={t('cliente.createLocation.namePlaceholder')}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('cliente.createLocation.charCount', { n: formData.nombre.length, max: 100 })}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cliente.createLocation.typeLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TIPOS_LUGAR_VALUES.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => handleInputChange('tipo_lugar', tipo.value)}
                        className={`p-3 rounded-lg border-2 transition-colors text-center ${
                          formData.tipo_lugar === tipo.value
                            ? 'border-[#4894AD] bg-[#4894AD]/10 text-[#4894AD]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">{t(`cliente.createLocation.types.${tipo.key}`)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-[#4894AD]" />
              {t('cliente.createLocation.sections.characteristics')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {t('cliente.createLocation.sizeLabel')}
                </label>
                <input
                  type="number"
                  value={formData.tamaño}
                  onChange={(e) => handleInputChange('tamaño', e.target.value)}
                  placeholder={t('cliente.createLocation.sizePlaceholder')}
                  min="1"
                  max="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Bath className="h-4 w-4" />
                  {t('cliente.createLocation.bathroomsLabel')}
                </label>
                <select
                  value={formData.baños}
                  onChange={(e) => handleInputChange('baños', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">{t('cliente.createLocation.bathroomsSelect.placeholder')}</option>
                  <option value="1">{t('cliente.createLocation.bathroomsSelect.one')}</option>
                  <option value="2">{t('cliente.createLocation.bathroomsSelect.two')}</option>
                  <option value="3">{t('cliente.createLocation.bathroomsSelect.three')}</option>
                  <option value="4">{t('cliente.createLocation.bathroomsSelect.four')}</option>
                  <option value="5">{t('cliente.createLocation.bathroomsSelect.fiveOrMore')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  {t('cliente.createLocation.floorsLabel')}
                </label>
                <select
                  value={formData.pisos}
                  onChange={(e) => handleInputChange('pisos', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">{t('cliente.createLocation.floorsSelect.placeholder')}</option>
                  <option value="1">{t('cliente.createLocation.floorsSelect.one')}</option>
                  <option value="2">{t('cliente.createLocation.floorsSelect.two')}</option>
                  <option value="3">{t('cliente.createLocation.floorsSelect.three')}</option>
                  <option value="4">{t('cliente.createLocation.floorsSelect.four')}</option>
                  <option value="5">{t('cliente.createLocation.floorsSelect.five')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ubicación y Mapa */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#4894AD]" />
              {t('cliente.createLocation.sections.location')}
            </h2>

            {/* Campo de dirección */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cliente.createLocation.addressLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  ref={addressInputRef}
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder={t('cliente.createLocation.addressPlaceholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Información de ubicación seleccionada */}
            {(markerPosition.lat !== defaultCenter.lat || markerPosition.lng !== defaultCenter.lng) && formData.direccion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-800 mb-1">{t('cliente.createLocation.selectedLocation')}</h3>
                    <p className="text-blue-700 text-sm mb-2">{formData.direccion}</p>
                    <div className="text-xs text-blue-600 grid grid-cols-2 gap-2">
                      <span>Latitud: {markerPosition.lat.toFixed(6)}</span>
                      <span>Longitud: {markerPosition.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenedor del Mapa */}
            <div className="mb-4 relative overflow-hidden rounded-lg" style={{ touchAction: 'none' }}>
              {mapLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center gap-2 text-[#4894AD]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">{t('cliente.createLocation.updatingLocation')}</span>
                  </div>
                </div>
              )}
              
              {!mapsLoaded ? (
                <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t('common.loading')}</span>
                  </div>
                </div>
              ) : (
                <div
                  ref={mapContainerRef}
                  className="w-full h-[400px] rounded-lg"
                  style={{ minHeight: '400px' }}
                />
              )}
            </div>

            {/* Nombre del lugar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                {t('cliente.createLocation.buildingLabel')}
              </label>
              <input
                type="text"
                value={formData.nombre_lugar}
                onChange={(e) => handleInputChange('nombre_lugar', e.target.value)}
                placeholder={t('cliente.createLocation.buildingPlaceholder')}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Detalles adicionales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cliente.createLocation.unitLabel')}
                </label>
                <input
                  type="text"
                  value={formData.numero_apartamento}
                  onChange={(e) => handleInputChange('numero_apartamento', e.target.value)}
                  placeholder={t('cliente.createLocation.unitPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cliente.createLocation.blockLabel')}
                </label>
                <input
                  type="text"
                  value={formData.bloque}
                  onChange={(e) => handleInputChange('bloque', e.target.value)}
                  placeholder={t('cliente.createLocation.blockPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Referencias */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cliente.createLocation.referencesLabel')}
              </label>
              <textarea
                value={formData.referencias}
                onChange={(e) => handleInputChange('referencias', e.target.value)}
                placeholder={t('cliente.createLocation.referencesPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#4894AD]" />
              {t('cliente.createLocation.sections.instructions')}
            </h2>
            
            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cliente.createLocation.descriptionLabel')}
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder={t('cliente.createLocation.descriptionPlaceholder')}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('cliente.createLocation.charCount', { n: formData.descripcion.length, max: 1000 })}
              </p>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="estado"
                checked={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.checked)}
                className="h-4 w-4 text-[#4894AD] border-gray-300 rounded focus:ring-[#4894AD]"
              />
              <label htmlFor="estado" className="text-sm font-medium text-gray-700">
                {t('cliente.createLocation.activeCheckbox')}
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/cliente/ubicaciones/index')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim() || isGeocodingFromAddress || isReverseGeocoding}
              className="flex-1 bg-[#4894AD] text-white px-6 py-3 rounded-lg hover:bg-[#195083] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? t('cliente.createLocation.submitting') : t('cliente.createLocation.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withClienteRole(CrearUbicacion);