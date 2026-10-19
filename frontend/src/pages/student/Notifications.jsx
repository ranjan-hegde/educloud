import { useState } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import EmptyState from "../../components/EmptyState";
import { currentStudent } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useAuth } from "../../context/AuthContext";
import { isVisibleToStudent } from "../../utils/notificationVisibility";

const categories = ["Academic", "Attendance", "Results", "Assignments", "Announcements"];

export default function StudentNotifications() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const [allItems, setItems] = usePersistentState("notifications");
  const items = (allItems || []).filter((n) => isVisibleToStudent(n, student));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const toast = useToast();

  const filtered = items.filter((n) =>
    (!category || n.category === category) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()))
  );

  function markRead(id) { setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))); }
  function remove(id) { setItems((prev) => prev.filter((n) => n.id !== id)); toast.info("Notification removed."); }
  function markAllRead() { setItems((prev) => prev.map((n) => ({ ...n, read: true }))); toast.success("All notifications marked as read."); }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${items.filter((n) => !n.read).length} unread`}
        actions={<button className="btn-secondary" onClick={markAllRead}><CheckCheck size={15} /> Mark all as read</button>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notifications..." />
        <Filter label="All categories" value={category} onChange={setCategory} options={categories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up — nothing matches your filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div key={n.id} className={`card p-4 flex items-start justify-between gap-4 ${!n.read ? "border-navy-200" : ""}`}>
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
              <div className="flex gap-1 shrink-0">
                {!n.read && <button onClick={() => markRead(n.id)} className="btn-ghost !py-1.5 !px-2 text-xs">Mark read</button>}
                <button onClick={() => remove(n.id)} className="btn-ghost !py-1.5 !px-2 text-accent-coral"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
