import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import {
  ArrowLeft, Edit3, Save, RefreshCw, AlertCircle, KeyRound,
  Trash2, Eye, EyeOff, X, Calendar, MapPin, Star,
  CheckCircle, XCircle, Mail, Phone, Crown, UserCheck,
  Briefcase, ChevronLeft, ChevronRight, User, Home,
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
  precio_total?: number;
  plan?: { nombre: string };
  empleada?: { nombre: string; apellido: string };
  cliente?: { nombre: string; apellido: string; email?: string; telefono?: string };
  lugar?: { nombre?: string; direccion?: string; tipo_inmueble?: string };
}

interface Ubicacion {
  id: string;
  nombre?: string;
  direccion?: string;
  tipo_inmueble?: string;
  area_m2?: number;
  area_ft2?: number;
  num_habitaciones?: number;
  num_banos?: number;
  activa?: boolean;
  descripcion?: string;
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

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-yellow-700", bg: "bg-yellow-100" },
  confirmada: { label: "Confirmada", color: "text-blue-700",   bg: "bg-blue-100"   },
  en_proceso: { label: "En proceso", color: "text-orange-700", bg: "bg-orange-100" },
  completada: { label: "Completada", color: "text-green-700",  bg: "bg-green-100"  },
  cancelada:  { label: "Cancelada",  color: "text-red-700",    bg: "bg-red-100"    },
};

const PAGO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: "Pendiente",   color: "text-yellow-700", bg: "bg-yellow-50" },
  pagado:      { label: "Pagado",      color: "text-green-700",  bg: "bg-green-50"  },
  fallido:     { label: "Fallido",     color: "text-red-700",    bg: "bg-red-50"    },
  reembolsado: { label: "Reembolsado", color: "text-gray-700",   bg: "bg-gray-100"  },
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

