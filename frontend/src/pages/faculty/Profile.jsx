import { useState, useEffect } from "react";
import { Pencil, Save, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { currentFaculty } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const fields = [
  ["name", "Full Name"], ["id", "Faculty ID"], ["email", "Email"], ["phone", "Phone"],
  ["department", "Department"], ["designation", "Designation"], ["qualification", "Qualification"], ["experience", "Experience"],
];

export default function FacultyProfile() {
  const { user, updateProfile } = useAuth();
  const faculty = user || currentFaculty;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(faculty);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...currentFaculty, ...prev, ...user }));
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

  const avatarInitials = (form.name || "Faculty")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const subjectsList = form.subjects || currentFaculty.subjects || [];

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="View and update your professional information"
        actions={editing ? (
          <>
            <button className="btn-secondary" onClick={() => { setForm(faculty); setEditing(false); }}><X size={15} /> Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Save size={15} /> Save</button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => setEditing(true)}><Pencil size={15} /> Edit Profile</button>
        )}
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
            <p className="text-sm text-navy-400">{form.id || "Faculty"} · {form.designation || "Faculty"}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {fields.map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              {editing ? (
                <input
                  className="input"
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  disabled={["id", "department"].includes(key)}
                />
              ) : (
                <p className="text-sm text-navy-800 py-2.5">{form[key] || "—"}</p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="label">Subjects Assigned</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {subjectsList.map((s) => <span key={s} className="badge-blue">{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
