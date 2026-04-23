import { useState, useEffect, useRef, useCallback } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import {
  CheckCircle,
  Circle,
  Camera,
  ImageIcon,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  User,
  MapPin,
  Clock,
  Calendar,
  Package,
  ChevronLeft,
  Play,
  Flag,
  ZoomIn,
  Phone,
  Star,
} from "lucide-react";

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string;
}

interface PlanInfo {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface LugarInfo {
  id: string;
  nombre: string;
  nombre_lugar: string | null;
  tipo_lugar: string | null;
  descripcion: string | null;
}

interface ActividadItem {
  id: string; // reservas_actividades.id
  id_actividad: string;
  nombre: string;
  descripcion: string | null;
  duracion_estimada_minutos: number | null;
  programada: boolean;
  ejecutada: boolean;
  notas: string | null;
}

interface FotoItem {
  id: string;
  url_foto: string;
  tipo: string | null;
  descripcion: string | null;
  id_actividad: string | null; // reservas_actividades.id
  created_at: string | null;
}

interface ReservaActiva {
  id: string;
  fecha: string | null;
  hora_inicio: string | null;
  hora_final: string | null;
  estado: string;
  precio_total: number | null;
  descripcion: string | null;
  cliente: Cliente | null;
  plan: PlanInfo | null;
  lugar: LugarInfo | null;
  actividades: ActividadItem[];
  fotos: FotoItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  };
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  programada: { label: "Programada", color: "text-blue-700", bg: "bg-blue-100" },
  confirmada: { label: "Confirmada", color: "text-indigo-700", bg: "bg-indigo-100" },
  pendiente: { label: "Pendiente", color: "text-yellow-700", bg: "bg-yellow-100" },
  en_proceso: { label: "En Progreso", color: "text-orange-700", bg: "bg-orange-100" },
  completada: { label: "Completada", color: "text-green-700", bg: "bg-green-100" },
  cancelada: { label: "Cancelada", color: "text-red-700", bg: "bg-red-100" },
};

// ─── Componente principal ─────────────────────────────────────────────────────

