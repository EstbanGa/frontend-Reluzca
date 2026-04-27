
import { useState, useEffect, useMemo } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import * as XLSX from "xlsx";
import {
  Calendar, Clock, MapPin, Edit3, Trash2, Search, CheckCircle, AlertCircle,
  XCircle, RefreshCw, Eye, DollarSign, Download, Star, Phone, Mail,
  ChevronLeft, ChevronRight, Activity, User
} from "lucide-react";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListDetailModal from "@/components/ui/ListDetailModal";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Cliente { id: string; nombre: string; apellido: string; correo: string; telefono?: string; }
interface Empleada { id: string; nombre: string; apellido: string; telefono?: string; ranking?: number; }
interface Plan { id: string; nombre: string; precio: number; descripcion?: string; }
interface Lugar { id: string; nombre?: string; direccion?: string; tipo_lugar?: string; }
interface Reserva {
  id: string; fecha: string; hora_inicio: string; hora_final: string;
  estado: string; estado_pago?: string; metodo_pago?: string;
  descripcion?: string; precio_total?: number;
  created_at: string; updated_at: string;
  cliente?: Cliente; empleada?: Empleada; plan?: Plan; lugar?: Lugar;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const fmtCOP = (v?: number | null) =>
  v != null ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v) : "—";

const fmtDateLocal = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const fmtDateShort = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
};