// ── Reservation Detail Modal ──────────────────────────────────────────────────
function ReservaModal({ reserva, onClose, userRol }: { reserva: Reserva; onClose: () => void; userRol: string }) {
  const estCfg = ESTADO_CONFIG[reserva.estado] ?? ESTADO_CONFIG.pendiente;
  const pagoCfg = PAGO_CONFIG[reserva.estado_pago ?? "pendiente"] ?? PAGO_CONFIG.pendiente;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-[#195083] to-[#0f3a5f] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm">Detalle de Reserva</h2>
            <p className="text-white/60 text-xs mt-0.5">{fmtDate(reserva.fecha)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        <div className="p-5 space-y-2.5 text-sm">
          <div className="flex gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estCfg.bg} ${estCfg.color}`}>{estCfg.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>{pagoCfg.label}</span>
          </div>
          <ModalRow label="Horario" value={`${reserva.hora_inicio} – ${reserva.hora_final}`} />
          {reserva.plan && <ModalRow label="Plan" value={reserva.plan.nombre} />}
          {userRol !== "empleada" && reserva.empleada && (
            <ModalRow label="Empleada" value={`${reserva.empleada.nombre} ${reserva.empleada.apellido}`} />
          )}
          {userRol === "empleada" && reserva.cliente && (
            <>
              <ModalRow label="Cliente" value={`${reserva.cliente.nombre} ${reserva.cliente.apellido}`} />
              {reserva.cliente.email && <ModalRow label="Correo" value={reserva.cliente.email} />}
              {reserva.cliente.telefono && <ModalRow label="Teléfono" value={reserva.cliente.telefono} />}
            </>
          )}
          {reserva.lugar && (
            <>
              <ModalRow label="Lugar" value={reserva.lugar.nombre ?? "—"} />
              {reserva.lugar.direccion && <ModalRow label="Dirección" value={reserva.lugar.direccion} />}
            </>
          )}
          {reserva.precio_total != null && (
            <div className="pt-2 border-t border-gray-100">
              <ModalRow label="Total" value={fmtCOP(reserva.precio_total)} bold />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Location Detail Modal ─────────────────────────────────────────────────────
function UbicacionModal({ ubicacion, onClose, areaUnit }: { ubicacion: Ubicacion; onClose: () => void; areaUnit: "m2" | "ft2" }) {
  const area = areaUnit === "ft2"
    ? (ubicacion.area_ft2 ?? (ubicacion.area_m2 != null ? Math.round(ubicacion.area_m2 * 10.7639 * 100) / 100 : null))
    : (ubicacion.area_m2 ?? (ubicacion.area_ft2 != null ? Math.round(ubicacion.area_ft2 / 10.7639 * 100) / 100 : null));
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-[#195083] to-[#0f3a5f] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-sm">{ubicacion.nombre ?? "Ubicación"}</h2>
            <p className="text-white/60 text-xs mt-0.5">{ubicacion.direccion ?? "Sin dirección"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        <div className="p-5 space-y-2.5 text-sm">
          <div className="flex gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ubicacion.activa !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {ubicacion.activa !== false ? "Activa" : "Inactiva"}
            </span>
            {ubicacion.tipo_inmueble && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                {ubicacion.tipo_inmueble}
              </span>
            )}
          </div>
          {area != null && <ModalRow label={`Área`} value={`${area.toLocaleString()} ${areaUnit}`} />}
          {ubicacion.num_habitaciones != null && <ModalRow label="Habitaciones" value={String(ubicacion.num_habitaciones)} />}
          {ubicacion.num_banos != null && <ModalRow label="Baños" value={String(ubicacion.num_banos)} />}
          {ubicacion.descripcion && <ModalRow label="Descripción" value={ubicacion.descripcion} />}
        </div>
      </div>
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
  const [resPage, setResPage] = useState(1);
  const [areaUnit, setAreaUnit] = useState<"ft2" | "m2">("ft2");

  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);

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
          fetch(`${API_BASE_URL}/api/reservas/empleada/${userId}`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/calificaciones/usuario/${userId}`, { headers: authHeaders() }),
        ]);
        const rData = rRes.ok ? await rRes.json() : [];
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

  const pagedReservas = reservas.slice((resPage - 1) * PAGE_SIZE, resPage * PAGE_SIZE);
  const resPages = Math.max(1, Math.ceil(reservas.length / PAGE_SIZE));

  const fmtArea = (ub: Ubicacion) => {
    if (areaUnit === "ft2") {
      const ft2 = ub.area_ft2 ?? (ub.area_m2 != null ? Math.round(ub.area_m2 * 10.7639 * 100) / 100 : null);
      return ft2 != null ? `${ft2.toLocaleString()} ft²` : "—";
    }
    const m2 = ub.area_m2 ?? (ub.area_ft2 != null ? Math.round(ub.area_ft2 / 10.7639 * 100) / 100 : null);
    return m2 != null ? `${m2.toLocaleString()} m²` : "—";
  };

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
    <div className="space-y-4 max-w-5xl">
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
          <div>
            {reservas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Sin reservas registradas</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Fecha</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Horario</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Plan</th>
                        {isEmpleada ? (
                          <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Cliente</th>
                        ) : (
                          <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Empleada</th>
                        )}
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Estado</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Pago</th>
                        <th className="text-right px-4 py-2 font-bold text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pagedReservas.map((r) => {
                        const estCfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente;
                        const pagoCfg = PAGO_CONFIG[r.estado_pago ?? "pendiente"] ?? PAGO_CONFIG.pendiente;
                        return (
                          <tr key={r.id} className="hover:bg-gray-50/70">
                            <td className="px-4 py-1.5 whitespace-nowrap text-gray-700">{fmtDate(r.fecha)}</td>
                            <td className="px-4 py-1.5 whitespace-nowrap text-gray-600">{r.hora_inicio} – {r.hora_final}</td>
                            <td className="px-4 py-1.5 whitespace-nowrap text-gray-700">{r.plan?.nombre ?? "—"}</td>
                            {isEmpleada ? (
                              <td className="px-4 py-1.5 whitespace-nowrap text-gray-600">
                                {r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : "—"}
                              </td>
                            ) : (
                              <td className="px-4 py-1.5 whitespace-nowrap text-gray-600">
                                {r.empleada ? `${r.empleada.nombre} ${r.empleada.apellido}` : "—"}
                              </td>
                            )}
                            <td className="px-4 py-1.5 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${estCfg.bg} ${estCfg.color}`}>
                                {estCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-1.5 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${pagoCfg.bg} ${pagoCfg.color}`}>
                                {pagoCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-1.5 whitespace-nowrap text-right font-semibold text-gray-800">
                              {fmtCOP(r.precio_total)}
                            </td>
                            <td className="px-3 py-1.5">
                              <button
                                onClick={() => setSelectedReserva(r)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#195083] transition-colors"
                                title="Ver detalle"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {resPages > 1 && (
                  <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                    <span>{(resPage - 1) * PAGE_SIZE + 1}–{Math.min(resPage * PAGE_SIZE, reservas.length)} de {reservas.length}</span>
                    <div className="flex gap-1">
                      <button disabled={resPage === 1} onClick={() => setResPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button disabled={resPage >= resPages} onClick={() => setResPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Ubicaciones (clientes/admins) ── */}
        {tab === "ubicaciones" && !isEmpleada && (
          <div>
            {ubicaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Sin ubicaciones registradas</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-500">Área en:</span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200">
                    <button onClick={() => setAreaUnit("ft2")}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${areaUnit === "ft2" ? "bg-[#195083] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                      ft²
                    </button>
                    <button onClick={() => setAreaUnit("m2")}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${areaUnit === "m2" ? "bg-[#195083] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                      m²
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Nombre / Dirección</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Tipo</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Área</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Hab.</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Baños</th>
                        <th className="text-left px-4 py-2 font-bold text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ubicaciones.map((ub) => (
                        <tr key={ub.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-1.5">
                            <p className="font-semibold text-gray-800">{ub.nombre ?? "Sin nombre"}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{ub.direccion}</p>
                          </td>
                          <td className="px-4 py-1.5 text-gray-600 capitalize">{ub.tipo_inmueble ?? "—"}</td>
                          <td className="px-4 py-1.5 text-gray-600">{fmtArea(ub)}</td>
                          <td className="px-4 py-1.5 text-gray-600">{ub.num_habitaciones ?? "—"}</td>
                          <td className="px-4 py-1.5 text-gray-600">{ub.num_banos ?? "—"}</td>
                          <td className="px-4 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                              ub.activa !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {ub.activa !== false ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td className="px-3 py-1.5">
                            <button
                              onClick={() => setSelectedUbicacion(ub)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#195083] transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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
      {selectedReserva && (
        <ReservaModal
          reserva={selectedReserva}
          onClose={() => setSelectedReserva(null)}
          userRol={usuario.rol}
        />
      )}

      {/* Location detail modal */}
      {selectedUbicacion && (
        <UbicacionModal
          ubicacion={selectedUbicacion}
          onClose={() => setSelectedUbicacion(null)}
          areaUnit={areaUnit}
        />
      )}
    </div>
  );
}

export default withAdminRole(AdminUsuarioDetalle);
