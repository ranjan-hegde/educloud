import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

const suggestedTasks = [
  "Create lesson plan", "Add class notes", "Schedule assessment", "Review assignments",
  "Evaluate submissions", "Add student remarks", "Prepare academic reports",
  "Post class announcements", "Review attendance", "Monitor student performance",
];

const emptyForm = { title: "", dueDate: "" };

export default function FacultyTasks() {
  const [list, setItems] = usePersistentState("facultyTasks");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  function addTask() {
    if (!form.title) { toast.error("Task title is required."); return; }
    const entry = { id: nextId(list, "TSK", { start: 1000 }), title: form.title, dueDate: form.dueDate || "—", status: "Pending" };
    setItems([entry, ...list]);
    toast.success("Task added.");
    setModalOpen(false);
    setForm(emptyForm);
  }

  function toggleStatus(id) {
    setItems(list.map((t) => (t.id === id ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" } : t)));
  }

  function remove(id) {
    setItems(list.filter((t) => t.id !== id));
    toast.info("Task removed.");
  }

  const pending = list.filter((t) => t.status === "Pending");
  const completed = list.filter((t) => t.status === "Completed");

  return (
    <div>
      <PageHeader
        title="Tasks & Activities"
        subtitle="Keep track of your day-to-day academic work"
        actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={15} /> Add Task</button>}
      />

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Pending ({pending.length})</p>
          {pending.length === 0 ? (
            <EmptyState icon={ListTodo} title="All caught up" message="No pending tasks right now." />
          ) : (
            <div className="space-y-2">
              {pending.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <button className="flex items-center gap-2.5 text-left" onClick={() => toggleStatus(t.id)}>
                    <Circle size={16} className="text-navy-300 shrink-0" />
                    <span className="text-sm text-navy-700">{t.title}</span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-navy-400">{t.dueDate}</span>
                    <button className="btn-ghost !py-1 !px-1.5 text-accent-coral" onClick={() => remove(t.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Completed ({completed.length})</p>
          {completed.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nothing completed yet" message="Completed tasks will show up here." />
          ) : (
            <div className="space-y-2">
              {completed.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <button className="flex items-center gap-2.5 text-left" onClick={() => toggleStatus(t.id)}>
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-navy-400 line-through">{t.title}</span>
                  </button>
                  <button className="btn-ghost !py-1 !px-1.5 text-accent-coral" onClick={() => remove(t.id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Task"
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={addTask}>Add Task</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Task</label>
            <input className="input" list="suggested-tasks" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Review Java assignment submissions" />
            <datalist id="suggested-tasks">
              {suggestedTasks.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
