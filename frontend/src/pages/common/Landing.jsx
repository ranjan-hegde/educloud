import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Cloud, QrCode, MapPin, GraduationCap, CalendarDays, Bell, Bot, Users, ShieldCheck,
  ArrowRight, Menu, X, CheckCircle2,
} from "lucide-react";
import Footer from "../../components/Footer";

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

import { useAuth } from "../../context/AuthContext";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="bg-transparent">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-accent-teal to-teal-400 flex items-center justify-center font-display font-bold text-navy-950 shadow-sm">E</div>
            <span className="font-display font-semibold text-navy-900 text-lg tracking-tight">EduCloud</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-navy-600">
            <a href="#home" className="hover:text-navy-950 transition-colors">Home</a>
            <a href="#about" className="hover:text-navy-950 transition-colors">About</a>
            <a href="#features" className="hover:text-navy-950 transition-colors">Features</a>
            <a href="#contact" className="hover:text-navy-950 transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to={`/${user.role}/dashboard`} className="btn-primary !py-2 flex items-center gap-2">
                <span>Go to Dashboard ({user.name.split(" ")[0]})</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline !py-2">Login</Link>
                <Link to="/register" className="btn-primary !py-2">Register</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-navy-700" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-surface-border px-6 py-4 space-y-3 bg-white animate-fade-in">
            <a href="#home" className="block text-sm text-navy-600">Home</a>
            <a href="#about" className="block text-sm text-navy-600">About</a>
            <a href="#features" className="block text-sm text-navy-600">Features</a>
            <a href="#contact" className="block text-sm text-navy-600">Contact</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-outline flex-1 !py-2">Login</Link>
              <Link to="/register" className="btn-primary flex-1 !py-2">Register</Link>
            </div>
          </div>
        )}
      </header>

      <section id="home" className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <span className="badge-blue mb-4">Cloud-Based · Multi-Role · Secure</span>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.1] text-navy-900">
            Smart Cloud-Based Student Management System
          </h1>
          <p className="text-navy-500 mt-5 text-base leading-relaxed max-w-lg">
            EduCloud centralizes student, faculty, attendance, academic, and administrative management on a single secure cloud platform — accessible from anywhere, on any device.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/register" className="btn-primary">Get Started <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
          <div className="flex items-center gap-6 mt-10 text-navy-400 text-xs">
            <span>1,240+ Students</span>
            <span className="h-1 w-1 rounded-full bg-navy-200" />
            <span>86 Faculty</span>
            <span className="h-1 w-1 rounded-full bg-navy-200" />
            <span>4 Departments</span>
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="card p-6 shadow-pop">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-navy-900">Attendance Overview</p>
              <span className="badge-green">Live</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[["Present", "101", "text-emerald-600"], ["Absent", "19", "text-rose-500"], ["Rate", "84%", "text-navy-800"]].map(([l, v, c]) => (
                <div key={l} className="rounded-xl bg-navy-50 p-3 text-center">
                  <p className={`text-xl font-display font-semibold ${c}`}>{v}</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              {["Java Programming", "Cloud Computing", "Web Technologies"].map((s, i) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="text-navy-600">{s}</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><CheckCircle2 size={14} /> Verified</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 card p-4 shadow-pop hidden sm:block w-44">
            <div className="flex items-center gap-2">
              <QrCode size={20} className="text-navy-700" />
              <div>
                <p className="text-xs font-semibold text-navy-800">QR Session</p>
                <p className="text-[10px] text-emerald-600 font-medium">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-surface-muted py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="badge-blue">Features</span>
            <h2 className="text-3xl font-display font-semibold mt-3">Everything your campus needs, in one place</h2>
            <p className="text-navy-400 mt-3 text-sm">Purpose-built modules for students, faculty, and administrators.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-5 hover:shadow-pop transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-navy-800 text-white flex items-center justify-center mb-4">
                  <f.icon size={18} />
                </div>
                <p className="font-semibold text-navy-900">{f.title}</p>
                <p className="text-sm text-navy-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="badge-blue">How it works</span>
          <h2 className="text-3xl font-display font-semibold mt-3">Up and running in three steps</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <p className="text-5xl font-display font-semibold text-navy-100">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-semibold text-navy-900 mt-2">{s.title}</p>
              <p className="text-sm text-navy-400 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-navy-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-white/10 text-white">Benefits</span>
            <h2 className="text-3xl font-display font-semibold mt-3">Built for institutions that run on trust and clarity</h2>
            <p className="text-navy-300 mt-4 text-sm leading-relaxed">
              EduCloud replaces scattered spreadsheets and paper registers with one accountable, auditable system — reducing administrative overhead so staff can focus on students.
            </p>
          </div>
          <div className="space-y-4">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent-teal shrink-0 mt-0.5" />
                <p className="text-sm text-navy-200">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-display font-semibold">Ready to modernize your campus?</h2>
        <p className="text-navy-400 mt-3 text-sm max-w-md mx-auto">Create an account to explore the student, faculty, and admin dashboards.</p>
        <div className="flex justify-center gap-3 mt-7">
          <Link to="/register" className="btn-primary">Get Started <ArrowRight size={16} /></Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
