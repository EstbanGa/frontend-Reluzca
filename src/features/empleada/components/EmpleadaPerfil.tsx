import { useState, useEffect } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import {
  User, Mail, Phone, FileText, Calendar,
  AlertCircle, RefreshCw, Star, Award,
} from "lucide-react";
import { API_BASE_URL } from "@/config/env";

interface EmpleadaProfile {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  documento?: string;
  fecha_nacimiento?: string;
  fecha_registro?: string;
  estado: string;
  ranking?: number | string;
}

function EmpleadaPerfilPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<EmpleadaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="h-8 w-8 text-[#D95B26] animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12 px-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar perfil</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchProfile}
          className="bg-[#D95B26] text-white px-4 py-2 rounded-lg hover:bg-[#b84d1f] transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const fields = [
    { icon: User,     label: "Nombre",           value: `${profile.nombre} ${profile.apellido}` },
    { icon: Mail,     label: "Correo",            value: profile.correo },
    { icon: Phone,    label: "Teléfono",          value: profile.telefono || "—" },
    { icon: FileText, label: "Documento",         value: profile.documento || "—" },
    { icon: Calendar, label: "Fecha de nacimiento", value: formatDate(profile.fecha_nacimiento) },
    { icon: Calendar, label: "Miembro desde",     value: formatDate(profile.fecha_registro) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D95B26] to-[#195083] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {profile.nombre[0]}{profile.apellido[0]}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{profile.nombre} {profile.apellido}</h1>
            <p className="text-white/80 text-sm mt-0.5">Empleada · {profile.estado}</p>
            {profile.ranking != null && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-300 fill-current" />
                <span className="text-sm font-semibold">{Number(profile.ranking).toFixed(1)}</span>
                <span className="text-white/60 text-xs">calificación</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Award className="h-5 w-5 text-[#D95B26]" />
          <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Icon className="h-4 w-4" />
                {label}
              </label>
              <p className="text-base font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withEmpleadaRole(EmpleadaPerfilPage);
