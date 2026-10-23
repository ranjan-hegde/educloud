import { useState } from "react";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Clock,
  User,
  MessageSquare,
  Send,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = usePersistentState("facultyTasks");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTaskReply, setActiveTaskReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const toast = useToast();

  const studentName = user?.name || "Student";
  const studentEmail = user?.email || "";
  const studentId = String(user?.id || user?.rollNo || user?.studentId || "");
  const studentRollNo = String(user?.rollNo || user?.id || "");

  // Filter tasks assigned to this student or assigned to all students
  const myTasks = (tasks || []).filter((t) => {
    if (t.studentId === "ALL") return true;
    if (studentId && t.studentId === studentId) return true;
    if (studentEmail && t.studentEmail === studentEmail) return true;
    if (studentRollNo && (t.studentRollNo === studentRollNo || t.studentId === studentRollNo)) return true;
    return false;
  });

  const displayedTasks = myTasks.filter((t) => {
    if (filterStatus === "All") return true;
    return t.status === filterStatus;
  });

  const pendingCount = myTasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = myTasks.filter((t) => t.status === "In Progress").length;
  const completedCount = myTasks.filter((t) => t.status === "Completed").length;

  function updateStatus(taskId, newStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    toast.success(`Task status marked as ${newStatus}.`);
  }

  function handleSendReply() {
    if (!replyText.trim() || !activeTaskReply) return;

    const newMsg = {
      sender: studentName,
      senderRole: "student",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeTaskReply.id) {
          return {
            ...t,
            messages: [...(t.messages || []), newMsg],
          };
        }
        return t;
      })
    );

    toast.success("Reply sent to teacher.");
    setActiveTaskReply(null);
    setReplyText("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks & Assigned Activities"
        subtitle="View direct academic tasks assigned by your professors and submit updates"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-navy-700">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Tasks</p>
          <p className="text-2xl font-bold text-navy-950 mt-1">{myTasks.length}</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
        </div>
        <div className="card p-4 border-l-4 border-sky-500">
          <p className="text-xs font-semibold text-sky-600 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-sky-900 mt-1">{inProgressCount}</p>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["All", "Pending", "In Progress", "Completed"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterStatus === st
                ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                : "bg-white text-navy-700 border-slate-200 hover:border-teal-400"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {displayedTasks.length === 0 ? (
          <div className="card p-8 text-center">
            <EmptyState
              icon={ListTodo}
              title="No Tasks Assigned"
              message="You have no tasks under this category. Direct tasks assigned by your teachers will appear here."
            />
          </div>
        ) : (
          displayedTasks.map((t) => (
            <div
              key={t.id}
              className={`card p-5 border transition-all ${
                t.status === "Completed"
                  ? "border-emerald-200 bg-emerald-50/20"
                  : t.status === "In Progress"
                  ? "border-sky-200 bg-sky-50/15"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-navy-600">{t.id}</span>
                    <h3
                      className={`text-base font-semibold text-navy-900 ${
                        t.status === "Completed" ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {t.title}
                    </h3>
                    <span className="text-xs bg-slate-100 text-navy-700 font-medium px-2.5 py-0.5 rounded">
                      {t.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.priority === "Urgent"
                          ? "bg-rose-100 text-rose-700"
                          : t.priority === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-navy-800">
                      <User size={13} className="text-teal-600" /> Assigned by: {t.facultyName || "Professor"}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                      <Calendar size={13} /> Due: {t.dueDate}
                    </span>
                  </div>

                  {/* Teacher Messages & Instructions Callout */}
                  {t.messages && t.messages.length > 0 && (
                    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-navy-800 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-teal-600" />
                        Teacher&apos;s Direct Instructions & Messages:
                      </p>
                      <div className="space-y-1.5 text-xs">
                        {t.messages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg ${
                              m.senderRole === "faculty"
                                ? "bg-teal-50 border border-teal-100 text-teal-950"
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-0.5 text-[11px] font-semibold text-slate-500">
                              <span>{m.sender}:</span>
                              <span className="font-normal font-mono">{m.time}</span>
                            </div>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Action Controls */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      t.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : t.status === "In Progress"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {t.status}
                  </span>

                  <div className="flex items-center gap-1.5 mt-2">
                    {t.status !== "In Progress" && t.status !== "Completed" && (
                      <button
                        onClick={() => updateStatus(t.id, "In Progress")}
                        className="btn-secondary !py-1 !px-2.5 text-xs text-sky-700 border-sky-300 hover:bg-sky-50"
                      >
                        Start Task
                      </button>
                    )}

                    {t.status !== "Completed" ? (
                      <button
                        onClick={() => updateStatus(t.id, "Completed")}
                        className="btn-primary !py-1 !px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Check size={12} /> Mark Done
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(t.id, "Pending")}
                        className="btn-ghost !py-1 !px-2 text-xs text-slate-500"
                      >
                        Reopen
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTaskReply(t);
                        setReplyText("");
                      }}
                      className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1 text-navy-700"
                    >
                      <MessageSquare size={12} /> Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <Modal
        open={!!activeTaskReply}
        onClose={() => setActiveTaskReply(null)}
        title={`Reply to ${activeTaskReply?.facultyName || "Teacher"}`}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setActiveTaskReply(null)}>
              Cancel
            </button>
            <button className="btn-primary flex items-center gap-1.5" onClick={handleSendReply}>
              <Send size={13} /> Send Reply
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Replying on task: <strong>{activeTaskReply?.title}</strong>
          </p>
          <textarea
            rows={4}
            className="input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message, query, or progress update for your teacher..."
          />
        </div>
      </Modal>
    </div>
  );
}
