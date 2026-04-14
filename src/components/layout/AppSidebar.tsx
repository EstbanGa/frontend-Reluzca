import { Link, useLocation } from "react-router-dom";
import { X, LogOut, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export interface UserInfo {
  nombre: string;
  apellido: string;
  correo: string;
  nombre_completo: string;
  iniciales: string;
  ranking?: number;
}

export interface ThemeConfig {
  gradient: string;       // e.g. "from-[#195083] to-[#4894AD]"
  textColor: string;      // e.g. "#F5F0E7"
  activeTextColor: string; // e.g. "text-[#195083]"
  subtitle: string;       // e.g. "Panel de Administración"
  breadcrumbPrefix: string; // e.g. "Administración"
  avatarGradient: string;  // e.g. "from-[#4894AD] to-[#195083]"
  focusRing: string;       // e.g. "focus:ring-[#195083]"
  profileRoute: string;    // e.g. "/admin/perfil"
  settingsRoute?: string;  // e.g. "/admin/configuracion/index"
  notificationsRoute?: string; // e.g. "/admin/notificaciones/index"
}

interface AppSidebarProps {
  menuItems: MenuItem[];
  theme: ThemeConfig;
  userInfo: UserInfo | null;
  sidebarOpen: boolean;
  isLoggingOut: boolean;
  onCloseSidebar: () => void;
  onLogout: () => void;
}

export default function AppSidebar({
  menuItems,
  theme,
  userInfo,
  sidebarOpen,
  isLoggingOut,
  onCloseSidebar,
  onLogout,
}: AppSidebarProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-72 xl:w-80
          bg-gradient-to-b ${theme.gradient}
          text-white flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1
                className="font-extrabold text-xl sm:text-2xl tracking-wide truncate"
                style={{ color: theme.textColor }}
              >
                Reluzca
              </h1>
              <p
                className="text-xs sm:text-sm mt-1 truncate"
                style={{ color: `${theme.textColor}cc` }}
              >
                {theme.subtitle}
              </p>
            </div>
            <button
              onClick={onCloseSidebar}
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
              to={item.href}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-sm sm:text-base
                ${
                  isActive(item.href)
                    ? `bg-[${theme.textColor}] ${theme.activeTextColor} shadow-lg font-semibold`
                    : `hover:bg-white/10 hover:text-white`
                }
              `}
              style={
                isActive(item.href)
                  ? { backgroundColor: theme.textColor }
                  : { color: theme.textColor }
              }
              onClick={onCloseSidebar}
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
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white/90 to-white rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span className={`${theme.activeTextColor} text-xs sm:text-sm font-bold`}>
                    {userInfo.iniciales}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-medium text-sm truncate"
                    style={{ color: theme.textColor }}
                  >
                    {userInfo.nombre_completo}
                  </p>
                  {userInfo.ranking != null && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs" style={{ color: `${theme.textColor}b3` }}>
                        {Number(userInfo.ranking).toFixed(1)}
                      </span>
                    </div>
                  )}
                  <p
                    className="text-xs truncate"
                    style={{ color: `${theme.textColor}b3` }}
                  >
                    {userInfo.correo}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className={`
              flex items-center gap-3 p-3 w-full rounded-lg
              hover:bg-white/10 hover:text-white transition-colors text-sm sm:text-base
              ${isLoggingOut ? "opacity-50 cursor-not-allowed" : ""}
            `}
            style={{ color: `${theme.textColor}cc` }}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>{isLoggingOut ? t('common.loggingOut') : t('common.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
