
import { useState, useEffect } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock,
  DollarSign,
  User,
  MapPin,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Home,
  Building,
  Users,
  RefreshCw,
  CheckSquare,
  Square
} from "lucide-react";

// Interfaces
interface Empleada {
  id: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  telefono: string;
  ranking: number;
}

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  servicios_asociados: string[];
  hora_inicio: string;
  hora_final: string;
  horas_servicio: number;
}

interface Ubicacion {
  id: string;
  nombre: string;
  tamaño: number | string;
  baños: number;
  pisos: number;
  ubicacion: {
    lat?: number;
    lng?: number;
    direccion?: string;
    [key: string]: unknown;
  };
  nombre_lugar: string;
  tipo_lugar: string;
  descripcion: string;
}

interface TareaExtra {
  nombre: string;
  precio: number;
}

interface DisponibilidadDia {
  fecha: string;
  disponible: boolean;
  dia_semana: string;
  es_hoy: boolean;
  es_pasado: boolean;
  es_sabado: boolean;
  es_domingo: boolean;
  sobrecargo_sabado: boolean;
}

interface HorarioDisponible {
  hora_inicio: string;
  hora_final: string;
  horas_duracion: number;
  sobrecargo_sabado: number;
  descripcion: string;
}

interface FechaHorario {
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  sobrecargo_sabado: number;
}

interface CalculoPrecio {
  precio_plan_unitario: number;
  cantidad_dias: number;
  precio_base: number;
  precio_tareas_extra: number;
  cantidad_tareas_extra: number;
  precio_pisos_extra: number;
  pisos_extra: number;
  sobrecargo_sabados: number;
  subtotal: number;
  porcentaje_descuento_dias: number;
  descuento_dias: number;
  precio_final: number;
  precio_por_dia: number;
}

// Pasos del proceso
const PASOS = [
  { id: 1, nombre: 'Empleada', descripcion: 'Seleccionar empleada' },
  { id: 2, nombre: 'Plan', descripcion: 'Elegir plan de servicio' },
  { id: 3, nombre: 'Horario', descripcion: 'Seleccionar horario único' },
  { id: 4, nombre: 'Fechas', descripcion: 'Elegir fechas disponibles' },
  { id: 5, nombre: 'Detalles', descripcion: 'Ubicación y extras' },
  { id: 6, nombre: 'Confirmación', descripcion: 'Revisar y confirmar' }
];

