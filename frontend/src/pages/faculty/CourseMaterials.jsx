import { useState } from "react";
import { Plus, Pencil, Trash2, FileText, Video, Link2, BookMarked } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { subjects, currentFaculty } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);
const types = ["Notes", "PDF", "Video", "Link", "Study Material"];
const typeIcon = { Notes: FileText, PDF: FileText, Video: Video, Link: Link2, "Study Material": BookMarked };
const emptyForm = { subject: mySubjects[0]?.name || "", class: "BCA 5th Semester", title: "", description: "", type: types[0] };

export default function FacultyCourseMaterials() {
  const [allMaterials, setAllMaterials] = usePersistentState("courseMaterials");
  const items = allMaterials.filter((m) => mySubjects.some((s) => s.name === m.subject));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(m) { setEditing(m); setForm(m); setModalOpen(true); }

  function save() {
    if (!form.title || !form.subject) { toast.error("Title and subject are required."); return; }
    if (editing) {
      setAllMaterials((prev) => prev.map((m) => (m.id === editing.id ? { ...form, id: editing.id, date: m.date } : m)));
      toast.success("Material updated.");
    } else {
      const created = { ...form, id: nextId(allMaterials, "MAT", { start: 1000 }), date: new Date().toISOString().slice(0, 10) };
      setAllMaterials((prev) => [created, ...prev]);
      toast.success("Material added — students can now see it under their subject.");
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setAllMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success("Material removed.");
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Course Materials"
        subtitle="Share notes, slides, videos, and links with your students"
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Material</button>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((m) => {
          const Icon = typeIcon[m.type] || FileText;
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center"><Icon size={18} /></div>
                <span className="badge-blue">{m.type}</span>
              </div>
              <p className="font-semibold text-navy-900">{m.title}</p>
              <p className="text-xs text-navy-400 mt-1">{m.subject}</p>
              <p className="text-sm text-navy-500 mt-2">{m.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-navy-300">{m.date}</span>
                <div className="flex gap-1">
                  <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(m)}><Pencil size={14} /></button>
                  <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteTarget(m)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-navy-400 col-span-full text-center py-10">No materials added yet.</p>}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Material" : "Add Course Material"}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? "Save Changes" : "Add Material"}</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Material Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div className="rounded-xl border border-dashed border-surface-border p-4 text-center text-xs text-navy-400">
            File upload is mocked in this frontend phase. Actual cloud file storage will be connected to the backend later.
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Material"
        message="Are you sure you want to remove this material? Students will no longer see it."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
