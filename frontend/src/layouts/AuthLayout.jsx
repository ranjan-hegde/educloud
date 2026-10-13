import { Link, Outlet } from "react-router-dom";
import { ShieldCheck, Cloud, QrCode } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-muted">
      <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-teal/10" />
        <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-navy-700/40" />
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="h-9 w-9 rounded-lg bg-accent-teal flex items-center justify-center font-display font-bold text-navy-950">E</div>
          <span className="font-display font-semibold text-xl">EduCloud</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-display font-semibold leading-tight">
            Manage your entire campus from one cloud dashboard.
          </h2>
          <p className="text-navy-300 mt-4 text-sm leading-relaxed">
            Students, faculty and administrators get real-time access to attendance, results, and academic records — anywhere, on any device.
          </p>
          <div className="mt-8 space-y-3.5">
            <div className="flex items-center gap-3 text-sm text-navy-200"><QrCode size={17} className="text-accent-teal" /> QR & location-based attendance</div>
            <div className="flex items-center gap-3 text-sm text-navy-200"><Cloud size={17} className="text-accent-teal" /> Centralized cloud infrastructure</div>
            <div className="flex items-center gap-3 text-sm text-navy-200"><ShieldCheck size={17} className="text-accent-teal" /> Secure role-based access</div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-navy-500">© 2026 EduCloud. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
