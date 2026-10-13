import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

export default function Sidebar({ items, basePath, mobileOpen, onClose, roleLabel }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-navy-950/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-navy-900 text-navy-100 flex flex-col z-40 transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent-teal flex items-center justify-center font-display font-bold text-navy-950">E</div>
            <div>
              <p className="font-display font-semibold text-white text-sm leading-none">EduCloud</p>
              <p className="text-[10px] text-navy-400 mt-0.5">{roleLabel}</p>
            </div>
          </div>
          <button className="lg:hidden text-navy-400" onClick={onClose}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={`${basePath}${item.path}`}
              end={item.path === ""}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive ? "bg-accent-teal/15 text-white" : "text-navy-300 hover:bg-navy-800 hover:text-white"}`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-800 text-[11px] text-navy-500">
          © 2026 EduCloud. Cloud-Based SMS.
        </div>
      </aside>
    </>
  );
}
