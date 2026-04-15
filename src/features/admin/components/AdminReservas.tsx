
import { useState, useEffect, useMemo } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { API_BASE_URL } from "@/config/env";
import * as XLSX from "xlsx";
import {
  Calendar, Clock, MapPin, User, Edit3, Search, CheckCircle, AlertCircle,
  XCircle, RefreshCw, Eye, ChevronLeft, ChevronRight, X, DollarSign,
  Download, Star, Phone, Mail, Filter
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────
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
}

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  estado: string;
  estado_pago?: string;
  metodo_pago?: string;
  descripcion?: string;
  precio_total?: number;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
  empleada?: Empleada;
  plan?: Plan;
  lugar?: Lugar;
}

const PAGE_SIZE = 15;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const fmtCOP = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v)
    : "—";

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" }) : "—";

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-yellow-700", bg: "bg-yellow-100" },
  confirmada: { label: "Confirmada", color: "text-blue-700",   bg: "bg-blue-100"   },
  en_proceso: { label: "En proceso", color: "text-orange-700", bg: "bg-orange-100" },
  completada: { label: "Completada", color: "text-green-700",  bg: "bg-green-100"  },
  cancelada:  { label: "Cancelada",  color: "text-red-700",    bg: "bg-red-100"    },
};

const PAGO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: "Pendiente",   color: "text-yellow-700", bg: "bg-yellow-50"  },
  pagado:      { label: "Pagado",      color: "text-green-700",  bg: "bg-green-100"  },
  fallido:     { label: "Fallido",     color: "text-red-700",    bg: "bg-red-100"    },
  reembolsado: { label: "Reembolsado", color: "text-gray-700",   bg: "bg-gray-100"   },
};

