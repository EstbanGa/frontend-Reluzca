
import { useState, useEffect, useMemo } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import * as XLSX from "xlsx";
import {
  Calendar, Clock, MapPin, User, Edit3, Trash2, Search, CheckCircle, AlertCircle,
  XCircle, RefreshCw, Eye, DollarSign,
  Download, Star, Phone, Mail, Filter
} from "lucide-react";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";
import ListDetailModal from "@/components/ui/ListDetailModal";
import ListPagination from "@/components/ui/ListPagination";

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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadReservas(); }, []);

  const handleDeleteReserva = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta reserva?")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservas/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDetailReserva(null);
      await loadReservas();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">

      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.admin}
        title="Reservas"
        subtitle={`${reservas.length} reservas totales — ${filtered.length} mostradas`}
        actions={
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        }
      />

      {/* Stats */}
      <ListStatsGrid
        columns={6}
        stats={[
          { label: "Pendientes",  value: stats.pendientes,  color: "#ca8a04" },
          { label: "Confirmadas", value: stats.confirmadas, color: "#2563eb" },
          { label: "En proceso",  value: stats.en_proceso,  color: "#ea580c" },
          { label: "Completadas", value: stats.completadas, color: "#16a34a" },
          { label: "Canceladas",  value: stats.canceladas,  color: "#dc2626" },
          { label: "Ingresos",    value: fmtCOP(stats.ingresos), color: "#059669" },
        ]}
      />

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, empleada, plan o lugar..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filtroEstado}
              onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
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
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
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

      {/* Lista de reservas */}
      <div className="space-y-3 sm:space-y-4">
        {paged.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 text-center text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            {busqueda || filtroEstado !== "todos" || filtroEstadoPago !== "todos"
              ? "Sin resultados para los filtros aplicados."
              : "No hay reservas registradas."}
          </div>
        ) : paged.map((r, idx) => {
          const estCfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente;
          const pagoCfg = PAGO_CONFIG[r.estado_pago ?? "pendiente"] ?? PAGO_CONFIG.pendiente;
          return (
            <SlideRevealCard
              key={r.id}
              buttonCount={3}
              actions={<>
                <SlideButton icon={<Eye className="h-4 w-4" />} onClick={() => setDetailReserva(r)} title="Ver detalle" hoverColor="hover:bg-blue-50 hover:text-blue-600" />
                <SlideButton icon={<Edit3 className="h-4 w-4" />} onClick={() => { setDetailReserva(null); navigate("/admin/reservas/editar", { state: { reserva: r } }); }} title="Editar reserva" hoverColor="hover:bg-[#195083]/10 hover:text-[#195083]" />
                <SlideButton icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDeleteReserva(r.id)} title="Eliminar reserva" hoverColor="hover:bg-red-50 hover:text-red-600" />
              </>}
              onClick={() => setDetailReserva(r)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar fecha */}
                <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #195083, #0f3a5f)" }}>
                  <span className="text-xs font-bold leading-none">{new Date(r.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit" })}</span>
                  <span className="text-[10px] uppercase leading-none mt-0.5">{new Date(r.fecha + "T00:00:00").toLocaleDateString("es-CO", { month: "short" })}</span>
                </div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                    {r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : "Sin cliente"}
                  </h4>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {r.hora_inicio} – {r.hora_final}{r.empleada ? ` · ${r.empleada.nombre} ${r.empleada.apellido}` : ""}{r.plan ? ` · ${r.plan.nombre}` : ""}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${estCfg.bg} ${estCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estCfg.color.replace("text-", "bg-")}`} />
                      {estCfg.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pagoCfg.color.replace("text-", "bg-")}`} />
                      {pagoCfg.label}
                    </span>
                    {r.lugar && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {r.lugar.nombre ?? r.lugar.direccion ?? ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección derecha - precio */}
                <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                  <span className="text-xs font-bold text-[#195083]">{fmtCOP(r.precio_total)}</span>
                  {r.empleada?.ranking != null && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">{r.empleada.ranking.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </SlideRevealCard>
          );
        })}

        <ListPagination page={page} totalPages={pages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* ══════════ MODAL DETALLE RESERVA ══════════ */}
      <ListDetailModal
        theme={ROLE_THEMES.admin}
        open={!!detailReserva}
        onClose={() => setDetailReserva(null)}
        title="Detalle de Reserva"
        subtitle={detailReserva ? `${fmtDate(detailReserva.fecha)} · ${detailReserva.hora_inicio} – ${detailReserva.hora_final}` : ""}
      >
        {detailReserva && (
          <>
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

              {detailReserva.metodo_pago && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Método de pago</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{detailReserva.metodo_pago}</p>
                </div>
              )}

              {detailReserva.descripcion && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-gray-700 text-sm">{detailReserva.descripcion}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => { setDetailReserva(null); navigate("/admin/reservas/editar", { state: { reserva: detailReserva } }); }}
                  className="flex-1 bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar reserva
                </button>
                <button
                  onClick={() => handleDeleteReserva(detailReserva.id)}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Eliminar
                </button>
              </div>
          </>
        )}
      </ListDetailModal>
    </div>
  );
}

export default withAdminRole(AdminReservas);
