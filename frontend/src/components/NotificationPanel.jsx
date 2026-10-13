import { Bell, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationPanel({ open, onClose, notifications = [], basePath }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 top-12 w-80 max-w-[90vw] card shadow-pop z-40 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <p className="font-semibold text-sm text-navy-900 flex items-center gap-2"><Bell size={15} /> Notifications</p>
        <button onClick={onClose} className="text-navy-400 hover:text-navy-700"><X size={15} /></button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <p className="text-sm text-navy-400 text-center py-8">You're all caught up.</p>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div key={n.id} className={`px-4 py-3 border-b border-surface-border last:border-0 ${!n.read ? "bg-navy-50/60" : ""}`}>
              <p className="text-sm font-medium text-navy-900">{n.title}</p>
              <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">{n.message}</p>
              <p className="text-[11px] text-navy-300 mt-1">{n.time}</p>
            </div>
          ))
        )}
      </div>
      <Link to={`${basePath}/notifications`} onClick={onClose} className="block text-center text-xs font-semibold text-navy-700 py-2.5 hover:bg-navy-50">
        View all notifications
      </Link>
    </div>
  );
}
