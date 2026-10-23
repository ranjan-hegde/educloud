import { useState } from "react";
import { Plus, Pencil, Trash2, FileText, Video, Link2, BookMarked, User } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";
import { subjects as masterSubjects } from "../../data/mockData";
import api from "../../services/api";

const types = ["Notes", "PDF", "Video", "Link", "Study Material"];
const typeIcon = { Notes: FileText, PDF: FileText, Video: Video, Link: Link2, "Study Material": BookMarked };

export default function FacultyCourseMaterials() {
  const { user } = useAuth();
  const [allMaterials, setAllMaterials] = usePersistentState("courseMaterials");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const facultyName = user?.name || "Faculty Member";
  const facultyId = String(user?.id || user?.facultyId || "FAC2601");
  const facultyEmail = user?.email || "";

  // Available subjects for this faculty
  const facultySubjectNames = Array.isArray(user?.subjects) && user.subjects.length > 0
    ? user.subjects
    : masterSubjects.map((s) => s.name);

  const emptyForm = {
    subject: facultySubjectNames[0] || "Data Structures & Algorithms",
    class: "BCA 5th Semester",
    title: "",
    description: "",
    type: types[0],
    fileUrl: "",
  };

  const [form, setForm] = useState(emptyForm);

  // Filter materials uploaded by this faculty member
  const items = (allMaterials || []).filter(
    (m) =>
      m.facultyId === facultyId ||
      m.faculty === facultyName ||
      (facultyEmail && m.facultyEmail === facultyEmail) ||
      (!m.faculty && !m.facultyEmail)
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(m) {
    setEditing(m);
    setForm({
      subject: m.subject || facultySubjectNames[0],
      class: m.class || "BCA 5th Semester",
      title: m.title || "",
      description: m.description || "",
      type: m.type || types[0],
      fileUrl: m.fileUrl || "",
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.title.trim() || !form.subject) {
      toast.error("Title and subject are required.");
      return;
    }

    if (editing) {
      setAllMaterials((prev) =>
        prev.map((m) =>
          m.id === editing.id
            ? {
                ...m,
                ...form,
                faculty: facultyName,
                facultyId,
                facultyEmail,
              }
            : m
        )
      );
      toast.success("Material updated.");
    } else {
      const created = {
        ...form,
        id: nextId(allMaterials, "MAT", { start: 1000 }),
        date: new Date().toISOString().slice(0, 10),
        faculty: facultyName,
        facultyId,
        facultyEmail,
      };

      setAllMaterials((prev) => [created, ...(prev || [])]);

      // Attempt to save to backend API
      try {
        await api("/api/materials", {
          method: "POST",
          body: JSON.stringify({
            title: created.title,
            subjectId: 1,
            type: created.type,
            description: created.description,
          }),
        });
      } catch {
        // offline fallback
      }

      toast.success("Material added — your students can now view it under Course Materials.");
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setAllMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success("Material removed.");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Materials Management"
        subtitle="Upload and manage lecture notes, slides, video lectures, and study links for your students"
        actions={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Material
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((m) => {
          const Icon = typeIcon[m.type] || FileText;
          return (
            <div key={m.id} className="card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span className="badge-blue text-xs font-semibold">{m.type}</span>
                </div>
                <p className="font-semibold text-navy-900 text-base">{m.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-navy-600 bg-slate-100 px-2 py-0.5 rounded">
                    {m.subject}
                  </span>
                </div>
                {m.description && (
                  <p className="text-xs text-navy-500 mt-2.5 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs text-navy-400 font-mono">{m.date}</span>
                <div className="flex gap-1">
                  <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(m)} title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn-ghost !py-1.5 !px-2 text-rose-500 hover:text-rose-700"
                    onClick={() => setDeleteTarget(m)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="card p-8 col-span-full text-center">
            <BookMarked size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-medium text-navy-800">No Course Materials Uploaded</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add Material&quot; above to upload lecture slides, notes, or links for your classes.
            </p>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Course Material" : "Add Course Material"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              {editing ? "Save Changes" : "Publish Material"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
            Publishing as <strong>{facultyName}</strong> • Materials will immediately appear in your students&apos; Course Materials portal.
          </div>

          <div>
            <label className="label">Subject</label>
            <select
              className="input"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            >
              {facultySubjectNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Material Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Title / Topic</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Unit 3 - Tree Traversal Algorithms"
            />
          </div>

          <div>
            <label className="label">External Link or Resource URL (Optional)</label>
            <input
              className="input"
              value={form.fileUrl}
              onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
              placeholder="https://drive.google.com/... or https://youtube.com/..."
            />
          </div>

          <div>
            <label className="label">Description / Summary Notes</label>
            <textarea
              rows={3}
              className="input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Summary notes, reading instructions, or key takeaways for students..."
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? Students will no longer be able to view it.`}
      />
    </div>
  );
}
