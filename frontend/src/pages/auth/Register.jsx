import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import * as authService from "../../services/authService";
import { useToast } from "../../context/ToastContext";

const departments = ["Computer Applications", "Computer Science", "Commerce", "Electronics"];
const courses = ["BCA", "B.Sc Computer Science", "B.Com", "B.Tech ECE"];

export default function Register() {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    role: "student", studentId: "", department: "", course: "", semester: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName) errs.fullName = "Full name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!/^\+?[0-9\s]{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number.";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match.";
    if (form.role === "student" && !form.studentId) errs.studentId = "Student ID is required.";
    if (!form.department) errs.department = "Select a department.";
    if (form.role === "student" && !form.course) errs.course = "Select a course.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register(form);
      toast.success("Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-navy-400 mt-1.5">Join EduCloud as a student or faculty member.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="flex gap-2">
          {["student", "faculty", "admin"].map((role) => (
            <button
              type="button"
              key={role}
              onClick={() => update("role", role)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors capitalize
              ${form.role === role ? "bg-navy-800 text-white border-navy-800" : "border-surface-border text-navy-600 hover:bg-navy-50"}`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" />
            {errors.fullName && <p className="text-xs text-accent-coral mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
            {errors.phone && <p className="text-xs text-accent-coral mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-accent-coral mt-1">{errors.email}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" />
            {errors.password && <p className="text-xs text-accent-coral mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" className="input" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-xs text-accent-coral mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        {form.role === "student" && (
          <div>
            <label className="label">Student ID</label>
            <input className="input" value={form.studentId} onChange={(e) => update("studentId", e.target.value)} placeholder="e.g. STU2309" />
            {errors.studentId && <p className="text-xs text-accent-coral mt-1">{errors.studentId}</p>}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => update("department", e.target.value)}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.department && <p className="text-xs text-accent-coral mt-1">{errors.department}</p>}
          </div>
          {form.role === "student" && (
            <div>
              <label className="label">Course</label>
              <select className="input" value={form.course} onChange={(e) => update("course", e.target.value)}>
                <option value="">Select course</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.course && <p className="text-xs text-accent-coral mt-1">{errors.course}</p>}
            </div>
          )}
        </div>

        {form.role === "student" && (
          <div>
            <label className="label">Semester</label>
            <select className="input" value={form.semester} onChange={(e) => update("semester", e.target.value)}>
              <option value="">Select semester</option>
              {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create account"}
        </button>
      </form>

      <p className="text-sm text-navy-500 text-center mt-6">
        Already have an account? <Link to="/login" className="text-navy-800 font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
}
