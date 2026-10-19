import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, Search, Moon, Sun, Cloud, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Grouping helper to organize flat items into macOS Finder sidebar sections
const SECTION_CONFIG = [
  {
    id: "favorites",
    title: "Favorites",
    paths: ["", "/dashboard", "/profile", "/chatbot"],
  },
  {
    id: "academics",
    title: "Academics",
    paths: [
      "/subjects",
      "/timetable",
      "/attendance",
      "/qr-attendance",
      "/results",
      "/assessments",
      "/assignments",
      "/marks",
      "/materials",
      "/my-classes",
      "/students",
      "/faculty",
      "/departments",
      "/courses",
      "/performance",
      "/announcements",
    ],
  },
  {
    id: "services",
    title: "Services & Management",
    paths: [
      "/fees",
      "/feedback",
      "/requests",
      "/reports",
      "/tasks",
      "/locations",
    ],
  },
  {
    id: "system",
    title: "System",
    paths: ["/notifications", "/settings"],
  },
];

// Liquid Glass icon accent tone
function getIconTone(path) {
  if (path === "" || path === "/dashboard") return "from-blue-500/25 to-blue-600/35 text-blue-600 dark:text-blue-400";
  if (path === "/profile") return "from-purple-500/25 to-purple-600/35 text-purple-600 dark:text-purple-400";
  if (path === "/chatbot") return "from-rose-500/25 to-pink-600/35 text-rose-600 dark:text-pink-400";
  if (path.includes("attendance")) return "from-emerald-500/25 to-teal-600/35 text-emerald-600 dark:text-emerald-400";
  if (path.includes("timetable")) return "from-amber-500/25 to-orange-600/35 text-amber-600 dark:text-orange-400";
  if (path.includes("result") || path.includes("mark")) return "from-indigo-500/25 to-violet-600/35 text-indigo-600 dark:text-indigo-400";
  if (path.includes("fee")) return "from-teal-500/25 to-emerald-600/35 text-teal-600 dark:text-teal-400";
  if (path.includes("notification")) return "from-red-500/25 to-rose-600/35 text-red-600 dark:text-rose-400";
  if (path.includes("setting")) return "from-slate-500/25 to-slate-600/35 text-slate-600 dark:text-slate-300";
  return "from-sky-500/25 to-blue-600/35 text-sky-600 dark:text-sky-400";
}

