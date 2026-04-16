import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Menu, User, LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { ThemeConfig } from "./AppSidebar";

interface AppHeaderProps {
  theme: ThemeConfig;
  userMenuOpen: boolean;
  isLoggingOut: boolean;
  onToggleUserMenu: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function AppHeader({
  theme,
  userMenuOpen,
  isLoggingOut,
  onToggleUserMenu,
  onToggleSidebar,
  onLogout,
}: AppHeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getPageTitle = () => {
    const basePaths: Record<string, string> = {
      "/admin/index": t("common.breadcrumb.dashboard"),
      "/cliente/index": t("common.breadcrumb.home"),
      "/empleada/index": t("common.breadcrumb.home"),
    };
    if (basePaths[pathname]) return basePaths[pathname];
    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0">
            <span className="hidden sm:inline">{theme.breadcrumbPrefix}</span>
            <span className="hidden sm:inline mx-2">/</span>
            <span className={`${theme.activeTextColor} font-medium truncate`}>
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <LanguageSwitcher />

          {theme.notificationsRoute && (
            <button
              onClick={() => navigate(theme.notificationsRoute!)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={t("common.notifications")}
            >
              <Bell size={18} className="sm:w-5 sm:h-5 text-gray-600" />
            </button>
          )}

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={onToggleUserMenu}
              className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${theme.avatarGradient} rounded-full flex items-center justify-center hover:shadow-lg transition-all focus:outline-none focus:ring-2 ${theme.focusRing} focus:ring-offset-2`}
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
                    onToggleUserMenu();
                    navigate(theme.profileRoute);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <User size={16} />
                  {t("common.myProfile")}
                </button>

                <button
                  onClick={() => {
                    onToggleUserMenu();
                    onLogout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? t("common.loggingOut") : t("common.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
