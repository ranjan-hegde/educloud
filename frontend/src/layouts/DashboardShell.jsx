import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DashboardShell({ items, basePath, roleLabel, title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen flex bg-surface-muted">
      <Sidebar items={items} basePath={basePath} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} roleLabel={roleLabel} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} basePath={basePath} title={title} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto animate-fade-in">
          <ErrorBoundary locationKey={location.pathname}>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
