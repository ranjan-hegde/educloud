import { useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { subjects, currentFaculty } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);
const priorities = ["Normal", "Important", "Urgent"];
const emptyForm = { title: "", message: "", subject: mySubjects[0]?.name || "", class: "BCA 5th Semester", priority: "Normal" };

export default function FacultyAnnouncements() {
  // Announcements are stored in the SAME shared "notifications" collection
  // Admin and Students already use, tagged with postedBy so Faculty only
  // manages their own here while Students see everything as usual.
  const [allNotifications, setAllNotifications] = usePersistentState("notifications");
  const mine = allNotifications.filter((n) => n.postedBy === "faculty" && n.postedByName === currentFaculty.name);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  function publish() {
    if (!form.title || !form.message) { toast.error("Title and message are required."); return; }
    const entry = {
      id: Date.now(),
      category: "Announcements",
      title: form.title,
      message: `${form.message}${form.subject ? ` (${form.subject})` : ""}`,
      time: "Just now",
      read: false,
      postedBy: "faculty",
      postedByName: currentFaculty.name,
      priority: form.priority,
    };
    setAllNotifications((prev) => [entry, ...prev]);
    toast.success("Announcement published to your students.");
    setModalOpen(false);
    setForm(emptyForm);
  }

  function remove(id) {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Announcement removed.");
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Post announcements to students in your classes"
        actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={15} /> New Announcement</button>}
      />

      {mine.length === 0 ? (
        <div className="card p-10 text-center">
          <Megaphone size={28} className="mx-auto text-navy-300 mb-3" />
          <p className="text-sm text-navy-400">You haven't posted any announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((n) => (
            <div key={n.id} className="card p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-navy-900 text-sm">{n.title}</p>
                  {n.priority && n.priority !== "Normal" && <span className={n.priority === "Urgent" ? "badge-red" : "badge-blue"}>{n.priority}</span>}
                </div>
                <p className="text-sm text-navy-500 mt-1">{n.message}</p>
                <p className="text-xs text-navy-300 mt-1.5">{n.time}</p>
              </div>
              <button onClick={() => remove(n.id)} className="btn-ghost !py-1.5 !px-2 text-accent-coral shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Announcement"
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={publish}>Publish</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Lab session moved to Lab 2" /></div>
          <div><label className="label">Message</label><textarea rows={3} className="input" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tomorrow's Java practical will be conducted in Lab 2." /></div>
          <div>
            <label className="label">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, priority: p }))} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${form.priority === p ? "border-navy-800 bg-navy-800 text-white" : "border-surface-border text-navy-600 hover:bg-navy-50"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
