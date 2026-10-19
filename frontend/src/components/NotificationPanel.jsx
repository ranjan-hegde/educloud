import { Bell, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationPanel({ open, onClose, notifications = [], basePath }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 top-11 w-80 max-w-[90vw] card shadow-2xl z-50 animate-fade-in overflow-hidden border border-white/70 dark:border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
        <p className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
          <Bell size={14} className="text-blue-500" /> Notifications
        </p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-black/5 dark:divide-white/5">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">You're all caught up.</p>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className={`px-4 py-2.5 transition-colors ${
                !n.read ? "bg-blue-500/5 dark:bg-blue-500/10" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
            </div>
          ))
        )}
      </div>
      <Link
        to={`${basePath}/notifications`}
        onClick={onClose}
        className="block text-center text-xs font-medium text-blue-600 dark:text-blue-400 py-2 border-t border-black/5 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
      >
        View all notifications
      </Link>
    </div>
  );
}