export default function Sidebar({ items, basePath, mobileOpen, onClose, roleLabel }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [bouncePath, setBouncePath] = useState(null);

  // Trigger tactile macOS bounce spring reaction on click
  function handleItemClick(path) {
    setBouncePath(path);
    setTimeout(() => setBouncePath(null), 520);
    onClose?.();
  }

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = searchQuery
    ? [{ id: "search", title: "Search Results", items: filteredItems }]
    : SECTION_CONFIG.map((sec) => {
        const secItems = filteredItems.filter((item) => sec.paths.includes(item.path));
        return {
          ...sec,
          items: secItems,
        };
      }).filter((sec) => sec.items.length > 0);

  if (!searchQuery) {
    const assignedPaths = new Set(SECTION_CONFIG.flatMap((s) => s.paths));
    const extraItems = filteredItems.filter((item) => !assignedPaths.has(item.path));
    if (extraItems.length > 0) {
      sections.push({
        id: "other",
        title: "Other",
        items: extraItems,
      });
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Floating Glassmorphism Island Sidebar / Popup */}
      <aside
        className={`
          ${
            mobileOpen
              ? "fixed top-3 bottom-3 left-3 right-3 sm:right-auto sm:w-72 z-50 animate-island-popup flex"
              : "fixed lg:sticky top-3.5 left-3.5 my-3.5 ml-3.5 h-[calc(100vh-1.75rem)] z-40 transition-all duration-300 ease-out hidden lg:flex"
          }
          ${isCollapsed && !mobileOpen ? "w-[72px]" : "w-64 sm:w-72"}
          macos-island-sidebar rounded-3xl text-slate-800 dark:text-slate-100 flex-col select-none overflow-hidden
        `}
      >
        {/* Floating Island Header — Strict: NO traffic lights, NO minimize/maximize buttons */}
        <div className="px-3.5 pt-3.5 pb-2.5 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Liquid Refractive Monogram with Click Bounce */}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="relative h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center font-display font-bold text-white shadow-md shadow-blue-500/25 border border-white/60 dark:border-white/20 overflow-hidden macos-bouncy shrink-0"
                title={isCollapsed ? "Expand Island" : "Collapse Island"}
              >
                <span className="relative z-10 text-base tracking-tight">E</span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
              </button>

              {(!isCollapsed || mobileOpen) && (
                <div className="leading-tight truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight truncate">EduCloud</p>
                    <Sparkles size={11} className="text-blue-500 opacity-90 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider truncate">{roleLabel}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Island Collapse/Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors macos-bouncy"
                title={isCollapsed ? "Expand Island Sidebar" : "Collapse Island"}
                aria-label="Toggle sidebar island"
              >
                {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 macos-bouncy"
                onClick={onClose}
                aria-label="Close Island"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Filter Pill (only when expanded) */}
          {(!isCollapsed || mobileOpen) && (
            <div className="mt-2.5 relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter pages..."
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grouped Section Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-3">
          {sections.map((section) => (
            <div key={section.id}>
              {(!isCollapsed || mobileOpen) && (
                <div className="px-2 pb-1 pt-1 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  <span>{section.title}</span>
                  <span className="text-[9px] opacity-70">{section.items.length}</span>
                </div>
              )}

              <div className="space-y-1 mt-0.5">
                {section.items.map((item) => {
                  const isDashboard = item.path === "" || item.path === "/dashboard";
                  const isItemActive = isDashboard
                    ? location.pathname === basePath || location.pathname === `${basePath}/dashboard`
                    : location.pathname === `${basePath}${item.path}`;

                  const toneClass = getIconTone(item.path);
                  const isBouncing = bouncePath === item.path;

                  return (
                    <NavLink
                      key={item.path}
                      to={`${basePath}${item.path || "/dashboard"}`}
                      onClick={() => handleItemClick(item.path)}
                      title={isCollapsed && !mobileOpen ? item.label : undefined}
                      className={`macos-finder-item group macos-bouncy ${
                        isBouncing ? "animate-macos-bounce" : ""
                      } ${
                        isItemActive
                          ? "macos-finder-item-active"
                          : "macos-finder-item-inactive"
                      } ${isCollapsed && !mobileOpen ? "justify-center !px-1.5 !py-2" : ""}`}
                    >
                      {/* Liquid Glass Icon Squircle */}
                      <div
                        className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                          isItemActive
                            ? "bg-white/25 text-white shadow-xs"
                            : `bg-gradient-to-br ${toneClass} border border-white/60 dark:border-white/10 group-hover:scale-110 shadow-xs`
                        }`}
                      >
                        <item.icon size={14} className="shrink-0" />
                      </div>

                      {/* Item Label & Active Dot (expanded) */}
                      {(!isCollapsed || mobileOpen) && (
                        <>
                          <span className="truncate flex-1 text-xs font-medium tracking-tight">{item.label}</span>
                          {isItemActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs shrink-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (!isCollapsed || mobileOpen) && (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No matching pages found
            </div>
          )}
        </nav>

        {/* Floating Island Bottom Status Bar */}
        <div className="px-3 py-2.5 border-t border-black/5 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
          {(!isCollapsed || mobileOpen) ? (
            <>
              <div className="flex items-center gap-1.5 truncate">
                <Cloud size={13} className="text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium tracking-tight truncate">Cloud Island</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors macos-bouncy shrink-0"
              >
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-full flex items-center justify-center p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors macos-bouncy"
            >
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
