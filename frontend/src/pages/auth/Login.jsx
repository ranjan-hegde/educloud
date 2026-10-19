import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";

export default function Login() {
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
    if (!email.trim()) errs.email = "Email is required.";
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
      // Role is automatically detected from the user's account!
      const user = await login({ email, password, remember });
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
    setEmail(map[demoRole]);
    setPassword("demo1234");
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-navy-950">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in with your email or Google account to access your portal.</p>
      </div>

      {/* Google Sign-in */}
      <div className="mb-5">
        <GoogleSignInButton text="Continue with Google" />
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-slate-300 text-navy-800 focus:ring-accent-teal"
            />
            <span>Stay logged in</span>
          </label>
          <Link to="/forgot-password" className="text-navy-700 font-semibold hover:text-accent-teal transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-2 font-semibold shadow-md flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign In <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Access Bar */}
      <div className="mt-6 rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Demo Access</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo("student")}
            className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-all shadow-2xs text-center"
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => fillDemo("faculty")}
            className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-all shadow-2xs text-center"
          >
            Faculty
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-all shadow-2xs text-center"
          >
            Admin
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500 text-center mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-navy-900 font-bold hover:text-accent-teal hover:underline transition-colors">
          Create Account
        </Link>
      </p>
    </div>
  );
}
