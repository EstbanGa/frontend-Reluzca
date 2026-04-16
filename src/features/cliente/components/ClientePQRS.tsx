
import { withClienteRole } from "@/components/common/ProtectedRoute";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Plus, Trash2, AlertCircle, CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react";
import { API_BASE_URL } from "@/config/env";

interface PQRSData {
  pqrs: Array<{
    id: string;
    tipo: string;
    estado: string;
    prioridad: string;
    descripcion: string;
    fecha_creacion?: string;
    respuesta?: string;
    fecha_resolucion?: string;
    empleada?: {
      nombre: string;
      apellido: string;
    };
    [key: string]: unknown;
  }>;
  estadisticas: {
    total: number;
    pendientes: number;
    en_proceso: number;
    resueltos: number;
    cerrados: number;
    por_tipo: Record<string, number>;
    por_prioridad: Record<string, number>;
  };
}

function PQRSPage() {
  const { t } = useTranslation();

  const TIPOS_PQRS = [
    { value: "peticion", label: t('cliente.pqrs.types.peticion'), color: "blue" },
    { value: "queja", label: t('cliente.pqrs.types.queja'), color: "red" },
    { value: "reclamo", label: t('cliente.pqrs.types.reclamo'), color: "orange" },
    { value: "sugerencia", label: t('cliente.pqrs.types.sugerencia'), color: "green" },
  ];

  const PRIORIDADES = [
    { value: "baja", label: t('cliente.pqrs.priorities.low'), color: "gray" },
    { value: "media", label: t('cliente.pqrs.priorities.medium'), color: "yellow" },
    { value: "alta", label: t('cliente.pqrs.priorities.high'), color: "red" },
  ];

  const [data, setData] = useState<PQRSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  
  // Form state
  const [formData, setFormData] = useState({
    tipo: "peticion",
    descripcion: "",
    prioridad: "media",
  });

  useEffect(() => {
    fetchPQRS();
  }, []);

  const fetchPQRS = async () => {
    setLoading(true);
    setError("");
    
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError(t('cliente.pqrs.errors.userNotFound'));
        return;
      }

      const user = JSON.parse(userStr);
      const response = await fetch(`${API_BASE_URL}/api/pqrs/usuario/${user.id}`);
      
      if (!response.ok) {
        throw new Error(t('cliente.pqrs.errors.loadError'));
      }

      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || t('cliente.pqrs.errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError(t('cliente.pqrs.errors.userNotFound'));
        return;
      }

      const user = JSON.parse(userStr);
      
      const response = await fetch(`${API_BASE_URL}/api/pqrs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: user.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error(t('cliente.pqrs.errors.createError'));
      }

      // Reset form and close modal
      setFormData({ tipo: "peticion", descripcion: "", prioridad: "media" });
      setShowCreateModal(false);
      
      // Refresh data
      fetchPQRS();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || t('cliente.pqrs.errors.createError'));
    }
  };

  const handleDelete = async (pqrsId: string) => {
    if (!confirm(t('cliente.pqrs.confirmDelete'))) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pqrs/${pqrsId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t('cliente.pqrs.errors.deleteError'));
      }

      fetchPQRS();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || t('cliente.pqrs.errors.deleteError'));
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "en_proceso":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case "resuelto":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cerrado":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "en_proceso":
        return "bg-blue-100 text-blue-800";
      case "resuelto":
        return "bg-green-100 text-green-800";
      case "cerrado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    const tipoObj = TIPOS_PQRS.find((t) => t.value === tipo);
    switch (tipoObj?.color) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      case "green":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFecha = (fechaISO: string | null) => {
    if (!fechaISO) return "N/A";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pqrsFiltrados = data?.pqrs.filter((pqrs) => {
    if (filtroEstado === "todos") return true;
    return pqrs.estado === filtroEstado;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4894AD]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-[#4894AD]" />
              {t('cliente.pqrs.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('cliente.pqrs.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#4894AD] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#3a7a91] transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('cliente.pqrs.newPQRS')}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">{t('cliente.pqrs.stats.total')}</div>
              <div className="text-2xl font-bold text-gray-900">{data.estadisticas.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">{t('cliente.pqrs.stats.pending')}</div>
              <div className="text-2xl font-bold text-yellow-600">{data.estadisticas.pendientes}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">{t('cliente.pqrs.stats.inProgress')}</div>
              <div className="text-2xl font-bold text-blue-600">{data.estadisticas.en_proceso}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">{t('cliente.pqrs.stats.resolved')}</div>
              <div className="text-2xl font-bold text-green-600">{data.estadisticas.resueltos}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroEstado === "todos"
                  ? "bg-[#4894AD] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t('cliente.pqrs.filters.all')}
            </button>
            <button
              onClick={() => setFiltroEstado("pendiente")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroEstado === "pendiente"
                  ? "bg-[#4894AD] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t('cliente.pqrs.filters.pending')}
            </button>
            <button
              onClick={() => setFiltroEstado("en_proceso")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroEstado === "en_proceso"
                  ? "bg-[#4894AD] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t('cliente.pqrs.filters.inProgress')}
            </button>
            <button
              onClick={() => setFiltroEstado("resuelto")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtroEstado === "resuelto"
                  ? "bg-[#4894AD] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t('cliente.pqrs.filters.resolved')}
            </button>
          </div>
        </div>

        {/* PQRS List */}
        <div className="space-y-4">
          {pqrsFiltrados.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{filtroEstado !== "todos" ? t('cliente.pqrs.emptyWithFilter', { status: t('common.statuses.' + filtroEstado) }) : t('cliente.pqrs.empty')}</p>
            </div>
          ) : (
            pqrsFiltrados.map((pqrs) => (
              <div key={pqrs.id} className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                {/* Botón oculto a la izquierda del card */}
                <div className="absolute left-0 inset-y-0 flex items-center gap-1 px-2 bg-gray-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={() => handleDelete(pqrs.id)}
                    className="p-2 rounded-lg bg-white shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Card content - se desliza a la derecha en hover */}
                <div className="relative z-10 bg-white p-6 transition-all duration-200 ease-out group-hover:translate-x-11 group-hover:mr-11">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getEstadoIcon(pqrs.estado)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(pqrs.tipo)}`}>
                          {TIPOS_PQRS.find((t) => t.value === pqrs.tipo)?.label || pqrs.tipo}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(pqrs.estado)}`}>
                          {t('common.statuses.' + pqrs.estado, pqrs.estado.replace("_", " "))}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(pqrs.prioridad)}`}>
                          {PRIORIDADES.find((p) => p.value === pqrs.prioridad)?.label || pqrs.prioridad}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {t('cliente.pqrs.createdLabel')} {pqrs.fecha_creacion ? formatFecha(pqrs.fecha_creacion) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('cliente.pqrs.descriptionLabel')}</h3>
                    <p className="text-gray-700">{pqrs.descripcion}</p>
                  </div>

                  {pqrs.respuesta && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">{t('cliente.pqrs.responseLabel')}</h3>
                      </div>
                      <p className="text-green-800">{pqrs.respuesta}</p>
                      {pqrs.fecha_resolucion && (
                        <p className="text-sm text-green-600 mt-2">
                          {t('cliente.pqrs.resolvedLabel')} {formatFecha(pqrs.fecha_resolucion)}
                        </p>
                      )}
                    </div>
                  )}

                  {pqrs.empleada && (
                    <div className="text-sm text-gray-600">
                      {t('cliente.pqrs.attendedBy')} {pqrs.empleada.nombre} {pqrs.empleada.apellido}
                    </div>
                  )}
                </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('cliente.pqrs.modal.title')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cliente.pqrs.modal.typeLabel')}
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4894AD]"
                    required
                  >
                    {TIPOS_PQRS.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cliente.pqrs.modal.priorityLabel')}
                  </label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4894AD]"
                    required
                  >
                    {PRIORIDADES.map((prioridad) => (
                      <option key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cliente.pqrs.modal.descriptionLabel')}
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4894AD]"
                    rows={6}
                    placeholder={t('cliente.pqrs.modal.descriptionPlaceholder')}
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ tipo: "peticion", descripcion: "", prioridad: "media" });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('cliente.pqrs.modal.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4894AD] text-white rounded-lg hover:bg-[#3a7a91] transition-colors"
                  >
                    {t('cliente.pqrs.modal.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withClienteRole(PQRSPage);