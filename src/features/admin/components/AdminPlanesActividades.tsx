import { useState, useEffect, useMemo } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { API_BASE_URL } from "@/config/env";
import {
  CreditCard,
  Zap,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Actividad {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_unitario?: number;
  activa: boolean;
}

interface Plan {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  horas_servicio?: number;
  estado: boolean;
  actividades: Actividad[];
}

const PAGE_SIZE = 8;

const fmtCOP = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v)
    : "—";

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

// ─── Component ────────────────────────────────────────────────────────────────

function AdminPlanesActividades() {
  // Tab
  const [activeTab, setActiveTab] = useState<"planes" | "actividades">("planes");

  // Data
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Pagination + search
  const [planPage, setPlanPage] = useState(1);
  const [actPage, setActPage] = useState(1);
  const [planSearch, setPlanSearch] = useState("");
  const [actSearch, setActSearch] = useState("");

  // ── Plan modal state ────────────────────────────────────────────────────────
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    nombre: "",
    precio: "",
    horas_servicio: "",
    descripcion: "",
  });
  const [selectedActividadesIds, setSelectedActividadesIds] = useState<string[]>([]);
  const [actFilterInModal, setActFilterInModal] = useState("");
  const [planFormLoading, setPlanFormLoading] = useState(false);
  const [planFormError, setPlanFormError] = useState<string | null>(null);

  // ── Actividad modal state ────────────────────────────────────────────────────
  const [actModalOpen, setActModalOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Actividad | null>(null);
  const [actFromPlan, setActFromPlan] = useState(false); // abrir desde plan modal
  const [actForm, setActForm] = useState({ nombre: "", descripcion: "", precio_unitario: "" });
  const [actFormLoading, setActFormLoading] = useState(false);
  const [actFormError, setActFormError] = useState<string | null>(null);

  // ── Delete confirm ────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "plan" | "actividad";
    id: string;
    nombre: string;
  }>({ open: false, type: "plan", id: "", nombre: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadPlanes();
    loadActividades();
  }, []);

  const loadPlanes = async () => {
    setLoadingPlanes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/planes?limit=100`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlanes(data);
    } catch (e) {
      setGlobalError("No se pudieron cargar los planes.");
    } finally {
      setLoadingPlanes(false);
    }
  };

  const loadActividades = async () => {
    setLoadingActividades(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/actividades?limit=100`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActividades(data);
    } catch (e) {
      setGlobalError("No se pudieron cargar las actividades.");
    } finally {
      setLoadingActividades(false);
    }
  };

  // ─── Filtered + Paginated lists ───────────────────────────────────────────

  const filteredPlanes = useMemo(() => {
    const q = planSearch.toLowerCase();
    return planes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || (p.descripcion ?? "").toLowerCase().includes(q)
    );
  }, [planes, planSearch]);

  const filteredActs = useMemo(() => {
    const q = actSearch.toLowerCase();
    return actividades.filter((a) => a.nombre.toLowerCase().includes(q));
  }, [actividades, actSearch]);

  const planPages = Math.max(1, Math.ceil(filteredPlanes.length / PAGE_SIZE));
  const actPages = Math.max(1, Math.ceil(filteredActs.length / PAGE_SIZE));
  const pagedPlanes = filteredPlanes.slice((planPage - 1) * PAGE_SIZE, planPage * PAGE_SIZE);
  const pagedActs = filteredActs.slice((actPage - 1) * PAGE_SIZE, actPage * PAGE_SIZE);

  const actividadesInModal = useMemo(() => {
    const q = actFilterInModal.toLowerCase();
    return actividades.filter((a) => a.nombre.toLowerCase().includes(q));
  }, [actividades, actFilterInModal]);

  // ─── Plan Modal helpers ───────────────────────────────────────────────────

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({ nombre: "", precio: "", horas_servicio: "", descripcion: "" });
    setSelectedActividadesIds([]);
    setActFilterInModal("");
    setPlanFormError(null);
    setPlanModalOpen(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      nombre: plan.nombre,
      precio: plan.precio != null ? String(plan.precio) : "",
      horas_servicio: plan.horas_servicio != null ? String(plan.horas_servicio) : "",
      descripcion: plan.descripcion ?? "",
    });
    setSelectedActividadesIds(plan.actividades.map((a) => a.id));
    setActFilterInModal("");
    setPlanFormError(null);
    setPlanModalOpen(true);
  };

  const toggleActividadInPlan = (id: string) => {
    setSelectedActividadesIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSavePlan = async () => {
    if (!planForm.nombre.trim()) {
      setPlanFormError("El nombre es obligatorio.");
      return;
    }
    if (!planForm.precio || isNaN(Number(planForm.precio))) {
      setPlanFormError("El precio debe ser un número válido.");
      return;
    }
    if (!planForm.horas_servicio || isNaN(Number(planForm.horas_servicio))) {
      setPlanFormError("Las horas de servicio deben ser un número válido.");
      return;
    }
    setPlanFormLoading(true);
    setPlanFormError(null);
    try {
      const body = {
        nombre: planForm.nombre.trim(),
        precio: parseFloat(planForm.precio),
        horas_servicio: parseInt(planForm.horas_servicio),
        descripcion: planForm.descripcion.trim() || null,
        tipo_plan: "full",
        estado: true,
      };

      let planId: string;
      if (editingPlan) {
        const res = await fetch(`${API_BASE_URL}/api/planes/${editingPlan.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        const saved = await res.json();
        planId = saved.id;
      } else {
        const res = await fetch(`${API_BASE_URL}/api/planes/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        const saved = await res.json();
        planId = saved.id;
      }

      // Sincronizar actividades
      const resActs = await fetch(`${API_BASE_URL}/api/planes/${planId}/actividades`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ actividad_ids: selectedActividadesIds }),
      });
      if (!resActs.ok) throw new Error(await resActs.text());

      setPlanModalOpen(false);
      await loadPlanes();
    } catch (e: any) {
      setPlanFormError(`Error al guardar: ${e.message}`);
    } finally {
      setPlanFormLoading(false);
    }
  };

  // ─── Actividad Modal helpers ──────────────────────────────────────────────

  const openCreateActividad = (fromPlan = false) => {
    setEditingAct(null);
    setActForm({ nombre: "", descripcion: "", precio_unitario: "" });
    setActFormError(null);
    setActFromPlan(fromPlan);
    setActModalOpen(true);
  };

  const openEditActividad = (act: Actividad) => {
    setEditingAct(act);
    setActForm({
      nombre: act.nombre,
      descripcion: act.descripcion ?? "",
      precio_unitario: act.precio_unitario != null ? String(act.precio_unitario) : "",
    });
    setActFormError(null);
    setActFromPlan(false);
    setActModalOpen(true);
  };

  const handleSaveActividad = async () => {
    if (!actForm.nombre.trim()) {
      setActFormError("El nombre es obligatorio.");
      return;
    }
    setActFormLoading(true);
    setActFormError(null);
    try {
      const body = {
        nombre: actForm.nombre.trim(),
        descripcion: actForm.descripcion.trim() || null,
        precio_unitario: actForm.precio_unitario ? parseFloat(actForm.precio_unitario) : null,
        activa: true,
      };

      if (editingAct) {
        const res = await fetch(`${API_BASE_URL}/api/actividades/${editingAct.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(`${API_BASE_URL}/api/actividades/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        const newAct = await res.json();
        // Si se creó desde el modal de plan, auto-seleccionar la nueva actividad
        if (actFromPlan) {
          setSelectedActividadesIds((prev) => [...prev, newAct.id]);
        }
      }

      setActModalOpen(false);
      await loadActividades();
    } catch (e: any) {
      setActFormError(`Error al guardar: ${e.message}`);
    } finally {
      setActFormLoading(false);
    }
  };

  const handleToggleActiva = async (act: Actividad) => {
    try {
      await fetch(`${API_BASE_URL}/api/actividades/${act.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ activa: !act.activa }),
      });
      await loadActividades();
    } catch {
      setGlobalError("No se pudo actualizar el estado de la actividad.");
    }
  };

  const handleTogglePlan = async (plan: Plan) => {
    try {
      await fetch(`${API_BASE_URL}/api/planes/${plan.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ estado: !plan.estado }),
      });
      await loadPlanes();
    } catch {
      setGlobalError("No se pudo actualizar el estado del plan.");
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const confirmDelete = (type: "plan" | "actividad", id: string, nombre: string) => {
    setDeleteConfirm({ open: true, type, id, nombre });
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const url =
        deleteConfirm.type === "plan"
          ? `${API_BASE_URL}/api/planes/${deleteConfirm.id}`
          : `${API_BASE_URL}/api/actividades/${deleteConfirm.id}`;
      const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setDeleteConfirm({ open: false, type: "plan", id: "", nombre: "" });
      if (deleteConfirm.type === "plan") await loadPlanes();
      else await loadActividades();
    } catch (e: any) {
      setGlobalError(`No se pudo eliminar: ${e.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-5 sm:p-7 text-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E7] mb-1">
          Planes y Actividades
        </h1>
        <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
          Gestiona los planes de servicio y las actividades individuales disponibles para tus clientes.
        </p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="bg-white/20 rounded-lg px-3 py-1">
            {planes.length} plan{planes.length !== 1 ? "es" : ""}
          </span>
          <span className="bg-white/20 rounded-lg px-3 py-1">
            {actividades.length} actividad{actividades.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {globalError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {globalError}
          <button onClick={() => setGlobalError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("planes")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            activeTab === "planes"
              ? "bg-[#195083] text-white shadow"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Planes
          {planes.length > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "planes" ? "bg-white/20" : "bg-gray-200 text-gray-700"
              }`}
            >
              {planes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("actividades")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            activeTab === "actividades"
              ? "bg-[#195083] text-white shadow"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Zap className="h-4 w-4" />
          Actividades
          {actividades.length > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "actividades" ? "bg-white/20" : "bg-gray-200 text-gray-700"
              }`}
            >
              {actividades.length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════ TAB PLANES ══════════ */}
      {activeTab === "planes" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar planes..."
                value={planSearch}
                onChange={(e) => { setPlanSearch(e.target.value); setPlanPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
              />
            </div>
            <button
              onClick={openCreatePlan}
              className="flex items-center gap-2 bg-[#195083] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3a5f] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Nuevo plan
            </button>
          </div>

          {loadingPlanes ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
            </div>
          ) : pagedPlanes.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CreditCard className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              {planSearch ? "Sin resultados para la búsqueda." : "Aún no hay planes. ¡Crea el primero!"}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <span>Plan</span>
                <span>Precio / día</span>
                <span>Horas</span>
                <span>Actividades</span>
                <span>Acciones</span>
              </div>

              {pagedPlanes.map((plan) => (
                <div
                  key={plan.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 px-4 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors items-center"
                >
                  {/* Nombre + descripción */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{plan.nombre}</p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          plan.estado
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {plan.estado ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    {plan.descripcion && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{plan.descripcion}</p>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-800">
                    <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                    {fmtCOP(plan.precio)}
                  </div>

                  {/* Horas */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-800">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    {plan.horas_servicio != null ? `${plan.horas_servicio}h` : "—"}
                  </div>

                  {/* Actividades */}
                  <div>
                    {plan.actividades.length === 0 ? (
                      <span className="text-xs text-gray-400">Sin actividades</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {plan.actividades.slice(0, 3).map((a) => (
                          <span key={a.id} className="text-xs bg-[#195083]/10 text-[#195083] px-2 py-0.5 rounded-full">
                            {a.nombre}
                          </span>
                        ))}
                        {plan.actividades.length > 3 && (
                          <span className="text-xs text-gray-500">+{plan.actividades.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePlan(plan)}
                      title={plan.estado ? "Desactivar" : "Activar"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        plan.estado
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {plan.estado ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditPlan(plan)}
                      title="Editar"
                      className="p-1.5 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete("plan", plan.id, plan.nombre)}
                      title="Eliminar"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination planes */}
              {planPages > 1 && (
                <div className="p-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {(planPage - 1) * PAGE_SIZE + 1}–{Math.min(planPage * PAGE_SIZE, filteredPlanes.length)} de{" "}
                    {filteredPlanes.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={planPage === 1}
                      onClick={() => setPlanPage((p) => p - 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={planPage >= planPages}
                      onClick={() => setPlanPage((p) => p + 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════ TAB ACTIVIDADES ══════════ */}
      {activeTab === "actividades" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar actividades..."
                value={actSearch}
                onChange={(e) => { setActSearch(e.target.value); setActPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
              />
            </div>
            <button
              onClick={() => openCreateActividad(false)}
              className="flex items-center gap-2 bg-[#195083] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f3a5f] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Nueva actividad
            </button>
          </div>

          {loadingActividades ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#195083]" />
            </div>
          ) : pagedActs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Zap className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              {actSearch ? "Sin resultados para la búsqueda." : "Aún no hay actividades. ¡Crea la primera!"}
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[2fr_1fr_auto] gap-4 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <span>Actividad</span>
                <span>Precio unitario</span>
                <span>Acciones</span>
              </div>

              {pagedActs.map((act) => (
                <div
                  key={act.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 md:gap-4 px-4 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{act.nombre}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          act.activa ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {act.activa ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    {act.descripcion && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{act.descripcion}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-800">
                    <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                    {fmtCOP(act.precio_unitario)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActiva(act)}
                      title={act.activa ? "Desactivar" : "Activar"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        act.activa ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {act.activa ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditActividad(act)}
                      className="p-1.5 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete("actividad", act.id, act.nombre)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {actPages > 1 && (
                <div className="p-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {(actPage - 1) * PAGE_SIZE + 1}–{Math.min(actPage * PAGE_SIZE, filteredActs.length)} de{" "}
                    {filteredActs.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={actPage === 1}
                      onClick={() => setActPage((p) => p - 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={actPage >= actPages}
                      onClick={() => setActPage((p) => p + 1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════ MODAL PLAN ══════════ */}
      {planModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPlanModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#195083]/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-[#195083]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingPlan ? "Editar plan" : "Nuevo plan"}
                </h2>
              </div>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {planFormError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {planFormError}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre del plan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={planForm.nombre}
                  onChange={(e) => setPlanForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Plan básico de limpieza"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                />
              </div>

              {/* Precio + Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Precio por día (COP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={planForm.precio}
                    onChange={(e) => setPlanForm((f) => ({ ...f, precio: e.target.value }))}
                    placeholder="Ej: 80000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Horas de servicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={planForm.horas_servicio}
                    onChange={(e) => setPlanForm((f) => ({ ...f, horas_servicio: e.target.value }))}
                    placeholder="Ej: 4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={planForm.descripcion}
                  onChange={(e) => setPlanForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                  placeholder="Descripción breve del plan (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30 resize-none"
                />
              </div>

              {/* Actividades incluidas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Actividades incluidas{" "}
                    {selectedActividadesIds.length > 0 && (
                      <span className="text-[#195083] font-bold">({selectedActividadesIds.length})</span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => openCreateActividad(true)}
                    className="flex items-center gap-1 text-xs text-[#195083] font-semibold hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Crear nueva actividad
                  </button>
                </div>

                {actividades.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    No hay actividades creadas aún. Crea una usando el botón de arriba.
                  </p>
                ) : (
                  <>
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Filtrar actividades..."
                        value={actFilterInModal}
                        onChange={(e) => setActFilterInModal(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#195083]/30"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {actividadesInModal.map((act) => (
                        <label
                          key={act.id}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                            !act.activa ? "opacity-50" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedActividadesIds.includes(act.id)}
                            onChange={() => toggleActividadInPlan(act.id)}
                            className="w-4 h-4 accent-[#195083]"
                          />
                          <span className="flex-1 text-sm text-gray-800">{act.nombre}</span>
                          {act.precio_unitario != null && (
                            <span className="text-xs text-gray-500">{fmtCOP(act.precio_unitario)}</span>
                          )}
                          {!act.activa && (
                            <span className="text-xs text-gray-400">(inactiva)</span>
                          )}
                        </label>
                      ))}
                      {actividadesInModal.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-3">Sin coincidencias</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSavePlan}
                  disabled={planFormLoading}
                  className="flex-1 bg-[#195083] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f3a5f] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {planFormLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {editingPlan ? "Guardar cambios" : "Crear plan"}
                </button>
                <button
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL ACTIVIDAD ══════════ */}
      {actModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingAct ? "Editar actividad" : "Nueva actividad"}
                </h2>
              </div>
              <button onClick={() => setActModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {actFormError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {actFormError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={actForm.nombre}
                  onChange={(e) => setActForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Barrer pisos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={actForm.descripcion}
                  onChange={(e) => setActForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                  placeholder="Descripción breve (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Precio unitario (COP)
                </label>
                <input
                  type="number"
                  min={0}
                  value={actForm.precio_unitario}
                  onChange={(e) => setActForm((f) => ({ ...f, precio_unitario: e.target.value }))}
                  placeholder="Ej: 15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195083]/30"
                />
                <p className="text-xs text-gray-400 mt-1">Precio cuando el cliente la solicita individualmente.</p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSaveActividad}
                  disabled={actFormLoading}
                  className="flex-1 bg-amber-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {actFormLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {editingAct ? "Guardar cambios" : "Crear actividad"}
                </button>
                <button
                  onClick={() => setActModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL CONFIRMAR ELIMINAR ══════════ */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Confirmar eliminación</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{deleteConfirm.type === "plan" ? "el plan" : "la actividad"}</strong>{" "}
              <span className="text-gray-900">"{deleteConfirm.nombre}"</span>?
              {deleteConfirm.type === "plan" && " Esto no eliminará las actividades asociadas."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Eliminar
              </button>
              <button
                onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminPlanesActividades);
