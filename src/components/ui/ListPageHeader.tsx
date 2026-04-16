import type { ReactNode } from "react";

export interface RoleTheme {
  gradientFrom: string;
  gradientTo: string;
  primaryColor: string;
}

export const ROLE_THEMES = {
  admin:    { gradientFrom: "#195083", gradientTo: "#0f3a5f", primaryColor: "#195083" },
  cliente:  { gradientFrom: "#4894AD", gradientTo: "#D95B26", primaryColor: "#4894AD" },
  empleada: { gradientFrom: "#D95B26", gradientTo: "#4894AD", primaryColor: "#D95B26" },
} as const;

interface ListPageHeaderProps {
  theme: RoleTheme;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function ListPageHeader({ theme, title, subtitle, icon, actions, children }: ListPageHeaderProps) {
  return (
    <div
      className="rounded-xl p-5 sm:p-7 text-white"
      style={{ background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0E7] mb-1 flex items-center gap-2">
            {icon}
            {title}
          </h1>
          {subtitle && <p className="text-[#F5F0E7]/80 text-sm">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
