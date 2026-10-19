import { useState } from "react";
import { Bell, Trash2, CheckCheck, Search } from "lucide-react";
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

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                Inbox
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Notifications &amp; Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Campus updates, assignment deadlines, and system announcements
            </p>
          </div>

          <button
            className="btn-secondary inline-flex items-center gap-2 macos-bouncy self-start sm:self-center text-xs"
            onClick={markAllRead}
          >
            <CheckCheck size={14} className="text-teal-500" /> Mark all read
          </button>
        </div>

        {/* Filter controls strip */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 soft-line-t">
          <div className="flex-1 min-w-[200px]">
            <SearchBar value={search} onChange={setSearch} placeholder="Search notifications..." />
          </div>
          <Filter label="All categories" value={category} onChange={setCategory} options={categories} />
        </div>
      </div>

      {/* 2. Unified Notification Feed (divided by soft lines — NO separate cards) */}
      <div className="divide-y divide-black/5 dark:divide-white/10">
        {filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState icon={Bell} title="No notifications" message="You're all caught up — nothing matches your filters." />
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 sm:p-6 flex items-start justify-between gap-4 transition-colors ${
                !n.read ? "bg-teal-500/[0.03] dark:bg-teal-500/[0.05]" : "hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`h-2.5 w-2.5 rounded-full mt-2 shrink-0 ${!n.read ? "bg-teal-500 ring-4 ring-teal-500/20" : "bg-transparent"}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${!n.read ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-800 dark:text-slate-200"}`}>
                      {n.title}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">{n.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="btn-ghost !py-1 !px-2 text-xs text-teal-600 dark:text-teal-400 macos-bouncy"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => remove(n.id)}
                  className="btn-ghost !py-1 !px-2 text-rose-500 hover:text-rose-600 macos-bouncy"
                  title="Remove notification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
