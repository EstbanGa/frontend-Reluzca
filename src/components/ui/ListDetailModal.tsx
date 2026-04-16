import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { RoleTheme } from "./ListPageHeader";

interface ListDetailModalProps {
  theme: RoleTheme;
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function ListDetailModal({ theme, open, onClose, title, subtitle, children }: ListDetailModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="modal-enter relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[#F5F0E7] text-lg truncate">{title}</h2>
            {subtitle && <p className="text-[#F5F0E7]/70 text-xs truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
