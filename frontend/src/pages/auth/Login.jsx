import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  function validate() {
    const errs = {};
    if (!role) errs.role = "Please select your role.";
    if (!email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login({ email, password, role, remember });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const from = location.state?.from || `/${user.role}/dashboard`;
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoRole) {
    const map = {
      student: "student@example.com",
      faculty: "faculty@example.com",
      admin: "admin@example.com",
    };
    setRole(demoRole);
    setEmail(map[demoRole]);
    setPassword("demo1234");
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="text-sm text-navy-400 mt-1.5">Sign in to access your EduCloud dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <label className="label">Select your role</label>
          <div className="flex gap-2">
            {["student", "faculty", "admin"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors capitalize
                ${role === r ? "bg-navy-800 text-white border-navy-800" : "border-surface-border text-navy-600 hover:bg-navy-50"}`}
              >
                {r}
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs text-accent-coral mt-1">{errors.role}</p>}
        </div>

        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input pl-10"
            />
          </div>
          {errors.email && <p className="text-xs text-accent-coral mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input pl-10 pr-10"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-accent-coral mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-navy-600 cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-navy-300" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-navy-700 font-semibold hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Login"}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-navy-50 border border-navy-100 p-3.5">
        <p className="text-xs font-semibold text-navy-600 mb-2">Demo accounts (mock authentication)</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fillDemo("student")} className="btn-outline !py-1.5 !px-3 text-xs">Student</button>
          <button onClick={() => fillDemo("faculty")} className="btn-outline !py-1.5 !px-3 text-xs">Faculty</button>
          <button onClick={() => fillDemo("admin")} className="btn-outline !py-1.5 !px-3 text-xs">Admin</button>
        </div>
      </div>

      <p className="text-sm text-navy-500 text-center mt-6">
        Don't have an account? <Link to="/register" className="text-navy-800 font-semibold hover:underline">Register</Link>
      </p>
    </div>
  );
}
