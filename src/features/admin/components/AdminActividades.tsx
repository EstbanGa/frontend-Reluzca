import { useState, useEffect, useCallback } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";

import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import {
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Activity,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface Actividad {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio_unitario?: number | null;
  duracion_estimada_minutos?: number | null;
  activa: boolean;
}

interface FormState {
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  duracion_estimada_minutos: string;
  activa: boolean;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  descripcion: "",
  precio_unitario: "",
  duracion_estimada_minutos: "",
  activa: true,
};

function AdminActividades() {
  const { t } = useTranslation();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"all" | "active" | "inactive">("all");

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null); // null = new, string = edit
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Actividad | null>(null);
  const [deleting, setDeleting] = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  const fetchActividades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/actividades`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Actividad[] = await res.json();
      setActividades(data);
    } catch (e) {
      setError(t("admin.activities.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchActividades();
  }, [fetchActividades]);

  const filtradas = actividades.filter((a) => {
    if (filtro === "active") return a.activa;
    if (filtro === "inactive") return !a.activa;
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (a: Actividad) => {
    setEditingId(a.id);
    setForm({
      nombre: a.nombre,
      descripcion: a.descripcion ?? "",
      precio_unitario: a.precio_unitario != null ? String(a.precio_unitario) : "",
      duracion_estimada_minutos:
        a.duracion_estimada_minutos != null ? String(a.duracion_estimada_minutos) : "",
      activa: a.activa,
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!form.nombre.trim()) {
      setFormError(t("admin.activities.errors.nameRequired"));
      return false;
    }
    if (form.precio_unitario && Number(form.precio_unitario) < 0) {
      setFormError(t("admin.activities.errors.pricePositive"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio_unitario: form.precio_unitario ? Number(form.precio_unitario) : null,
        duracion_estimada_minutos: form.duracion_estimada_minutos
          ? Number(form.duracion_estimada_minutos)
          : null,
        activa: form.activa,
      };

      const url = editingId
        ? `${API_BASE_URL}/api/actividades/${editingId}`
        : `${API_BASE_URL}/api/actividades`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeader(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || t("admin.activities.errors.saveFailed"));
      }

      await fetchActividades();
      closeForm();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : t("admin.activities.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/actividades/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(t("admin.activities.errors.deleteFailed"));
      }
      await fetchActividades();
      setDeleteConfirm(null);
    } catch {
      setError(t("admin.activities.errors.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (a: Actividad) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/actividades/${a.id}`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ activa: !a.activa }),
      });
      if (!res.ok) throw new Error();
      setActividades((prev) =>
        prev.map((item) => (item.id === a.id ? { ...item, activa: !item.activa } : item))
      );
    } catch {
      setError(t("admin.activities.errors.saveFailed"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            {t("admin.activities.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("admin.activities.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchActividades}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("admin.activities.createActivity")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {t(`admin.activities.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t("admin.activities.empty")}</p>
          <button
            onClick={openCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {t("admin.activities.createFirst")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:bg-[#195083]/5 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-200"
            >
              {/* Indicador activa/inactiva */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                a.activa ? "bg-green-100" : "bg-gray-100"
              }`}>
                <Activity className={`h-5 w-5 ${a.activa ? "text-green-600" : "text-gray-400"}`} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">{a.nombre}</h4>
                {a.descripcion && (
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{a.descripcion}</p>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {a.precio_unitario != null && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                      ${Number(a.precio_unitario).toLocaleString("es-CO")}
                    </span>
                  )}
                  {a.duracion_estimada_minutos != null && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                      {a.duracion_estimada_minutos} min
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    a.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${a.activa ? "bg-green-500" : "bg-gray-400"}`} />
                    {a.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleToggle(a)}
                  title={t("admin.activities.fields.active")}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {a.activa ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(a)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  title={t("admin.activities.editActivity")}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(a)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title={t("common.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {editingId
                  ? t("admin.activities.editActivity")
                  : t("admin.activities.createActivity")}
              </h2>
              <button
                onClick={closeForm}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("admin.activities.fields.name")} *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder={t("admin.activities.fields.namePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("admin.activities.fields.price")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.precio_unitario}
                  onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("admin.activities.fields.duration")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.duracion_estimada_minutos}
                  onChange={(e) =>
                    setForm({ ...form, duracion_estimada_minutos: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("admin.activities.fields.active")}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t("admin.activities.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {t("admin.activities.saveActivity")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <p className="text-gray-800 dark:text-gray-200 text-sm mb-5">
              {t("admin.activities.confirmDelete", { name: deleteConfirm.nombre })}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t("admin.activities.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminActividades);
