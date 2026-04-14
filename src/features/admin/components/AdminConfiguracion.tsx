import { useState, useEffect } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import {
  Settings,
  User,
  Lock,
  Mail,
  Phone,
  FileText,
  Calendar,
  Building2,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
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
  rol: string;
  fecha_registro: string | null;
}

type ActiveTab = "profile" | "password";

function AdminConfiguracionPage() {
  const { t } = useTranslation();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    documento: "",
    tipo_persona: "",
    fecha_nacimiento: "",
  });

  // Password state
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error(t("settings.userNotFound"));

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
      setError(err instanceof Error ? err.message : t("settings.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
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
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || t("settings.profile.saveError"));
      }
      const updated = await response.json();
      setProfile(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("settings.profile.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
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

  const passwordValidation = {
    hasUppercase: /[A-Z]/.test(passwordForm.newPassword),
    hasLowercase: /[a-z]/.test(passwordForm.newPassword),
    hasNumber: /\d/.test(passwordForm.newPassword),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
    minLength: passwordForm.newPassword.length >= 8,
  };
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch =
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordForm.confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!isPasswordValid || !passwordsMatch) return;
    try {
      setChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(false);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || t("settings.password.changeError"));
      }
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t("settings.password.changeError"));
    } finally {
      setChangingPassword(false);
    }
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
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#195083]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t("settings.errorLoading")}</h3>
        <p className="text-sm sm:text-base text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#4894AD] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold">
              {t("settings.title")}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">{t("settings.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Success alerts */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{t("settings.profile.saveSuccess")}</p>
        </div>
      )}
      {passwordSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{t("settings.password.changeSuccess")}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "text-[#195083] border-b-2 border-[#195083] bg-[#195083]/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User className="h-4 w-4" />
            {t("settings.tabs.profile")}
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "password"
                ? "text-[#195083] border-b-2 border-[#195083] bg-[#195083]/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Lock className="h-4 w-4" />
            {t("settings.tabs.password")}
          </button>
        </div>

        {/* ========= PROFILE TAB ========= */}
        {activeTab === "profile" && (
          <div>
            {/* Card header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{t("settings.profile.personalInfo")}</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#195083] bg-[#195083]/10 rounded-lg hover:bg-[#195083]/20 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  {t("settings.profile.edit")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    {t("settings.profile.cancel")}
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#195083] rounded-lg hover:bg-[#195083]/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? t("settings.profile.saving") : t("settings.profile.save")}
                  </button>
                </div>
              )}
            </div>

            {saveError && (
              <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <User className="h-4 w-4" /> {t("settings.profile.firstName")}
                </label>
                {editing ? (
                  <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent" />
                ) : (
                  <p className="text-base font-medium text-gray-900">{profile.nombre}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <User className="h-4 w-4" /> {t("settings.profile.lastName")}
                </label>
                {editing ? (
                  <input type="text" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent" />
                ) : (
                  <p className="text-base font-medium text-gray-900">{profile.apellido}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Mail className="h-4 w-4" /> {t("settings.profile.email")}
                </label>
                <p className="text-base text-gray-900">{profile.email}</p>
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Phone className="h-4 w-4" /> {t("settings.profile.phone")}
                </label>
                {editing ? (
                  <input type="tel" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent" />
                ) : (
                  <p className="text-base text-gray-900">{profile.telefono || "—"}</p>
                )}
              </div>

              {/* Documento */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <FileText className="h-4 w-4" /> {t("settings.profile.document")}
                </label>
                {editing ? (
                  <input type="text" value={editForm.documento} onChange={(e) => setEditForm({ ...editForm, documento: e.target.value })}
                    placeholder={t("settings.profile.documentPlaceholder")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent" />
                ) : (
                  <p className="text-base text-gray-900">{profile.documento || "—"}</p>
                )}
              </div>

              {/* Tipo Persona */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Building2 className="h-4 w-4" /> {t("settings.profile.personType")}
                </label>
                {editing ? (
                  <select value={editForm.tipo_persona} onChange={(e) => setEditForm({ ...editForm, tipo_persona: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent">
                    <option value="">{t("settings.profile.selectOption")}</option>
                    <option value="natural">{t("settings.profile.natural")}</option>
                    <option value="juridica">{t("settings.profile.juridica")}</option>
                  </select>
                ) : (
                  <p className="text-base text-gray-900">
                    {profile.tipo_persona ? t(`settings.profile.${profile.tipo_persona}`) : "—"}
                  </p>
                )}
              </div>

              {/* Fecha Nacimiento */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Calendar className="h-4 w-4" /> {t("settings.profile.birthDate")}
                </label>
                {editing ? (
                  <input type="date" value={editForm.fecha_nacimiento} onChange={(e) => setEditForm({ ...editForm, fecha_nacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent" />
                ) : (
                  <p className="text-base text-gray-900">{formatDate(profile.fecha_nacimiento)}</p>
                )}
              </div>

              {/* Fecha Registro (read-only) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Calendar className="h-4 w-4" /> {t("settings.profile.registrationDate")}
                </label>
                <p className="text-base text-gray-900">{formatDate(profile.fecha_registro)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========= PASSWORD TAB ========= */}
        {activeTab === "password" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("settings.password.title")}</h2>
              <p className="text-sm text-gray-500">{t("settings.password.description")}</p>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            <div className="max-w-md space-y-4">
              {/* Current password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t("settings.password.currentPassword")}</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t("settings.password.newPassword")}</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Validation indicators */}
                {passwordForm.newPassword.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {[
                      { key: "minLength", label: t("settings.password.rules.minLength") },
                      { key: "hasUppercase", label: t("settings.password.rules.uppercase") },
                      { key: "hasLowercase", label: t("settings.password.rules.lowercase") },
                      { key: "hasNumber", label: t("settings.password.rules.number") },
                      { key: "hasSymbol", label: t("settings.password.rules.symbol") },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation[key as keyof typeof passwordValidation] ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className={`text-xs ${passwordValidation[key as keyof typeof passwordValidation] ? "text-green-600" : "text-gray-400"}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t("settings.password.confirmPassword")}</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#195083] focus:border-transparent ${
                    passwordForm.confirmPassword.length > 0 && !passwordsMatch
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {passwordForm.confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-500">{t("settings.password.mismatch")}</p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !isPasswordValid || !passwordsMatch || !passwordForm.currentPassword}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#195083] rounded-lg hover:bg-[#195083]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                {changingPassword ? t("settings.password.changing") : t("settings.password.changeButton")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminRole(AdminConfiguracionPage);