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
  X,
  AlertCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Eye,
} from "lucide-react";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard, { SlideButton } from "@/components/ui/SlideRevealCard";
import ListPagination from "@/components/ui/ListPagination";

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
  const [actPanelOpen, setActPanelOpen] = useState(false); // panel desplegable dentro del modal de plan
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
    if (fromPlan) {
      setActPanelOpen(true);
    } else {
      setActModalOpen(true);
    }
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
        const res = await fetch(`${API_BASE_URL}/api/actividades`, {
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
      setActPanelOpen(false);
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
    <div className="space-y-6 max-w-full">
      <style>{`
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes panelSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        .modal-enter { animation: modalScaleIn 0.2s ease-out forwards; }
        .panel-enter { animation: panelSlideIn 0.25s ease-out forwards; }
      `}</style>
      {/* Header */}
      <ListPageHeader
        theme={ROLE_THEMES.admin}
        title="Planes y Actividades"
        subtitle="Gestiona los planes de servicio y las actividades individuales disponibles para tus clientes."
        icon={<CreditCard className="h-7 w-7" />}
      />

      {/* Stats */}
      <ListStatsGrid
        columns={4}
        stats={[
          { label: "Planes", value: planes.length, color: "#195083" },
          { label: "Planes activos", value: planes.filter(p => p.estado).length, color: "#16a34a" },
          { label: "Actividades", value: actividades.length, color: "#7c3aed" },
          { label: "Actividades activas", value: actividades.filter(a => a.activa).length, color: "#2563eb" },
        ]}
      />

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
        <>
          {/* Search + create */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
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
          </div>

          {loadingPlanes ? (
            <div className="flex items-center justify-center min-h-64">
              <RefreshCw className="h-10 w-10 animate-spin text-[#195083]" />
            </div>
          ) : pagedPlanes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 text-center text-gray-400">
              <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              {planSearch ? "Sin resultados para la búsqueda." : "Aún no hay planes. ¡Crea el primero!"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pagedPlanes.map((plan) => (
                <SlideRevealCard
                  key={plan.id}
                  buttonCount={3}
                  actions={
                    <>
                      <SlideButton
                        icon={plan.estado ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                        onClick={() => handleTogglePlan(plan)}
                        title={plan.estado ? "Desactivar" : "Activar"}
                      />
                      <SlideButton
                        icon={<Edit3 className="h-4 w-4" />}
                        onClick={() => openEditPlan(plan)}
                        title="Editar"
                        hoverColor="hover:bg-[#195083]/10 hover:text-[#195083]"
                      />
                      <SlideButton
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => confirmDelete("plan", plan.id, plan.nombre)}
                        title="Eliminar"
                        hoverColor="hover:bg-red-50 hover:text-red-600"
                      />
                    </>
                  }
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#195083]/10">
                      <CreditCard className="h-5 w-5 text-[#195083]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{plan.nombre}</h4>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          plan.estado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${plan.estado ? "bg-green-500" : "bg-gray-400"}`} />
                          {plan.estado ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      {plan.descripcion && (
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{plan.descripcion}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          {fmtCOP(plan.precio)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {plan.horas_servicio != null ? `${plan.horas_servicio}h` : "—"}
                        </span>
                        {plan.actividades.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {plan.actividades.slice(0, 3).map((a) => (
                              <span key={a.id} className="text-[10px] bg-[#195083]/10 text-[#195083] px-1.5 py-0.5 rounded-full font-medium">
                                {a.nombre}
                              </span>
                            ))}
                            {plan.actividades.length > 3 && (
                              <span className="text-[10px] text-gray-500">+{plan.actividades.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SlideRevealCard>
              ))}

              <ListPagination page={planPage} totalPages={planPages} totalItems={filteredPlanes.length} pageSize={PAGE_SIZE} onPageChange={setPlanPage} />
            </div>
          )}
        </>
      )}

      {/* ══════════ TAB ACTIVIDADES ══════════ */}
      {activeTab === "actividades" && (
        <>
          {/* Search + create */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
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
          </div>

          {loadingActividades ? (
            <div className="flex items-center justify-center min-h-64">
              <RefreshCw className="h-10 w-10 animate-spin text-[#195083]" />
            </div>
          ) : pagedActs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 text-center text-gray-400">
              <Zap className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              {actSearch ? "Sin resultados para la búsqueda." : "Aún no hay actividades. ¡Crea la primera!"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pagedActs.map((act) => (
                <SlideRevealCard
                  key={act.id}
                  buttonCount={3}
                  actions={
                    <>
                      <SlideButton
                        icon={act.activa ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                        onClick={() => handleToggleActiva(act)}
                        title={act.activa ? "Desactivar" : "Activar"}
                      />
                      <SlideButton
                        icon={<Edit3 className="h-4 w-4" />}
                        onClick={() => openEditActividad(act)}
                        title="Editar"
                        hoverColor="hover:bg-[#195083]/10 hover:text-[#195083]"
                      />
                      <SlideButton
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => confirmDelete("actividad", act.id, act.nombre)}
                        title="Eliminar"
                        hoverColor="hover:bg-red-50 hover:text-red-600"
                      />
                    </>
                  }
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      act.activa ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Zap className={`h-5 w-5 ${act.activa ? "text-green-600" : "text-gray-400"}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{act.nombre}</h4>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          act.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${act.activa ? "bg-green-500" : "bg-gray-400"}`} />
                          {act.activa ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      {act.descripcion && (
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{act.descripcion}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          {fmtCOP(act.precio_unitario)}
                        </span>
                      </div>
                    </div>
                  </div>
                </SlideRevealCard>
              ))}

              <ListPagination page={actPage} totalPages={actPages} totalItems={filteredActs.length} pageSize={PAGE_SIZE} onPageChange={setActPage} />
            </div>
          )}
        </>
      )}

      {/* ══════════ MODAL PLAN ══════════ */}
      {planModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { if (!actPanelOpen) { setPlanModalOpen(false); } }}
          />
          <div
            className={`modal-enter relative bg-white rounded-2xl shadow-2xl max-h-[90vh] flex overflow-hidden transition-all duration-300 ${
              actPanelOpen ? "w-full max-w-5xl" : "w-full max-w-2xl"
            }`}
          >
            {/* ── Columna izquierda: formulario del plan ── */}
            <div
              className={`flex-1 min-w-0 overflow-y-auto transition-opacity duration-300 ${
                actPanelOpen ? "opacity-30 pointer-events-none select-none" : "opacity-100"
              }`}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-tl-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#195083]/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-[#195083]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingPlan ? "Editar plan" : "Nuevo plan"}
                  </h2>
                </div>
                <button
                  onClick={() => { setPlanModalOpen(false); setActPanelOpen(false); }}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Descripción <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                  </label>
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
                    onClick={() => { setPlanModalOpen(false); setActPanelOpen(false); }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            {/* ── Columna derecha: panel crear actividad (slide-in) ── */}
            {actPanelOpen && (
              <div className="panel-enter w-80 min-w-[300px] border-l border-gray-200 bg-slate-50 rounded-r-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-slate-50 z-10 rounded-tr-2xl">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Zap className="h-4 w-4 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">Nueva actividad</h3>
                  </div>
                  <button
                    onClick={() => setActPanelOpen(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                  {actFormError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {actFormError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={actForm.nombre}
                      onChange={(e) => setActForm((f) => ({ ...f, nombre: e.target.value }))}
                      placeholder="Ej: Barrer pisos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={actForm.descripcion}
                      onChange={(e) => setActForm((f) => ({ ...f, descripcion: e.target.value }))}
                      rows={2}
                      placeholder="Descripción breve (opcional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Precio unitario (COP)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={actForm.precio_unitario}
                      onChange={(e) => setActForm((f) => ({ ...f, precio_unitario: e.target.value }))}
                      placeholder="Ej: 15000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    />
                    <p className="text-xs text-gray-400 mt-1">Precio cuando se solicita individualmente.</p>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-200 bg-slate-50 rounded-br-2xl">
                  <button
                    onClick={handleSaveActividad}
                    disabled={actFormLoading}
                    className="w-full bg-amber-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {actFormLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Guardar actividad
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ MODAL ACTIVIDAD (standalone desde tab actividades) ══════════ */}
      {actModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActModalOpen(false)} />
          <div className="modal-enter relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
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
          <div className="modal-enter relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
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
