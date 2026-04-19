import { useState, useEffect } from "react";
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Building2,
  Save,
  AlertCircle,
  CheckCircle,
  Pencil,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  documento: string | null;
  telefono: string;
  tipo_persona: string | null;
  fecha_nacimiento: string | null;
  estado: string;
  fecha_registro: string | null;
  created_at: string | null;
}

interface EditFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  documento: string;
  tipo_persona: string;
  fecha_nacimiento: string;
}

function ClientePerfilPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    nombre: "",
    apellido: "",
    telefono: "",
    documento: "",
    tipo_persona: "",
    fecha_nacimiento: "",
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error(t("cliente.profile.userNotFound"));

      const user = JSON.parse(userStr);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios/${user.id}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
      setEditForm({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        telefono: data.telefono || "",
        documento: data.documento || "",
        tipo_persona: data.tipo_persona || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("cliente.profile.errorLoading")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const payload: Record<string, string | null> = {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        telefono: editForm.telefono.trim(),
        documento: editForm.documento.trim() || null,
        tipo_persona: editForm.tipo_persona || null,
        fecha_nacimiento: editForm.fecha_nacimiento || null,
      };

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios/${profile.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || t("cliente.profile.saveError"));
      }

      const updated = await response.json();
      setProfile(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : t("cliente.profile.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        telefono: profile.telefono || "",
        documento: profile.documento || "",
        tipo_persona: profile.tipo_persona || "",
        fecha_nacimiento: profile.fecha_nacimiento || "",
      });
    }
    setEditing(false);
    setSaveError(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#4894AD]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          {t("cliente.profile.errorLoading")}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4894AD] to-[#D95B26] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-1">
              {t("cliente.profile.title")}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              {t("cliente.profile.subtitle")}
            </p>
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold">
            {profile.nombre.charAt(0)}
            {profile.apellido.charAt(0)}
          </div>
        </div>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{t("cliente.profile.saveSuccess")}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("cliente.profile.personalInfo")}
          </h2>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}

        {/* Fields */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <User className="h-4 w-4" />
              {t("cliente.profile.firstName")}
            </label>
            {editing ? (
              <input
                type="text"
                value={editForm.nombre}
                onChange={(e) =>
                  setEditForm({ ...editForm, nombre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4894AD] focus:border-transparent"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">
                {profile.nombre}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <User className="h-4 w-4" />
              {t("cliente.profile.lastName")}
            </label>
            {editing ? (
              <input
                type="text"
                value={editForm.apellido}
                onChange={(e) =>
                  setEditForm({ ...editForm, apellido: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4894AD] focus:border-transparent"
              />
            ) : (
              <p className="text-base font-medium text-gray-900">
                {profile.apellido}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Mail className="h-4 w-4" />
              {t("cliente.profile.email")}
            </label>
            <p className="text-base text-gray-900">{profile.email}</p>
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Phone className="h-4 w-4" />
              {t("cliente.profile.phone")}
            </label>
            {editing ? (
              <input
                type="tel"
                value={editForm.telefono}
                onChange={(e) =>
                  setEditForm({ ...editForm, telefono: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4894AD] focus:border-transparent"
              />
            ) : (
              <p className="text-base text-gray-900">
                {profile.telefono || "—"}
              </p>
            )}
          </div>

          {/* Documento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText className="h-4 w-4" />
              {t("cliente.profile.document")}
            </label>
            {editing ? (
              <input
                type="text"
                value={editForm.documento}
                onChange={(e) =>
                  setEditForm({ ...editForm, documento: e.target.value })
                }
                placeholder={t("cliente.profile.documentPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4894AD] focus:border-transparent"
              />
            ) : (
              <p className="text-base text-gray-900">
                {profile.documento || "—"}
              </p>
            )}
          </div>

          {/* Tipo Persona */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Building2 className="h-4 w-4" />
              {t("cliente.profile.personType")}
            </label>
            {editing ? (
              <select
                value={editForm.tipo_persona}
                onChange={(e) =>
                  setEditForm({ ...editForm, tipo_persona: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4894AD] focus:border-transparent"
              >
                <option value="">{t("cliente.profile.selectOption")}</option>
                <option value="natural">{t("cliente.profile.natural")}</option>
                <option value="juridica">{t("cliente.profile.juridica")}</option>
              </select>
            ) : (
              <p className="text-base text-gray-900">
                {profile.tipo_persona
                  ? t(`cliente.profile.${profile.tipo_persona}`)
                  : "—"}
              </p>
            )}
          </div>

          {/* Fecha Nacimiento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Calendar className="h-4 w-4" />
              {t("cliente.profile.birthDate")}
            </label>
            {editing ? (
              <input
                type="date"
                value={editForm.fecha_nacimiento}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    fecha_nacimiento: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4894AD] focus:border-transparent"
              />
            ) : (
              <p className="text-base text-gray-900">
                {formatDate(profile.fecha_nacimiento)}
              </p>
            )}
          </div>

          {/* Fecha Registro (read-only) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Calendar className="h-4 w-4" />
              {t("cliente.profile.registrationDate")}
            </label>
            <p className="text-base text-gray-900">
                {formatDate(profile.fecha_registro)}
              </p>
          </div>
        </div>
      </div>

      {/* Nota contraseña */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">¿Deseas cambiar tu contraseña?</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Los cambios de contraseña se realizan desde la página de inicio de sesión usando la opción
            <strong> "¿Olvidaste tu contraseña?"</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withClienteRole(ClientePerfilPage);
