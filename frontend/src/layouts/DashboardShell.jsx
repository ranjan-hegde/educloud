import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  QrCode,
  BookMarked,
  ListTodo,
  Menu,
  Users,
  UserCog,
  FileClock,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DashboardShell({ items, basePath, roleLabel, title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Bottom action bar items for phone screens
  const mobileNavItems =
    basePath === "/student"
      ? [
          { to: "/student", label: "Home", icon: LayoutDashboard },
          { to: "/student/qr-attendance", label: "QR Pass", icon: QrCode },
          { to: "/student/materials", label: "Materials", icon: BookMarked },
          { to: "/student/tasks", label: "Tasks", icon: ListTodo },
        ]
      : basePath === "/faculty"
      ? [
          { to: "/faculty", label: "Home", icon: LayoutDashboard },
          { to: "/faculty/qr-attendance", label: "QR Pass", icon: QrCode },
          { to: "/faculty/students", label: "Students", icon: Users },
          { to: "/faculty/tasks", label: "Tasks", icon: ListTodo },
        ]
      : [
          { to: "/admin", label: "Home", icon: LayoutDashboard },
          { to: "/admin/qr-attendance", label: "Scanner", icon: QrCode },
          { to: "/admin/faculty", label: "Faculty", icon: UserCog },
          { to: "/admin/requests", label: "Requests", icon: FileClock },
        ];

  return (
    <div className="min-h-screen flex bg-surface-muted relative overflow-hidden">
      {/* Ambient glassmorphic light orbs */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      <Sidebar
        items={items}
        basePath={basePath}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        roleLabel={roleLabel}
      />
      <div className="flex-1 min-w-0 flex flex-col relative z-0">
        <Navbar onMenuClick={() => setMobileOpen(true)} basePath={basePath} title={title} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto animate-fade-in">
          <ErrorBoundary locationKey={location.pathname}>{children}</ErrorBoundary>
        </main>

        {/* Mobile Bottom Navigation Bar (Phones only) */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-2xl px-2 py-1.5 flex items-center justify-around safe-bottom"
        >
          {mobileNavItems.map((item) => {
            const isActive =
              item.to === basePath
                ? location.pathname === basePath || location.pathname === `${basePath}/dashboard`
                : location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? "text-teal-700 font-bold scale-105"
                    : "text-slate-500 hover:text-navy-900 font-medium"
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? "bg-teal-50 text-teal-700 shadow-sm" : ""
                  }`}
                >
                  <item.icon size={19} />
                </div>
                <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More / Menu Drawer Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-navy-900 font-medium transition-all"
          >
            <div className="p-1 rounded-lg">
              <Menu size={19} />
            </div>
            <span className="text-[10px] mt-0.5 whitespace-nowrap">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
