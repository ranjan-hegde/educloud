import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { subjects, currentFaculty } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);
const types = ["Internal Assessment", "Unit Test", "Quiz", "Mid-Term", "Practical", "Assignment Evaluation", "Project Evaluation", "Final Examination"];
const emptyForm = { title: "", subject: mySubjects[0]?.name || "", class: "BCA 5th Semester", type: types[0], date: "", startTime: "", duration: "", maxMarks: 50, instructions: "", status: "Unpublished" };

export default function FacultyAssessments() {
  const [allAssessments, setAllAssessments] = usePersistentState("assessments");
  const items = allAssessments.filter((a) => mySubjects.some((s) => s.name === a.subject));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(a) { setEditing(a); setForm(a); setModalOpen(true); }

  function save() {
    if (!form.title || !form.subject || !form.date) { toast.error("Title, subject, and date are required."); return; }
    if (editing) {
      setAllAssessments((prev) => prev.map((a) => (a.id === editing.id ? { ...form, id: editing.id } : a)));
      toast.success("Assessment updated.");
    } else {
      const created = { ...form, id: nextId(allAssessments, "ASM", { start: 1000 }) };
      setAllAssessments((prev) => [created, ...prev]);
      toast.success("Assessment created.");
    }
    setModalOpen(false);
  }

  function togglePublish(a) {
    setAllAssessments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: x.status === "Published" ? "Unpublished" : "Published" } : x)));
    toast.success(a.status === "Published" ? "Assessment unpublished." : "Assessment published — students can now see it.");
  }

  function confirmDelete() {
    setAllAssessments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success("Assessment deleted.");
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Assessments"
        subtitle="Create and manage assessments for your subjects"
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Create Assessment</button>}
      />

      <div className="card p-5">
        <DataTable
          columns={["Title", "Subject", "Type", "Date", "Max Marks", "Status", "Actions"]}
          data={items}
          emptyMessage="No assessments created yet."
          renderRow={(a) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{a.title}</td>
              <td className="px-3 py-3 text-navy-500">{a.subject}</td>
              <td className="px-3 py-3 text-navy-500">{a.type}</td>
              <td className="px-3 py-3 text-navy-500">{a.date}</td>
              <td className="px-3 py-3 text-navy-500">{a.maxMarks}</td>
              <td className="px-3 py-3"><span className={a.status === "Published" ? "badge-green" : "badge-blue"}>{a.status}</span></td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <button className="btn-ghost !py-1.5 !px-2" onClick={() => togglePublish(a)} title={a.status === "Published" ? "Unpublish" : "Publish"}>
                    {a.status === "Published" ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(a)}><Pencil size={14} /></button>
                  <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteTarget(a)}><Trash2 size={14} /></button>
                </div>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Assessment" : "Create Assessment"}
        size="lg"
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? "Save Changes" : "Create"}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
          <div><label className="label">Start Time</label><input type="time" className="input" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} /></div>
          <div><label className="label">Duration</label><input className="input" placeholder="e.g. 60 mins" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} /></div>
          <div><label className="label">Maximum Marks</label><input type="number" className="input" value={form.maxMarks} onChange={(e) => setForm((f) => ({ ...f, maxMarks: Number(e.target.value) }))} /></div>
          <div className="sm:col-span-2"><label className="label">Instructions</label><textarea rows={3} className="input" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} /></div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
