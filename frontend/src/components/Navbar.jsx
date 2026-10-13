import { useState } from "react";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import { currentStudent } from "../data/mockData";
import { usePersistentState } from "../hooks/usePersistentState";

const studentClass = `${currentStudent.course} ${currentStudent.semester}`;

export default function Navbar({ onMenuClick, basePath, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allNotifications] = usePersistentState("notifications");

  // Same scoping rule the Notifications pages already use: students only
  // see class-scoped items (or unscoped general ones); other roles see all.
  const notificationsList =
    user?.role === "student"
      ? allNotifications.filter((n) => !n.classId || n.classId === studentClass)
      : allNotifications;
  const unread = notificationsList.filter((n) => !n.read).length;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-surface-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-navy-600" onClick={onMenuClick}><Menu size={22} /></button>
        <h2 className="font-display font-semibold text-navy-900 text-lg hidden sm:block">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            className="relative p-2 rounded-xl hover:bg-navy-50 text-navy-600"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent-coral text-white text-[10px] flex items-center justify-center">{unread}</span>
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notificationsList} basePath={basePath} />
        </div>

        <div className="relative">
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-navy-50" onClick={() => setMenuOpen((o) => !o)}>
            <div className="h-8 w-8 rounded-full bg-navy-800 text-white text-xs font-semibold flex items-center justify-center">
              {user?.avatar || user?.name?.slice(0, 2)?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-navy-800 leading-none">{user?.name}</p>
              <p className="text-[10px] text-navy-400 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-navy-400 hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-44 card shadow-pop py-1.5 animate-fade-in">
              <button
                onClick={() => { setMenuOpen(false); navigate(`${basePath}/settings`); }}
                className="w-full text-left px-3.5 py-2 text-sm text-navy-700 hover:bg-navy-50"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-sm text-accent-coral hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
