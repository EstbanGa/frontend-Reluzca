
import {
  Calendar,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/layout/AppLayout";
import type { MenuItem, ThemeConfig } from "@/components/layout/AppLayout";

export default function ClienteLayout() {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { href: "/cliente/reservas/index", icon: Calendar, label: t('cliente.menu.reservations') },
    { href: "/cliente/ubicaciones/index", icon: MapPin, label: t('cliente.menu.locations') },
  ];

  const theme: ThemeConfig = {
    gradient: "from-[#4894AD] to-[#D95B26]",
    textColor: "#FCF7F0",
    activeTextColor: "text-[#4894AD]",
    subtitle: t('cliente.theme.subtitle'),
    breadcrumbPrefix: t('cliente.theme.breadcrumbPrefix'),
    avatarGradient: "from-[#D95B26] to-[#4894AD]",
    focusRing: "focus:ring-[#4894AD]",
    profileRoute: "/cliente/perfil",
    notificationsRoute: "/cliente/notificaciones/index",
  };

  return <AppLayout menuItems={menuItems} theme={theme} />;
}