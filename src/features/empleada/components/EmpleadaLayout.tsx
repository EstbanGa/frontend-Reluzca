
import {
  Home,
  Calendar,
  Star,
  Bell,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/layout/AppLayout";
import type { MenuItem, ThemeConfig } from "@/components/layout/AppLayout";

export default function EmpleadaLayout() {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { href: "/empleada/index", icon: Home, label: t('empleada.menu.home') },
    { href: "/empleada/reservas/index", icon: Calendar, label: t('empleada.menu.services') },
    { href: "/empleada/calificaciones/index", icon: Star, label: t('empleada.menu.ratings') },
    { href: "/empleada/notificaciones/index", icon: Bell, label: t('empleada.menu.notifications') },
  ];

  const theme: ThemeConfig = {
    gradient: "from-[#D95B26] to-[#195083]",
    textColor: "#FCF7F0",
    activeTextColor: "text-[#D95B26]",
    subtitle: t('empleada.theme.subtitle'),
    breadcrumbPrefix: t('empleada.theme.breadcrumbPrefix'),
    avatarGradient: "from-[#D95B26] to-[#195083]",
    focusRing: "focus:ring-[#D95B26]",
    profileRoute: "/empleada/perfil",
  };

  return <AppLayout menuItems={menuItems} theme={theme} />;
}