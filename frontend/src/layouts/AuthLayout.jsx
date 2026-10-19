import { Link, Outlet, Navigate } from "react-router-dom";
import { ShieldCheck, Cloud, QrCode, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // If already logged in, redirect directly to dashboard — persistent session
  if (!loading && user?.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] bg-accent-teal/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />

      {/* Brand Hero Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 relative z-10 text-white">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accent-teal to-teal-300 flex items-center justify-center font-display font-bold text-navy-950 text-xl shadow-glow-teal">
            E
          </div>
          <div>
            <span className="font-display font-semibold text-2xl tracking-tight">EduCloud</span>
            <span className="block text-[10px] uppercase tracking-widest text-teal-300 font-semibold">Campus Cloud OS</span>
          </div>
        </Link>

        <div className="max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-teal-300 font-medium mb-6">
            <Sparkles size={14} /> Next-Gen Student Information System
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold leading-[1.15] tracking-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Your entire campus, unified in the cloud.
          </h2>
          <p className="text-slate-300/90 mt-5 text-base leading-relaxed">
            Real-time attendance, grades, smart QR sessions, and AI academic assistance — completely isolated, secure, and always accessible.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-sm text-slate-200">
              <div className="p-2 rounded-lg bg-accent-teal/20 text-accent-teal"><QrCode size={18} /></div>
              <span>Anti-spoofing QR & geo-fenced classroom attendance</span>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-sm text-slate-200">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300"><Cloud size={18} /></div>
              <span>Isolated database partitions for each student & faculty</span>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-sm text-slate-200">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300"><ShieldCheck size={18} /></div>
              <span>Persistent biometric & token authentication</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">© 2026 EduCloud Inc. Built for higher education institutions.</p>
      </div>

      {/* Auth Form Container with Frosted Glass Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-glass-lg border border-white/60">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
