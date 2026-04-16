
import { useState, useEffect, useMemo } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";

import { API_BASE_URL } from "@/config/env";
import { formatDate } from "@/utils/dateUtils";
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
  Users,
  List,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsuarioBasico {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  correo?: string;
}

interface PQRS {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  respuesta?: string | null;
  fecha_creacion?: string | null;
  fecha_resolucion?: string | null;
  created_at?: string | null;
  usuario?: UsuarioBasico | null;
  id_usuario?: string;
}

interface Estadisticas {
  total: number;
  pendientes: number;
  en_proceso: number;
  resueltos: number;
  cerrados: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  peticion: { label: "Petición", color: "bg-blue-100 text-blue-700" },
  queja: { label: "Queja", color: "bg-orange-100 text-orange-700" },
  reclamo: { label: "Reclamo", color: "bg-red-100 text-red-700" },
  sugerencia: { label: "Sugerencia", color: "bg-purple-100 text-purple-700" },
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3.5 w-3.5" /> },
  en_proceso: { label: "En proceso", color: "bg-blue-100 text-blue-700", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  resuelto: { label: "Resuelto", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  cerrado: { label: "Cerrado", color: "bg-gray-100 text-gray-600", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const PRIORIDAD_CONFIG: Record<string, { label: string; color: string }> = {
  baja: { label: "Baja", color: "bg-gray-100 text-gray-600" },
  media: { label: "Media", color: "bg-yellow-100 text-yellow-700" },
  alta: { label: "Alta", color: "bg-red-100 text-red-700" },
};

const PAGE_SIZE = 10;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

// ─── Badge components ─────────────────────────────────────────────────────────

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const cfg = TIPO_LABELS[tipo] ?? { label: tipo, color: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>;
};

const EstadoBadge = ({ estado }: { estado: string }) => {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: "bg-gray-100 text-gray-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const PrioridadBadge = ({ prioridad }: { prioridad: string }) => {
  const cfg = PRIORIDAD_CONFIG[prioridad] ?? { label: prioridad, color: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>;
};

// ─── Main component ───────────────────────────────────────────────────────────

function AdminPQRS() {
  const [pqrsList, setPqrsList] = useState<PQRS[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<"cronologico" | "usuario">("cronologico");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Filters
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);

  // Respond modal
  const [respondModal, setRespondModal] = useState<{ open: boolean; pqrs: PQRS | null }>({ open: false, pqrs: null });
  const [respuestaText, setRespuestaText] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("resuelto");
  const [respondLoading, setRespondLoading] = useState(false);
  const [respondError, setRespondError] = useState<string | null>(null);

  // ─── Data ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadPQRS();
  }, []);

  const loadPQRS = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pqrs/admin/all`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPqrsList(data.pqrs ?? []);
      setEstadisticas(data.estadisticas ?? null);
    } catch {
      setError("No se pudo cargar la lista de PQRS.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtered list ────────────────────────────────────────────────────────

  const filteredList = useMemo(() => {
    return pqrsList.filter((p) => {
      if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
      if (filtroTipo !== "todos" && p.tipo !== filtroTipo) return false;
      if (filtroPrioridad !== "todos" && p.prioridad !== filtroPrioridad) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        const nombre = p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido}`.toLowerCase() : "";
        if (!nombre.includes(q) && !p.descripcion.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [pqrsList, filtroEstado, filtroTipo, filtroPrioridad, busqueda]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const pagedList = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ─── Grouped by user ──────────────────────────────────────────────────────

  const usuariosAgrupados = useMemo(() => {
    const map: Record<string, { usuario: UsuarioBasico | null; pqrs: PQRS[] }> = {};
    for (const p of pqrsList) {
      const uid = p.usuario?.id ?? p.id_usuario ?? "desconocido";
      if (!map[uid]) map[uid] = { usuario: p.usuario ?? null, pqrs: [] };
      map[uid].pqrs.push(p);
    }
    return Object.values(map).sort((a, b) => b.pqrs.length - a.pqrs.length);
  }, [pqrsList]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const openRespondModal = (pqrs: PQRS) => {
    setRespondModal({ open: true, pqrs });
    setRespuestaText(pqrs.respuesta ?? "");
    setNuevoEstado(pqrs.estado === "pendiente" ? "resuelto" : pqrs.estado);
    setRespondError(null);
  };

  const handleResponder = async () => {
    if (!respondModal.pqrs) return;
    if (!respuestaText.trim()) {
      setRespondError("La respuesta no puede estar vacía.");
      return;
    }
    setRespondLoading(true);
    setRespondError(null);
    try {
      const userId = localStorage.getItem("user_id") ?? (() => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u).id : "admin";
      })();
      const res = await fetch(`${API_BASE_URL}/api/pqrs/${respondModal.pqrs.id}/responder`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ respuesta: respuestaText.trim(), estado: nuevoEstado, respondida_por: userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRespondModal({ open: false, pqrs: null });
      await loadPQRS();
    } catch (e: unknown) {
      setRespondError(`Error al responder: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRespondLoading(false);
    }
  };

  const handleCambiarEstado = async (pqrsId: string, estado: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/pqrs/${pqrsId}/estado`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ estado }),
      });
      await loadPQRS();
    } catch {
      setError("No se pudo actualizar el estado.");
    }
  };

  const toggleUser = (id: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-5 sm:p-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E7] mb-1">PQRS</h1>
        <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
          Gestiona las peticiones, quejas, reclamos y sugerencias de tus clientes.
        </p>

        {estadisticas && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            {[
              { label: "Total", value: estadisticas.total, bg: "bg-white/10" },
              { label: "Pendientes", value: estadisticas.pendientes, bg: "bg-yellow-500/20" },
              { label: "En proceso", value: estadisticas.en_proceso, bg: "bg-blue-500/20" },
              { label: "Resueltos", value: estadisticas.resueltos, bg: "bg-green-500/20" },
              { label: "Cerrados", value: estadisticas.cerrados, bg: "bg-gray-500/20" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* View toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {(["cronologico", "usuario"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              viewMode === mode ? "bg-[#195083] text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {mode === "cronologico" ? <List className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {mode === "cronologico" ? "Por orden de llegada" : "Agrupado por usuario"}
          </button>
        ))}
      </div>

      {/* ══════ CRONOLÓGICO ══════ */}
      {viewMode === "cronologico" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente o descripción…"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
              />
            </div>
            {(["todos", "pendiente", "en_proceso", "resuelto", "cerrado"] as const).map((est) => (
              <button
                key={est}
                onClick={() => { setFiltroEstado(est); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filtroEstado === est ? "bg-[#195083] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {est === "todos" ? "Todos" : ESTADO_CONFIG[est]?.label ?? est}
              </button>
            ))}
            <select
              value={filtroTipo}
              onChange={(e) => { setFiltroTipo(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none text-gray-700"
            >
              <option value="todos">Todos los tipos</option>
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filtroPrioridad}
              onChange={(e) => { setFiltroPrioridad(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none text-gray-700"
            >
              <option value="todos">Todas las prioridades</option>
              {Object.entries(PRIORIDAD_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={loadPQRS} className="p-2 text-gray-500 hover:text-[#195083] hover:bg-gray-100 rounded-lg" title="Recargar">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
            </div>
          ) : pagedList.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              No hay PQRS que coincidan con los filtros.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 p-3">
                {pagedList.map((pqrs) => (
                  <div key={pqrs.id} className="group relative rounded-xl overflow-hidden border border-gray-100">
                    {/* Botón oculto detrás del card */}
                    <div className="absolute right-0 inset-y-0 flex items-center gap-1 px-2 bg-gray-50">
                      <button
                        onClick={() => openRespondModal(pqrs)}
                        className="p-2 rounded-lg bg-white shadow-sm hover:bg-blue-50 text-gray-500 hover:text-[#195083] transition-colors"
                        title={pqrs.respuesta ? "Editar respuesta" : "Responder"}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Card content - se desliza a la izquierda en hover */}
                    <div
                      className="relative flex items-start gap-3 p-3 bg-white cursor-pointer transition-transform duration-300 ease-out group-hover:-translate-x-11"
                      onClick={() => openRespondModal(pqrs)}
                    >
                      {/* Avatar tipo */}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {pqrs.usuario ? `${pqrs.usuario.nombre} ${pqrs.usuario.apellido}` : "Desconocido"}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{pqrs.descripcion}</p>

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          <TipoBadge tipo={pqrs.tipo} />
                          <PrioridadBadge prioridad={pqrs.prioridad} />
                          <EstadoBadge estado={pqrs.estado} />
                          {pqrs.respuesta && <span className="text-[10px] text-green-600 font-semibold">✓ Respondida</span>}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-[10px] text-gray-400">
                          {pqrs.fecha_creacion ? formatDate(pqrs.fecha_creacion) : pqrs.created_at ? formatDate(pqrs.created_at) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                  <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredList.length)} de {filteredList.length}</span>
                  <div className="flex gap-1 items-center">
                    <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-2 text-xs">{page}/{totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════ POR USUARIO ══════ */}
      {viewMode === "usuario" && (
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl p-12 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
            </div>
          ) : usuariosAgrupados.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              No hay PQRS registradas.
            </div>
          ) : (
            usuariosAgrupados.map(({ usuario, pqrs }) => {
              const uid = usuario?.id ?? "desconocido";
              const isExpanded = expandedUsers.has(uid);
              const pendientes = pqrs.filter((p) => p.estado === "pendiente").length;

              return (
                <div key={uid} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleUser(uid)}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#195083] to-[#4894AD] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {usuario ? usuario.nombre[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario desconocido"}
                      </p>
                      {(usuario?.email || usuario?.correo) && (
                        <p className="text-xs text-gray-500 truncate">{usuario.email ?? usuario.correo}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-[#195083]/10 text-[#195083] px-2 py-0.5 rounded-full font-semibold">
                        {pqrs.length} PQRS
                      </span>
                      {pendientes > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                          {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
                        </span>
                      )}
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {pqrs.map((p) => (
                        <div key={p.id} className="px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center hover:bg-gray-50/60">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <TipoBadge tipo={p.tipo} />
                              <PrioridadBadge prioridad={p.prioridad} />
                              <EstadoBadge estado={p.estado} />
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{p.descripcion}</p>
                            {p.respuesta && (
                              <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded line-clamp-1">
                                Respuesta: {p.respuesta}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {p.fecha_creacion ? formatDate(p.fecha_creacion) : p.created_at ? formatDate(p.created_at) : ""}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {p.estado !== "cerrado" && (
                              <select
                                value={p.estado}
                                onChange={(e) => handleCambiarEstado(p.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#195083]/30"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En proceso</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="cerrado">Cerrado</option>
                              </select>
                            )}
                            <button
                              onClick={() => openRespondModal(p)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#195083] text-white rounded-lg hover:bg-[#0f3a5f] font-semibold whitespace-nowrap"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              {p.respuesta ? "Editar" : "Responder"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════ MODAL RESPONDER ══════ */}
      {respondModal.open && respondModal.pqrs && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRespondModal({ open: false, pqrs: null })} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#195083]/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-[#195083]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Responder PQRS</h2>
                  <p className="text-xs text-gray-500">
                    {respondModal.pqrs.usuario
                      ? `${respondModal.pqrs.usuario.nombre} ${respondModal.pqrs.usuario.apellido}`
                      : "Cliente"}
                  </p>
                </div>
              </div>
              <button onClick={() => setRespondModal({ open: false, pqrs: null })} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <TipoBadge tipo={respondModal.pqrs.tipo} />
                  <PrioridadBadge prioridad={respondModal.pqrs.prioridad} />
                  <EstadoBadge estado={respondModal.pqrs.estado} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{respondModal.pqrs.descripcion}</p>
                {respondModal.pqrs.fecha_creacion && (
                  <p className="text-xs text-gray-400">{formatDate(respondModal.pqrs.fecha_creacion)}</p>
                )}
              </div>

              {respondError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {respondError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nuevo estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                >
                  <option value="en_proceso">En proceso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Respuesta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={respuestaText}
                  onChange={(e) => setRespuestaText(e.target.value)}
                  rows={5}
                  placeholder="Escribe la respuesta al cliente. Se enviará una notificación automática."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Al guardar se notificará automáticamente al cliente.</p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleResponder}
                  disabled={respondLoading}
                  className="flex-1 bg-[#195083] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3a5f] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {respondLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Enviar respuesta
                </button>
                <button
                  onClick={() => setRespondModal({ open: false, pqrs: null })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminPQRS);
