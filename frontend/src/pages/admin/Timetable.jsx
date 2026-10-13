import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { subjects } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptyForm = { time: "", subject: "", faculty: "", room: "" };

export default function AdminTimetable() {
  const [timetable, setTimetable] = usePersistentState("timetable");
  const [savedLocations] = usePersistentState("locations");
  const [facultyList] = usePersistentState("faculty");
  const days = dayOrder.filter((d) => timetable[d] !== undefined);
  const [activeDay, setActiveDay] = useState(days[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const toast = useToast();

  function openAdd() { setEditIndex(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(i) { setEditIndex(i); setForm(timetable[activeDay][i]); setModalOpen(true); }

  function save() {
    if (!form.time || !form.subject || !form.faculty || !form.room) {
      toast.error("All fields are required.");
      return;
    }
    setTimetable((prev) => {
      const dayEntries = [...prev[activeDay]];
      if (editIndex !== null) dayEntries[editIndex] = form;
      else dayEntries.push(form);
      return { ...prev, [activeDay]: dayEntries };
    });
    toast.success(editIndex !== null ? "Timetable entry updated." : "Timetable entry added.");
    setModalOpen(false);
  }

  function confirmDelete() {
    setTimetable((prev) => {
      const dayEntries = prev[activeDay].filter((_, i) => i !== deleteIndex);
      return { ...prev, [activeDay]: dayEntries };
    });
    toast.success("Timetable entry removed.");
    setDeleteIndex(null);
  }

  return (
    <div>
      <PageHeader
        title="Timetable Management"
        subtitle="Create and manage the weekly class schedule"
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Entry</button>}
      />

      <div className="flex gap-2 overflow-x-auto scrollbar-thin mb-5 pb-1">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeDay === d ? "bg-navy-800 text-white" : "bg-white border border-surface-border text-navy-600 hover:bg-navy-50"}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {timetable[activeDay].map((cls, i) => (
          <div key={i} className="card p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-navy-900">{cls.subject}</p>
              <p className="text-xs text-navy-400 mt-0.5">{cls.faculty} · {cls.room}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-blue">{cls.time}</span>
              <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(i)}><Pencil size={14} /></button>
              <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteIndex(i)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {timetable[activeDay].length === 0 && <p className="text-sm text-navy-400 text-center py-10">No classes scheduled for {activeDay}.</p>}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editIndex !== null ? "Edit Timetable Entry" : `Add Entry — ${activeDay}`}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editIndex !== null ? "Save Changes" : "Add Entry"}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Time Slot</label><input className="input" placeholder="e.g. 10:00 - 11:00" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /></div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              <option value="">Select</option>
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Faculty</label>
            <select className="input" value={form.faculty} onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value }))}>
              <option value="">Select</option>
              {facultyList.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Room</label>
            <select className="input" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}>
              <option value="">Select</option>
              {savedLocations.map((l) => <option key={l.id} value={l.room}>{l.room}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={confirmDelete}
        title="Remove Timetable Entry"
        message="Are you sure you want to remove this class from the schedule?"
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
