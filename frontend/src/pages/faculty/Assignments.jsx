import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { Plus } from "lucide-react";
import { subjects, currentFaculty } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);

export default function FacultyAssignments() {
  const [items, setItems] = usePersistentState("assignments");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: mySubjects[0]?.name || "", description: "", dueDate: "" });
  const toast = useToast();

  function createAssignment() {
    if (!form.title || !form.dueDate) { toast.error("Title and due date are required."); return; }
    setItems((prev) => [{ id: nextId(prev, "ASG", { pad: 2 }), ...form, status: "Pending", submissions: 0, totalStudents: 40 }, ...prev]);
    setModalOpen(false);
    toast.success("Assignment created successfully.");
    setForm({ title: "", subject: mySubjects[0]?.name || "", description: "", dueDate: "" });
  }

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Create assignments and track submissions" actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={15} /> New Assignment</button>} />

      <div className="card p-5">
        <DataTable
          columns={["Title", "Subject", "Due Date", "Submissions"]}
          data={items}
          renderRow={(a) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{a.title}</td>
              <td className="px-3 py-3 text-navy-500">{a.subject}</td>
              <td className="px-3 py-3 text-navy-500">{a.dueDate}</td>
              <td className="px-3 py-3 text-navy-600 font-medium">{a.submissions}/{a.totalStudents}</td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Assignment"
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={createAssignment}>Create</button></>}
      >
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label">Due date</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
