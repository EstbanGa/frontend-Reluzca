
import { useState } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Package,
  FileText,
  Tag,
  Calendar,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Settings
} from "lucide-react";

interface FormData {
  nombre: string;
  descripcion: string;
  precio: string;
  estado: boolean;
  fecha_inicio: string;
  fecha_final: string;
  hora_inicio: string;
  hora_final: string;
  servicios_asociados: string[];
}

// Servicios predefinidos (puedes expandir esta lista)
const SERVICIOS_DISPONIBLES = [
  'Limpieza general',
  'Limpieza profunda',
  'Limpieza de ventanas',
  'Limpieza de alfombras',
  'Limpieza de baños',
  'Limpieza de cocina',
  'Aspirado',
  'Trapeo',
  'Desinfección',
  'Organización',
  'Limpieza de electrodomésticos',
  'Limpieza de muebles'
];

function AdminCrearPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [customService, setCustomService] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    estado: true,
    fecha_inicio: '',
    fecha_final: '',
    hora_inicio: '',
    hora_final: '',
    servicios_asociados: []
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicios_asociados: prev.servicios_asociados.includes(service)
        ? prev.servicios_asociados.filter(s => s !== service)
        : [...prev.servicios_asociados, service]
    }));
  };

  const addCustomService = () => {
    if (customService.trim() && !formData.servicios_asociados.includes(customService.trim())) {
      setFormData(prev => ({
        ...prev,
        servicios_asociados: [...prev.servicios_asociados, customService.trim()]
      }));
      setCustomService('');
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicios_asociados: prev.servicios_asociados.filter(s => s !== service)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del lado del cliente
    if (!formData.nombre.trim()) {
      setError('El nombre del plan es obligatorio');
      return;
    }

    if (formData.nombre.trim().length > 100) {
      setError('El nombre no puede exceder 100 caracteres');
      return;
    }

    // Validar precio si se proporciona
    if (formData.precio && (isNaN(Number(formData.precio)) || Number(formData.precio) < 0)) {
      setError('El precio debe ser un número positivo');
      return;
    }

    // Validar fechas
    if (formData.fecha_inicio && formData.fecha_final) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaFinal = new Date(formData.fecha_final);
      
      if (fechaFinal <= fechaInicio) {
        setError('La fecha final debe ser posterior a la fecha de inicio');
        return;
      }
    }

    // Validar horarios
    if (formData.hora_inicio && formData.hora_final) {
      const horaInicio = new Date(`2000-01-01T${formData.hora_inicio}`);
      const horaFinal = new Date(`2000-01-01T${formData.hora_final}`);
      
      if (horaFinal <= horaInicio) {
        setError('La hora final debe ser posterior a la hora de inicio');
        return;
      }
    }

    // Preparar payload
    const payload: Record<string, unknown> = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      precio: formData.precio ? formData.precio : undefined,
      estado: formData.estado,
      fecha_inicio: formData.fecha_inicio || undefined,
      fecha_final: formData.fecha_final || undefined,
      hora_inicio: formData.hora_inicio || undefined,
      hora_final: formData.hora_final || undefined,
      servicios_asociados: formData.servicios_asociados.length > 0 ? formData.servicios_asociados : undefined
    };

    // Remover campos undefined del payload
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      console.log('Enviando solicitud con payload:', payload);
      console.log('Token presente:', token ? 'Sí' : 'No');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (!response.ok) {
        throw new Error(result.error || result.details || result.detail || `Error HTTP ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/planes/index');
      }, 2000);

    } catch (err) {
      console.error('Error al crear plan:', err);
      setError(err instanceof Error ? err.message : "Error desconocido al crear el plan");
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Plan creado exitosamente!</h2>
          <p className="text-gray-600 mb-4">Redirigiendo a la gestión de planes...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#195083] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-4 sm:p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/planes/index')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F0E7]">
                Nuevo Plan
              </h1>
              <p className="text-[#F5F0E7]/80 text-sm sm:text-base mt-1">
                Crea un nuevo plan de servicio
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
                Cerrar
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#195083]" />
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del plan *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Plan Básico, Plan Premium, Mantenimiento Mensual..."
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.nombre.length}/100 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio (COP)
                </label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => handleInputChange('precio', e.target.value)}
                  placeholder="Ej: 50000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-1 sm:self-end pb-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('estado', !formData.estado)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.estado
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {formData.estado ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                  {formData.estado ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
          </div>

          {/* Vigencia */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#195083]" />
              Vigencia del Plan
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de finalización
                </label>
                <input
                  type="date"
                  value={formData.fecha_final}
                  onChange={(e) => handleInputChange('fecha_final', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#195083]" />
              Horarios de Servicio
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de finalización
                </label>
                <input
                  type="time"
                  value={formData.hora_final}
                  onChange={(e) => handleInputChange('hora_final', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Servicios Asociados */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#195083]" />
              Servicios Asociados
            </h2>
            
            {/* Servicios predefinidos */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecciona los servicios incluidos:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SERVICIOS_DISPONIBLES.map((servicio) => (
                  <button
                    key={servicio}
                    type="button"
                    onClick={() => handleServiceToggle(servicio)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors text-sm ${
                      formData.servicios_asociados.includes(servicio)
                        ? 'border-[#195083] bg-[#195083]/10 text-[#195083]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {servicio}
                  </button>
                ))}
              </div>
            </div>

            {/* Agregar servicio personalizado */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar servicio personalizado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  placeholder="Escribe un servicio personalizado..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={addCustomService}
                  disabled={!customService.trim()}
                  className="px-4 py-3 bg-[#195083] text-white rounded-lg hover:bg-[#0f3a5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
            </div>

            {/* Servicios seleccionados */}
            {formData.servicios_asociados.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios seleccionados ({formData.servicios_asociados.length}):
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.servicios_asociados.map((servicio, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {servicio}
                      <button
                        type="button"
                        onClick={() => removeService(servicio)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#195083]" />
              Descripción del Plan
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción detallada
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Describe las características, beneficios y detalles importantes del plan..."
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.descripcion.length}/1000 caracteres
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/planes/index')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim()}
              className="flex-1 bg-[#195083] text-white px-6 py-3 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? 'Creando...' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAdminRole(AdminCrearPlan);