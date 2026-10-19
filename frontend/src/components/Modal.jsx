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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/65 backdrop-blur-md animate-fade-in">
      <div className={`card w-full ${sizes[size]} max-h-[90vh] flex flex-col shadow-2xl border border-white/80 dark:border-white/10`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white font-display tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto scrollbar-thin text-slate-800 dark:text-slate-200">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-black/5 dark:border-white/10 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
