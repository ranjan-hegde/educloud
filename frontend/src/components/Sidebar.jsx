import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, Search, Moon, Sun, Cloud, Sparkles } from "lucide-react";
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

// Refined Liquid Glass icon accent tint based on route
function getIconTone(path) {
  if (path === "" || path === "/dashboard") return "from-blue-500/20 to-blue-600/30 text-blue-600 dark:text-blue-400";
  if (path === "/profile") return "from-purple-500/20 to-purple-600/30 text-purple-600 dark:text-purple-400";
  if (path === "/chatbot") return "from-rose-500/20 to-pink-600/30 text-rose-600 dark:text-pink-400";
  if (path.includes("attendance")) return "from-emerald-500/20 to-teal-600/30 text-emerald-600 dark:text-emerald-400";
  if (path.includes("timetable")) return "from-amber-500/20 to-orange-600/30 text-amber-600 dark:text-orange-400";
  if (path.includes("result") || path.includes("mark")) return "from-indigo-500/20 to-violet-600/30 text-indigo-600 dark:text-indigo-400";
  if (path.includes("fee")) return "from-teal-500/20 to-emerald-600/30 text-teal-600 dark:text-teal-400";
  if (path.includes("notification")) return "from-red-500/20 to-rose-600/30 text-red-600 dark:text-rose-400";
  if (path.includes("setting")) return "from-slate-500/20 to-slate-600/30 text-slate-600 dark:text-slate-300";
  return "from-sky-500/20 to-blue-600/30 text-sky-600 dark:text-sky-400";
}

export default function Sidebar({ items, basePath, mobileOpen, onClose, roleLabel }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items by category if not searching
  const sections = searchQuery
    ? [{ id: "search", title: "Search Results", items: filteredItems }]
    : SECTION_CONFIG.map((sec) => {
        const secItems = filteredItems.filter((item) => sec.paths.includes(item.path));
        return {
          ...sec,
          items: secItems,
        };
      }).filter((sec) => sec.items.length > 0);

  // Add any unclassified items to the first or a fallback section
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
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 macos-finder-sidebar text-slate-800 dark:text-slate-200 flex flex-col z-40 transition-transform duration-200 select-none
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* macOS Top Header — Strict: NO traffic lights, NO minimize/maximize buttons */}
        <div className="px-4 pt-4 pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Liquid Refractive Monogram */}
              <div className="relative h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center font-display font-bold text-white shadow-md shadow-blue-500/20 border border-white/40 overflow-hidden">
                <span className="relative z-10 text-sm tracking-tight">E</span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight">EduCloud</p>
                  <Sparkles size={11} className="text-blue-500 opacity-80" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{roleLabel}</p>
              </div>
            </div>

            <button
              className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Finder Quick Search Input */}
          <div className="mt-3 relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* macOS Finder Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-2.5 space-y-4">
          {sections.map((section) => (
            <div key={section.id}>
              <div className="px-2.5 pb-1 pt-1 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                <span>{section.title}</span>
                <span className="text-[9px] opacity-70">{section.items.length}</span>
              </div>

              <div className="space-y-0.5 mt-0.5">
                {section.items.map((item) => {
                  const isDashboard = item.path === "" || item.path === "/dashboard";
                  const isItemActive = isDashboard
                    ? location.pathname === basePath || location.pathname === `${basePath}/dashboard`
                    : location.pathname === `${basePath}${item.path}`;

                  const toneClass = getIconTone(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={`${basePath}${item.path || "/dashboard"}`}
                      onClick={onClose}
                      className={`macos-finder-item group ${
                        isItemActive
                          ? "macos-finder-item-active"
                          : "macos-finder-item-inactive"
                      }`}
                    >
                      {/* Liquid Glass Icon Squircle */}
                      <div
                        className={`h-6 w-6 rounded-md flex items-center justify-center transition-all duration-150 ${
                          isItemActive
                            ? "bg-white/20 text-white shadow-xs"
                            : `bg-gradient-to-br ${toneClass} border border-white/50 dark:border-white/10 group-hover:scale-105 shadow-xs`
                        }`}
                      >
                        <item.icon size={13} className="shrink-0" />
                      </div>

                      <span className="truncate flex-1 text-[13px]">{item.label}</span>

                      {/* Active indicator dot */}
                      {isItemActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs shrink-0" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No matching pages found
            </div>
          )}
        </nav>

        {/* macOS Finder Bottom Status Bar */}
        <div className="px-3.5 py-2.5 border-t border-black/5 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <Cloud size={13} className="text-emerald-500" />
            <span className="text-[11px] font-medium tracking-tight">Cloud Synced</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
          </button>
        </div>
      </aside>
    </>
  );
}
