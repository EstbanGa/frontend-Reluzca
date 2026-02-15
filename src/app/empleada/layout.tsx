"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home,
  Calendar, 
  MapPin, 
  Star,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Clock,
  CheckCircle
} from "lucide-react";

interface UserInfo {
  nombre: string;
  apellido: string;
  correo: string;
  nombre_completo: string;
  iniciales: string;
  ranking?: number;
}

export default function EmpleadaLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  // Menú simplificado para empleadas
  const menuItems = [
    { href: "/empleada/index", icon: Home, label: "Inicio" },
    { href: "/empleada/reservas/index", icon: Calendar, label: "Mis Servicios" },
    { href: "/empleada/calificaciones/index", icon: Star, label: "Calificaciones" },
    { href: "/empleada/notificaciones/index", icon: Bell, label: "Notificaciones" },
  ];

  // Obtener información del usuario al cargar el componente
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Los datos vienen directamente, no dentro de data.user
        const userInfoFormatted = {
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.email || data.correo,
          nombre_completo: `${data.nombre} ${data.apellido}`,
          iniciales: `${data.nombre[0]}${data.apellido[0]}`.toUpperCase(),
          ranking: data.ranking
        };
        setUserInfo(userInfoFormatted);
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // FastAPI no tiene endpoint de logout - el logout es client-side
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/auth//login');
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Cerrar sidebar al hacer click fuera o al redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && !target.closest('.relative')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const getPageTitle = () => {
    if (pathname === '/empleada/index') return 'Inicio';
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  return (
    <div className="flex h-screen bg-[#FCF9F1] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-72 xl:w-80
        bg-gradient-to-b from-[#D95B26] to-[#195083] 
        text-white flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-xl sm:text-2xl text-[#FCF7F0] tracking-wide truncate">
                Reluzca
              </h1>
              <p className="text-[#FCF7F0]/80 text-xs sm:text-sm mt-1 truncate">Panel Empleada</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-sm sm:text-base
                ${isActive(item.href) 
                  ? 'bg-[#FCF7F0] text-[#D95B26] shadow-lg font-semibold' 
                  : 'text-[#FCF7F0] hover:bg-white/10 hover:text-white'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 sm:p-4 border-t border-white/20">
          {userInfo && (
            <div className="mb-3 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FCF7F0] to-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#D95B26] text-xs sm:text-sm font-bold">
                    {userInfo.iniciales}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#FCF7F0] font-medium text-sm truncate">
                    {userInfo.nombre_completo}
                  </p>
                  {userInfo.ranking && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-[#FCF7F0]/70 text-xs">{userInfo.ranking.toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-[#FCF7F0]/70 text-xs truncate">
                    {userInfo.correo}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              flex items-center gap-3 p-3 w-full rounded-lg text-[#FCF7F0]/80 
              hover:bg-white/10 hover:text-white transition-colors text-sm sm:text-base
              ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
                <span className="hidden sm:inline">Panel Empleada</span>
                <span className="hidden sm:inline mx-2">/</span>
                <span className="text-[#D95B26] font-medium truncate">
                  {getPageTitle()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Mobile user avatar */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#D95B26] to-[#195083] rounded-full flex items-center justify-center hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D95B26] focus:ring-offset-2"
                >
                  <span className="text-white">
                    <User size={16} className="sm:w-5 sm:h-5" />
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/empleada/perfil');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User size={16} />
                      Mi Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <LogOut size={16} />
                      {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}