// ─── Estado config ────────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-amber-700",  bg: "bg-amber-100",  dot: "bg-amber-400"  },
  programada: { label: "Programada", color: "text-blue-700",   bg: "bg-blue-100",   dot: "bg-blue-500"   },
  confirmada: { label: "Programada", color: "text-blue-700",   bg: "bg-blue-100",   dot: "bg-blue-500"   },
  en_curso:   { label: "En Curso",   color: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  en_proceso: { label: "En Curso",   color: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  completada: { label: "Completada", color: "text-green-700",  bg: "bg-green-100",  dot: "bg-green-500"  },
  cancelada:  { label: "Cancelada",  color: "text-red-700",    bg: "bg-red-100",    dot: "bg-red-400"    },
};

const ESTADOS_FILTRO = [
  { value: "todos",     label: "Todos"      },
  { value: "pendiente", label: "Pendiente"  },
  { value: "programada",label: "Programada" },
  { value: "en_curso",  label: "En Curso"   },
  { value: "completada",label: "Completada" },
  { value: "cancelada", label: "Cancelada"  },
];

const ESTADO_ALIASES: Record<string, string[]> = {
  programada: ["programada", "confirmada"],
  en_curso:   ["en_curso", "en_proceso"],
};

const matchEstado = (r: Reserva, filtro: string) => {
  if (filtro === "todos") return true;
  const aliases = ESTADO_ALIASES[filtro];
  return aliases ? aliases.includes(r.estado) : r.estado === filtro;
};

// ─── Component ────────────────────────────────────────────────────────────────
function AdminReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [detailReserva, setDetailReserva] = useState<Reserva | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { loadReservas(); }, []);

  const loadReservas = async () => {
    setLoading(true); setError(null);
    try {
      let all: Reserva[] = [];
      let pg = 1;
      while (true) {
        const res = await fetch(`${API_BASE_URL}/api/reservas?page=${pg}&items_per_page=100`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        all = [...all, ...(data.reservas ?? [])];
        if (!data.paginacion?.has_next) break;
        pg++;
      }
      setReservas(all);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta reserva?")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservas/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDetailReserva(null);
      await loadReservas();
    } catch (e: any) { alert(e.message); }
    finally { setDeleteLoading(false); }
  };

  // ── Stats globales ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       reservas.length,
    pendientes:  reservas.filter(r => r.estado === "pendiente").length,
    programadas: reservas.filter(r => r.estado === "programada" || r.estado === "confirmada").length,
    en_curso:    reservas.filter(r => r.estado === "en_curso" || r.estado === "en_proceso").length,
    completadas: reservas.filter(r => r.estado === "completada").length,
    canceladas:  reservas.filter(r => r.estado === "cancelada").length,
    ingresos:    reservas.filter(r => r.estado_pago === "pagado" || r.estado_pago === "PAGADO").reduce((s, r) => s + (r.precio_total ?? 0), 0),
  }), [reservas]);

  // ── Agrupar reservas por fecha ──────────────────────────────────────────────
  const reservasByDate = useMemo(() => {
    const map: Record<string, Reserva[]> = {};
    for (const r of reservas) {
      if (!map[r.fecha]) map[r.fecha] = [];
      map[r.fecha].push(r);
    }
    return map;
  }, [reservas]);

  // ── Días del mes actual ────────────────────────────────────────────────────
  const diasDelMes = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const ultimoDia = new Date(year, month + 1, 0).getDate();
    const days: (string | null)[] = Array(primerDia).fill(null);
    for (let d = 1; d <= ultimoDia; d++) {
      days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return days;
  }, [calendarMonth]);

  // ── Reservas del día seleccionado (con filtros) ─────────────────────────────
  const reservasDelDia = useMemo(() => {
    const diaReservas = reservasByDate[selectedDate] ?? [];
    const q = busqueda.toLowerCase();
    return diaReservas.filter(r => {
      const matchE = matchEstado(r, filtroEstado);
      const matchQ = !q || (
        r.cliente?.nombre?.toLowerCase().includes(q) ||
        r.cliente?.apellido?.toLowerCase().includes(q) ||
        r.empleada?.nombre?.toLowerCase().includes(q) ||
        r.plan?.nombre?.toLowerCase().includes(q)
      );
      return matchE && matchQ;
    });
  }, [reservasByDate, selectedDate, filtroEstado, busqueda]);

  const exportToExcel = () => {
    const rows = reservas.map((r, i) => ({
      "#": i + 1, "Fecha": fmtDateLocal(r.fecha),
      "Horario": `${r.hora_inicio} – ${r.hora_final}`,
      "Cliente": r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : "",
      "Empleada": r.empleada ? `${r.empleada.nombre} ${r.empleada.apellido}` : "",
      "Plan": r.plan?.nombre ?? "", "Estado": r.estado,
      "Total $$": r.precio_total ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservas");
    XLSX.writeFile(wb, `reservas_reluzca_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <div className="flex items-center justify-center min-h-64"><RefreshCw className="h-10 w-10 animate-spin text-[#195083]" /></div>;
  if (error) return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={loadReservas} className="bg-[#195083] text-white px-4 py-2 rounded-lg">Reintentar</button>
    </div>
  );

  const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  return (
    <div className="space-y-5 lg:space-y-6">

      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.admin}
        title="Reservas"
        subtitle={`${reservas.length} reservas totales`}
        actions={
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
            <Download className="h-4 w-4" /> Exportar Excel
          </button>
        }
      />

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total",       value: stats.total,       color: "bg-gray-100 text-gray-700"     },
          { label: "Pendientes",  value: stats.pendientes,  color: "bg-amber-100 text-amber-700"   },
          { label: "Programadas", value: stats.programadas, color: "bg-blue-100 text-blue-700"     },
          { label: "En Curso",    value: stats.en_curso,    color: "bg-orange-100 text-orange-700" },
          { label: "Completadas", value: stats.completadas, color: "bg-green-100 text-green-700"   },
          { label: "Canceladas",  value: stats.canceladas,  color: "bg-red-100 text-red-700"       },
          { label: "Ingresos",    value: fmtCOP(stats.ingresos), color: "bg-emerald-100 text-emerald-700" },
        ].map(s => (
          <div key={s.label} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${s.color}`}>
            {s.label}: <span className="font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Layout principal: Calendario + Lista del día ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">

        {/* ── CALENDARIO ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Navegación mes */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-lg">
                {MESES[calendarMonth.getMonth()]}
              </h3>
              <p className="text-sm text-gray-500">{calendarMonth.getFullYear()}</p>
            </div>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Selector de mes rápido */}
          <div className="px-4 pt-3 pb-0">
            <div className="flex flex-wrap gap-1">
              {MESES.map((mes, idx) => (
                <button
                  key={mes}
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), idx, 1))}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    calendarMonth.getMonth() === idx
                      ? 'bg-[#195083] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {mes.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Grid calendario */}
          <div className="p-4">
            {/* Encabezado días */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 gap-1">
              {diasDelMes.map((fechaStr, idx) => {
                if (!fechaStr) return <div key={idx} />;

                const reservasDia = reservasByDate[fechaStr] ?? [];
                const isSelected = fechaStr === selectedDate;
                const isToday = fechaStr === todayStr;
                const hasReservas = reservasDia.length > 0;

                // Agrupar puntos por estado (máx 3 puntos distintos)
                const estadosPuntos = [...new Set(reservasDia.map(r => {
                  if (r.estado === 'confirmada') return 'programada';
                  if (r.estado === 'en_proceso') return 'en_curso';
                  return r.estado;
                }))].slice(0, 3);

                const [,, dayNum] = fechaStr.split('-');

                return (
                  <button
                    key={fechaStr}
                    onClick={() => setSelectedDate(fechaStr)}
                    className={`
                      relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[52px] transition-all text-sm
                      ${isSelected
                        ? 'bg-[#195083] text-white shadow-lg shadow-[#195083]/25'
                        : isToday
                        ? 'bg-[#195083]/10 text-[#195083] font-bold'
                        : hasReservas
                        ? 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                        : 'hover:bg-gray-50 text-gray-600'
                      }
                    `}
                  >
                    <span className={`font-semibold text-sm leading-none ${isSelected ? 'text-white' : ''}`}>
                      {parseInt(dayNum)}
                    </span>
                    {/* Dots de estados */}
                    {estadosPuntos.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {estadosPuntos.map(est => (
                          <span
                            key={est}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : ESTADO_CONFIG[est]?.dot ?? 'bg-gray-400'}`}
                          />
                        ))}
                        {reservasDia.length > 3 && (
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                            +{reservasDia.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Contador total */}
                    {reservasDia.length > 0 && (
                      <span className={`text-[10px] leading-none mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        {reservasDia.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-gray-100">
              {[
                { label: "Pendiente",  dot: "bg-amber-400"  },
                { label: "Programada", dot: "bg-blue-500"   },
                { label: "En Curso",   dot: "bg-orange-500" },
                { label: "Completada", dot: "bg-green-500"  },
                { label: "Cancelada",  dot: "bg-red-400"    },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTA DEL DÍA ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {/* Header día seleccionado */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-base capitalize">
                  {fmtDateLocal(selectedDate)}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {reservasDelDia.length} reserva{reservasDelDia.length !== 1 ? 's' : ''} para este día
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-xs bg-[#195083]/10 text-[#195083] px-2.5 py-1 rounded-full font-medium hover:bg-[#195083]/20 transition-colors"
                >
                  Hoy
                </button>
              </div>
            </div>

            {/* Filtros de estado (chips) */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ESTADOS_FILTRO.map(est => (
                <button
                  key={est.value}
                  onClick={() => setFiltroEstado(est.value)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    filtroEstado === est.value
                      ? 'bg-[#195083] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {est.label}
                  {est.value !== 'todos' && (() => {
                    const c = (reservasByDate[selectedDate] ?? []).filter(r => matchEstado(r, est.value)).length;
                    return c > 0 ? <span className="ml-1 opacity-70">({c})</span> : null;
                  })()}
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente, empleada, plan..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#195083]/30 focus:border-[#195083] bg-gray-50"
              />
            </div>
          </div>

          {/* Lista de reservas del día */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-[300px] max-h-[520px]">
            {reservasDelDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <Calendar className="h-12 w-12 mb-3" />
                <p className="text-sm text-gray-400">
                  {(reservasByDate[selectedDate] ?? []).length === 0
                    ? "Sin reservas para este día"
                    : "Sin reservas con los filtros aplicados"}
                </p>
              </div>
            ) : reservasDelDia.map(r => {
              const estCfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente;
              return (
                <div
                  key={r.id}
                  className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => setDetailReserva(r)}
                >
                  <div className="flex items-start gap-3">
                    {/* Hora */}
                    <div className="shrink-0 text-center w-12">
                      <p className="text-xs font-bold text-gray-700">{r.hora_inicio?.slice(0,5)}</p>
                      <p className="text-[10px] text-gray-400">{r.hora_final?.slice(0,5)}</p>
                    </div>

                    {/* Separador vertical coloreado */}
                    <div className={`w-0.5 self-stretch rounded-full shrink-0 ${estCfg.dot}`} />

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : "Sin cliente"}
                          </p>
                          {r.empleada && (
                            <p className="text-xs text-gray-500 truncate">
                              {r.empleada.nombre} {r.empleada.apellido}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estCfg.bg} ${estCfg.color}`}>
                            {estCfg.label}
                          </span>
                          {r.precio_total != null && (
                            <p className="text-xs font-bold text-gray-700 mt-0.5">{fmtCOP(r.precio_total)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        {r.plan && <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.plan.nombre}</span>}
                        {r.lugar?.nombre && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />{r.lugar.nombre}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones (visibles al hover) */}
                    <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); setDetailReserva(r); }}
                        className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-gray-400"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate("/admin/reservas/editar", { state: { reserva: r } }); }}
                        className="p-1.5 hover:bg-[#195083]/10 hover:text-[#195083] rounded-lg transition-colors text-gray-400"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-400"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer — total del día */}
          {reservasDelDia.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {reservasDelDia.length} reserva{reservasDelDia.length !== 1 ? 's' : ''} mostradas
              </span>
              <span className="text-xs font-bold text-gray-700">
                {fmtCOP(reservasDelDia.reduce((s, r) => s + (r.precio_total ?? 0), 0))} total día
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Detalle ── */}
      <ListDetailModal
        theme={ROLE_THEMES.admin}
        open={!!detailReserva}
        onClose={() => setDetailReserva(null)}
        title="Detalle de Reserva"
        subtitle={detailReserva ? `${fmtDateLocal(detailReserva.fecha)} · ${detailReserva.hora_inicio?.slice(0,5)} – ${detailReserva.hora_final?.slice(0,5)}` : ""}
      >
        {detailReserva && (() => {
          const estCfg = ESTADO_CONFIG[detailReserva.estado] ?? ESTADO_CONFIG.pendiente;
          return (
            <>
              {/* Estado y precio */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${estCfg.bg} ${estCfg.color}`}>{estCfg.label}</span>
                {detailReserva.estado_pago && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">{detailReserva.estado_pago}</span>
                )}
                {detailReserva.precio_total != null && (
                  <span className="ml-auto font-bold text-xl text-gray-900">{fmtCOP(detailReserva.precio_total)}</span>
                )}
              </div>

              {/* Fecha y horario */}
              <div className="bg-[#195083]/5 border border-[#195083]/10 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Fecha y Horario</p>
                <p className="font-semibold text-gray-900 capitalize">{fmtDateLocal(detailReserva.fecha)}</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {detailReserva.hora_inicio?.slice(0,5)} — {detailReserva.hora_final?.slice(0,5)}
                </p>
              </div>

              {/* Cliente */}
              {detailReserva.cliente && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cliente</p>
                  <p className="font-semibold text-gray-900">{detailReserva.cliente.nombre} {detailReserva.cliente.apellido}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-3.5 w-3.5" />{detailReserva.cliente.correo}</div>
                    {detailReserva.cliente.telefono && (
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Activity className="h-3.5 w-3.5" />{detailReserva.cliente.telefono}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Empleada */}
              {detailReserva.empleada && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Empleada</p>
                  <p className="font-semibold text-gray-900">{detailReserva.empleada.nombre} {detailReserva.empleada.apellido}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {detailReserva.empleada.telefono && (
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Activity className="h-3.5 w-3.5" />{detailReserva.empleada.telefono}</div>
                    )}
                    {detailReserva.empleada.ranking != null && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />{detailReserva.empleada.ranking.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plan y Lugar */}
              <div className="grid grid-cols-2 gap-3">
                {detailReserva.plan && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Plan</p>
                    <p className="font-semibold text-gray-900 text-sm">{detailReserva.plan.nombre}</p>
                    {detailReserva.plan.precio != null && (
                      <p className="text-xs text-gray-500 mt-0.5">{fmtCOP(detailReserva.plan.precio)}/día</p>
                    )}
                    {detailReserva.plan.descripcion && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{detailReserva.plan.descripcion}</p>
                    )}
                  </div>
                )}
                {detailReserva.lugar && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Lugar</p>
                    <p className="font-semibold text-gray-900 text-sm">{detailReserva.lugar.nombre ?? "Sin nombre"}</p>
                    {detailReserva.lugar.tipo_lugar && (
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{detailReserva.lugar.tipo_lugar}</p>
                    )}
                    {detailReserva.lugar.direccion && (
                      <p className="text-xs text-gray-400 mt-1">{detailReserva.lugar.direccion}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pago */}
              {(detailReserva.metodo_pago || detailReserva.estado_pago) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Información de Pago</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {detailReserva.estado_pago && (
                      <div><span className="text-gray-500 text-xs">Estado pago:</span><p className="font-medium text-gray-900">{detailReserva.estado_pago}</p></div>
                    )}
                    {detailReserva.metodo_pago && (
                      <div><span className="text-gray-500 text-xs">Método:</span><p className="font-medium text-gray-900 capitalize">{detailReserva.metodo_pago}</p></div>
                    )}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {detailReserva.descripcion && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-gray-700 text-sm">{detailReserva.descripcion}</p>
                </div>
              )}

              {/* IDs y fechas técnicas */}
              <div className="text-xs text-gray-400 space-y-0.5 border-t border-gray-100 pt-3">
                <p>ID: {detailReserva.id}</p>
                {detailReserva.created_at && <p>Creada: {new Date(detailReserva.created_at).toLocaleString('es-CO')}</p>}
                {detailReserva.updated_at && <p>Actualizada: {new Date(detailReserva.updated_at).toLocaleString('es-CO')}</p>}
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setDetailReserva(null); navigate("/admin/reservas/editar", { state: { reserva: detailReserva } }); }}
                  className="flex-1 bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" /> Editar reserva
                </button>
                <button
                  onClick={() => handleDelete(detailReserva.id)}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Eliminar
                </button>
              </div>
            </>
          );
        })()}
      </ListDetailModal>
    </div>
  );
}

export default withAdminRole(AdminReservas);
