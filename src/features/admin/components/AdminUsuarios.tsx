
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import * as XLSX from "xlsx";
import {
  Users, User, Search, Crown, UserCheck, Briefcase, Eye, EyeOff,
  RefreshCw, AlertCircle, Download, Star, X, KeyRound, Save,
  UserPlus,
} from "lucide-react";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";
import ListPagination from "@/components/ui/ListPagination";

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<"todos" | "admin" | "cliente" | "empleada">("todos");
  const [page, setPage] = useState(1);

  // Compatibility stubs – panels permanently disabled (conditions always false)
  const [detailUser] = useState<Usuario | null>(null);
  const [detailTab, setDetailTab] = useState<"reservas" | "ubicaciones" | "editar">("reservas");
  const [detailReservas] = useState<Reserva[]>([]);
  const [detailUbicaciones] = useState<Ubicacion[]>([]);
  const [detailLoading] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", telefono: "", direccion: "", estado: "" });
  const [editLoading] = useState(false);
  const [editError] = useState<string | null>(null);
  const [pwdModal] = useState(false);
  const [pwdTarget] = useState<Usuario | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading] = useState(false);
  const [pwdError] = useState<string | null>(null);
  const [deleteLoading] = useState(false);
  const openDetail = (u: Usuario) => navigate(`/admin/usuarios/detalle/${u.id}`);
  const closeDetail = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveEdit = async () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (_id: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openPwd = (_u: Usuario) => {};
  const closePwd = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChangePwd = async () => {};

  useEffect(() => { loadAllUsuarios(); }, []);;

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

  const exportToExcel = () => {
    const rows = usuarios.map(u => ({
      "Nombre": u.nombre,
      "Apellido": u.apellido,
      "Correo": u.correo,
      "Teléfono": u.telefono ?? "",
      "Rol": u.rol,
      "Estado": u.estado,
      "Fecha registro": fmtDate(u.fecha_registro),
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
        {t('common.retry')}
      </button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">

      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.admin}
        title="Usuarios"
        subtitle={`${usuarios.length} usuarios registrados — ${filtered.length} mostrados`}
        icon={<Users className="h-7 w-7" />}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/usuarios/crear')}
              className="flex items-center gap-2 bg-white text-[#195083] hover:bg-[#F5F0E7] px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {t('admin.users.createUser')}
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('admin.users.exportExcel')}
            </button>
          </div>
        }
      />

      {/* Stats */}
      <ListStatsGrid
        columns={4}
        stats={[
          { label: t('admin.users.stats.total'), value: usuarios.length, color: "#195083" },
          { label: t('admin.users.stats.admins'), value: usuarios.filter(u => u.rol === "admin").length, color: "#7c3aed" },
          { label: t('admin.users.stats.clients'), value: usuarios.filter(u => u.rol === "cliente").length, color: "#2563eb" },
          { label: t('admin.users.stats.employees'), value: usuarios.filter(u => u.rol === "empleada").length, color: "#059669" },
        ]}
      />

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('admin.users.searchPlaceholder')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-600 bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={rolFilter}
              onChange={(e) => { setRolFilter(e.target.value as typeof rolFilter); setPage(1); }}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
            >
              <option value="todos">{t('admin.users.filters.allRoles')}</option>
              <option value="admin">{t('admin.users.filters.admins')}</option>
              <option value="cliente">{t('admin.users.filters.clients')}</option>
              <option value="empleada">{t('admin.users.filters.employees')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3 sm:space-y-4">
        {paged.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 text-center text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            {search ? "Sin resultados para la búsqueda." : "No hay usuarios."}
          </div>
        ) : paged.map((u) => {
          const rolCfg = ROL_CONFIG[u.rol] ?? ROL_CONFIG.cliente;
          const RolIcon = rolCfg.icon;
          const isActivo = u.estado === "activo";
          return (
            <SlideRevealCard
              key={u.id}
              buttonCount={1}
              actions={<SlideButton icon={<Eye className="h-4 w-4" />} onClick={() => navigate(`/admin/usuarios/detalle/${u.id}`)} title="Ver detalle" />}
              onClick={() => navigate(`/admin/usuarios/detalle/${u.id}`)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #195083, #0f3a5f)" }}
                >
                  <User className="h-5 w-5 text-white" />
                </div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base text-gray-900 truncate">
                    {u.nombre} {u.apellido}
                  </h4>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {u.correo}
                  </p>
                  {u.telefono && (
                    <p className="text-xs text-gray-400 truncate">{u.telefono}</p>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${rolCfg.bg} ${rolCfg.color}`}>
                      <RolIcon className="h-3.5 w-3.5" />
                      {rolCfg.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActivo ? "bg-green-500" : "bg-red-500"}`} />
                      {isActivo ? t('common.active') : t('common.inactive')}
                    </span>
                    {u.ranking != null && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                        {Number(u.ranking).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección derecha */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1 text-right">
                  <span className="text-xs text-gray-400">{fmtDate(u.fecha_registro)}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{t('admin.users.stats.reservations')}</span>
                    <span className="text-sm font-bold text-[#195083]">{u.estadisticas?.total_reservas ?? "—"}</span>
                  </div>
                </div>
              </div>
            </SlideRevealCard>
          );
        })}

        <ListPagination page={page} totalPages={pages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>

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
