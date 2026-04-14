import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import AppSidebar, { type MenuItem, type UserInfo, type ThemeConfig } from "./AppSidebar";
import AppHeader from "./AppHeader";

interface AppLayoutProps {
  menuItems: MenuItem[];
  theme: ThemeConfig;
}

export default function AppLayout({ menuItems, theme }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Cerrar sidebar al redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && !target.closest(".relative")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.email,
          nombre_completo: `${data.nombre} ${data.apellido}`,
          iniciales: `${data.nombre[0]}${data.apellido[0]}`.toUpperCase(),
          ranking: data.ranking ?? undefined,
        });
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FCF9F1] overflow-hidden">
      <AppSidebar
        menuItems={menuItems}
        theme={theme}
        userInfo={userInfo}
        sidebarOpen={sidebarOpen}
        isLoggingOut={isLoggingOut}
        onCloseSidebar={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          theme={theme}
          userMenuOpen={userMenuOpen}
          isLoggingOut={isLoggingOut}
          onToggleUserMenu={() => setUserMenuOpen(!userMenuOpen)}
          onToggleSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export type { MenuItem, UserInfo, ThemeConfig };
