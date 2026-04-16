import type { ComponentType, MouseEvent } from "react";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export interface HoverAction {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: MouseEvent) => void;
  variant?: "primary" | "accent" | "danger" | "success" | "warning";
  /** Renderizar solo cuando se cumpla condición (default: true) */
  show?: boolean;
}

const VARIANT: Record<string, string> = {
  primary: "bg-[#195083] text-white hover:bg-[#0f3a5f]",
  accent:  "bg-[#4894AD] text-white hover:bg-[#3a7a8f]",
  danger:  "bg-red-500 text-white hover:bg-red-600",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
};

/* ─── Botones internos ───────────────────────────────────────────────────── */

function ActionButtons({ actions }: { actions: HoverAction[] }) {
  const visible = actions.filter((a) => a.show !== false);
  if (!visible.length) return null;

  return (
    <>
      {visible.map((a, i) => {
        const Icon = a.icon;
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); a.onClick(e); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shadow-sm transition-colors ${VARIANT[a.variant ?? "primary"]}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {a.label}
          </button>
        );
      })}
    </>
  );
}

/* ─── Para filas de tabla (<tr> debe tener class "group") ────────────────── */

export function TableRowActions({ actions }: { actions: HoverAction[] }) {
  const visible = actions.filter((a) => a.show !== false);
  if (!visible.length) return null;

  return (
    <td className="relative w-0 p-0" onClick={(e) => e.stopPropagation()}>
      <div className="absolute right-3 top-0 bottom-0 flex items-center gap-1.5 opacity-0 lg:translate-x-3 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all duration-200 ease-out z-10 max-sm:opacity-100 sm:max-lg:opacity-100">
        <ActionButtons actions={actions} />
      </div>
    </td>
  );
}

/* ─── Para tarjetas / divs (el contenedor padre debe tener class "group") ─ */

export function CardHoverActions({ actions, className = "" }: { actions: HoverAction[]; className?: string }) {
  const visible = actions.filter((a) => a.show !== false);
  if (!visible.length) return null;

  return (
    <div
      className={`flex items-center gap-1.5 lg:opacity-0 lg:translate-x-2 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all duration-200 ease-out ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ActionButtons actions={actions} />
    </div>
  );
}
