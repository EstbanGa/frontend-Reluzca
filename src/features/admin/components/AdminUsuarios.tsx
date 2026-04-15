
import { useState, useEffect, useMemo } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { API_BASE_URL } from "@/config/env";
import * as XLSX from "xlsx";
import {
  Users, Search, Crown, UserCheck, Briefcase, Edit3, Eye, EyeOff,
  X, RefreshCw, AlertCircle, Trash2, Download, KeyRound, Mail, Phone,
  Calendar, MapPin, Star, ChevronLeft, ChevronRight, CheckCircle,
  XCircle, Save
} from "lucide-react";

// â”€â”€â”€ Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: string;
  ranking?: number;
  fecha_registro?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  created_at?: string;
  estadisticas?: {
    total_reservas?: number;
    gasto_total?: number;
    total_servicios?: number;
    ingresos_generados?: number;
    [key: string]: string | number | boolean | null | undefined;
  };
}

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_final: string;
  estado: string;
  estado_pago?: string;
  metodo_pago?: string;
  precio_total?: number;
  plan?: { nombre: string; precio?: number };
  empleada?: { nombre: string; apellido: string };
  lugar?: { nombre?: string; direccion?: string };
}

interface Ubicacion {
  id: string;
  nombre?: string;
  direccion?: string;
  tipo_inmueble?: string;
  area_m2?: number;
  num_habitaciones?: number;
  num_banos?: number;
  activa?: boolean;
}

const PAGE_SIZE = 15;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const fmtCOP = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v)
    : "â€”";

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" }) : "â€”";

const ROL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  admin:    { label: "Admin",    color: "text-purple-700", bg: "bg-purple-100", icon: Crown },
  cliente:  { label: "Cliente",  color: "text-blue-700",   bg: "bg-blue-100",   icon: UserCheck },
  empleada: { label: "Empleada", color: "text-emerald-700", bg: "bg-emerald-100", icon: Briefcase },
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-yellow-700", bg: "bg-yellow-100" },
  confirmada: { label: "Confirmada", color: "text-blue-700",   bg: "bg-blue-100"   },
  en_proceso: { label: "En proceso", color: "text-orange-700", bg: "bg-orange-100" },
  completada: { label: "Completada", color: "text-green-700",  bg: "bg-green-100"  },
  cancelada:  { label: "Cancelada",  color: "text-red-700",    bg: "bg-red-100"    },
};

