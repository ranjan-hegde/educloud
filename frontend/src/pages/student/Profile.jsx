import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { currentStudent } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

const fields = [
  ["name", "Full Name"], ["rollNo", "Roll Number"], ["email", "Email"], ["phone", "Phone"],
  ["department", "Department"], ["course", "Course"], ["semester", "Semester"], ["academicYear", "Academic Year"],
  ["dob", "Date of Birth"], ["bloodGroup", "Blood Group"], ["guardianName", "Guardian Name"], ["guardianPhone", "Guardian Phone"],
  ["address", "Address"],
];

export default function StudentProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(currentStudent);
  const toast = useToast();

  function handleSave() {
    setEditing(false);
    toast.success("Profile updated successfully.");
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and update your personal and academic information"
        actions={
          editing ? (
            <>
              <button className="btn-secondary" onClick={() => { setForm(currentStudent); setEditing(false); }}><X size={15} /> Cancel</button>
              <button className="btn-primary" onClick={handleSave}><Save size={15} /> Save Changes</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setEditing(true)}><Pencil size={15} /> Edit Profile</button>
          )
        }
      />

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-border">
          <div className="h-20 w-20 rounded-2xl bg-navy-800 text-white flex items-center justify-center text-2xl font-display font-semibold">
            {currentStudent.avatar}
          </div>
          <div>
            <p className="text-lg font-semibold text-navy-900">{form.name}</p>
            <p className="text-sm text-navy-400">{currentStudent.id} · {currentStudent.course}</p>
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
                  disabled={["rollNo", "department", "course"].includes(key)}
                />
              ) : (
                <p className="text-sm text-navy-800 py-2.5">{form[key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
