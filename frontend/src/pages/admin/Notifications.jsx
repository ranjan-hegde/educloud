import { Bell, Send, Trash2, Mail, Eye } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { emailRecipientGroups, departments, courses } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import * as notificationService from "../../services/notificationService";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useState } from "react";

const categories = ["Academic", "Attendance", "Results", "Assignments", "Announcements"];

export default function AdminNotifications() {
  const [items, setItems] = usePersistentState("notifications");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", recipient: "All Students", specific: "" });
  const toast = useToast();

  const filtered = items.filter(
    (n) => (!category || n.category === category) && n.title.toLowerCase().includes(search.toLowerCase())
  );

  function remove(id) { setItems((prev) => prev.filter((n) => n.id !== id)); toast.info("Notification removed."); }

  async function sendAnnouncement() {
    if (!form.subject || !form.message) { toast.error("Subject and message are required."); return; }
    if ((form.recipient === "Specific Department" || form.recipient === "Specific Course") && !form.specific) {
      toast.error(`Please select a ${form.recipient === "Specific Department" ? "department" : "course"}.`);
      return;
    }
    setSending(true);
    await notificationService.sendAnnouncement(form);
    setSending(false);
    setItems((prev) => [
      {
        id: Date.now(),
        category: "Announcements",
        title: form.subject,
        message: form.message,
        time: "Just now",
        read: false,
        audience: { type: form.recipient, target: form.specific || null },
      },
      ...prev,
    ]);
    toast.success(`Announcement sent to ${form.recipient}.`);
    setComposeOpen(false);
    setForm({ subject: "", message: "", recipient: "All Students", specific: "" });
  }

  return (
    <div>
      <PageHeader
        title="Notifications & Announcements"
        subtitle="Broadcast announcements and manage system notifications"
        actions={<button className="btn-primary" onClick={() => setComposeOpen(true)}><Mail size={15} /> New Announcement</button>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notifications..." />
        <Filter label="All categories" value={category} onChange={setCategory} options={categories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="Nothing matches your current filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div key={n.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-accent-teal" : "bg-transparent"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-navy-900 text-sm">{n.title}</p>
                    <span className="badge-blue">{n.category}</span>
                  </div>
                  <p className="text-sm text-navy-500 mt-1">{n.message}</p>
                  <p className="text-xs text-navy-300 mt-1.5">{n.time}</p>
                </div>
              </div>
              <button onClick={() => remove(n.id)} className="btn-ghost !py-1.5 !px-2 text-accent-coral shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Compose Announcement"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setPreviewOpen(true)}><Eye size={15} /> Preview</button>
            <button className="btn-primary" onClick={sendAnnouncement} disabled={sending}>
              <Send size={15} /> {sending ? "Sending..." : "Send Email"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Recipients</label>
            <select className="input" value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))}>
              {emailRecipientGroups.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          {form.recipient === "Specific Department" && (
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.specific} onChange={(e) => setForm((f) => ({ ...f, specific: e.target.value }))}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          )}
          {form.recipient === "Specific Course" && (
            <div>
              <label className="label">Course</label>
              <select className="input" value={form.specific} onChange={(e) => setForm((f) => ({ ...f, specific: e.target.value }))}>
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mid-semester exam schedule released" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea rows={5} className="input" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Write your announcement..." />
          </div>
          <p className="text-xs text-navy-400">Email delivery is simulated in this frontend phase. A real email service will be connected to the backend later.</p>
        </div>
      </Modal>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Email Preview" size="sm">
        <div className="rounded-xl border border-surface-border p-4">
          <p className="text-xs text-navy-400 mb-1">To: {form.recipient}{form.specific ? ` — ${form.specific}` : ""}</p>
          <p className="font-semibold text-navy-900 mb-2">{form.subject || "(no subject)"}</p>
          <p className="text-sm text-navy-600 whitespace-pre-wrap">{form.message || "(no message)"}</p>
        </div>
      </Modal>
    </div>
  );
}
