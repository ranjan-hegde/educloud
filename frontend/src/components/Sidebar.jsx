import { NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";

export default function Sidebar({ items, basePath, mobileOpen, onClose, roleLabel }) {
  const location = useLocation();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-navy-950/95 backdrop-blur-2xl text-navy-100 flex flex-col z-40 transition-transform duration-200 border-r border-white/10 shadow-2xl
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-accent-teal to-teal-300 flex items-center justify-center font-display font-bold text-navy-950 shadow-md">E</div>
            <div>
              <p className="font-display font-semibold text-white text-sm leading-none tracking-wide">EduCloud</p>
              <p className="text-[10px] text-teal-300/80 font-medium mt-0.5 uppercase tracking-wider">{roleLabel}</p>
            </div>
          </div>
          <button className="lg:hidden text-navy-400 hover:text-white" onClick={onClose}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
          {items.map((item) => {
            const isDashboard = item.path === "" || item.path === "/dashboard";
            const isItemActive = isDashboard
              ? location.pathname === basePath || location.pathname === `${basePath}/dashboard`
              : location.pathname === `${basePath}${item.path}`;

            return (
              <NavLink
                key={item.path}
                to={`${basePath}${item.path || "/dashboard"}`}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isItemActive 
                  ? "bg-gradient-to-r from-accent-teal/20 to-accent-teal/10 text-teal-300 border border-teal-500/30 shadow-sm" 
                  : "text-navy-300 hover:bg-white/5 hover:text-white"}`}
              >
                <item.icon size={17} className={isItemActive ? "text-teal-300" : "text-navy-400"} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 text-[11px] text-navy-400/80 flex items-center justify-between">
          <span>© 2026 EduCloud</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="System Online"></span>
        </div>
      </aside>
    </>
  );
}
