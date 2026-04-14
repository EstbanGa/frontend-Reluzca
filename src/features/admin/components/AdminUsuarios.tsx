
import { useState, useEffect } from "react";
import { withAdminRole } from "@/components/common/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate, formatDateTime, formatTime, formatDateForModal } from "@/utils/dateUtils";
import { API_BASE_URL } from "@/config/env";
import { 
  Users, 
  Search,
  Crown,
  UserCheck,
  Briefcase,
  Edit3,
  Eye,
  X,
  RefreshCw,
  AlertCircle,
  Trash2,
  Square,
  CheckSquare,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  UserX,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: string;
  ranking?: number;
  fecha_registro?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  estadisticas?: {
    total_reservas?: number;
    gasto_total?: number;
    total_servicios?: number;
    ingresos_generados?: number;
    [key: string]: string | number | boolean | null | undefined;
  };
}

interface UsuariosData {
  admins: Usuario[];
  clientes: Usuario[];
  empleadas: Usuario[];
  estadisticas: {
    total: number;
    admins: number;
    clientes: number;
    empleadas: number;
    activos: number;
    inactivos: number;
  };
}

// Configuraciones de roles
const ROL_CONFIGS = {
  admin: {
    label: 'Administradores',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  cliente: {
    label: 'Clientes',
    icon: UserCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  empleada: {
    label: 'Empleadas',
    icon: Briefcase,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
} as const;

type RolType = keyof typeof ROL_CONFIGS;

function AdminUsuarios() {
  const [data, setData] = useState<UsuariosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [searchTerms, setSearchTerms] = useState({
    admin: '',
    cliente: '',
    empleada: ''
  });
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    admin: true,
    cliente: false,
    empleada: false
  });
  const [selectedUsuarios, setSelectedUsuarios] = useState<{[key: string]: string[]}>({
    admin: [],
    cliente: [],
    empleada: []
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsuarios();
  }, []);

  const fetchAllUsuarios = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("access_token");
      
      // Hacer 3 requests paralelos para cada rol
      const [adminsResponse, clientesResponse, empleadasResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/usuarios/rol/admin`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/api/usuarios/rol/cliente`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/api/usuarios/rol/empleada`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      if (!adminsResponse.ok || !clientesResponse.ok || !empleadasResponse.ok) {
        throw new Error(t('admin.users.errors.loadError'));
      }

      const [adminsData, clientesData, empleadasData] = await Promise.all([
        adminsResponse.json(),
        clientesResponse.json(),
        empleadasResponse.json()
      ]);

      // Usar las estadísticas de cualquiera de las respuestas (deberían ser iguales)
      const estadisticas = clientesData.estadisticas;

      setData({
        admins: adminsData.usuarios,
        clientes: clientesData.usuarios,
        empleadas: empleadasData.usuarios,
        estadisticas
      });
      setError(null);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (rol: RolType, searchTerm: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [rol]: searchTerm
    }));
  };

  const handleSelectUsuario = (rol: RolType, id: string) => {
    setSelectedUsuarios(prev => ({
      ...prev,
      [rol]: prev[rol].includes(id) 
        ? prev[rol].filter(item => item !== id)
        : [...prev[rol], id]
    }));
  };

  const handleSelectAll = (rol: RolType, usuarios: Usuario[]) => {
    const currentSelected = selectedUsuarios[rol];
    if (currentSelected.length === usuarios.length) {
      setSelectedUsuarios(prev => ({
        ...prev,
        [rol]: []
      }));
    } else {
      setSelectedUsuarios(prev => ({
        ...prev,
        [rol]: usuarios.map(u => u.id)
      }));
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(t('admin.users.confirmDelete', { count: ids.length }))) {
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario/admin/usuarios/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      alert(result.message);
      
      await fetchAllUsuarios();
      setSelectedUsuarios({ admin: [], cliente: [], empleada: [] });
    } catch (err) {
      console.error('Error al eliminar usuarios:', err);
      alert(err instanceof Error ? err.message : t('admin.users.errors.deleteError'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCreated = (dateString: string | null | undefined) => {
    if (!dateString) return t('common.noData');
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'activo':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: UserCheck,
          label: t('common.active')
        };
      case 'inactivo':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: UserX,
          label: t('common.inactive')
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: UserCheck,
          label: estado
        };
    }
  };

  const openModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
  };

  const handleEditUsuario = (id: string) => {
    // navigate(`/admin/usuarios/editar/${id}`);
    navigate(`/admin/usuarios/editar`);
  };

  const renderUsuarioStats = (usuario: Usuario) => {
    if (!usuario.estadisticas) return null;

    const stats = usuario.estadisticas;

    switch (usuario.rol) {
      case 'cliente':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">{t('admin.users.stats.reservations')}</p>
              <p className="text-sm font-bold text-blue-600">{stats.total_reservas || 0}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-xs text-gray-600">{t('admin.users.stats.spent')}</p>
              <p className="text-xs font-bold text-green-600">{formatCurrency(stats.gasto_total || 0)}</p>
            </div>
          </div>
        );
      case 'empleada':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-xs text-gray-600">{t('admin.users.stats.services')}</p>
              <p className="text-sm font-bold text-green-600">{stats.total_servicios || 0}</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">{t('admin.users.stats.revenue')}</p>
              <p className="text-xs font-bold text-blue-600">{formatCurrency(stats.ingresos_generados || 0)}</p>
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-purple-50 rounded">
              <p className="text-xs text-gray-600">{t('admin.users.stats.users')}</p>
              <p className="text-sm font-bold text-purple-600">{stats.total_usuarios_sistema || 0}</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <p className="text-xs text-gray-600">{t('admin.users.stats.reservations')}</p>
              <p className="text-sm font-bold text-orange-600">{stats.total_reservas_sistema || 0}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    const allUsuarios = [...data.admins, ...data.clientes, ...data.empleadas];
    const headers = ['nombre', 'apellido', 'correo', 'telefono', 'rol', 'estado', 'ranking', 'fecha_registro', 'fecha_nacimiento', 'genero', 'direccion'];
    const rows = allUsuarios.map(u => [
      u.nombre,
      u.apellido,
      u.correo,
      u.telefono || '',
      u.rol,
      u.estado,
      u.ranking != null ? String(u.ranking) : '',
      u.fecha_registro || '',
      u.fecha_nacimiento || '',
      u.genero || '',
      u.direccion || ''
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios_reluzca_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterUsuarios = (usuarios: Usuario[], searchTerm: string) => {
    if (!searchTerm) return usuarios;
    return usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.telefono && usuario.telefono.includes(searchTerm))
    );
  };

  const renderUsuarioSection = (rol: RolType, usuarios: Usuario[], title: string) => {
    const config = ROL_CONFIGS[rol];
    const IconComponent = config.icon;
    const filteredUsuarios = filterUsuarios(usuarios, searchTerms[rol]);
    const selectedIds = selectedUsuarios[rol];
    const isExpanded = expandedSections[rol];

    const toggleSection = () => {
      setExpandedSections(prev => ({ ...prev, [rol]: !prev[rol] }));
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header de la sección - Clickeable para expandir/colapsar */}
        <div 
          className={`p-4 sm:p-6 border-b border-gray-200 ${config.bgColor} cursor-pointer transition-colors hover:opacity-90`}
          onClick={toggleSection}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconComponent className={`h-6 w-6 ${config.color}`} />
              <div>
                <h2 className={`text-lg sm:text-xl font-bold ${config.color} flex items-center gap-2`}>
                  {title} ({filteredUsuarios.length})
                  {isExpanded ? (
                    <ChevronUp className={`h-5 w-5 ${config.color}`} />
                  ) : (
                    <ChevronDown className={`h-5 w-5 ${config.color}`} />
                  )}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredUsuarios.length !== usuarios.length && 
                    `${filteredUsuarios.length} ${t('admin.users.of')} ${usuarios.length} ${t('admin.users.shown')}`}
                </p>
              </div>
            </div>
            
            {/* Acciones de selección múltiple */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className={`text-sm font-medium ${config.color}`}>
                  {selectedIds.length} {t('admin.users.selected')}
                </span>
                <button
                  onClick={() => setSelectedUsuarios(prev => ({ ...prev, [rol]: [] }))}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {t('admin.users.clear')}
                </button>
                <button
                  onClick={() => handleDelete(selectedIds)}
                  disabled={deleteLoading}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {t('common.delete')}
                </button>
              </div>
            )}
          </div>

          {/* Búsqueda por sección */}
          {isExpanded && (
            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('admin.users.searchPlaceholder', { role: title.toLowerCase() })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195083] focus:border-transparent text-sm"
                  value={searchTerms[rol]}
                  onChange={(e) => handleSearch(rol, e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lista de usuarios - Solo visible cuando está expandido */}
        {isExpanded && (
          <div className="p-4 sm:p-6">
          {filteredUsuarios.length > 0 ? (
            <div className="space-y-3">
              {/* Header con selección múltiple */}
              <div className={`rounded-lg p-3 flex items-center gap-3 ${config.bgColor}`}>
                <button
                  onClick={() => handleSelectAll(rol, filteredUsuarios)}
                  className="p-1 hover:bg-white/50 rounded"
                >
                  {selectedIds.length === filteredUsuarios.length && filteredUsuarios.length > 0 ? (
                    <CheckSquare className={`h-5 w-5 ${config.color}`} />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <span className={`text-sm font-medium ${config.color}`}>
                  {t('admin.users.selectAll')} ({filteredUsuarios.length})
                </span>
              </div>

              {filteredUsuarios.map((usuario) => {
                const estadoConfig = getEstadoConfig(usuario.estado);
                const StatusIcon = estadoConfig.icon;
                const isSelected = selectedIds.includes(usuario.id);
                
                return (
                  <div key={usuario.id} className={`bg-gray-50 rounded-xl p-4 border transition-all ${isSelected ? `${config.borderColor} ${config.bgColor}` : 'border-gray-200 hover:shadow-sm'}`}>
                    <div className="space-y-3">
                      {/* Header del usuario */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => handleSelectUsuario(rol, usuario.id)}
                            className="p-1 hover:bg-gray-200 rounded mt-1 flex-shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className={`h-5 w-5 ${config.color}`} />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          
                          <div className={`p-2 rounded-lg flex-shrink-0 bg-white`}>
                            <IconComponent className={`h-5 w-5 ${config.color}`} />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-base">
                                {usuario.nombre} {usuario.apellido}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                {estadoConfig.label}
                              </span>
                              {usuario.rol === 'empleada' && usuario.ranking && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-600">{usuario.ranking}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                <span>{usuario.correo}</span>
                              </div>
                              {usuario.telefono && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{usuario.telefono}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>{t('admin.users.registered')}: {formatCreated(usuario.fecha_registro)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openModal(usuario)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('admin.users.viewDetails')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditUsuario(usuario.id)}
                            className="p-2 text-gray-400 hover:text-[#195083] hover:bg-[#195083]/10 rounded-lg transition-colors"
                            title={t('admin.users.editUser')}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete([usuario.id])}
                            disabled={deleteLoading}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title={t('admin.users.deleteUser')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {usuario.direccion && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">{t('common.address')}</p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {usuario.direccion}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {usuario.fecha_nacimiento && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">{t('admin.users.birthDate')}</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(usuario.fecha_nacimiento)}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {usuario.genero && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-600">{t('admin.users.gender')}</p>
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {usuario.genero}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Estadísticas del usuario */}
                      {renderUsuarioStats(usuario)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center ${config.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${config.color}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {searchTerms[rol] ? t('admin.users.noUsersFound') : t('admin.users.noUsersInRole', { role: title.toLowerCase() })}
              </h3>
              <p className="text-sm text-gray-600">
                {searchTerms[rol] 
                  ? t('admin.users.tryDifferentSearch')
                  : t('admin.users.noUsersRegistered', { role: title.toLowerCase() })
                }
              </p>
            </div>
          )}
        </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#195083]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('admin.users.errors.loadError')}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAllUsuarios}
          className="bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm sm:text-base flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#195083] to-[#0f3a5f] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F0E7] mb-2">
              {t('admin.users.title')}
            </h1>
            <p className="text-[#F5F0E7]/80 text-sm sm:text-base">
              {t('admin.users.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={!data}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {t('admin.users.exportCSV')}
            </button>
            <button
              onClick={() => navigate('/admin/usuarios/crear')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Users className="h-4 w-4" />
              {t('admin.users.createUser')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Generales - Tamaño Reducido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-0.5">{t('common.total')}</p>
            <p className="text-base sm:text-xl font-bold text-[#195083]">
              {data?.estadisticas.total || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-0.5">{t('admin.users.admins')}</p>
            <p className="text-base sm:text-xl font-bold text-purple-600">
              {data?.estadisticas.admins || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-0.5">{t('admin.users.clients')}</p>
            <p className="text-base sm:text-xl font-bold text-blue-600">
              {data?.estadisticas.clientes || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-0.5">{t('admin.users.employees')}</p>
            <p className="text-base sm:text-xl font-bold text-green-600">
              {data?.estadisticas.empleadas || 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100 col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-0.5">{t('common.active')}</p>
            <p className="text-base sm:text-xl font-bold text-green-500">
              {data?.estadisticas.activos || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Las 3 secciones de usuarios */}
      {data && (
        <div className="space-y-8">
          {renderUsuarioSection('admin', data.admins, t('admin.users.administrators'))}
          {renderUsuarioSection('cliente', data.clientes, t('admin.users.clients'))}
          {renderUsuarioSection('empleada', data.empleadas, t('admin.users.employees'))}
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedUsuario && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${ROL_CONFIGS[selectedUsuario.rol as keyof typeof ROL_CONFIGS]?.bgColor || 'bg-gray-100'}`}>
                    {(() => {
                      const IconComponent = ROL_CONFIGS[selectedUsuario.rol as keyof typeof ROL_CONFIGS]?.icon || Users;
                      const colorClass = ROL_CONFIGS[selectedUsuario.rol as keyof typeof ROL_CONFIGS]?.color || 'text-gray-600';
                      return <IconComponent className={`h-6 w-6 ${colorClass}`} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedUsuario.nombre} {selectedUsuario.apellido}
                    </h2>
                    <p className="text-gray-600 capitalize">{selectedUsuario.rol}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{t('admin.users.modal.personalInfo')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{selectedUsuario.correo}</span>
                    </div>
                    {selectedUsuario.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{selectedUsuario.telefono}</span>
                      </div>
                    )}
                    {selectedUsuario.fecha_nacimiento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{formatDate(selectedUsuario.fecha_nacimiento)}</span>
                      </div>
                    )}
                    {selectedUsuario.genero && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900 capitalize">{selectedUsuario.genero}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{t('admin.users.modal.systemStatus')}</h4>
                  <div className="space-y-2">
                    {(() => {
                      const estadoConfig = getEstadoConfig(selectedUsuario.estado);
                      const StatusIcon = estadoConfig.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-gray-500" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                            {estadoConfig.label}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="text-sm text-gray-600">
                      <p>{t('admin.users.registered')}: {formatCreated(selectedUsuario.fecha_registro)}</p>
                      {selectedUsuario.last_login && (
                        <p>{t('admin.users.modal.lastAccess')}: {formatCreated(selectedUsuario.last_login)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              {selectedUsuario.direccion && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('common.address')}
                  </h4>
                  <p className="text-gray-700">{selectedUsuario.direccion}</p>
                </div>
              )}

              {/* Estadísticas detalladas */}
              {selectedUsuario.estadisticas && Object.keys(selectedUsuario.estadisticas).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('admin.users.modal.statistics')}
                  </h4>
                  
                  {selectedUsuario.rol === 'cliente' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.totalReservations')}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {selectedUsuario.estadisticas.total_reservas || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.completed')}</p>
                        <p className="text-lg font-bold text-green-600">
                          {selectedUsuario.estadisticas.reservas_completadas || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.cancelled')}</p>
                        <p className="text-lg font-bold text-red-600">
                          {selectedUsuario.estadisticas.reservas_canceladas || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.totalSpent')}</p>
                        <p className="text-sm font-bold text-yellow-600">
                          {formatCurrency(selectedUsuario.estadisticas.gasto_total || 0)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedUsuario.rol === 'empleada' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.stats.services')}</p>
                        <p className="text-lg font-bold text-green-600">
                          {selectedUsuario.estadisticas.total_servicios || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.completedServices')}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {selectedUsuario.estadisticas.servicios_completados || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.pendingServices')}</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {selectedUsuario.estadisticas.servicios_pendientes || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.stats.revenue')}</p>
                        <p className="text-sm font-bold text-purple-600">
                          {formatCurrency(selectedUsuario.estadisticas.ingresos_generados || 0)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedUsuario.rol === 'admin' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.totalUsers')}</p>
                        <p className="text-lg font-bold text-purple-600">
                          {selectedUsuario.estadisticas.total_usuarios_sistema || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.totalReservations')}</p>
                        <p className="text-lg font-bold text-orange-600">
                          {selectedUsuario.estadisticas.total_reservas_sistema || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.usersToday')}</p>
                        <p className="text-lg font-bold text-green-600">
                          {selectedUsuario.estadisticas.usuarios_creados_hoy || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">{t('admin.users.modal.reservationsToday')}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {selectedUsuario.estadisticas.reservas_creadas_hoy || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ranking para empleadas */}
              {selectedUsuario.rol === 'empleada' && selectedUsuario.ranking && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {t('admin.users.modal.rating')}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= selectedUsuario.ranking!
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-yellow-600">
                      {selectedUsuario.ranking.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    closeModal();
                    handleEditUsuario(selectedUsuario.id);
                  }}
                  className="flex-1 bg-[#195083] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a5f] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {t('admin.users.editUser')}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminRole(AdminUsuarios);