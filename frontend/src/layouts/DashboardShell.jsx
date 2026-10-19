import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DashboardShell({ items, basePath, roleLabel, title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-transparent relative overflow-x-hidden transition-colors duration-300">
      {/* Soft atmospheric ambient light orbs blending with mountain horizon */}
      <div className="pointer-events-none fixed -top-24 right-1/4 w-[600px] h-[600px] bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 w-[550px] h-[550px] bg-teal-500/10 dark:bg-purple-600/15 rounded-full blur-[130px] -z-10" />

      {/* Floating Glassmorphism Island Sidebar */}
      <Sidebar
        items={items}
        basePath={basePath}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        roleLabel={roleLabel}
      />

      {/* Main Floating Content Surface */}
      <div className="flex-1 min-w-0 flex flex-col relative z-0 px-3 sm:px-4 py-3.5 overflow-y-auto">
        <Navbar onMenuClick={() => setMobileOpen(true)} basePath={basePath} title={title} />
        <main className="flex-1 pt-4 pb-8 max-w-[1440px] w-full mx-auto animate-fade-in">
          <ErrorBoundary locationKey={location.pathname}>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
