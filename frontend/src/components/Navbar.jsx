import { useState } from "react";
import { Menu, Bell, LogOut, ChevronDown, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import { usePersistentState } from "../hooks/usePersistentState";

export default function Navbar({ onMenuClick, basePath, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allNotifications] = usePersistentState("notifications");

  const studentClass = `${user?.course || "BCA"} ${user?.semester || "1st Semester"}`;

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

  const isGoogleAvatar = user?.avatar && typeof user.avatar === "string" && user.avatar.startsWith("http");
  const avatarInitials = (user?.name || "User").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-navy-600 hover:text-navy-900" onClick={onMenuClick}><Menu size={22} /></button>
        <h2 className="font-display font-semibold text-navy-900 text-lg hidden sm:block tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            className="relative p-2 rounded-xl hover:bg-white/80 text-navy-600 transition-colors border border-transparent hover:border-white/60 shadow-none hover:shadow-sm"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent-coral text-white text-[10px] flex items-center justify-center font-bold shadow-sm">{unread}</span>
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notificationsList} basePath={basePath} />
        </div>

        <div className="relative">
          <button className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl hover:bg-white/80 border border-transparent hover:border-white/80 transition-all shadow-none hover:shadow-sm" onClick={() => setMenuOpen((o) => !o)}>
            {isGoogleAvatar ? (
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-white/80 shadow-sm" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-navy-800 to-indigo-900 text-white text-xs font-semibold flex items-center justify-center shadow-sm">
                {user?.avatar || avatarInitials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-navy-900 leading-none">{user?.name || "User"}</p>
              <p className="text-[10px] text-teal-600 font-semibold mt-0.5 capitalize">{user?.role || "Account"}</p>
            </div>
            <ChevronDown size={14} className="text-navy-400 hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-glass-lg py-2 animate-fade-in border border-white/80">
              <div className="px-3.5 py-2 border-b border-surface-border mb-1">
                <p className="text-xs font-bold text-navy-900 truncate">{user?.name || "Account"}</p>
                <p className="text-[11px] text-navy-400 truncate">{user?.email || ""}</p>
              </div>

              <button
                onClick={() => { setMenuOpen(false); navigate(`${basePath}/profile`); }}
                className="w-full text-left px-3.5 py-2 text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2"
              >
                <UserIcon size={14} className="text-navy-400" /> My Profile
              </button>

              <button
                onClick={() => { setMenuOpen(false); navigate(`${basePath}/settings`); }}
                className="w-full text-left px-3.5 py-2 text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2"
              >
                <SettingsIcon size={14} className="text-navy-400" /> Settings
              </button>

              <div className="border-t border-surface-border mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-sm text-accent-coral hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
