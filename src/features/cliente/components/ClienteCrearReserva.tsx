
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

interface ActividadPlan {
  id: string;
  nombre: string;
  precio_unitario?: number | null;
  duracion_estimada_minutos?: number | null;
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
  tipo_plan?: "full" | "a_la_carte";
  actividades?: ActividadPlan[];
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
  reservas_existentes?: number;
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
const PASOS_IDS = [1, 2, 3, 4, 5, 6];
const PASO_KEYS = [
  { nombre: 'steps.employee', descripcion: 'steps.employeeDesc' },
  { nombre: 'steps.plan', descripcion: 'steps.planDesc' },
  { nombre: 'steps.schedule', descripcion: 'steps.scheduleDesc' },
  { nombre: 'steps.dates', descripcion: 'steps.datesDesc' },
  { nombre: 'steps.details', descripcion: 'steps.detailsDesc' },
  { nombre: 'steps.confirmation', descripcion: 'steps.confirmationDesc' }
];

function CrearReserva() {
  // Estados principales
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<string[]>([]);

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
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.loadEmployees'));
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
        throw new Error(result.error || t('cliente.createReservation.errors.loadPlans'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.loadPlans'));
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
        throw new Error(result.error || t('cliente.createReservation.errors.loadLocations'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.loadLocations'));
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
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.loadAvailability'));
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
        throw new Error(result.error || t('cliente.createReservation.errors.loadSchedules'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.loadSchedules'));
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
        throw new Error(result.error || t('cliente.createReservation.errors.loadExtraTasks'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.loadExtraTasks'));
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
        throw new Error(result.error || t('cliente.createReservation.errors.calculatePrice'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.calculatePrice'));
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
          tareas_extra: tareasSeleccionadas,
          actividades_seleccionadas: actividadesSeleccionadas,
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
        throw new Error(result.error || t('cliente.createReservation.errors.createReservations'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cliente.createReservation.errors.createReservations'));
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
    if (dias <= 3) return { porcentaje: 0, descripcion: t('cliente.createReservation.discounts.none') };
    if (dias <= 7) return { porcentaje: 3, descripcion: t('cliente.createReservation.discounts.3pct') };
    if (dias <= 11) return { porcentaje: 5, descripcion: t('cliente.createReservation.discounts.5pct') };
    if (dias <= 14) return { porcentaje: 7, descripcion: t('cliente.createReservation.discounts.7pct') };
    if (dias <= 30) return { porcentaje: 10, descripcion: t('cliente.createReservation.discounts.10pct') };
    return { porcentaje: 10, descripcion: t('cliente.createReservation.discounts.10pctMax') };
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
    setHorarioSeleccionado(null);
    setFechasSeleccionadas([]);
    // Si es full, preseleccionar todas las actividades del plan
    if (plan.tipo_plan !== 'a_la_carte') {
      setActividadesSeleccionadas((plan.actividades ?? []).map((a) => a.id));
    } else {
      setActividadesSeleccionadas([]);
    }
  };

  const toggleActividadPlan = (id: string) => {
    setActividadesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
              {t('cliente.createReservation.title')}
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              {t('cliente.createReservation.subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/cliente/reservas/index')}
            className="bg-[#D95B26] hover:bg-[#b8491f] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-sm sm:text-base flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={20} />
            {t('cliente.createReservation.backToReservations')}
          </button>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          {PASOS_IDS.map((pasoId, index) => (
            <div key={pasoId} className="flex items-center flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => irAPaso(pasoId)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                    pasoActual === pasoId
                      ? 'bg-[#195083] text-white'
                      : pasoActual > pasoId
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {pasoActual > pasoId ? <Check size={16} /> : pasoId}
                </button>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <p className={`font-medium text-sm ${pasoActual >= pasoId ? 'text-gray-900' : 'text-gray-500'}`}>
                    {t(`cliente.createReservation.${PASO_KEYS[index].nombre}`)}
                  </p>
                  <p className="text-xs text-gray-500">{t(`cliente.createReservation.${PASO_KEYS[index].descripcion}`)}</p>
                </div>
              </div>
              {index < PASOS_IDS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${pasoActual > pasoId ? 'bg-[#22c55e]' : 'bg-gray-200'}`} />
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
                {t('cliente.createReservation.selectEmployee.title')}
              </h2>
              <p className="text-gray-600">
                {t('cliente.createReservation.selectEmployee.subtitle')}
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
                <p className="text-gray-500">{t('cliente.createReservation.selectEmployee.noEmployees')}</p>
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Seleccionar Plan */}
        {pasoActual === 2 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {t('cliente.createReservation.selectPlan.title')}
              </h2>
              <p className="text-gray-600">
                {t('cliente.createReservation.selectPlan.employee')} <span className="font-semibold text-gray-900">{empleadaSeleccionada?.nombre_completo}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('cliente.createReservation.selectPlan.planDefines')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {planes.length === 0 ? (
                <div className="lg:col-span-2 text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('cliente.createReservation.selectPlan.noPlans')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('cliente.createReservation.selectPlan.noPlansDesc')}
                  </p>
                </div>
              ) : (
              planes.map((plan) => (
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
                      {formatCurrency(plan.precio)} {t('cliente.createReservation.selectPlan.perDay')}
                    </span>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {t('cliente.createReservation.selectPlan.workHours', { n: plan.horas_servicio })}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    {t('cliente.createReservation.selectPlan.available', { start: plan.hora_inicio, end: plan.hora_final })}
                  </div>

                  {/* Actividades à la carte */}
                  {plan.tipo_plan === 'a_la_carte' && plan.actividades && plan.actividades.length > 0 && planSeleccionado?.id === plan.id && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        {t('admin.createPlan.activities')}
                      </p>
                      <div className="space-y-1">
                        {plan.actividades.map((act) => {
                          const sel = actividadesSeleccionadas.includes(act.id);
                          return (
                            <label key={act.id} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={sel}
                                onChange={() => toggleActividadPlan(act.id)}
                                className="w-4 h-4 text-[#195083]"
                              />
                              <span className="flex-1 text-gray-700">{act.nombre}</span>
                              {act.precio_unitario != null && (
                                <span className="text-gray-500 text-xs">
                                  ${Number(act.precio_unitario).toLocaleString('es-CO')}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                      {actividadesSeleccionadas.length > 0 && (
                        <p className="text-xs text-[#195083] mt-2 font-medium">
                          Total: ${(
                            plan.actividades
                              .filter((a) => actividadesSeleccionadas.includes(a.id))
                              .reduce((s, a) => s + (a.precio_unitario ?? 0), 0)
                          ).toLocaleString('es-CO')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Servicios incluidos (planes full) */}
                  {plan.tipo_plan !== 'a_la_carte' && plan.servicios_asociados.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">{t('cliente.createReservation.selectPlan.servicesIncluded')}</p>
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
              ))
              )}
            </div>
          </div>
        )}

        {/* Paso 3: Seleccionar Horario */}
        {pasoActual === 3 && (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {t('cliente.createReservation.selectSchedule.title')}
              </h2>
              <p className="text-gray-600">
                {t('cliente.createReservation.selectSchedule.plan')} <span className="font-semibold text-gray-900">{planSeleccionado?.nombre}</span> 
                ({t('cliente.createReservation.selectPlan.workHours', { n: planSeleccionado?.horas_servicio })})
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('cliente.createReservation.selectSchedule.subtitle')}
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
                      {t('cliente.createReservation.selectSchedule.hoursOfService', { n: horario.horas_duracion })}
                    </p>

                    {horario.sobrecargo_sabado > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                        <p className="text-yellow-800 font-medium">
                          {t('cliente.createReservation.selectSchedule.saturdaySurcharge')}
                        </p>
                        <p className="text-yellow-700">
                          {t('cliente.createReservation.selectSchedule.surchargeAmount', { amount: formatCurrency(horario.sobrecargo_sabado) })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {horariosDisponibles.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('cliente.createReservation.selectSchedule.noSchedules')}</p>
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
                {t('cliente.createReservation.selectDates.title')}
              </h2>
              <p className="text-gray-600">
                {t('cliente.createReservation.selectDates.selectedSchedule')} <span className="font-semibold text-gray-900">
                  {horarioSeleccionado?.hora_inicio} - {horarioSeleccionado?.hora_final}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('cliente.createReservation.selectDates.subtitle', { n: fechasSeleccionadas.length })}
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
                          {new Date(fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                  {(t('cliente.createReservation.calendar.days', { returnObjects: true }) as string[]).map(dia => (
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
                        {disponibilidadFecha?.reservas_existentes === 1 && disponible && (
                          <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-400 rounded-full" title={t('cliente.createReservation.calendar.oneServiceToday')}></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#195083] rounded"></div>
                    <span>{t('cliente.createReservation.calendar.legend.selected')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
                    <span>{t('cliente.createReservation.calendar.legend.available')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
                    <span>{t('cliente.createReservation.calendar.legend.saturday')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>{t('cliente.createReservation.calendar.legend.unavailable')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-gray-200 rounded relative">
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    </div>
                    <span>{t('cliente.createReservation.calendar.legend.oneService')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>{t('cliente.createReservation.calendar.legend.today')}</span>
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
                {t('cliente.createReservation.details.title')}
              </h2>
              <p className="text-gray-600">
                {t('cliente.createReservation.details.subtitle')}
              </p>
            </div>

            {/* Selección de Ubicación */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('cliente.createReservation.details.locationTitle')}</h3>
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
                        <span>{t('cliente.createReservation.details.floors', { n: ubicacion.pisos })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{t('cliente.createReservation.details.bathrooms', { n: ubicacion.baños })}</span>
                      </div>
                      {ubicacion.pisos > 1 && (
                        <div className="text-xs text-orange-600 mt-2">
                          {t('cliente.createReservation.details.extraFloorsCharge', { amount: formatCurrency((ubicacion.pisos - 1) * 10000) })}
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
                  {t('cliente.createReservation.details.extraTasks')}
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    {t('cliente.createReservation.details.extraTasksPrice')}
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
                    <p className="text-gray-500">{t('cliente.createReservation.details.allTasksIncluded')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de precio en tiempo real */}
            {calculoPrecio && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('cliente.createReservation.pricing.title')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('cliente.createReservation.pricing.planBase', { n: calculoPrecio.cantidad_dias })}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_base)}</span>
                  </div>
                  
                  {calculoPrecio.cantidad_tareas_extra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        {t('cliente.createReservation.pricing.extraTasks', { n: calculoPrecio.cantidad_tareas_extra })}
                      </span>
                      <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_tareas_extra)}</span>
                    </div>
                  )}
                  
                  {calculoPrecio.pisos_extra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        {t('cliente.createReservation.pricing.extraFloors', { n: calculoPrecio.pisos_extra })}
                      </span>
                      <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_pisos_extra)}</span>
                    </div>
                  )}

                  {calculoPrecio.sobrecargo_sabados > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">{t('cliente.createReservation.pricing.saturdaySurcharge')}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.sobrecargo_sabados)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-gray-700">{t('cliente.createReservation.pricing.subtotal')}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.subtotal)}</span>
                  </div>
                  
                  {calculoPrecio.porcentaje_descuento_dias > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('cliente.createReservation.pricing.dayDiscount', { n: calculoPrecio.porcentaje_descuento_dias })}</span>
                      <span className="font-medium">-{formatCurrency(calculoPrecio.descuento_dias)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-900">{t('cliente.createReservation.pricing.total')}</span>
                    <span className="font-bold text-lg text-blue-900">
                      {formatCurrency(calculoPrecio.precio_final)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 text-center pt-2">
                    {t('cliente.createReservation.pricing.perDay', { amount: formatCurrency(calculoPrecio.precio_por_dia) })}
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
                {t('cliente.createReservation.confirm.title')}
              </h2>
              <p className="text-gray-600">
                {t('cliente.createReservation.confirm.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Detalles de la reserva */}
              <div className="space-y-4">
                {/* Empleada */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('cliente.createReservation.confirm.assignedEmployee')}
                  </h4>
                  <p className="text-gray-700">{empleadaSeleccionada?.nombre_completo}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {t('cliente.createReservation.confirm.stars', { n: empleadaSeleccionada?.ranking.toFixed(1) })}
                    </span>
                  </div>
                </div>

                {/* Plan y Horario */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {t('cliente.createReservation.confirm.planAndSchedule')}
                  </h4>
                  <p className="text-gray-700 font-medium">{planSeleccionado?.nombre}</p>
                  <p className="text-sm text-gray-600">{planSeleccionado?.descripcion}</p>
                  <div className="mt-2 bg-white p-2 rounded border">
                    <p className="text-sm font-medium text-gray-900">
                      {t('cliente.createReservation.confirm.schedule')} {horarioSeleccionado?.hora_inicio} - {horarioSeleccionado?.hora_final}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t('cliente.createReservation.confirm.workHours', { n: horarioSeleccionado?.horas_duracion })}
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('cliente.createReservation.confirm.serviceDates', { n: fechasSeleccionadas.length })}
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
                              {t('cliente.createReservation.selectDates.surcharge')}
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
                    {t('cliente.createReservation.confirm.location')}
                  </h4>
                  <p className="text-gray-700 font-medium">{ubicacionSeleccionada?.nombre}</p>
                  <p className="text-sm text-gray-600">{ubicacionSeleccionada?.nombre_lugar}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>{t('cliente.createReservation.confirm.floors', { n: ubicacionSeleccionada?.pisos })}</span>
                    <span>{t('cliente.createReservation.confirm.bathrooms', { n: ubicacionSeleccionada?.baños })}</span>
                  </div>
                </div>

                {/* Tareas extra */}
                {tareasSeleccionadas.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('cliente.createReservation.confirm.extraTasks', { n: tareasSeleccionadas.length })}
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
                    {t('cliente.createReservation.confirm.paymentSummary')}
                  </h4>
                  
                  {calculoPrecio && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {t('cliente.createReservation.pricing.planBase', { n: calculoPrecio.cantidad_dias })}
                        </span>
                        <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_base)}</span>
                      </div>
                      
                      {calculoPrecio.cantidad_tareas_extra > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {t('cliente.createReservation.pricing.extraTasks', { n: calculoPrecio.cantidad_tareas_extra })}
                          </span>
                          <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_tareas_extra)}</span>
                        </div>
                      )}
                      
                      {calculoPrecio.pisos_extra > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {t('cliente.createReservation.pricing.extraFloors', { n: calculoPrecio.pisos_extra })}
                          </span>
                          <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.precio_pisos_extra)}</span>
                        </div>
                      )}

                      {calculoPrecio.sobrecargo_sabados > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">{t('cliente.createReservation.pricing.saturdaySurcharge')}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.sobrecargo_sabados)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm pt-2 border-t border-[#195083]/20">
                        <span className="text-gray-700">{t('cliente.createReservation.pricing.subtotal')}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(calculoPrecio.subtotal)}</span>
                      </div>
                      
                      {calculoPrecio.porcentaje_descuento_dias > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{t('cliente.createReservation.pricing.dayDiscount', { n: calculoPrecio.porcentaje_descuento_dias })}</span>
                          <span className="font-medium">-{formatCurrency(calculoPrecio.descuento_dias)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2 border-t border-[#195083]/30">
                        <span className="font-semibold text-[#195083]">{t('cliente.createReservation.pricing.totalToPay')}</span>
                        <span className="font-bold text-xl text-[#195083]">
                          {formatCurrency(calculoPrecio.precio_final)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 text-center pt-2">
                        {t('cliente.createReservation.pricing.splitInfo', { n: calculoPrecio.cantidad_dias, amount: formatCurrency(calculoPrecio.precio_por_dia) })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Nota importante */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">{t('cliente.createReservation.confirm.important')}</p>
                      <p className="text-yellow-700">
                        {t('cliente.createReservation.confirm.importantMessage', { n: fechasSeleccionadas.length, start: horarioSeleccionado?.hora_inicio, end: horarioSeleccionado?.hora_final })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• {t('cliente.createReservation.terms.securePayment')}</p>
                  <p>• {t('cliente.createReservation.terms.cancel24h')}</p>
                  <p>• {t('cliente.createReservation.terms.onTimeArrival')}</p>
                  <p>• {t('cliente.createReservation.terms.basicMaterials')}</p>
                  <p>• {t('cliente.createReservation.terms.saturdaySurcharge')}</p>
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
              {t('cliente.createReservation.nav.previous')}
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
                  {t('cliente.createReservation.nav.continue')}
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
                      {t('cliente.createReservation.nav.processing')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      {t('cliente.createReservation.nav.confirmAndPay')}
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
                <h3 className="font-semibold text-gray-900">{t('cliente.createReservation.errorModal.title')}</h3>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              {t('cliente.createReservation.errorModal.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withClienteRole(CrearReserva);