import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import * as authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";

const departments = ["Computer Applications", "Computer Science", "Commerce", "Electronics"];
const courses = ["BCA", "B.Sc Computer Science", "B.Com", "B.Tech ECE"];

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    studentId: "",
    department: "Computer Applications",
    course: "BCA",
    semester: "1",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Auto-assign student ID if not entered
      const registrationData = {
        ...form,
        studentId: form.studentId.trim() || `STU${Math.floor(2400 + Math.random() * 900)}`,
        department: form.department || "Computer Applications",
        course: form.course || "BCA",
        semester: form.semester || "1",
      };

      await authService.register(registrationData);

      // Auto login right away — persistent session!
      const user = await login({
        email: registrationData.email,
        password: registrationData.password,
        role: registrationData.role,
        remember: true,
      });

      toast.success(`Account created! Welcome, ${user.name.split(" ")[0]}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">Create account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join EduCloud with your university role and get started.</p>
      </div>

      {/* Google Sign-in on Register */}
      <div className="mb-5">
        <GoogleSignInButton role={form.role} text="Register with Google" />
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/10 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/95 dark:bg-slate-900/95 px-3 text-slate-400 dark:text-slate-500 font-medium tracking-wider">
            or register with details
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Role Selector Required on Registration */}
        <div>
          <label className="label">Select your institution role</label>
          <div className="grid grid-cols-3 gap-2">
            {["student", "faculty", "admin"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => update("role", role)}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all capitalize ${
                  form.role === role
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="e.g. Ranjan Hegde"
          />
          {errors.fullName && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fullName}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Phone (Optional)</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              className="input"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Academic Details for Students */}
        {form.role === "student" && (
          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-3">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider">Academic Program</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label !text-teal-800 dark:!text-teal-200">Course</label>
                <select
                  className="input"
                  value={form.course}
                  onChange={(e) => update("course", e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label !text-teal-800 dark:!text-teal-200">Current Semester</label>
                <select
                  className="input"
                  value={form.semester}
                  onChange={(e) => update("semester", e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}st/nd/th Semester</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 mt-2 font-medium shadow-md flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Creating your profile...
            </>
          ) : (
            <>
              Complete Registration <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