function CrearReserva() {
  // Estados principales
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estados de datos
  const [empleadas, setEmpleadas] = useState<Empleada[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [tareasExtra, setTareasExtra] = useState<TareaExtra[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDia[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);

  // Estados de selección
  const [empleadaSeleccionada, setEmpleadaSeleccionada] = useState<Empleada | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<HorarioDisponible | null>(null);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<string[]>([]);
  
  // Estados de cálculo
  const [calculoPrecio, setCalculoPrecio] = useState<CalculoPrecio | null>(null);
  const [calculandoPrecio, setCalculandoPrecio] = useState(false);

  // Estados de calendario
  const [mesActual, setMesActual] = useState(new Date());
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      cargarEmpleadas(),
      cargarPlanes(),
      cargarUbicaciones()
    ]);
  }, []);

  // Cargar tareas extra cuando se selecciona un plan
  useEffect(() => {
    if (planSeleccionado) {
      cargarTareasExtra(planSeleccionado.id);
    }
  }, [planSeleccionado]);

  // Cargar horarios cuando se selecciona un plan
  useEffect(() => {
    if (planSeleccionado) {
      cargarHorariosDisponibles(planSeleccionado.id);
    }
  }, [planSeleccionado]);

  // Calcular precio cuando cambian los datos relevantes
  useEffect(() => {
    if (planSeleccionado && ubicacionSeleccionada && fechasSeleccionadas.length > 0 && horarioSeleccionado) {
      calcularPrecio();
    }
  }, [planSeleccionado, ubicacionSeleccionada, fechasSeleccionadas, horarioSeleccionado, tareasSeleccionadas]);

  const cargarEmpleadas = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/empleadas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const empleadas = await response.json();
      setEmpleadas(empleadas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar empleadas");
    }
  };

  const cargarPlanes = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/planes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setPlanes(result.planes);
      } else {
        throw new Error(result.error || 'Error al cargar planes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar planes");
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/ubicaciones/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setUbicaciones(result.ubicaciones);
      } else {
        throw new Error(result.error || 'Error al cargar ubicaciones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar ubicaciones");
    }
  };

  const cargarDisponibilidad = async (empleadaId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/empleadas/${empleadaId}/disponibilidad`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Si el endpoint no existe, usar disponibilidad vacía
        console.warn('Endpoint de disponibilidad no disponible, usando calendario vacío');
        setDisponibilidad([]);
        return;
      }

      const result = await response.json();
      if (result.success) {
        setDisponibilidad(result.calendario);
      } else {
        setDisponibilidad([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar disponibilidad");
    } finally {
      setLoading(false);
    }
  };

  // CORRECTED: URL corregida para horarios
  const cargarHorariosDisponibles = async (planId: string, fechaEjemplo: string = '2024-01-01') => {
    try {
      setCargandoHorarios(true);
      const token = localStorage.getItem("access_token");
      
      // URL CORREGIDA: Coincide con el patrón de Django
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/horarios/${planId}/${fechaEjemplo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setHorariosDisponibles(result.horarios_disponibles);
      } else {
        throw new Error(result.error || 'Error al cargar horarios');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar horarios");
    } finally {
      setCargandoHorarios(false);
    }
  };

  // CORRECTED: URL corregida para tareas extra
  const cargarTareasExtra = async (planId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // URL CORREGIDA: Coincide con el patrón de Django
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/planes/${planId}/tareas-extra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setTareasExtra(result.tareas_extra);
        setTareasSeleccionadas([]); // Resetear selección
      } else {
        throw new Error(result.error || 'Error al cargar tareas extra');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tareas extra");
    }
  };

  const calcularPrecio = async () => {
    if (!horarioSeleccionado) return;
    
    try {
      setCalculandoPrecio(true);
      const token = localStorage.getItem("access_token");
      
      // Crear fechas_horarios con el horario seleccionado para todas las fechas
      const fechasHorarios = fechasSeleccionadas.map(fecha => {
        const fechaObj = new Date(fecha);
        const esSabado = fechaObj.getDay() === 6;
        const horaFinal = horarioSeleccionado.hora_final;
        
        // Calcular sobrecargo si es sábado después del mediodía
        let sobrecargo = 0;
        if (esSabado && horaFinal > '12:00') {
          sobrecargo = horarioSeleccionado.sobrecargo_sabado || 10000;
        }
        
        return {
          fecha: fecha,
          hora_inicio: horarioSeleccionado.hora_inicio,
          hora_final: horarioSeleccionado.hora_final,
          sobrecargo_sabado: sobrecargo
        };
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/calcular-precio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planSeleccionado?.id,
          ubicacion_id: ubicacionSeleccionada?.id,
          fechas_horarios: fechasHorarios,
          tareas_extra: tareasSeleccionadas
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setCalculoPrecio(result.calculo);
      } else {
        throw new Error(result.error || 'Error al calcular precio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al calcular precio");
    } finally {
      setCalculandoPrecio(false);
    }
  };

  // CORRECTED: URL corregida para crear reservas
  const crearReservas = async () => {
    if (!horarioSeleccionado) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      // Crear fechas_horarios con el horario seleccionado para todas las fechas
      const fechasHorarios = fechasSeleccionadas.map(fecha => {
        const fechaObj = new Date(fecha);
        const esSabado = fechaObj.getDay() === 6;
        const horaFinal = horarioSeleccionado.hora_final;
        
        // Calcular sobrecargo si es sábado después del mediodía
        let sobrecargo = 0;
        if (esSabado && horaFinal > '12:00') {
          sobrecargo = horarioSeleccionado.sobrecargo_sabado || 10000;
        }
        
        return {
          fecha: fecha,
          hora_inicio: horarioSeleccionado.hora_inicio,
          hora_final: horarioSeleccionado.hora_final,
          sobrecargo_sabado: sobrecargo
        };
      });
      
      // URL CORREGIDA: Usar la ruta correcta basada en las URLs de Django
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservas/crear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empleada_id: empleadaSeleccionada?.id,
          plan_id: planSeleccionado?.id,
          ubicacion_id: ubicacionSeleccionada?.id,
          fechas_horarios: fechasHorarios,
          tareas_extra: tareasSeleccionadas
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        alert(`${result.message}\nTotal pagado: ${formatCurrency(result.data.resumen.precio_total)}`);
        navigate('/cliente/reservas/index');
      } else {
        throw new Error(result.error || 'Error al crear reservas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear reservas");
    } finally {
      setLoading(false);
    }
  };

  // Funciones de utilidad
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerDescuentoPorDias = (dias: number) => {
    if (dias <= 3) return { porcentaje: 0, descripcion: 'Sin descuento' };
    if (dias <= 7) return { porcentaje: 3, descripcion: '3% de descuento' };
    if (dias <= 11) return { porcentaje: 5, descripcion: '5% de descuento' };
    if (dias <= 14) return { porcentaje: 7, descripcion: '7% de descuento' };
    if (dias <= 30) return { porcentaje: 10, descripcion: '10% de descuento' };
    return { porcentaje: 10, descripcion: '10% de descuento (máximo)' };
  };

  // Funciones de navegación
  const irAPaso = (paso: number) => {
    if (paso === 1) {
      setPasoActual(1);
    } else if (paso === 2 && empleadaSeleccionada) {
      setPasoActual(2);
    } else if (paso === 3 && empleadaSeleccionada && planSeleccionado) {
      setPasoActual(3);
    } else if (paso === 4 && empleadaSeleccionada && planSeleccionado && horarioSeleccionado) {
      setPasoActual(4);
    } else if (paso === 5 && empleadaSeleccionada && planSeleccionado && horarioSeleccionado && fechasSeleccionadas.length > 0) {
      setPasoActual(5);
    } else if (paso === 6 && empleadaSeleccionada && planSeleccionado && horarioSeleccionado && fechasSeleccionadas.length > 0 && ubicacionSeleccionada) {
      setPasoActual(6);
    }
  };

  const siguientePaso = () => {
    if (pasoActual < 6) {
      irAPaso(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  // Funciones de selección
  const seleccionarEmpleada = (empleada: Empleada) => {
    setEmpleadaSeleccionada(empleada);
    setFechasSeleccionadas([]);
    cargarDisponibilidad(empleada.id);
  };

  const seleccionarPlan = (plan: Plan) => {
    setPlanSeleccionado(plan);
    setHorarioSeleccionado(null); // Resetear horario cuando cambia el plan
    setFechasSeleccionadas([]); // Resetear fechas cuando cambia el plan
  };

  const toggleFecha = (fecha: string) => {
    if (fechasSeleccionadas.includes(fecha)) {
      setFechasSeleccionadas(fechasSeleccionadas.filter(f => f !== fecha));
    } else {
      if (fechasSeleccionadas.length < 30) {
        setFechasSeleccionadas([...fechasSeleccionadas, fecha].sort());
      }
    }
  };

  const toggleTareaExtra = (tarea: string) => {
    if (tareasSeleccionadas.includes(tarea)) {
      setTareasSeleccionadas(tareasSeleccionadas.filter(t => t !== tarea));
    } else {
      setTareasSeleccionadas([...tareasSeleccionadas, tarea]);
    }
  };

  // Funciones de calendario
  const obtenerDiasDelMes = (fecha: Date) => {
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const dias = [];
    
    // Días en blanco al inicio
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push(null);
    }
    
    // Días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(fecha.getFullYear(), fecha.getMonth(), dia));
    }
    
    return dias;
  };

  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1));
  };

  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1));
  };

  const obtenerDisponibilidadFecha = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return disponibilidad.find(d => d.fecha === fechaStr);
  };

  // Validaciones
  const puedeAvanzarPaso1 = empleadaSeleccionada !== null;
  const puedeAvanzarPaso2 = planSeleccionado !== null;
  const puedeAvanzarPaso3 = horarioSeleccionado !== null;
  const puedeAvanzarPaso4 = fechasSeleccionadas.length > 0;
  const puedeAvanzarPaso5 = ubicacionSeleccionada !== null;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2">
              Crear Nueva Reserva
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              Reserva tu servicio de limpieza paso a paso
            </p>
          </div>
          <button
            onClick={() => navigate('/cliente/reservas/index')}
            className="bg-[#D95B26] hover:bg-[#b8491f] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-base flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={20} />
            Volver a Reservas
          </button>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          {PASOS.map((paso, index) => (
            <div key={paso.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => irAPaso(paso.id)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                    pasoActual === paso.id
                      ? 'bg-[#195083] text-white'
                      : pasoActual > paso.id
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {pasoActual > paso.id ? <Check size={16} /> : paso.id}
                </button>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <p className={`font-medium text-sm ${pasoActual >= paso.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {paso.nombre}
                  </p>
                  <p className="text-xs text-gray-500">{paso.descripcion}</p>
                </div>
              </div>
              {index < PASOS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${pasoActual > paso.id ? 'bg-[#22c55e]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Paso 1: Seleccionar Empleada */}
        {pasoActual === 1 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Selecciona una Empleada
              </h2>
              <p className="text-gray-600">
                Elige la empleada que realizará tu servicio de limpieza
              </p>
            </div>

            {empleadas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {empleadas.map((empleada) => (
                  <div 
                    key={empleada.id}
                    onClick={() => seleccionarEmpleada(empleada)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      empleadaSeleccionada?.id === empleada.id
                        ? 'border-[#195083] bg-[#195083]/5'
                        : 'border-gray-200 hover:border-[#195083]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-[#195083]/10 p-2 rounded-lg">
                        <User className="h-5 w-5 text-[#195083]" />
                      </div>
                      {empleadaSeleccionada?.id === empleada.id && (
                        <CheckCircle className="h-5 w-5 text-[#195083]" />
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {empleada.nombre_completo}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {empleada.ranking.toFixed(1)}
                      </span>
                    </div>
                    
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay empleadas disponibles</p>
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Seleccionar Plan */}
        {pasoActual === 2 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Selecciona un Plan
              </h2>
              <p className="text-gray-600">
                Empleada: <span className="font-semibold text-gray-900">{empleadaSeleccionada?.nombre_completo}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                El plan define las horas de trabajo y servicios incluidos
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {planes.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => seleccionarPlan(plan)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    planSeleccionado?.id === plan.id
                      ? 'border-[#195083] bg-[#195083]/5'
                      : 'border-gray-200 hover:border-[#195083]/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-[#195083]/10 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-[#195083]" />
                    </div>
                    {planSeleccionado?.id === plan.id && (
                      <CheckCircle className="h-5 w-5 text-[#195083]" />
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{plan.nombre}</h4>
                  <p className="text-sm text-gray-600 mb-2">{plan.descripcion}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-[#195083]">
                      {formatCurrency(plan.precio)} / día
                    </span>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {plan.horas_servicio}h de trabajo
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    Disponible: {plan.hora_inicio} - {plan.hora_final}
                  </div>

                  {plan.servicios_asociados.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Servicios incluidos:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.servicios_asociados.slice(0, 20).map((servicio, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {servicio}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Seleccionar Horario */}
        {pasoActual === 3 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Selecciona el Horario
              </h2>
              <p className="text-gray-600">
                Plan: <span className="font-semibold text-gray-900">{planSeleccionado?.nombre}</span> 
                ({planSeleccionado?.horas_servicio}h de trabajo)
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Este horario se aplicará a todos los días que reserves
              </p>
            </div>

            {cargandoHorarios ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {horariosDisponibles.map((horario, index) => (
                  <div
                    key={index}
                    onClick={() => setHorarioSeleccionado(horario)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      horarioSeleccionado?.hora_inicio === horario.hora_inicio && 
                      horarioSeleccionado?.hora_final === horario.hora_final
                        ? 'border-[#195083] bg-[#195083]/5'
                        : 'border-gray-200 hover:border-[#195083]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-[#195083]/10 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-[#195083]" />
                      </div>
                      {horarioSeleccionado?.hora_inicio === horario.hora_inicio && 
                       horarioSeleccionado?.hora_final === horario.hora_final && (
                        <CheckCircle className="h-5 w-5 text-[#195083]" />
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {horario.hora_inicio} - {horario.hora_final}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {horario.horas_duracion} horas de servicio
                    </p>

                    {horario.sobrecargo_sabado > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                        <p className="text-yellow-800 font-medium">
                          Sobrecargo sábados después del mediodía
                        </p>
                        <p className="text-yellow-700">
                          +{formatCurrency(horario.sobrecargo_sabado)} por día
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {horariosDisponibles.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay horarios disponibles para este plan</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paso 4: Seleccionar Fechas */}
        {pasoActual === 4 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Selecciona las Fechas
              </h2>
              <p className="text-gray-600">
                Horario seleccionado: <span className="font-semibold text-gray-900">
                  {horarioSeleccionado?.hora_inicio} - {horarioSeleccionado?.hora_final}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Puedes seleccionar entre 1 y 30 días. Días seleccionados: {fechasSeleccionadas.length}
              </p>
              
              {fechasSeleccionadas.length > 0 && (
                <div className="mt-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Descuento por cantidad de días: {obtenerDescuentoPorDias(fechasSeleccionadas.length).descripcion}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {fechasSeleccionadas.map(fecha => (
                        <span key={fecha} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {new Date(fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Navegación del calendario */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <button
                    onClick={mesAnterior}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mesActual.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <button
                    onClick={mesSiguiente}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Calendario */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Encabezados de días */}
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                    <div key={dia} className="p-2 text-center text-sm font-medium text-gray-600">
                      {dia}
                    </div>
                  ))}
                  
                  {/* Días del mes */}
                  {obtenerDiasDelMes(mesActual).map((fecha, index) => {
                    if (!fecha) {
                      return <div key={index} className="p-2"></div>;
                    }
                    
                    const fechaStr = fecha.toISOString().split('T')[0];
                    const disponibilidadFecha = obtenerDisponibilidadFecha(fecha);
                    const estaSeleccionada = fechasSeleccionadas.includes(fechaStr);
                    const esHoy = fecha.toDateString() === new Date().toDateString();
                    const esPasado = fecha < new Date() && !esHoy;
                    const disponible = disponibilidadFecha?.disponible && !esPasado;

                    return (
                      <button
                        key={index}
                        onClick={() => disponible && toggleFecha(fechaStr)}
                        disabled={!disponible}
                        className={`
                          p-2 text-sm rounded-lg transition-all min-h-[40px] sm:min-h-[44px] relative
                          ${estaSeleccionada 
                            ? 'bg-[#195083] text-white font-semibold' 
                            : disponible 
                            ? 'bg-white hover:bg-[#195083]/10 border border-gray-200 hover:border-[#195083] text-gray-900' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                          ${esHoy ? 'ring-2 ring-blue-400' : ''}
                          ${disponibilidadFecha?.es_sabado && disponible ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                        `}
                      >
                        {fecha.getDate()}
                        {esHoy && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                        {disponibilidadFecha?.es_sabado && disponible && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#195083] rounded"></div>
                    <span>Seleccionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
                    <span>Sábado (posible sobrecargo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>No disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Hoy</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 5: Detalles (Ubicación y Tareas Extra) */}
        {pasoActual === 5 && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Detalles del Servicio
              </h2>
              <p className="text-gray-600">
                Selecciona ubicación y servicios adicionales
              </p>
            </div>

            {/* Selección de Ubicación */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación del Servicio</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ubicaciones.map((ubicacion) => (
                  <div
                    key={ubicacion.id}
                    onClick={() => setUbicacionSeleccionada(ubicacion)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      ubicacionSeleccionada?.id === ubicacion.id
                        ? 'border-[#195083] bg-[#195083]/5'
                        : 'border-gray-200 hover:border-[#195083]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-[#195083]/10 p-2 rounded-lg">
                        <Home className="h-5 w-5 text-[#195083]" />
                      </div>
                      {ubicacionSeleccionada?.id === ubicacion.id && (
                        <CheckCircle className="h-5 w-5 text-[#195083]" />
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">{ubicacion.nombre}</h4>
                    <p className="text-sm text-gray-600 mb-2">{ubicacion.nombre_lugar}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{ubicacion.pisos} piso{ubicacion.pisos !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{ubicacion.baños} baño{ubicacion.baños !== 1 ? 's' : ''}</span>
                      </div>
                      {ubicacion.pisos > 1 && (
                        <div className="text-xs text-orange-600 mt-2">
                          +{formatCurrency((ubicacion.pisos - 1) * 10000)} por pisos adicionales
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas Extra */}
            {planSeleccionado && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tareas Adicionales
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Opcionales - $15.000 cada una)
                  </span>
                </h3>
                
                {tareasExtra.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tareasExtra.map((tarea) => (
                      <div
                        key={tarea.nombre}
                        onClick={() => toggleTareaExtra(tarea.nombre)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                          tareasSeleccionadas.includes(tarea.nombre)
                            ? 'border-[#195083] bg-[#195083]/5'
                            : 'border-gray-200 hover:border-[#195083]/50'
                        }`}
                      >
                        {tareasSeleccionadas.includes(tarea.nombre) ? (
                          <CheckSquare className="h-5 w-5 text-[#195083] flex-shrink-0" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-900">{tarea.nombre}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Todas las tareas están incluidas en este plan</p>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de precio en tiempo real */}
            {calculoPrecio && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Resumen de Costos</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Plan base ({calculoPrecio.cantidad_dias} días)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_base)}</span>
                  </div>
                  
                  {calculoPrecio.cantidad_tareas_extra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        Tareas extra ({calculoPrecio.cantidad_tareas_extra})
                      </span>
                      <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_tareas_extra)}</span>
                    </div>
                  )}
                  
                  {calculoPrecio.pisos_extra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        Pisos adicionales ({calculoPrecio.pisos_extra})
                      </span>
                      <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_pisos_extra)}</span>
                    </div>
                  )}

                  {calculoPrecio.sobrecargo_sabados > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Sobrecargo sábados</span>
                      <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.sobrecargo_sabados)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.subtotal)}</span>
                  </div>
                  
                  {calculoPrecio.porcentaje_descuento_dias > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento por días ({calculoPrecio.porcentaje_descuento_dias}%)</span>
                      <span className="font-medium">-{formatCurrency(calculoPrecio.descuento_dias)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-900">Total</span>
                    <span className="font-bold text-lg text-blue-900">
                      {formatCurrency(calculoPrecio.precio_final)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 text-center pt-2">
                    Equivale a {formatCurrency(calculoPrecio.precio_por_dia)} por día
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 6: Confirmación */}
        {pasoActual === 6 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Confirmar Reserva
              </h2>
              <p className="text-gray-600">
                Revisa todos los detalles antes de confirmar tu reserva
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Detalles de la reserva */}
              <div className="space-y-4">
                {/* Empleada */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Empleada Asignada
                  </h4>
                  <p className="text-gray-700">{empleadaSeleccionada?.nombre_completo}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {empleadaSeleccionada?.ranking.toFixed(1)} estrellas
                    </span>
                  </div>
                </div>

                {/* Plan y Horario */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Plan y Horario
                  </h4>
                  <p className="text-gray-700 font-medium">{planSeleccionado?.nombre}</p>
                  <p className="text-sm text-gray-600">{planSeleccionado?.descripcion}</p>
                  <div className="mt-2 bg-white p-2 rounded border">
                    <p className="text-sm font-medium text-gray-900">
                      Horario: {horarioSeleccionado?.hora_inicio} - {horarioSeleccionado?.hora_final}
                    </p>
                    <p className="text-xs text-gray-600">
                      {horarioSeleccionado?.horas_duracion} horas de trabajo
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fechas del Servicio ({fechasSeleccionadas.length} días)
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {fechasSeleccionadas.map(fecha => {
                      const fechaObj = new Date(fecha);
                      const esSabado = fechaObj.getDay() === 6;
                      return (
                        <div key={fecha} className="text-sm text-gray-700 flex items-center justify-between">
                          <span>{formatDate(fecha)}</span>
                          {esSabado && horarioSeleccionado && horarioSeleccionado.hora_final > '12:00' && (
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              Sobrecargo
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ubicación */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación
                  </h4>
                  <p className="text-gray-700 font-medium">{ubicacionSeleccionada?.nombre}</p>
                  <p className="text-sm text-gray-600">{ubicacionSeleccionada?.nombre_lugar}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>{ubicacionSeleccionada?.pisos} piso(s)</span>
                    <span>{ubicacionSeleccionada?.baños} baño(s)</span>
                  </div>
                </div>

                {/* Tareas extra */}
                {tareasSeleccionadas.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Tareas Adicionales ({tareasSeleccionadas.length})
                    </h4>
                    <div className="space-y-1">
                      {tareasSeleccionadas.map(tarea => (
                        <div key={tarea} className="text-sm text-gray-700">
                          • {tarea}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de pago */}
              <div className="space-y-4">
                <div className="bg-[#195083]/5 border border-[#195083]/20 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Resumen de Pago
                  </h4>
                  
                  {calculoPrecio && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          Plan base ({calculoPrecio.cantidad_dias} días)
                        </span>
                        <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_base)}</span>
                      </div>
                      
                      {calculoPrecio.cantidad_tareas_extra > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            Tareas extra ({calculoPrecio.cantidad_tareas_extra})
                          </span>
                          <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_tareas_extra)}</span>
                        </div>
                      )}
                      
                      {calculoPrecio.pisos_extra > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            Pisos adicionales ({calculoPrecio.pisos_extra})
                          </span>
                          <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_pisos_extra)}</span>
                        </div>
                      )}

                      {calculoPrecio.sobrecargo_sabados > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Sobrecargo sábados</span>
                          <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.sobrecargo_sabados)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm pt-2 border-t border-[#195083]/20">
                        <span className="text-gray-700">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.subtotal)}</span>
                      </div>
                      
                      {calculoPrecio.porcentaje_descuento_dias > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento por días ({calculoPrecio.porcentaje_descuento_dias}%)</span>
                          <span className="font-medium">-{formatCurrency(calculoPrecio.descuento_dias)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2 border-t border-[#195083]/30">
                        <span className="font-semibold text-[#195083]">TOTAL A PAGAR</span>
                        <span className="font-bold text-xl text-[#195083]">
                          {formatCurrency(calculoPrecio.precio_final)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 text-center pt-2">
                        Se dividirán en {calculoPrecio.cantidad_dias} reservas de {formatCurrency(calculoPrecio.precio_por_dia)} cada una
                      </div>
                    </div>
                  )}
                </div>

                {/* Nota importante */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Importante</p>
                      <p className="text-yellow-700">
                        Se crearán {fechasSeleccionadas.length} reservas individuales con el mismo horario 
                        ({horarioSeleccionado?.hora_inicio} - {horarioSeleccionado?.hora_final}). 
                        Podrás modificar cada reserva individualmente después de crearlas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• El pago se procesa de manera segura</p>
                  <p>• Puedes cancelar hasta 24 horas antes del servicio</p>
                  <p>• La empleada llegará en el horario acordado</p>
                  <p>• Todas las tareas incluyen materiales básicos</p>
                  <p>• Los sábados después del mediodía tienen sobrecargo</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación entre pasos */}
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={pasoAnterior}
              disabled={pasoActual === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>

            <div className="flex items-center gap-3">
              {pasoActual < 6 ? (
                <button
                  onClick={siguientePaso}
                  disabled={
                    (pasoActual === 1 && !puedeAvanzarPaso1) ||
                    (pasoActual === 2 && !puedeAvanzarPaso2) ||
                    (pasoActual === 3 && !puedeAvanzarPaso3) ||
                    (pasoActual === 4 && !puedeAvanzarPaso4) ||
                    (pasoActual === 5 && !puedeAvanzarPaso5)
                  }
                  className="flex items-center gap-2 bg-[#195083] text-white px-6 py-2 rounded-lg hover:bg-[#0f3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={crearReservas}
                  disabled={loading || calculandoPrecio}
                  className="flex items-center gap-2 bg-[#22c55e] text-white px-6 py-2 rounded-lg hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirmar y Pagar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error modal */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setError(null)}></div>
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">Error</h3>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withClienteRole(CrearReserva);