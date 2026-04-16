import type { ReactNode } from "react";

interface SlideRevealCardProps {
  /** Buttons rendered on the left side, revealed on hover */
  actions: ReactNode;
  /** Number of action buttons — controls card translation: 1→11, 2→20, 3→28 */
  buttonCount?: 1 | 2 | 3;
  /** Card content */
  children: ReactNode;
  /** Click handler for the card body */
  onClick?: () => void;
  /** Extra classes on the outer wrapper */
  className?: string;
}

const TRANSLATE: Record<number, string> = {
  1: "group-hover:translate-x-11 group-hover:mr-11",
  2: "group-hover:translate-x-20 group-hover:mr-20",
  3: "group-hover:translate-x-28 group-hover:mr-28",
};

export default function SlideRevealCard({ actions, buttonCount = 1, children, onClick, className }: SlideRevealCardProps) {
  return (
    <div className={`group relative rounded-xl overflow-hidden border border-gray-100 ${className ?? ""}`}>
      {/* Hidden buttons — left side, revealed on hover */}
      <div className="absolute left-0 inset-y-0 flex items-center gap-1 px-2 bg-gray-50 pointer-events-none group-hover:pointer-events-auto">
        {actions}
      </div>

      {/* Card content — slides right on hover */}
      <div
        className={`relative z-10 bg-white p-3 sm:p-4 transition-all duration-200 ease-out ${TRANSLATE[buttonCount] ?? TRANSLATE[1]} ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
}

interface SlideButtonProps {
  icon: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  hoverColor?: string;
}

export function SlideButton({ icon, onClick, title, hoverColor = "hover:bg-blue-50 hover:text-blue-600" }: SlideButtonProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={`p-2 rounded-lg bg-white shadow-sm text-gray-500 transition-colors ${hoverColor}`}
      title={title}
    >
      {icon}
    </button>
  );
}