const PAGO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:    { label: "Pendiente",    color: "text-yellow-700", bg: "bg-yellow-50" },
  pagado:       { label: "Pagado",       color: "text-green-700",  bg: "bg-green-50"  },
  fallido:      { label: "Fallido",      color: "text-red-700",    bg: "bg-red-50"    },
  reembolsado:  { label: "Reembolsado",  color: "text-gray-700",   bg: "bg-gray-100"  },
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<"todos" | "admin" | "cliente" | "empleada">("todos");
  const [page, setPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Detail panel
  const [detailUser, setDetailUser] = useState<Usuario | null>(null);
  const [detailTab, setDetailTab] = useState<"reservas" | "ubicaciones" | "editar">("reservas");
  const [detailReservas, setDetailReservas] = useState<Reserva[]>([]);
  const [detailUbicaciones, setDetailUbicaciones] = useState<Ubicacion[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPage, setDetailPage] = useState(1);

  // Edit form
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", telefono: "", direccion: "", estado: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Password modal
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdTarget, setPwdTarget] = useState<Usuario | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => { loadAllUsuarios(); }, []);

  const loadAllUsuarios = async () => {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_BASE_URL}/api/usuarios/rol/admin`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/usuarios/rol/cliente`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/usuarios/rol/empleada`, { headers: authHeaders() }),
      ]);
      if (!r1.ok || !r2.ok || !r3.ok) throw new Error("Error al cargar usuarios");
      const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
      setUsuarios([...d1.usuarios, ...d2.usuarios, ...d3.usuarios]);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (u: Usuario) => {
    setDetailUser(u);
    setDetailTab("reservas");
    setDetailPage(1);
    setEditForm({ nombre: u.nombre, apellido: u.apellido, telefono: u.telefono ?? "", direccion: u.direccion ?? "", estado: u.estado });
    setEditError(null);
    setDetailLoading(true);
    try {
      const [rRes, uRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reservas/cliente/${u.id}`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/ubicaciones/cliente/${u.id}`, { headers: authHeaders() }),
      ]);
      setDetailReservas(rRes.ok ? await rRes.json() : []);
      setDetailUbicaciones(uRes.ok ? await uRes.json() : []);
    } catch {
      setDetailReservas([]);
      setDetailUbicaciones([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetailUser(null);

  const handleSaveEdit = async () => {
    if (!detailUser) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${detailUser.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          nombre: editForm.nombre.trim(),
          apellido: editForm.apellido.trim(),
          telefono: editForm.telefono.trim() || null,
          direccion: editForm.direccion.trim() || null,
          estado: editForm.estado,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadAllUsuarios();
      closeDetail();
    } catch (e: any) {
      setEditError(`Error al guardar: ${e.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Â¿Eliminar este usuario permanentemente?")) return;
    setDeleteLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/usuarios/${id}`, { method: "DELETE", headers: authHeaders() });
      await loadAllUsuarios();
      if (detailUser?.id === id) closeDetail();
    } finally {
      setDeleteLoading(false);
    }
  };

  const openPwd = (u: Usuario) => { setPwdTarget(u); setNewPwd(""); setPwdError(null); setPwdModal(true); };
  const closePwd = () => { setPwdModal(false); setPwdTarget(null); setNewPwd(""); setPwdError(null); };

  const handleChangePwd = async () => {
    if (!pwdTarget || newPwd.length < 6) { setPwdError("MÃ­nimo 6 caracteres"); return; }
    setPwdLoading(true);
    setPwdError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${pwdTarget.id}/password`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ nueva_contrasena: newPwd }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || `HTTP ${res.status}`); }
      closePwd();
    } catch (e: any) {
      setPwdError(e.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const exportToExcel = () => {
    const rows = usuarios.map(u => ({
      "Nombre": u.nombre,
      "Apellido": u.apellido,
      "Correo": u.correo,
      "TelÃ©fono": u.telefono ?? "",
      "Rol": u.rol,
      "Estado": u.estado,
      "Fecha registro": fmtDate(u.fecha_registro),
      "Fecha nacimiento": fmtDate(u.fecha_nacimiento),
      "GÃ©nero": u.genero ?? "",
      "DirecciÃ³n": u.direccion ?? "",
      "Ranking": u.ranking ?? "",
      "Total reservas": u.estadisticas?.total_reservas ?? "",
      "Gasto total": u.estadisticas?.gasto_total ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, `usuarios_reluzca_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return usuarios.filter(u => {
      const matchRol = rolFilter === "todos" || u.rol === rolFilter;
      const matchSearch = !q || (
        u.nombre.toLowerCase().includes(q) ||
        u.apellido.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        (u.telefono ?? "").includes(q)
      );
      return matchRol && matchSearch;
    });
  }, [usuarios, search, rolFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedReservas = detailReservas.slice((detailPage - 1) * PAGE_SIZE, detailPage * PAGE_SIZE);
  const reservaPages = Math.max(1, Math.ceil(detailReservas.length / PAGE_SIZE));

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <RefreshCw className="h-10 w-10 animate-spin text-[#195083]" />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <p className="text-gray-600 mb-4">{error}</p>
      <button onClick={loadAllUsuarios} className="bg-[#195083] text-white px-4 py-2 rounded-lg">
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-full">
      <style>{`
        @keyframes modalScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .modal-enter { animation: modalScaleIn 0.2s ease-out forwards; }
        .panel-slide-in { animation: slideInRight 0.25s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-5 sm:p-7 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E7] mb-1">Usuarios</h1>
            <p className="text-[#F5F0E7]/80 text-sm">
              {usuarios.length} usuarios registrados â€” {filtered.length} mostrados
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

        {/* Role filter chips */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { key: "todos",    label: "Todos",     count: usuarios.length },
            { key: "admin",    label: "Admins",    count: usuarios.filter(u => u.rol === "admin").length },
            { key: "cliente",  label: "Clientes",  count: usuarios.filter(u => u.rol === "cliente").length },
            { key: "empleada", label: "Empleadas", count: usuarios.filter(u => u.rol === "empleada").length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setRolFilter(key as typeof rolFilter); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                rolFilter === key ? "bg-white text-[#195083]" : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o telÃ©fono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
          />
        </div>
      </div>

      {/* Excel-like table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Correo</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">TelÃ©fono</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Registro</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Reservas</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    <Users className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                    {search ? "Sin resultados para la bÃºsqueda." : "No hay usuarios."}
                  </td>
                </tr>
              ) : paged.map((u) => {
                const rolCfg = ROL_CONFIG[u.rol] ?? ROL_CONFIG.cliente;
                const RolIcon = rolCfg.icon;
                const isActivo = u.estado === "activo";
                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #195083, #0f3a5f)" }}
                        >
                          {u.nombre[0]}{u.apellido[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.nombre} {u.apellido}</p>
                          {u.ranking != null && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">{Number(u.ranking).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{u.correo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {u.telefono ?? <span className="text-gray-300">â€”</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${rolCfg.bg} ${rolCfg.color}`}>
                        <RolIcon className="h-3 w-3" />
                        {rolCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isActivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {isActivo ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {isActivo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                      {fmtDate(u.fecha_registro)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#195083]">
                        {u.estadisticas?.total_reservas ?? "â€”"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openDetail(u)}
                          title="Ver detalles"
                          className="p-1.5 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPwd(u)}
                          title="Cambiar contraseÃ±a"
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deleteLoading}
                          title="Eliminar"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{(page - 1) * PAGE_SIZE + 1}â€“{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â• PANEL DE DETALLE â•â•â•â•â•â•â•â•â•â• */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetail} />
          <div className="panel-slide-in relative ml-auto w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#195083] to-[#0f3a5f] text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {detailUser.nombre[0]}{detailUser.apellido[0]}
                </div>
                <div>
                  <h2 className="font-bold text-[#F5F0E7]">{detailUser.nombre} {detailUser.apellido}</h2>
                  <p className="text-[#F5F0E7]/70 text-xs">{detailUser.correo} &middot; {detailUser.rol}</p>
                </div>
              </div>
              <button onClick={closeDetail} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
              {[
                { key: "reservas",    label: `Reservas (${detailReservas.length})`,       icon: Calendar },
                { key: "ubicaciones", label: `Ubicaciones (${detailUbicaciones.length})`, icon: MapPin },
                { key: "editar",      label: "Editar usuario",                             icon: Edit3 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setDetailTab(key as typeof detailTab)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    detailTab === key
                      ? "border-[#195083] text-[#195083]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
                </div>
              ) : (
                <>
                  {/* â”€â”€ Tab: Reservas â”€â”€ */}
                  {detailTab === "reservas" && (
                    <div>
                      {detailReservas.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                          <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                          Sin reservas registradas
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Fecha</th>
                                  <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Horario</th>
                                  <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Plan</th>
                                  <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Empleada</th>
                                  <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Estado</th>
                                  <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Pago</th>
                                  <th className="text-right px-4 py-2.5 font-bold text-gray-500 uppercase whitespace-nowrap">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {pagedReservas.map((r) => {
                                  const estCfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente;
                                  const pagoCfg = PAGO_CONFIG[r.estado_pago ?? "pendiente"] ?? PAGO_CONFIG.pendiente;
                                  return (
                                    <tr key={r.id} className="hover:bg-gray-50/70">
                                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{fmtDate(r.fecha)}</td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">{r.hora_inicio} â€“ {r.hora_final}</td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{r.plan?.nombre ?? "â€”"}</td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                                        {r.empleada ? `${r.empleada.nombre} ${r.empleada.apellido}` : "â€”"}
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${estCfg.bg} ${estCfg.color}`}>
                                          {estCfg.label}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>
                                          {pagoCfg.label}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 whitespace-nowrap text-right font-semibold text-gray-800">
                                        {fmtCOP(r.precio_total)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {reservaPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                              <span>{(detailPage - 1) * PAGE_SIZE + 1}â€“{Math.min(detailPage * PAGE_SIZE, detailReservas.length)} de {detailReservas.length}</span>
                              <div className="flex gap-1">
                                <button disabled={detailPage === 1} onClick={() => setDetailPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button disabled={detailPage >= reservaPages} onClick={() => setDetailPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* â”€â”€ Tab: Ubicaciones â”€â”€ */}
                  {detailTab === "ubicaciones" && (
                    <div>
                      {detailUbicaciones.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                          <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                          Sin ubicaciones registradas
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">Nombre / DirecciÃ³n</th>
                                <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">Tipo</th>
                                <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">Ãrea</th>
                                <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">Hab.</th>
                                <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">BaÃ±os</th>
                                <th className="text-left px-4 py-2.5 font-bold text-gray-500 uppercase">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {detailUbicaciones.map((ub) => (
                                <tr key={ub.id} className="hover:bg-gray-50/70">
                                  <td className="px-4 py-2.5">
                                    <p className="font-semibold text-gray-800">{ub.nombre ?? "Sin nombre"}</p>
                                    <p className="text-gray-500">{ub.direccion}</p>
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-600 capitalize">{ub.tipo_inmueble ?? "â€”"}</td>
                                  <td className="px-4 py-2.5 text-gray-600">{ub.area_m2 != null ? `${ub.area_m2} mÂ²` : "â€”"}</td>
                                  <td className="px-4 py-2.5 text-gray-600">{ub.num_habitaciones ?? "â€”"}</td>
                                  <td className="px-4 py-2.5 text-gray-600">{ub.num_banos ?? "â€”"}</td>
                                  <td className="px-4 py-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                      ub.activa !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                    }`}>
                                      {ub.activa !== false ? "Activa" : "Inactiva"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* â”€â”€ Tab: Editar â”€â”€ */}
                  {detailTab === "editar" && (
                    <div className="p-6 space-y-5 max-w-lg">
                      {editError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {editError}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editForm.nombre}
                            onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                          <input
                            type="text"
                            value={editForm.apellido}
                            onChange={e => setEditForm(f => ({ ...f, apellido: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">TelÃ©fono</label>
                        <input
                          type="text"
                          value={editForm.telefono}
                          onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                          placeholder="Ej: +57 300 123 4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                        <input
                          type="text"
                          value={editForm.direccion}
                          onChange={e => setEditForm(f => ({ ...f, direccion: e.target.value }))}
                          placeholder="Dirección del usuario"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                        <select
                          value={editForm.estado}
                          onChange={e => setEditForm(f => ({ ...f, estado: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={handleSaveEdit}
                          disabled={editLoading}
                          className="flex items-center gap-2 bg-[#195083] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3a5f] disabled:opacity-50 transition-colors"
                        >
                          {editLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Guardar cambios
                        </button>
                        <button
                          onClick={() => openPwd(detailUser)}
                          className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors"
                        >
                          <KeyRound className="h-4 w-4" />
                          Cambiar contraseÃ±a
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â• MODAL CONTRASEÃ‘A â•â•â•â•â•â•â•â•â•â• */}
      {pwdModal && pwdTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closePwd} />
          <div className="modal-enter relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <KeyRound className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Cambiar contraseÃ±a</h2>
                  <p className="text-xs text-gray-500">{pwdTarget.nombre} {pwdTarget.apellido}</p>
                </div>
              </div>
              <button onClick={closePwd} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva contraseÃ±a</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleChangePwd()}
                    placeholder="MÃ­nimo 6 caracteres"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {pwdError && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-3.5 w-3.5" />{pwdError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleChangePwd}
                  disabled={pwdLoading || newPwd.length < 6}
                  className="flex-1 bg-amber-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {pwdLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Guardar
                </button>
                <button onClick={closePwd} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
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

export default withAdminRole(AdminUsuarios);
