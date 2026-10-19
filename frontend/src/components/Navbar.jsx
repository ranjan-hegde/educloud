import { useState } from "react";
import { Menu, Bell, LogOut, ChevronDown, User as UserIcon, Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import { usePersistentState } from "../hooks/usePersistentState";

export default function Navbar({ onMenuClick, basePath, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allNotifications] = usePersistentState("notifications");

  const studentClass = `${user?.course || "BCA"} ${user?.semester || "1st Semester"}`;

  const safeNotifications = Array.isArray(allNotifications) ? allNotifications : [];
  const notificationsList =
    user?.role === "student"
      ? safeNotifications.filter((n) => !n.classId || n.classId === studentClass)
      : safeNotifications;
  const unread = notificationsList.filter((n) => !n.read).length;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const isGoogleAvatar = user?.avatar && typeof user.avatar === "string" && user.avatar.startsWith("http");
  const avatarInitials = (user?.name || "User").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-3.5 z-30 h-13 macos-island-navbar rounded-2xl flex items-center justify-between px-3.5 sm:px-5 transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <button
          className="lg:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 macos-bouncy"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <Menu size={19} />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-none">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Theme Toggle with macOS Bounce */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 macos-bouncy border border-transparent hover:border-black/5 dark:hover:border-white/10"
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 macos-bouncy border border-transparent hover:border-black/5 dark:hover:border-white/10"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold shadow-xs">
                {unread}
              </span>
            )}
          </button>
          <NotificationPanel
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            notifications={notificationsList}
            basePath={basePath}
          />
        </div>

        {/* User Profile Island Popover */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-black/5 dark:hover:border-white/10 macos-bouncy"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {isGoogleAvatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 rounded-lg object-cover border border-white/60 dark:border-white/20 shadow-xs"
              />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center shadow-xs">
                {user?.avatar || avatarInitials}
              </div>
            )}
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{user?.name || "User"}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 capitalize">{user?.role || "Account"}</p>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block ml-0.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-2xl shadow-2xl py-1.5 animate-island-popup border border-white/70 dark:border-white/10 text-slate-800 dark:text-slate-100 z-50">
              <div className="px-3.5 py-2 border-b border-black/5 dark:border-white/10 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name || "Account"}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{user?.email || ""}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`${basePath}/profile`);
                }}
                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white flex items-center gap-2 rounded-xl transition-colors macos-bouncy"
              >
                <UserIcon size={14} /> My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`${basePath}/settings`);
                }}
                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white flex items-center gap-2 rounded-xl transition-colors macos-bouncy"
              >
                <SettingsIcon size={14} /> Settings
              </button>

              <div className="border-t border-black/5 dark:border-white/10 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500 hover:text-white flex items-center gap-2 rounded-xl transition-colors macos-bouncy"
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
