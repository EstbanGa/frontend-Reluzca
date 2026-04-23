import { useState } from "react";
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
  UserPlus,
  Mail,
  Phone,
  User,
  Calendar,
  Shield,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  documento: string;
  tipo_persona: string;
  fecha_nacimiento: string;
  rol: string;
  estado: string;
}

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "cliente", label: "Cliente" },
  { value: "empleada", label: "Empleada" },
];

const ESTADOS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "pendiente", label: "Pendiente" },
];

const TIPOS_PERSONA = [
  { value: "", label: "Seleccionar..." },
  { value: "natural", label: "Natural" },
  { value: "juridica", label: "Jurídica" },
];

function AdminCrearUsuario() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    documento: "",
    tipo_persona: "",
    fecha_nacimiento: "",
    rol: "cliente",
    estado: "activo",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.nombre.trim()) return t('admin.createUser.errors.nameRequired');
    if (!formData.apellido.trim()) return t('admin.createUser.errors.lastNameRequired');
    if (!formData.email.trim()) return t('admin.createUser.errors.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return t('admin.createUser.errors.emailInvalid');
    if (!formData.password) return t('admin.createUser.errors.passwordRequired');
    if (formData.password.length < 6)
      return t('admin.createUser.errors.passwordMinLength');
    if (!formData.telefono.trim()) return t('admin.createUser.errors.phoneRequired');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");

      const body: Record<string, string | null> = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        password: formData.password,
        telefono: formData.telefono.trim(),
        rol: formData.rol,
        estado: formData.estado,
        documento: formData.documento.trim() || null,
        tipo_persona: formData.tipo_persona || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/admin/create-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/usuarios/index");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.createUser.errors.createError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('admin.createUser.successTitle')}
          </h2>
          <p className="text-gray-600">{t('admin.createUser.successRedirect')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/usuarios/index")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F0E7]">
              {t('admin.createUser.title')}
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm sm:text-base mt-1">
              {t('admin.createUser.subtitle')}
            </p>
          </div>
          <UserPlus className="h-6 w-6 text-[#F5F0E7] flex-shrink-0" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">{t('common.error')}</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#195083]" />
            {t('admin.createUser.personalInfo')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                placeholder={t('admin.createUser.namePlaceholder')}
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createUser.lastNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                placeholder={t('admin.createUser.lastNamePlaceholder')}
              />
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                {t('admin.createUser.documentLabel')}
              </label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => handleInputChange("documento", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                placeholder={t('admin.createUser.documentPlaceholder')}
              />
            </div>

            {/* Tipo Persona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createUser.personTypeLabel')}
              </label>
              <select
                value={formData.tipo_persona}
                onChange={(e) =>
                  handleInputChange("tipo_persona", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
              >
                {TIPOS_PERSONA.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                {t('admin.createUser.birthDateLabel')}
              </label>
              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  handleInputChange("fecha_nacimiento", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Contacto y Acceso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#195083]" />
            {t('admin.createUser.contactAccess')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                {t('common.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                {t('common.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                placeholder="3001234567"
              />
            </div>

            {/* Contraseña */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                  placeholder={t('admin.createUser.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.createUser.passwordNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Rol y Estado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#195083]" />
            {t('admin.createUser.roleAndStatus')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.createUser.roleLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.rol}
                onChange={(e) => handleInputChange("rol", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm bg-white"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(`common.roles.${r.value}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.status')}
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange("estado", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm bg-white"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {t(`common.statuses.${e.value}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/usuarios/index")}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#195083] text-white rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.creating')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('admin.createUser.submitBtn')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAdminRole(AdminCrearUsuario);