// ─── Component ───────────────────────────────────────────────────────────────
function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);

  const [detailReserva, setDetailReserva] = useState<Reserva | null>(null);

  useEffect(() => { loadReservas(); }, []);

  const loadReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      let all: Reserva[] = [];
      let pg = 1;
      while (true) {
        const res = await fetch(
          `${API_BASE_URL}/api/reservas?page=${pg}&items_per_page=100`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        all = [...all, ...(data.reservas ?? [])];
        if (!data.paginacion?.has_next) break;
        pg++;
      }
      setReservas(all);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = busqueda.toLowerCase();
    return reservas.filter(r => {
      const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
      const matchPago = filtroEstadoPago === "todos" || r.estado_pago === filtroEstadoPago;
      const matchSearch = !q || (
        r.cliente?.nombre?.toLowerCase().includes(q) ||
        r.cliente?.apellido?.toLowerCase().includes(q) ||
        r.cliente?.correo?.toLowerCase().includes(q) ||
        r.empleada?.nombre?.toLowerCase().includes(q) ||
        r.empleada?.apellido?.toLowerCase().includes(q) ||
        r.plan?.nombre?.toLowerCase().includes(q) ||
        r.lugar?.direccion?.toLowerCase().includes(q) ||
        r.lugar?.nombre?.toLowerCase().includes(q)
      );
      return matchEstado && matchPago && matchSearch;
    });
  }, [reservas, filtroEstado, filtroEstadoPago, busqueda]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats from all reservas
  const stats = useMemo(() => ({
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === "pendiente").length,
    confirmadas: reservas.filter(r => r.estado === "confirmada").length,
    en_proceso: reservas.filter(r => r.estado === "en_proceso").length,
    completadas: reservas.filter(r => r.estado === "completada").length,
    canceladas: reservas.filter(r => r.estado === "cancelada").length,
    ingresos: reservas.filter(r => r.estado_pago === "pagado").reduce((s, r) => s + (r.precio_total ?? 0), 0),
  }), [reservas]);

  const exportToExcel = () => {
    const rows = filtered.map((r, i) => ({
      "#": i + 1,
      "Fecha": fmtDate(r.fecha),
      "Horario": `${r.hora_inicio} – ${r.hora_final}`,
      "Cliente": r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : "",
      "Correo cliente": r.cliente?.correo ?? "",
      "Tel. cliente": r.cliente?.telefono ?? "",
      "Empleada": r.empleada ? `${r.empleada.nombre} ${r.empleada.apellido}` : "",
      "Plan": r.plan?.nombre ?? "",
      "Lugar": r.lugar?.nombre ?? r.lugar?.direccion ?? "",
      "Estado": r.estado,
      "Estado pago": r.estado_pago ?? "",
      "Método pago": r.metodo_pago ?? "",
      "Total (COP)": r.precio_total ?? "",
      "Descripción": r.descripcion ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservas");
    XLSX.writeFile(wb, `reservas_reluzca_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <RefreshCw className="h-10 w-10 animate-spin text-[#195083]" />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={loadReservas} className="bg-[#195083] text-white px-4 py-2 rounded-lg">
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-full">
      <style>{`
        @keyframes modalScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .modal-enter { animation: modalScaleIn 0.2s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-5 sm:p-7 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E7] mb-1">Reservas</h1>
            <p className="text-[#F5F0E7]/80 text-sm">
              {reservas.length} reservas totales — {filtered.length} mostradas
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
          {[
            { label: "Pendientes",  val: stats.pendientes,  cls: "text-yellow-300" },
            { label: "Confirmadas", val: stats.confirmadas, cls: "text-blue-300"   },
            { label: "En proceso",  val: stats.en_proceso,  cls: "text-orange-300" },
            { label: "Completadas", val: stats.completadas, cls: "text-green-300"  },
            { label: "Canceladas",  val: stats.canceladas,  cls: "text-red-300"    },
            { label: "Ingresos",    val: fmtCOP(stats.ingresos), cls: "text-emerald-300" },
          ].map(({ label, val, cls }) => (
            <div key={label} className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-[#F5F0E7]/70 text-xs">{label}</p>
              <p className={`font-bold text-sm ${cls}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, empleada, plan o lugar..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <select
              value={filtroEstado}
              onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_proceso">En proceso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <select
              value={filtroEstadoPago}
              onChange={e => { setFiltroEstadoPago(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
            >
              <option value="todos">Todo pago</option>
              <option value="pendiente">Pago pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="fallido">Fallido</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Excel-like table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">#</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Horario</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Empleada</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pago</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Total</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-400">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                    {busqueda || filtroEstado !== "todos" || filtroEstadoPago !== "todos"
                      ? "Sin resultados para los filtros aplicados."
                      : "No hay reservas registradas."}
                  </td>
                </tr>
              ) : paged.map((r, idx) => {
                const estCfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente;
                const pagoCfg = PAGO_CONFIG[r.estado_pago ?? "pendiente"] ?? PAGO_CONFIG.pendiente;
                const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3 text-gray-400 text-xs">{rowNum}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-medium">{fmtDate(r.fecha)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                      {r.hora_inicio} – {r.hora_final}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.cliente ? (
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            {r.cliente.nombre} {r.cliente.apellido}
                          </p>
                          <p className="text-gray-400 text-xs">{r.cliente.correo}</p>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.empleada ? (
                        <div>
                          <p className="text-gray-800 text-xs font-medium">
                            {r.empleada.nombre} {r.empleada.apellido}
                          </p>
                          {r.empleada.ranking != null && (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400">{r.empleada.ranking.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-xs">
                      {r.plan?.nombre ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estCfg.bg} ${estCfg.color}`}>
                        {estCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>
                        {pagoCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-800 text-xs">
                      {fmtCOP(r.precio_total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setDetailReserva(r)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-all"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 py-1 text-xs text-gray-500">Pág. {page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ MODAL DETALLE RESERVA ══════════ */}
      {detailReserva && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailReserva(null)} />
          <div className="modal-enter relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#F5F0E7] text-lg">Detalle de Reserva</h2>
                <p className="text-[#F5F0E7]/70 text-xs">{fmtDate(detailReserva.fecha)} · {detailReserva.hora_inicio} – {detailReserva.hora_final}</p>
              </div>
              <button onClick={() => setDetailReserva(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Status badges */}
              <div className="flex items-center gap-3">
                {(() => {
                  const estCfg = ESTADO_CONFIG[detailReserva.estado] ?? ESTADO_CONFIG.pendiente;
                  const pagoCfg = PAGO_CONFIG[detailReserva.estado_pago ?? "pendiente"] ?? PAGO_CONFIG.pendiente;
                  return (
                    <>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${estCfg.bg} ${estCfg.color}`}>
                        {estCfg.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>
                        {pagoCfg.label}
                      </span>
                      {detailReserva.precio_total != null && (
                        <span className="ml-auto font-bold text-lg text-gray-900">
                          {fmtCOP(detailReserva.precio_total)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Cliente */}
              {detailReserva.cliente && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cliente</p>
                  <p className="font-semibold text-gray-900">{detailReserva.cliente.nombre} {detailReserva.cliente.apellido}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3.5 w-3.5" />{detailReserva.cliente.correo}
                    </div>
                    {detailReserva.cliente.telefono && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />{detailReserva.cliente.telefono}
                      </div>
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
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5" />{detailReserva.empleada.telefono}
                      </div>
                    )}
                    {detailReserva.empleada.ranking != null && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                        {detailReserva.empleada.ranking.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plan y lugar */}
              <div className="grid grid-cols-2 gap-3">
                {detailReserva.plan && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Plan</p>
                    <p className="font-semibold text-gray-900 text-sm">{detailReserva.plan.nombre}</p>
                    {detailReserva.plan.precio != null && (
                      <p className="text-xs text-gray-500 mt-0.5">{fmtCOP(detailReserva.plan.precio)}</p>
                    )}
                  </div>
                )}
                {detailReserva.lugar && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Lugar</p>
                    <p className="font-semibold text-gray-900 text-sm">{detailReserva.lugar.nombre ?? "Sin nombre"}</p>
                    {detailReserva.lugar.direccion && (
                      <p className="text-xs text-gray-500 mt-0.5">{detailReserva.lugar.direccion}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pago info */}
              {detailReserva.metodo_pago && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Método de pago</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{detailReserva.metodo_pago}</p>
                </div>
              )}

              {/* Descripción */}
              {detailReserva.descripcion && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-gray-700 text-sm">{detailReserva.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminReservas);