function EmpleadaReservaActiva() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [empleadaId, setEmpleadaId] = useState<string | null>(null);
  const [reserva, setReserva] = useState<ReservaActiva | null>(null);
  const [actividades, setActividades] = useState<ActividadItem[]>([]);
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noActiva, setNoActiva] = useState(false);

  // Upload state
  const [uploadTarget, setUploadTarget] = useState<string | null>("general"); // "general" | actividad.id
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Estado mutation
  const [changingEstado, setChangingEstado] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Auth / load ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { headers: authHeader() })
      .then((r) => r.json())
      .then((u) => setEmpleadaId(u.id ?? u.supabase_uid ?? null))
      .catch(() => setError("No se pudo obtener la sesión"));
  }, []);

  const fetchReservaActiva = useCallback(async () => {
    if (!empleadaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reservas/empleada/${empleadaId}/activa`,
        { headers: authHeader() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.activa || !data.reserva) {
        setNoActiva(true);
        setReserva(null);
      } else {
        setReserva(data.reserva);
        setActividades(data.reserva.actividades ?? []);
        setFotos(data.reserva.fotos ?? []);
        setNoActiva(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [empleadaId]);

  useEffect(() => {
    if (empleadaId) fetchReservaActiva();
  }, [fetchReservaActiva]);

  // ── Toggle actividad ─────────────────────────────────────────────────────

  const toggleActividad = async (item: ActividadItem) => {
    if (!reserva) return;
    setTogglingId(item.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reservas/${reserva.id}/actividades/${item.id}/toggle`,
        {
          method: "PATCH",
          headers: authHeader(),
          body: JSON.stringify({ ejecutada: !item.ejecutada }),
        }
      );
      if (res.ok) {
        setActividades((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, ejecutada: !a.ejecutada } : a))
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  // ── Foto upload ──────────────────────────────────────────────────────────

  const triggerFileInput = (targetId: string) => {
    setUploadTarget(targetId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !reserva) return;
    setUploadingFor(uploadTarget);
    try {
      const base64 = await compressImage(file);
      const body: Record<string, string | null> = {
        url_foto: base64,
        tipo: "durante",
        id_actividad: uploadTarget === "general" ? null : uploadTarget,
      };
      const res = await fetch(`${API_BASE_URL}/api/reservas/${reserva.id}/fotos`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const nueva: FotoItem = await res.json();
        setFotos((prev) => [...prev, nueva]);
      }
    } catch {
      // silent
    } finally {
      setUploadingFor(null);
    }
  };

  const deleteFoto = async (fotoId: string) => {
    if (!reserva) return;
    const res = await fetch(
      `${API_BASE_URL}/api/reservas/${reserva.id}/fotos/${fotoId}`,
      { method: "DELETE", headers: authHeader() }
    );
    if (res.ok || res.status === 204) {
      setFotos((prev) => prev.filter((f) => f.id !== fotoId));
    }
  };

  // ── Cambiar estado ───────────────────────────────────────────────────────

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!reserva) return;
    setChangingEstado(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reservas/${reserva.id}/estado`,
        {
          method: "PATCH",
          headers: authHeader(),
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );
      if (res.ok) {
        setReserva((r) => r ? { ...r, estado: nuevoEstado } : r);
        if (nuevoEstado === "completada") {
          setTimeout(() => navigate("/empleada/index"), 1500);
        }
      }
    } finally {
      setChangingEstado(false);
    }
  };

  // ── Derivados ────────────────────────────────────────────────────────────

  const actividadesEjecutadas = actividades.filter((a) => a.ejecutada).length;
  const progreso = actividades.length > 0 ? Math.round((actividadesEjecutadas / actividades.length) * 100) : 0;
  const estadoCfg = ESTADO_CONFIG[reserva?.estado ?? ""] ?? { label: reserva?.estado ?? "", color: "text-gray-700", bg: "bg-gray-100" };
  const fotosGenerales = fotos.filter((f) => !f.id_actividad);

  // ── Loading / Error ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D95B26]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={fetchReservaActiva}
          className="bg-[#D95B26] text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    );
  }

  if (noActiva || !reserva) {
    return (
      <div className="text-center py-16 px-4">
        <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">{t('empleada.activeService.noActiveServices')}</h3>
        <p className="text-gray-500 mb-6">{t('empleada.activeService.noActiveMessage')}</p>
        <button
          onClick={() => navigate("/empleada/reservas/index")}
          className="bg-[#D95B26] text-white px-6 py-2 rounded-xl font-semibold"
        >
          {t('empleada.activeService.viewMyReservations')}
        </button>
      </div>
    );
  }

  // ─── Render principal ───────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16 px-1 sm:px-0">

      {/* Input oculto para seleccionar foto (cámara o galería) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="foto" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxSrc(null)}>
            <X className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#D95B26] to-[#e07b4a] rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate("/empleada/index")}
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4" /> Dashboard
          </button>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoCfg.bg} ${estadoCfg.color}`}>
            {estadoCfg.label}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold mb-1">🧹 Servicio en Progreso</h1>
        <div className="flex flex-wrap gap-3 text-sm text-white/90 mt-2">
          {reserva.fecha && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(reserva.fecha + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          )}
          {reserva.hora_inicio && reserva.hora_final && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {reserva.hora_inicio} – {reserva.hora_final}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {actividades.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Actividades: {actividadesEjecutadas}/{actividades.length} completadas</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Botones de acción ── */}
      <div className="flex gap-3">
        {reserva.estado !== "en_proceso" && reserva.estado !== "completada" && (
          <button
            onClick={() => cambiarEstado("en_proceso")}
            disabled={changingEstado}
            className="flex-1 flex items-center justify-center gap-2 bg-[#D95B26] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#b84e22] transition-colors disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {changingEstado ? "Actualizando..." : "Iniciar servicio"}
          </button>
        )}
        {reserva.estado === "en_proceso" && (
          <button
            onClick={() => cambiarEstado("completada")}
            disabled={changingEstado || progreso < 100}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            title={progreso < 100 ? "Completa todas las actividades primero" : ""}
          >
            <Flag className="h-4 w-4" />
            {changingEstado ? "Finalizando..." : progreso < 100 ? `Completar (${progreso}%)` : "✓ Finalizar servicio"}
          </button>
        )}
      </div>

      {/* ── Info del cliente / lugar ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        {reserva.cliente && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#195083] to-[#4894AD] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {reserva.cliente.nombre.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{reserva.cliente.nombre}</p>
              {reserva.cliente.telefono && (
                <a
                  href={`tel:${reserva.cliente.telefono}`}
                  className="text-sm text-[#D95B26] flex items-center gap-1"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {reserva.cliente.telefono}
                </a>
              )}
            </div>
            <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        )}

        {reserva.lugar && (
          <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
            <MapPin className="h-5 w-5 text-[#D95B26] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">{reserva.lugar.nombre}</p>
              {reserva.lugar.nombre_lugar && (
                <p className="text-sm text-gray-500">{reserva.lugar.nombre_lugar}</p>
              )}
              {reserva.lugar.descripcion && (
                <p className="text-xs text-gray-400 mt-0.5">{reserva.lugar.descripcion}</p>
              )}
            </div>
          </div>
        )}

        {reserva.plan && (
          <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
            <Package className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">{reserva.plan.nombre}</p>
              {reserva.plan.descripcion && (
                <p className="text-sm text-gray-500">{reserva.plan.descripcion}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Actividades ── */}
      {actividades.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="h-4 w-4 text-[#D95B26]" />
              {t('empleada.activeService.serviceActivities')}
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {actividadesEjecutadas}/{actividades.length}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {actividades.map((act) => {
              const fotosAct = fotos.filter((f) => f.id_actividad === act.id);
              const isToggling = togglingId === act.id;
              const isUploading = uploadingFor === act.id;

              return (
                <div key={act.id} className="p-4">
                  {/* Fila principal */}
                  <div className="flex items-start gap-3">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleActividad(act)}
                      disabled={isToggling}
                      className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
                    >
                      {act.ejecutada ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : isToggling ? (
                        <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${act.ejecutada ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {act.nombre}
                      </p>
                      {act.descripcion && (
                        <p className="text-xs text-gray-500 mt-0.5">{act.descripcion}</p>
                      )}
                      {act.duracion_estimada_minutos && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ~{act.duracion_estimada_minutos} min
                        </p>
                      )}

                      {/* Fotos de esta actividad */}
                      {fotosAct.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {fotosAct.map((f) => (
                            <div key={f.id} className="relative group">
                              <img
                                src={f.url_foto}
                                alt="foto actividad"
                                className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-gray-200"
                                onClick={() => setLightboxSrc(f.url_foto)}
                              />
                              <button
                                onClick={() => deleteFoto(f.id)}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center hidden group-hover:flex"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div
                                className="absolute inset-0 bg-black/20 rounded-lg items-center justify-center hidden group-hover:flex cursor-pointer"
                                onClick={() => setLightboxSrc(f.url_foto)}
                              >
                                <ZoomIn className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botón agregar foto para la actividad */}
                      <button
                        onClick={() => triggerFileInput(act.id)}
                        disabled={isUploading}
                        className="mt-2 flex items-center gap-1.5 text-xs text-[#D95B26] font-semibold hover:text-[#b84e22] transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Camera className="h-3.5 w-3.5" />
                        )}
                        {isUploading ? "Subiendo..." : fotosAct.length > 0 ? "Agregar otra foto" : "Agregar foto"}
                      </button>
                    </div>

                    {fotosAct.length > 0 && (
                      <span className="flex-shrink-0 text-xs bg-[#D95B26]/10 text-[#D95B26] font-bold rounded-full px-2 py-0.5">
                        {fotosAct.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Fotos generales del servicio ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#D95B26]" />
            {t('empleada.activeService.servicePhotos')}
          </h2>
          <button
            onClick={() => triggerFileInput("general")}
            disabled={uploadingFor === "general"}
            className="flex items-center gap-1.5 bg-[#D95B26] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#b84e22] transition-colors disabled:opacity-50"
          >
            {uploadingFor === "general" ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            {uploadingFor === "general" ? "Subiendo..." : "Agregar foto"}
          </button>
        </div>

        <div className="p-4">
          {fotosGenerales.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aún no hay fotos generales del servicio</p>
              <p className="text-xs mt-1">Toma fotos del antes, durante y después del servicio</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {fotosGenerales.map((f) => (
                <div key={f.id} className="relative group aspect-square">
                  <img
                    src={f.url_foto}
                    alt="foto servicio"
                    className="w-full h-full rounded-xl object-cover cursor-pointer border border-gray-100"
                    onClick={() => setLightboxSrc(f.url_foto)}
                  />
                  <button
                    onClick={() => deleteFoto(f.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 items-center justify-center hidden group-hover:flex shadow"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <div
                    className="absolute inset-0 bg-black/20 rounded-xl items-center justify-center hidden group-hover:flex cursor-pointer"
                    onClick={() => setLightboxSrc(f.url_foto)}
                  >
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Nota para el cliente ── */}
      {reserva.descripcion && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">Nota del cliente:</p>
          <p className="text-sm text-amber-800">{reserva.descripcion}</p>
        </div>
      )}

      {/* ── Precio ── */}
      {reserva.precio_total && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-green-800">Valor del servicio</span>
          <span className="text-xl font-extrabold text-green-700">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(reserva.precio_total)}
          </span>
        </div>
      )}

    </div>
  );
}

export default withEmpleadaRole(EmpleadaReservaActiva);
