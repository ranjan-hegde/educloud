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

  const isImageAvatar =
    form.avatar &&
    typeof form.avatar === "string" &&
    (form.avatar.startsWith("http://") ||
      form.avatar.startsWith("https://") ||
      form.avatar.startsWith("data:"));

  const avatarInitials = (form.name || "Student")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedRollNo = (() => {
    const raw = form.rollNo || form.id;
    if (!raw) return "STU2601";
    const str = String(raw);
    if (/^\d+$/.test(str)) return `STU${2600 + parseInt(str, 10)}`;
    if (str.startsWith("GOOG")) return `STU${str.replace("GOOG", "")}`;
    return str;
  })();

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and update your personal and academic information"
        actions={
          editing ? (
            <>
              <button className="btn-secondary" onClick={() => { setForm(student); setEditing(false); }}><X size={15} /> Cancel</button>
              <button className="btn-primary" onClick={handleSave}><Save size={15} /> Save Changes</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setEditing(true)}><Pencil size={15} /> Edit Profile</button>
          )
        }
      />

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-border">
          {isImageAvatar ? (
            <img
              src={form.avatar}
              alt={form.name}
              className="h-20 w-20 rounded-2xl object-cover border border-surface-border shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-navy-800 text-white flex items-center justify-center text-2xl font-display font-semibold">
              {avatarInitials}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-navy-900">{form.name}</p>
            <p className="text-sm text-navy-400">{formattedRollNo} · {form.course || "BCA"}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {fields.map(([key, label]) => (
            <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
              <label className="label">{label}</label>
              {editing ? (
                <input
                  className="input"
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-semibold text-navy-800 mt-1">
                  {key === "rollNo" ? formattedRollNo : form[key] || "—"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
