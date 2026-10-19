import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
      <div className={`card w-full ${sizes[size]} max-h-[90vh] flex flex-col shadow-pop`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h3 className="text-base font-semibold text-navy-900 font-display">{title}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 p-1 rounded-lg hover:bg-navy-50">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-surface-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
