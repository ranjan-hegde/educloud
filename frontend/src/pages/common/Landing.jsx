import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Cloud, QrCode, MapPin, GraduationCap, CalendarDays, Bell, Bot, Users, ShieldCheck,
  ArrowRight, Menu, X, CheckCircle2,
} from "lucide-react";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

const features = [
  { icon: Users, title: "Student Management", desc: "Centralized profiles, enrollment, and academic records for every student." },
  { icon: GraduationCap, title: "Faculty Management", desc: "Assign subjects, classes, and track faculty workload with ease." },
  { icon: QrCode, title: "QR Attendance", desc: "Fast, session-based attendance marking with duplicate prevention." },
  { icon: MapPin, title: "Location-Based Attendance", desc: "Classroom-radius verification keeps attendance accurate and honest." },
  { icon: GraduationCap, title: "Academic Results", desc: "SGPA, CGPA, and subject-wise marks in one clear view." },
  { icon: CalendarDays, title: "Timetable", desc: "Weekly schedules for students, faculty, and classrooms." },
  { icon: Bell, title: "Notifications", desc: "Real-time academic, attendance, and announcement alerts." },
  { icon: Bot, title: "AI Chatbot", desc: "Instant answers about attendance, timetable, and results." },
  { icon: Cloud, title: "Cloud Management", desc: "Institutional data hosted on scalable, resilient cloud infrastructure." },
  { icon: ShieldCheck, title: "Secure Role-Based Access", desc: "Students, faculty, and admins each see exactly what they need." },
];

const steps = [
  { title: "Sign in to your portal", desc: "Students, faculty, and admins each get a tailored dashboard after login." },
  { title: "Track academics in real time", desc: "Attendance, results, and timetables sync across the institution instantly." },
  { title: "Act from anywhere", desc: "Mark attendance, publish results, or manage records from any device." },
];

const benefits = [
  "Eliminates paper-based record keeping",
  "Reduces manual attendance errors with QR + location checks",
  "Gives every role a focused, distraction-free dashboard",
  "Scales from a single department to an entire university",
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="bg-transparent min-h-screen text-slate-800 dark:text-slate-100">
      {/* Floating Island Header */}
      <div className="px-4 sm:px-6 pt-3 sticky top-0 z-30">
        <header className="max-w-6xl mx-auto h-14 px-5 rounded-2xl macos-island-navbar shadow-lg flex items-center justify-between transition-all">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center font-display font-bold text-white shadow-md border border-white/60">
              E
            </div>
            <span className="font-display font-semibold text-slate-900 dark:text-white text-base tracking-tight">EduCloud</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#home" className="hover:text-blue-600 dark:hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <Link to={`/${user.role}/dashboard`} className="btn-primary !py-2 text-xs flex items-center gap-1.5">
                <span>Go to Dashboard ({user.name.split(" ")[0]})</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !py-1.5 !px-3 text-xs">Login</Link>
                <Link to="/register" className="btn-primary !py-1.5 !px-3 text-xs">Register</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-slate-700 dark:text-slate-300 p-1.5 rounded-xl hover:bg-black/5" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {menuOpen && (
          <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl macos-island-sidebar p-4 space-y-3 animate-island-popup">
            <a href="#home" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Home</a>
            <a href="#about" className="block text-sm font-medium text-slate-700 dark:text-slate-200">About</a>
            <a href="#features" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Features</a>
            <a href="#contact" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Contact</a>
            <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/10">
              <Link to="/login" className="btn-secondary flex-1 !py-2 text-xs">Login</Link>
              <Link to="/register" className="btn-primary flex-1 !py-2 text-xs">Register</Link>
            </div>
          </div>
        )}
      </div>

      {/* Hero Section floating over Mountain landscape */}
      <section id="home" className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <span className="badge-blue mb-4">Cloud-Based · Multi-Role · Peaceful UI</span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold leading-[1.12] text-slate-900 dark:text-white tracking-tight">
            Smart Cloud-Based Student Management System
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-5 text-base leading-relaxed max-w-lg">
            EduCloud centralizes student, faculty, attendance, academic, and administrative management on a single secure cloud platform — accessible from anywhere, on any device.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/register" className="btn-primary">Get Started <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn-secondary">Login to Portal</Link>
          </div>
          <div className="flex items-center gap-6 mt-10 text-slate-500 dark:text-slate-400 text-xs">
            <span>1,240+ Students</span>
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            <span>86 Faculty</span>
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            <span>4 Departments</span>
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Attendance Overview</p>
              <span className="badge-green">Live</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[["Present", "101", "text-emerald-600 dark:text-emerald-400"], ["Absent", "19", "text-rose-500 dark:text-rose-400"], ["Rate", "84%", "text-slate-800 dark:text-slate-100"]].map(([l, v, c]) => (
                <div key={l} className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-center border border-black/5 dark:border-white/10">
                  <p className={`text-xl font-display font-bold ${c}`}>{v}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              {["Java Programming", "Cloud Computing", "Web Technologies"].map((s) => (
                <div key={s} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{s}</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold"><CheckCircle2 size={14} /> Verified</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 card p-4 shadow-2xl hidden sm:block w-44">
            <div className="flex items-center gap-2">
              <QrCode size={20} className="text-blue-500" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">QR Session</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features in Glassmorphism Cards */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="badge-blue">Features</span>
            <h2 className="text-3xl font-display font-bold mt-3 text-slate-900 dark:text-white tracking-tight">Everything your campus needs, in one place</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">Purpose-built modules for students, faculty, and administrators.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-5 hover:shadow-2xl transition-all macos-bouncy">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                  <f.icon size={19} />
                </div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="badge-blue">How it works</span>
          <h2 className="text-3xl font-display font-bold mt-3 text-slate-900 dark:text-white tracking-tight">Up and running in three steps</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="card p-6 relative">
              <p className="text-5xl font-display font-bold text-blue-500/20 dark:text-blue-400/20">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-semibold text-slate-900 dark:text-white mt-2 text-sm">{s.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="about" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="card p-8 sm:p-12 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-teal">Benefits</span>
              <h2 className="text-3xl font-display font-bold mt-3 text-slate-900 dark:text-white tracking-tight">Built for institutions that run on trust and clarity</h2>
              <p className="text-slate-600 dark:text-slate-300 mt-4 text-sm leading-relaxed">
                EduCloud replaces scattered spreadsheets and paper registers with one accountable, auditable system — reducing administrative overhead so staff can focus on students.
              </p>
            </div>
            <div className="space-y-4">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Ready to modernize your campus?</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-md mx-auto">Create an account to explore the student, faculty, and admin dashboards.</p>
        <div className="flex justify-center gap-3 mt-7">
          <Link to="/register" className="btn-primary">Get Started <ArrowRight size={16} /></Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
