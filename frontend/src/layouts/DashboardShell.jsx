import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DashboardShell({ items, basePath, roleLabel, title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen flex bg-surface-muted relative overflow-hidden">
      {/* Ambient glassmorphic light orbs */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      <Sidebar items={items} basePath={basePath} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} roleLabel={roleLabel} />
      <div className="flex-1 min-w-0 flex flex-col relative z-0">
        <Navbar onMenuClick={() => setMobileOpen(true)} basePath={basePath} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto animate-fade-in">
          <ErrorBoundary locationKey={location.pathname}>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
