import { useState, useEffect } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Package,
  FileText,
  Tag,
  Calendar,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Activity,
  Settings,
} from "lucide-react";

interface Actividad {
  id: string;
  nombre: string;
  precio_unitario?: number | null;
  duracion_estimada_minutos?: number | null;
  activa: boolean;
}

interface FormData {
  nombre: string;
  descripcion: string;
  precio: string;
  estado: boolean;
  tipo_plan: "full" | "a_la_carte";
  fecha_inicio: string;
  fecha_final: string;
  hora_inicio: string;
  hora_final: string;
}

function AdminCrearPlan() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedActividades, setSelectedActividades] = useState<string[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    precio: "",
    estado: true,
    tipo_plan: "full",
    fecha_inicio: "",
    fecha_final: "",
    hora_inicio: "",
    hora_final: "",
  });

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE_URL}/api/actividades`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Actividad[] = await res.json();
          setActividades(data.filter((a) => a.activa));
        }
      } catch {
        // non-critical
      } finally {
        setLoadingActividades(false);
      }
    };
    fetchActividades();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleActividad = (id: string) => {
    setSelectedActividades((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedTotal = selectedActividades.reduce((sum, id) => {
    const a = actividades.find((x) => x.id === id);
    return sum + (a?.precio_unitario ?? 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setError(t("admin.createPlan.errors.nameRequired"));
      return;
    }
    if (formData.nombre.trim().length > 100) {
      setError(t("admin.createPlan.errors.nameMaxLength"));
      return;
    }
    if (formData.precio && (isNaN(Number(formData.precio)) || Number(formData.precio) < 0)) {
      setError(t("admin.createPlan.errors.pricePositive"));
      return;
    }
    if (formData.fecha_inicio && formData.fecha_final) {
      if (new Date(formData.fecha_final) <= new Date(formData.fecha_inicio)) {
        setError(t("admin.createPlan.errors.endDateAfterStart"));
        return;
      }
    }
    if (formData.hora_inicio && formData.hora_final) {
      if (
        new Date(`2000-01-01T${formData.hora_final}`) <=
        new Date(`2000-01-01T${formData.hora_inicio}`)
      ) {
        setError(t("admin.createPlan.errors.endTimeAfterStart"));
        return;
      }
    }

    const payload: Record<string, unknown> = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      precio:
        formData.tipo_plan === "a_la_carte" && selectedTotal > 0
          ? selectedTotal
          : formData.precio
          ? Number(formData.precio)
          : undefined,
      estado: formData.estado,
      tipo_plan: formData.tipo_plan,
      fecha_inicio: formData.fecha_inicio || undefined,
      fecha_final: formData.fecha_final || undefined,
      hora_inicio: formData.hora_inicio || undefined,
      hora_final: formData.hora_final || undefined,
    };

    // Strip undefined
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) throw new Error(t("admin.createPlan.errors.noToken"));

      const createRes = await fetch(`${API_BASE_URL}/api/planes/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await createRes.json();
      if (!createRes.ok) {
        throw new Error(
          result.error || result.details || result.detail || `Error HTTP ${createRes.status}`
        );
      }

      // Associar actividades si hay seleccionadas
      if (selectedActividades.length > 0 && result.id) {
        await fetch(`${API_BASE_URL}/api/planes/${result.id}/actividades`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ actividad_ids: selectedActividades }),
        });
      }

      setSuccess(true);
      setTimeout(() => navigate("/admin/planes/index"), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("admin.createPlan.errors.unknown")
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t("admin.createPlan.successTitle")}
          </h2>
          <p className="text-gray-600 mb-4">{t("admin.createPlan.successRedirect")}</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#195083] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl p-4 sm:p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/planes/index")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F0E7]">
                {t("admin.createPlan.title")}
              </h1>
              <p className="text-[#F5F0E7]/80 text-sm sm:text-base mt-1">
                {t("admin.createPlan.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">{t("common.error")}</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 text-sm mt-2 hover:text-red-800"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#195083]" />
              {t("admin.createPlan.basicInfo")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.createPlan.planName")} *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder={t("admin.createPlan.planNamePlaceholder")}
                  maxLength={100}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.nombre.length}/100 {t("admin.createPlan.characters")}
                </p>
              </div>

              {/* Tipo de plan */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t("admin.createPlan.tipoPlan")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["full", "a_la_carte"] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => handleInputChange("tipo_plan", tipo)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        formData.tipo_plan === tipo
                          ? "border-[#195083] bg-[#195083]/10 text-[#195083]"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <p className="font-medium text-sm">
                        {tipo === "full"
                          ? t("admin.createPlan.tipoPlanFull")
                          : t("admin.createPlan.tipoPlanALaCarte")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Precio (solo para full) */}
              {formData.tipo_plan === "full" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("admin.createPlan.price")} $$
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => handleInputChange("precio", e.target.value)}
                    placeholder={t("admin.createPlan.pricePlaceholder")}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center gap-3 self-end pb-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("estado", !formData.estado)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.estado
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {formData.estado ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                  {formData.estado ? t("common.active") : t("common.inactive")}
                </button>
              </div>
            </div>
          </div>

          {/* Actividades del plan */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#195083]" />
              {t("admin.createPlan.activities")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{t("admin.createPlan.activitiesHint")}</p>

            {loadingActividades ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : actividades.length === 0 ? (
              <p className="text-sm text-gray-400">{t("admin.createPlan.noActivitiesAvailable")}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {actividades.map((a) => {
                    const selected = selectedActividades.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleActividad(a.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selected
                            ? "border-[#195083] bg-[#195083]/10 text-[#195083]"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <p className="font-medium text-sm">{a.nombre}</p>
                        <p className="text-xs mt-0.5 text-gray-400">
                          {a.precio_unitario != null
                            ? `$${Number(a.precio_unitario).toLocaleString("es-CO")}`
                            : "—"}
                          {a.duracion_estimada_minutos
                            ? ` · ${a.duracion_estimada_minutos} min`
                            : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {selectedActividades.length > 0 && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {t("admin.createPlan.selectedActivities", {
                        n: selectedActividades.length,
                      })}
                    </span>
                    {formData.tipo_plan === "a_la_carte" && selectedTotal > 0 && (
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {t("admin.createPlan.estimatedTotal")}:{" "}
                        ${selectedTotal.toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Vigencia */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#195083]" />
              {t("admin.createPlan.planValidity")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.createPlan.startDate")}
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.createPlan.endDate")}
                </label>
                <input
                  type="date"
                  value={formData.fecha_final}
                  onChange={(e) => handleInputChange("fecha_final", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#195083]" />
              {t("admin.createPlan.serviceHours")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.createPlan.startTime")}
                </label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => handleInputChange("hora_inicio", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.createPlan.endTime")}
                </label>
                <input
                  type="time"
                  value={formData.hora_final}
                  onChange={(e) => handleInputChange("hora_final", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#195083]" />
              {t("admin.createPlan.planDescription")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.createPlan.detailedDescription")}
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                placeholder={t("admin.createPlan.descriptionPlaceholder")}
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.descripcion.length}/1000 {t("admin.createPlan.characters")}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-[#195083] text-white rounded-xl hover:bg-[#0f3a5f] disabled:opacity-60 transition-colors font-semibold"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {t("admin.createPlan.submitBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAdminRole(AdminCrearPlan);
