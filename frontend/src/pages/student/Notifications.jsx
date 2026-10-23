import { useState, useEffect } from "react";
import { Bell, Trash2, CheckCheck, Megaphone, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import EmptyState from "../../components/EmptyState";
import { currentStudent } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useAuth } from "../../context/AuthContext";
import { isVisibleToStudent } from "../../utils/notificationVisibility";
import * as notificationService from "../../services/notificationService";

const categories = ["Academic", "Attendance", "Results", "Assignments", "Announcements"];

export default function StudentNotifications() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const [allItems, setItems] = usePersistentState("notifications");
  const items = (allItems || []).filter((n) => isVisibleToStudent(n, student));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const toast = useToast();

  useEffect(() => {
    // Sync notifications from backend database on mount
    notificationService.getNotifications().then((fresh) => {
      if (fresh && fresh.length > 0) {
        setItems(fresh);
      }
    });
  }, [setItems]);

  const filtered = items.filter((n) =>
    (!category || n.category === category) &&
    ((n.title || "").toLowerCase().includes(search.toLowerCase()) || (n.message || "").toLowerCase().includes(search.toLowerCase()))
  );

  async function markRead(id) {
    await notificationService.markAsRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function remove(id) {
    await notificationService.deleteNotification(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notification removed.");
  }

  async function markAllRead() {
    await notificationService.markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  }

  return (
    <div>
      <PageHeader
        title="Notifications & Announcements"
        subtitle={`${items.filter((n) => !n.read).length} unread alerts`}
        actions={<button className="btn-secondary" onClick={markAllRead}><CheckCheck size={15} /> Mark all as read</button>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notifications..." />
        <Filter label="All categories" value={category} onChange={setCategory} options={categories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up — no announcements or alerts match your filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const isAnnouncement = n.category === "Announcements" || n.postedBy === "faculty";
            return (
              <div
                key={n.id}
                className={`card p-4.5 flex items-start justify-between gap-4 transition-all ${
                  !n.read ? "border-l-4 border-l-accent-teal bg-white/95" : "bg-white/75"
                } ${isAnnouncement ? "border-navy-200" : ""}`}
              >
                <div className="flex gap-3.5">
                  <div className="mt-1 shrink-0">
                    {isAnnouncement ? (
                      <div className="h-8 w-8 rounded-xl bg-teal-50 text-accent-teal flex items-center justify-center">
                        <Megaphone size={16} />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Bell size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy-900 text-sm">{n.title}</p>
                      <span className={isAnnouncement ? "badge-teal" : "badge-blue"}>{n.category}</span>
                      {n.priority && n.priority !== "Normal" && (
                        <span className={n.priority === "Urgent" ? "badge-red" : "badge-amber"}>
                          <AlertCircle size={10} className="mr-1 inline" /> {n.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-navy-600 mt-1.5 leading-relaxed">{n.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-navy-400 mt-2">
                      <span>{n.time || "Recently"}</span>
                      {n.postedByName && (
                        <span className="font-medium text-navy-600">· Posted by {n.postedByName}</span>
                      )}
                      {n.subject && <span>· Subject: {n.subject}</span>}
                      {n.classId && <span>· Class: {n.classId}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="btn-ghost !py-1.5 !px-2.5 text-xs text-accent-teal font-medium">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} className="btn-ghost !py-1.5 !px-2 text-accent-coral hover:bg-rose-50" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
