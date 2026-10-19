import { useState, useEffect } from "react";
import { Pencil, Save, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { currentStudent } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const fields = [
  ["name", "Full Name"], ["rollNo", "Roll Number"], ["email", "Email"], ["phone", "Phone"],
  ["department", "Department"], ["course", "Course"], ["semester", "Semester"], ["academicYear", "Academic Year"],
  ["dob", "Date of Birth"], ["bloodGroup", "Blood Group"], ["guardianName", "Guardian Name"], ["guardianPhone", "Guardian Phone"],
  ["address", "Address"],
];

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const student = user || currentStudent;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(student);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      const isDemo = user.email === "student@example.com";
      const baseDefaults = isDemo ? currentStudent : {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        department: user.department || "Computer Applications",
        course: user.course || "BCA",
        semester: user.semester || "1st Semester",
        academicYear: "2026 - 2027",
        rollNo: user.rollNo || user.id || "STU2601",
        dob: "",
        bloodGroup: "",
        guardianName: "",
        guardianPhone: "",
        address: "",
      };
      setForm((prev) => ({ ...baseDefaults, ...prev, ...user }));
    }
  }, [user]);

  function handleSave() {
    updateProfile(form);
    setEditing(false);
    toast.success("Profile updated successfully.");
  }

  const avatarText = form.avatar || form.name?.slice(0, 2)?.toUpperCase() || "ST";

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Identity &amp; Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Student Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              View and manage your official university details and contact information
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  className="btn-secondary inline-flex items-center gap-1.5 macos-bouncy text-xs"
                  onClick={() => { setForm(student); setEditing(false); }}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  className="btn-primary inline-flex items-center gap-1.5 macos-bouncy text-xs"
                  onClick={handleSave}
                >
                  <Save size={14} /> Save Changes
                </button>
              </>
            ) : (
              <button
                className="btn-primary inline-flex items-center gap-1.5 macos-bouncy text-xs"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Avatar & Identity Strip */}
      <div className="p-6 sm:p-7 soft-line-b flex items-center gap-5">
        <div className="h-20 w-20 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/25 flex items-center justify-center text-2xl font-display font-bold shadow-xs">
          {avatarText}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{form.name}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Roll No: <span className="font-semibold text-slate-700 dark:text-slate-300">{form.rollNo || form.id || "STU2601"}</span> · {form.course || "BCA"}
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Enrolled Student
          </span>
        </div>
      </div>

      {/* 3. Fields Grid */}
      <div className="p-6 sm:p-7">
        <div className="grid sm:grid-cols-2 gap-6">
          {fields.map(([key, label]) => (
            <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                {label}
              </label>
              {editing ? (
                <input
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 py-1">
                  {form[key] || "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
