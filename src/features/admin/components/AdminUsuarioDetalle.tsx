import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";
import ListDetailModal from "@/components/ui/ListDetailModal";
import { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import {
  ArrowLeft, Edit3, Save, RefreshCw, AlertCircle, KeyRound,
  Trash2, Eye, EyeOff, X, Calendar, MapPin, Star,
  CheckCircle, XCircle, Mail, Phone, Crown, UserCheck,
  Briefcase, User, Home, Clock, DollarSign,
  Bath, Layers, Ruler, Search, Filter,
} from "lucide-react";

// ── Interfaces ───────────────────────────────────────────────────────────────
interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  estado: string;
  ranking?: number | string;
  fecha_registro?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  estadisticas?: {
    total_reservas?: number;
    gasto_total?: number;
    total_servicios?: number;
    ingresos_generados?: number;
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
  descripcion?: string;
  precio_total?: number;
  created_at?: string;
  updated_at?: string;
  empleada?: { id?: string; nombre: string; apellido: string; telefono?: string; ranking?: number };
  cliente?: { id?: string; nombre: string; apellido: string; email?: string; telefono?: string };
  plan?: { id?: string; nombre: string; precio?: number; duracion?: number };
  lugar?: { id?: string; nombre?: string; direccion?: string; tipo_lugar?: string };
}

interface Ubicacion {
  id: string;
  nombre: string;
  tamaño: { categoria: string | null; metros: number | null; unidad: string | null; display: string } | null;
  baños: number | null;
  pisos: number | null;
  ubicacion: { lat?: number; lng?: number; direccion?: string; formatted_address?: string } | null;
  nombre_lugar: string | null;
  tipo_lugar: string | null;
  estado: boolean | null;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Calificacion {
  id: string;
  calificacion_servicio: number;
  calificacion_empleada?: number | null;
  comentario?: string | null;
  created_at: string;
  reserva?: { id: string; fecha: string; plan?: { nombre: string } | null } | null;
}

interface CalStats {
  total: number;
  promedio_servicio: number;
  promedio_empleada: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtCOP = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v)
    : "—";

const ROL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  admin:    { label: "Admin",    color: "text-purple-700",  bg: "bg-purple-100",  icon: Crown },
  cliente:  { label: "Cliente",  color: "text-blue-700",    bg: "bg-blue-100",    icon: UserCheck },
  empleada: { label: "Empleada", color: "text-emerald-700", bg: "bg-emerald-100", icon: Briefcase },
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pendiente:  { label: "Pendiente",  color: "text-amber-700",  bg: "bg-amber-100",  icon: AlertCircle },
  programada: { label: "Programada", color: "text-blue-700",   bg: "bg-blue-100",   icon: Calendar },
  confirmada: { label: "Programada", color: "text-blue-700",   bg: "bg-blue-100",   icon: Calendar },
  en_curso:   { label: "En Curso",   color: "text-orange-700", bg: "bg-orange-100", icon: Clock },
  en_proceso: { label: "En Curso",   color: "text-orange-700", bg: "bg-orange-100", icon: Clock },
  completada: { label: "Completada", color: "text-green-700",  bg: "bg-green-100",  icon: CheckCircle },
  cancelada:  { label: "Cancelada",  color: "text-red-700",    bg: "bg-red-100",    icon: XCircle },
};

const PAGO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: "Sin pagar",   color: "text-yellow-700", bg: "bg-yellow-50" },
  SIN_PAGAR:   { label: "Sin pagar",   color: "text-yellow-700", bg: "bg-yellow-50" },
  PAGADO:      { label: "Pagado",      color: "text-green-700",  bg: "bg-green-50"  },
  pagado:      { label: "Pagado",      color: "text-green-700",  bg: "bg-green-50"  },
  PARCIAL:     { label: "Parcial",     color: "text-blue-700",   bg: "bg-blue-50"   },
  REEMBOLSADO: { label: "Reembolsado", color: "text-gray-700",   bg: "bg-gray-100"  },
};

function StarsDisplay({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </span>
  );
}

function ModalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <span className={`text-xs text-right ${bold ? "font-bold text-gray-900" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
function AdminUsuarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [calStats, setCalStats] = useState<CalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<"detalles" | "reservas" | "ubicaciones" | "calificaciones">("detalles");

  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);

  // Búsqueda y filtros
  const [busquedaReserva, setBusquedaReserva] = useState("");
  const [filtroEstadoReserva, setFiltroEstadoReserva] = useState("todas");
  const [busquedaUbicacion, setBusquedaUbicacion] = useState("");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", telefono: "", direccion: "", estado: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { if (id) loadAll(id); }, [id]);

  const loadAll = async (userId: string) => {
    setLoading(true);
    try {
      const uRes = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, { headers: authHeaders() });
      if (!uRes.ok) throw new Error("Usuario no encontrado");
      const uData = await uRes.json();
      setUsuario(uData);
      setEditForm({
        nombre: uData.nombre,
        apellido: uData.apellido,
        telefono: uData.telefono ?? "",
        direccion: uData.direccion ?? "",
        estado: uData.estado,
      });

      if (uData.rol === "empleada") {
        const [rRes, calRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reservas/empleada/${userId}/detalle`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/calificaciones/usuario/${userId}`, { headers: authHeaders() }),
        ]);
        const rData = rRes.ok ? await rRes.json() : { reservas: [] };
        setReservas(Array.isArray(rData) ? rData : (rData.reservas ?? []));
        if (calRes.ok) {
          const calData = await calRes.json();
          setCalificaciones(calData.calificaciones ?? []);
          setCalStats(calData.estadisticas ?? null);
        }
        setUbicaciones([]);
      } else {
        const [rRes, ubRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reservas/cliente/${userId}`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/ubicaciones/cliente/${userId}`, { headers: authHeaders() }),
        ]);
        const rData = rRes.ok ? await rRes.json() : { reservas: [] };
        setReservas(Array.isArray(rData) ? rData : (rData.reservas ?? []));
        const ubData = ubRes.ok ? await ubRes.json() : [];
        setUbicaciones(Array.isArray(ubData) ? ubData : (ubData.ubicaciones ?? []));
        setCalificaciones([]);
        setCalStats(null);
      }
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!usuario) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}`, {
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
      await loadAll(usuario.id);
      setEditing(false);
    } catch (e: any) {
      setEditError(`Error al guardar: ${e.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePwd = async () => {
    if (!usuario || newPwd.length < 6) { setPwdError("Mínimo 6 caracteres"); return; }
    setPwdLoading(true);
    setPwdError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}/password`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ nueva_contrasena: newPwd }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || `HTTP ${res.status}`); }
      setPwdOpen(false);
      setNewPwd("");
    } catch (e: any) {
      setPwdError(e.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!usuario) return;
    if (!window.confirm(`¿Eliminar definitivamente a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`)) return;
    setDeleteLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}`, { method: "DELETE", headers: authHeaders() });
      navigate("/admin/usuarios/index");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (v?: number | null) =>
    v != null ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v) : "—";

  const formatTamano = (t: Ubicacion['tamaño']) => {
    if (!t) return null;
    if (t.metros) {
      const ft2 = Math.round(t.metros * 10.7639 * 100) / 100;
      return `${t.metros} m² / ${ft2} ft²`;
    }
    return t.display || null;
  };

  const reservasFiltradas = reservas.filter(r => {
    const matchEstado = filtroEstadoReserva === "todas" || r.estado === filtroEstadoReserva ||
      (filtroEstadoReserva === "programada" && (r.estado === "programada" || r.estado === "confirmada")) ||
      (filtroEstadoReserva === "en_curso" && (r.estado === "en_curso" || r.estado === "en_proceso"));
    const term = busquedaReserva.toLowerCase();
    const matchSearch = !term ||
      r.empleada?.nombre?.toLowerCase().includes(term) ||
      r.empleada?.apellido?.toLowerCase().includes(term) ||
      r.cliente?.nombre?.toLowerCase().includes(term) ||
      r.cliente?.apellido?.toLowerCase().includes(term) ||
      r.plan?.nombre?.toLowerCase().includes(term) ||
      r.lugar?.nombre?.toLowerCase().includes(term);
    return matchEstado && matchSearch;
  });

  const ubicacionesFiltradas = ubicaciones.filter(ub => {
    const term = busquedaUbicacion.toLowerCase();
    return !term ||
      ub.nombre?.toLowerCase().includes(term) ||
      ub.nombre_lugar?.toLowerCase().includes(term) ||
      ub.tipo_lugar?.toLowerCase().includes(term) ||
      (ub.ubicacion?.formatted_address ?? ub.ubicacion?.direccion ?? "").toLowerCase().includes(term);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <RefreshCw className="h-10 w-10 animate-spin text-[#195083]" />
    </div>
  );

  if (error || !usuario) return (
    <div className="text-center py-16">
      <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <p className="text-gray-600 mb-4">{error ?? t("admin.users.errors.userNotFound")}</p>
      <button onClick={() => navigate("/admin/usuarios/index")} className="bg-[#195083] text-white px-4 py-2 rounded-lg">
        {t("admin.users.backToUsers")}
      </button>
    </div>
  );

  const isEmpleada = usuario.rol === "empleada";
  const rolCfg = ROL_CONFIG[usuario.rol] ?? ROL_CONFIG.cliente;
  const RolIcon = rolCfg.icon;
  const isActivo = usuario.estado === "activo";

  const tabList = isEmpleada
    ? [
        { key: "detalles",       label: t("admin.users.tabs.details"),                                  icon: User },
        { key: "reservas",       label: `${t("admin.users.tabs.reservations")} (${reservas.length})`,   icon: Calendar },
        { key: "calificaciones", label: `${t("admin.users.tabs.ratings")} (${calificaciones.length})`,  icon: Star },
      ]
    : [
        { key: "detalles",    label: t("admin.users.tabs.details"),                                   icon: User },
        { key: "reservas",    label: `${t("admin.users.tabs.reservations")} (${reservas.length})`,    icon: Calendar },
        { key: "ubicaciones", label: `${t("admin.users.tabs.locations")} (${ubicaciones.length})`,   icon: MapPin },
      ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-5 sm:p-7 text-white">
        <button
          onClick={() => navigate("/admin/usuarios/index")}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.users.backToUsers")}
        </button>
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0 border-2 border-white/30"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))" }}
          >
            {usuario.nombre[0]}{usuario.apellido[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-[#F5F0E7]">{usuario.nombre} {usuario.apellido}</h1>
            <p className="text-[#F5F0E7]/70 text-sm mt-1">{usuario.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                <RolIcon className="h-3 w-3" />
                {rolCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActivo ? "bg-green-500/30 text-green-100" : "bg-red-500/30 text-red-100"
              }`}>
                {isActivo ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {isActivo ? t("common.active") : t("common.inactive")}
              </span>
              {usuario.ranking != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-100">
                  <Star className="h-3 w-3 fill-current" />
                  {Number(usuario.ranking).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t("admin.users.stats.reservations"),
            value: isEmpleada ? (usuario.estadisticas?.total_servicios ?? reservas.length) : (usuario.estadisticas?.total_reservas ?? 0),
            icon: Calendar,
          },
          {
            label: isEmpleada ? "Ingresos" : t("admin.users.stats.totalSpent"),
            value: isEmpleada ? fmtCOP(usuario.estadisticas?.ingresos_generados) : fmtCOP(usuario.estadisticas?.gasto_total),
            icon: User,
          },
          { label: t("admin.users.stats.memberSince"), value: fmtDate(usuario.fecha_registro), icon: Home },
          {
            label: isEmpleada ? t("admin.users.tabs.ratings") : t("admin.users.stats.locations"),
            value: isEmpleada ? calificaciones.length : ubicaciones.length,
            icon: isEmpleada ? Star : MapPin,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-[#195083]/60" />
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabList.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === key
                  ? "border-[#195083] text-[#195083]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Detalles ── */}
        {tab === "detalles" && (
          <div className="p-6 space-y-5">
            {editError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {editError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Nombre</p>
                  {editing ? (
                    <input type="text" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30" />
                  ) : (
                    <p className="text-sm text-gray-800 font-medium mt-0.5">{usuario.nombre}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Apellido</p>
                  {editing ? (
                    <input type="text" value={editForm.apellido} onChange={e => setEditForm(f => ({ ...f, apellido: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30" />
                  ) : (
                    <p className="text-sm text-gray-800 font-medium mt-0.5">{usuario.apellido}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Correo</p>
                  <p className="text-sm text-gray-800 font-medium mt-0.5">{usuario.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                  {editing ? (
                    <input type="text" value={editForm.telefono} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                      placeholder="+1 555 123 4567"
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30" />
                  ) : (
                    <p className="text-sm text-gray-800 font-medium mt-0.5">{usuario.telefono ?? "No registrado"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Género</p>
                  <p className="text-sm text-gray-800 font-medium mt-0.5">{usuario.genero ?? "No especificado"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Nacimiento</p>
                  <p className="text-sm text-gray-800 font-medium mt-0.5">{fmtDate(usuario.fecha_nacimiento)}</p>
                </div>
              </div>
              {editing && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-[#195083]/60 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Estado</p>
                    <select value={editForm.estado} onChange={e => setEditForm(f => ({ ...f, estado: e.target.value }))}
                      className="w-full mt-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30">
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#195083] text-[#195083] rounded-lg text-sm font-semibold hover:bg-[#195083]/5 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Editar usuario
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="flex items-center gap-2 bg-[#195083] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#0f3a5f] disabled:opacity-50 transition-colors"
                >
                  {editLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar cambios
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Acciones administrativas</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPwdOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors"
                >
                  <KeyRound className="h-4 w-4" />
                  Cambiar contraseña
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Eliminar usuario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reservas ── */}
        {tab === "reservas" && (
          <div className="p-4 space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por empleada, cliente, plan..."
                  value={busquedaReserva}
                  onChange={e => setBusquedaReserva(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filtroEstadoReserva}
                  onChange={e => setFiltroEstadoReserva(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30 bg-white"
                >
                  <option value="todas">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="programada">Programada</option>
                  <option value="en_curso">En Curso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            {reservasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">{reservas.length === 0 ? "Sin reservas registradas" : "No hay resultados"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservasFiltradas.map((r) => {
                  const estCfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente;
                  const EstIcon = estCfg.icon;
                  const pagoCfg = PAGO_CONFIG[r.estado_pago ?? "SIN_PAGAR"] ?? PAGO_CONFIG.SIN_PAGAR;
                  return (
                    <SlideRevealCard
                      key={r.id}
                      buttonCount={1}
                      actions={
                        <SlideButton
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => setSelectedReserva(r)}
                          title="Ver detalle"
                          hoverColor="hover:bg-blue-50 hover:text-[#195083]"
                        />
                      }
                      onClick={() => setSelectedReserva(r)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="bg-[#195083]/10 p-2 rounded-lg shrink-0">
                              <Calendar className="h-5 w-5 text-[#195083]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{fmtDate(r.fecha)}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {isEmpleada
                                  ? r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : ""
                                  : r.empleada ? `${r.empleada.nombre} ${r.empleada.apellido}` : ""
                                }
                                {r.lugar?.nombre ? ` · ${r.lugar.nombre}` : ""}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 ${estCfg.bg} ${estCfg.color}`}>
                            <EstIcon className="h-3 w-3" />
                            {estCfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {r.hora_inicio} – {r.hora_final}
                          </span>
                          {r.plan && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {r.plan.nombre}
                            </span>
                          )}
                          {r.precio_total != null && (
                            <span className="flex items-center gap-1 font-medium text-green-600">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatCurrency(r.precio_total)}
                            </span>
                          )}
                          {r.estado_pago && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${pagoCfg.bg} ${pagoCfg.color}`}>
                              {pagoCfg.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </SlideRevealCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Ubicaciones (clientes) ── */}
        {tab === "ubicaciones" && !isEmpleada && (
          <div className="p-4 space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, barrio, dirección..."
                value={busquedaUbicacion}
                onChange={e => setBusquedaUbicacion(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
              />
            </div>

            {ubicacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">{ubicaciones.length === 0 ? "Sin ubicaciones registradas" : "No hay resultados"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ubicacionesFiltradas.map((ub) => {
                  const tam = formatTamano(ub.tamaño);
                  const addr = ub.ubicacion?.formatted_address ?? ub.ubicacion?.direccion;
                  return (
                    <SlideRevealCard
                      key={ub.id}
                      buttonCount={1}
                      actions={
                        <SlideButton
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => setSelectedUbicacion(ub)}
                          title="Ver detalle"
                          hoverColor="hover:bg-blue-50 hover:text-[#195083]"
                        />
                      }
                      onClick={() => setSelectedUbicacion(ub)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="bg-[#195083]/10 p-2 rounded-lg shrink-0">
                              <MapPin className="h-5 w-5 text-[#195083]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{ub.nombre}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {ub.tipo_lugar ?? ""}
                                {ub.nombre_lugar ? ` · ${ub.nombre_lugar}` : ""}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                            ub.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {ub.estado ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {tam && (
                            <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{tam}</span>
                          )}
                          {ub.baños != null && (
                            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{ub.baños} baños</span>
                          )}
                          {ub.pisos != null && (
                            <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{ub.pisos} pisos</span>
                          )}
                          {addr && (
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />{addr}
                            </span>
                          )}
                        </div>
                      </div>
                    </SlideRevealCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Calificaciones (empleadas) ── */}
        {tab === "calificaciones" && isEmpleada && (
          <div>
            {calStats && calStats.total > 0 && (
              <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
                {[
                  { label: "Promedio servicio", value: calStats.promedio_servicio?.toFixed(1) ?? "—" },
                  { label: "Promedio empleada", value: calStats.promedio_empleada?.toFixed(1) ?? "—" },
                  { label: "Total calificaciones", value: calStats.total },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white px-4 py-3 text-center">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            )}
            {calificaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Star className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Sin calificaciones registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Fecha</th>
                      <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Plan</th>
                      <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Servicio</th>
                      <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Empleada</th>
                      <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Comentario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {calificaciones.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-1.5 whitespace-nowrap text-gray-700">{fmtDate(c.reserva?.fecha ?? c.created_at)}</td>
                        <td className="px-4 py-1.5 whitespace-nowrap text-gray-600">{c.reserva?.plan?.nombre ?? "—"}</td>
                        <td className="px-4 py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <StarsDisplay value={c.calificacion_servicio} />
                            <span className="text-gray-500 ml-1">{c.calificacion_servicio}/5</span>
                          </div>
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap">
                          {c.calificacion_empleada != null ? (
                            <div className="flex items-center gap-1">
                              <StarsDisplay value={c.calificacion_empleada} />
                              <span className="text-gray-500 ml-1">{c.calificacion_empleada}/5</span>
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-1.5 text-gray-600 max-w-[200px] truncate">
                          {c.comentario ?? <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password modal */}
      {pwdOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPwdOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <KeyRound className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Cambiar contraseña</h2>
                  <p className="text-xs text-gray-500">{usuario.nombre} {usuario.apellido}</p>
                </div>
              </div>
              <button onClick={() => setPwdOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleChangePwd()}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
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
                <button onClick={() => setPwdOpen(false)} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation detail modal */}
      <ListDetailModal
        theme={ROLE_THEMES.admin}
        open={!!selectedReserva}
        onClose={() => setSelectedReserva(null)}
        title="Detalle de Reserva"
        subtitle={selectedReserva ? `${fmtDate(selectedReserva.fecha)} · ${selectedReserva.hora_inicio} – ${selectedReserva.hora_final}` : ""}
      >
        {selectedReserva && (() => {
          const estCfg = ESTADO_CONFIG[selectedReserva.estado] ?? ESTADO_CONFIG.pendiente;
          const EstIcon = estCfg.icon;
          const pagoCfg = PAGO_CONFIG[selectedReserva.estado_pago ?? "SIN_PAGAR"] ?? PAGO_CONFIG.SIN_PAGAR;
          return (
            <>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${estCfg.bg} ${estCfg.color}`}>
                  <EstIcon className="h-4 w-4" />
                  {estCfg.label}
                </span>
                {selectedReserva.precio_total != null && (
                  <span className="ml-auto font-bold text-lg text-gray-900">
                    {fmtCOP(selectedReserva.precio_total)}
                  </span>
                )}
              </div>

              {selectedReserva.empleada && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Empleada</p>
                  <p className="font-semibold text-gray-900">{selectedReserva.empleada.nombre} {selectedReserva.empleada.apellido}</p>
                  {selectedReserva.empleada.telefono && (
                    <p className="text-sm text-gray-600 mt-1">{selectedReserva.empleada.telefono}</p>
                  )}
                  {selectedReserva.empleada.ranking != null && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{Number(selectedReserva.empleada.ranking).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedReserva.cliente && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cliente</p>
                  <p className="font-semibold text-gray-900">{selectedReserva.cliente.nombre} {selectedReserva.cliente.apellido}</p>
                  {selectedReserva.cliente.email && (
                    <p className="text-sm text-gray-600 mt-1">{selectedReserva.cliente.email}</p>
                  )}
                  {selectedReserva.cliente.telefono && (
                    <p className="text-sm text-gray-600 mt-0.5">{selectedReserva.cliente.telefono}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {selectedReserva.plan && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Plan</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedReserva.plan.nombre}</p>
                    {selectedReserva.plan.precio != null && (
                      <p className="text-xs text-gray-500 mt-0.5">{fmtCOP(selectedReserva.plan.precio)}</p>
                    )}
                  </div>
                )}
                {selectedReserva.lugar && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Lugar</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedReserva.lugar.nombre ?? "—"}</p>
                    {selectedReserva.lugar.tipo_lugar && (
                      <p className="text-xs text-gray-500 mt-0.5">{selectedReserva.lugar.tipo_lugar}</p>
                    )}
                    {selectedReserva.lugar.direccion && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{selectedReserva.lugar.direccion}</p>
                    )}
                  </div>
                )}
              </div>

              {selectedReserva.estado_pago && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pago</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>
                    {pagoCfg.label}
                  </span>
                  {selectedReserva.metodo_pago && (
                    <p className="text-xs text-gray-500 mt-1">{selectedReserva.metodo_pago}</p>
                  )}
                </div>
              )}

              {selectedReserva.descripcion && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-gray-700 text-sm">{selectedReserva.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                {selectedReserva.created_at && (
                  <p>Creada: {fmtDate(selectedReserva.created_at)}</p>
                )}
                {selectedReserva.updated_at && (
                  <p>Actualizada: {fmtDate(selectedReserva.updated_at)}</p>
                )}
              </div>
            </>
          );
        })()}
      </ListDetailModal>

      {/* Location detail modal */}
      <ListDetailModal
        theme={ROLE_THEMES.admin}
        open={!!selectedUbicacion}
        onClose={() => setSelectedUbicacion(null)}
        title={selectedUbicacion?.nombre ?? "Detalle de Ubicación"}
        subtitle={selectedUbicacion ? [selectedUbicacion.tipo_lugar, selectedUbicacion.nombre_lugar].filter(Boolean).join(" · ") : ""}
      >
        {selectedUbicacion && (() => {
          const tam = formatTamano(selectedUbicacion.tamaño);
          const addr = selectedUbicacion.ubicacion?.formatted_address ?? selectedUbicacion.ubicacion?.direccion;
          return (
            <>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedUbicacion.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {selectedUbicacion.estado ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedUbicacion.nombre_lugar && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Barrio / Edificio</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedUbicacion.nombre_lugar}</p>
                  </div>
                )}
                {selectedUbicacion.tipo_lugar && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Tipo</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedUbicacion.tipo_lugar}</p>
                  </div>
                )}
                {tam && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Ruler className="h-3 w-3" /> Tamaño
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">{tam}</p>
                    {selectedUbicacion.tamaño?.categoria && (
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{selectedUbicacion.tamaño.categoria}</p>
                    )}
                  </div>
                )}
                {selectedUbicacion.baños != null && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Bath className="h-3 w-3" /> Baños
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedUbicacion.baños}</p>
                  </div>
                )}
                {selectedUbicacion.pisos != null && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Pisos
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedUbicacion.pisos}</p>
                  </div>
                )}
              </div>

              {addr && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Dirección
                  </p>
                  <p className="text-sm text-gray-700">📍 {addr}</p>
                </div>
              )}

              {selectedUbicacion.descripcion && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedUbicacion.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                {selectedUbicacion.created_at && (
                  <p>Creada: {fmtDate(selectedUbicacion.created_at)}</p>
                )}
                {selectedUbicacion.updated_at && selectedUbicacion.updated_at !== selectedUbicacion.created_at && (
                  <p>Actualizada: {fmtDate(selectedUbicacion.updated_at)}</p>
                )}
              </div>
            </>
          );
        })()}
      </ListDetailModal>
    </div>
  );
}

export default withAdminRole(AdminUsuarioDetalle);
