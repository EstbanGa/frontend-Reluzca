
import {
  Users,
  Calendar,
  LayoutDashboard,
  FileText,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/layout/AppLayout";
import type { MenuItem, ThemeConfig } from "@/components/layout/AppLayout";

export default function AdminLayout() {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { href: "/admin/index", icon: LayoutDashboard, label: t('admin.menu.dashboard') },
    { href: "/admin/usuarios/index", icon: Users, label: t('admin.menu.users') },
    { href: "/admin/reservas/index", icon: Calendar, label: t('admin.menu.reservations') },
    { href: "/admin/planes/index", icon: CreditCard, label: t('admin.menu.plans') },
    { href: "/admin/pqrs/index", icon: FileText, label: t('admin.menu.pqrs') },
  ];

  const theme: ThemeConfig = {
    gradient: "from-[#195083] to-[#4894AD]",
    textColor: "#F5F0E7",
    activeTextColor: "text-[#195083]",
    subtitle: t('admin.theme.subtitle'),
    breadcrumbPrefix: t('admin.theme.breadcrumbPrefix'),
    avatarGradient: "from-[#4894AD] to-[#195083]",
    focusRing: "focus:ring-[#195083]",
    profileRoute: "/admin/configuracion/index",
    settingsRoute: "/admin/configuracion/index",
    notificationsRoute: "/admin/notificaciones/index",
  };

  return <AppLayout menuItems={menuItems} theme={theme} />;
}