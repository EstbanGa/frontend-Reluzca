"use client";

import { useState, useEffect } from "react";
import { withAdminRole } from "@/hoc/withRole";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { formatDate, formatDateTime } from "@/lib/dateUtils";
import { 
  FileText, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  X
} from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface Empleada {
  id: string;
  nombre: string;
  apellido: string;
}

interface PQRS {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  respuesta: string | null;
  fecha_creacion: string | null;
  fecha_resolucion: string | null;
  created_at: string | null;
  usuario: Usuario | null;
  empleada: Empleada | null;
  reserva: { id: string; fecha?: string; [key: string]: unknown } | null;
}

interface PQRSResponse {
  message: string;
  pqrs: PQRS[];
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

const TIPOS_PQRS = [
  { value: "peticion", label: "Petición", color: "blue", icon: MessageSquare },
  { value: "queja", label: "Queja", color: "red", icon: AlertCircle },
  { value: "reclamo", label: "Reclamo", color: "orange", icon: XCircle },
  { value: "sugerencia", label: "Sugerencia", color: "green", icon: CheckCircle },
];

const ESTADOS = [
  { value: "todos", label: "Todos los estados" },
  { value: "pendiente", label: "Pendientes", color: "yellow" },
  { value: "en_proceso", label: "En Proceso", color: "blue" },
  { value: "resuelto", label: "Resueltos", color: "green" },
  { value: "cerrado", label: "Cerrados", color: "gray" },
];

const PRIORIDADES = [
  { value: "baja", label: "Baja", color: "gray" },
  { value: "media", label: "Media", color: "yellow" },
  { value: "alta", label: "Alta", color: "red" },
];

function AdminPQRS() {
  const [data, setData] = useState<PQRSResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pqrsFiltrados, setPqrsFiltrados] = useState<PQRS[]>([]);
  const [selectedPQRS, setSelectedPQRS] = useState<PQRS | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [respuestaText, setRespuestaText] = useState("");
  const [estadoRespuesta, setEstadoRespuesta] = useState("resuelto");
  const [respondiendo, setRespondiendo] = useState(false);
  const router = useRouter();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPQRS();
  }, []);

  useEffect(() => {
    if (data) {
      filtrarPQRS();
    }
  }, [data, filtroEstado, filtroPrioridad, busqueda]);

  const fetchPQRS = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${API_BASE_URL}/api/pqrs/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error al cargar PQRS:', err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const filtrarPQRS = () => {
    if (!data) return;

    let filtrados = [...data.pqrs];

    // Filtrar por estado
    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter(p => p.estado === filtroEstado);
    }

    // Filtrar por prioridad
    if (filtroPrioridad !== "todos") {
      filtrados = filtrados.filter(p => p.prioridad === filtroPrioridad);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        p =>
          p.descripcion?.toLowerCase().includes(busquedaLower) ||
          p.tipo?.toLowerCase().includes(busquedaLower) ||
          p.usuario?.nombre?.toLowerCase().includes(busquedaLower) ||
          p.usuario?.apellido?.toLowerCase().includes(busquedaLower) ||
          p.usuario?.email?.toLowerCase().includes(busquedaLower)
      );
    }

    setPqrsFiltrados(filtrados);
    setCurrentPage(1);
  };

  const handleResponder = (pqrs: PQRS) => {
    setSelectedPQRS(pqrs);
    setRespuestaText(pqrs.respuesta || "");
    setEstadoRespuesta(pqrs.estado === "pendiente" ? "en_proceso" : pqrs.estado);
    setShowModal(true);
  };

  const handleEnviarRespuesta = async () => {
    if (!selectedPQRS || !respuestaText.trim()) {
      alert("Por favor ingresa una respuesta");
      return;
    }

    try {
      setRespondiendo(true);
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        alert("No se encontró información del usuario");
        return;
      }

      const user = JSON.parse(userStr);

      const response = await fetch(`${API_BASE_URL}/api/pqrs/${selectedPQRS.id}/responder`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          respuesta: respuestaText,
          estado: estadoRespuesta,
          id_empleada: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar respuesta");
      }

      // Refrescar datos
      await fetchPQRS();
      setShowModal(false);
      setSelectedPQRS(null);
      setRespuestaText("");
      alert("Respuesta enviada exitosamente");
    } catch (err) {
      console.error("Error al responder:", err);
      alert("Error al enviar respuesta");
    } finally {
      setRespondiendo(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resuelto":
        return "bg-green-100 text-green-800 border-green-200";
      case "cerrado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="w-4 h-4" />;
      case "en_proceso":
        return <AlertCircle className="w-4 h-4" />;
      case "resuelto":
        return <CheckCircle className="w-4 h-4" />;
      case "cerrado":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baja":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTipoColor = (tipo: string) => {
    const tipoObj = TIPOS_PQRS.find(t => t.value === tipo);
    if (!tipoObj) return "bg-gray-100 text-gray-800";
    
    switch (tipoObj.color) {
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

  // formatDate ya importado de @/lib/dateUtils

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pqrsFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pqrsFiltrados.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#195083] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando PQRS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Error al cargar PQRS</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F0E7] mb-2">
              Gestión de PQRS
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
              Administra las peticiones, quejas, reclamos y sugerencias de los clientes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-[#195083]">
                {data?.estadisticas.total || 0}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                {data?.estadisticas.pendientes || 0}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">En Proceso</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">
                {data?.estadisticas.en_proceso || 0}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Resueltos</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {data?.estadisticas.resueltos || 0}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Cerrados</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-600">
                {data?.estadisticas.cerrados || 0}
              </p>
            </div>
          </div>
        </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por descripción, cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Filtro Estado */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent appearance-none cursor-pointer text-gray-900"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro Prioridad */}
            <div>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                <select
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent appearance-none cursor-pointer text-gray-900"
                >
                  <option value="todos">Todas las prioridades</option>
                  {PRIORIDADES.map((prioridad) => (
                    <option key={prioridad.value} value={prioridad.value}>
                      {prioridad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

      {/* Lista de PQRS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-700">No se encontraron PQRS</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((pqrs) => (
                    <tr key={pqrs.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(pqrs.tipo)}`}>
                          {TIPOS_PQRS.find(t => t.value === pqrs.tipo)?.label || pqrs.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {pqrs.usuario?.nombre} {pqrs.usuario?.apellido}
                            </p>
                            <p className="text-xs text-gray-600">{pqrs.usuario?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                          {pqrs.descripcion}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioridadColor(pqrs.prioridad)}`}>
                          {PRIORIDADES.find(p => p.value === pqrs.prioridad)?.label || pqrs.prioridad}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(pqrs.estado)}`}>
                          {getEstadoIcon(pqrs.estado)}
                          {ESTADOS.find(e => e.value === pqrs.estado)?.label || pqrs.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(pqrs.fecha_creacion)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleResponder(pqrs)}
                          className="text-[#195083] hover:text-[#2563eb] flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Responder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, pqrsFiltrados.length)} de {pqrsFiltrados.length} PQRS
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Modal de Respuesta */}
      {showModal && selectedPQRS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#195083]">Responder PQRS</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPQRS(null);
                    setRespuestaText("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Información del PQRS */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tipo</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(selectedPQRS.tipo)}`}>
                      {TIPOS_PQRS.find(t => t.value === selectedPQRS.tipo)?.label || selectedPQRS.tipo}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Prioridad</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioridadColor(selectedPQRS.prioridad)}`}>
                      {PRIORIDADES.find(p => p.value === selectedPQRS.prioridad)?.label || selectedPQRS.prioridad}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Cliente</p>
                  <p className="text-sm font-medium">
                    {selectedPQRS.usuario?.nombre} {selectedPQRS.usuario?.apellido} ({selectedPQRS.usuario?.email})
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
                  <p className="text-sm font-medium">{formatDate(selectedPQRS.fecha_creacion)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Descripción</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedPQRS.descripcion}</p>
                </div>
              </div>

              {/* Formulario de Respuesta */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={estadoRespuesta}
                  onChange={(e) => setEstadoRespuesta(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent"
                >
                  {ESTADOS.filter(e => e.value !== "todos").map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respuesta
                </label>
                <textarea
                  value={respuestaText}
                  onChange={(e) => setRespuestaText(e.target.value)}
                  rows={6}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent resize-none"
                />
              </div>

              {/* Respuesta anterior si existe */}
              {selectedPQRS.respuesta && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-blue-900 mb-2">Respuesta Anterior</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedPQRS.respuesta}</p>
                  {selectedPQRS.empleada && (
                    <p className="text-xs text-blue-600 mt-2">
                      Respondido por: {selectedPQRS.empleada.nombre} {selectedPQRS.empleada.apellido}
                    </p>
                  )}
                  {selectedPQRS.fecha_resolucion && (
                    <p className="text-xs text-blue-600">
                      Fecha: {formatDate(selectedPQRS.fecha_resolucion)}
                    </p>
                  )}
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPQRS(null);
                    setRespuestaText("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarRespuesta}
                  disabled={respondiendo || !respuestaText.trim()}
                  className="px-6 py-2 bg-[#195083] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {respondiendo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Respuesta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminPQRS);