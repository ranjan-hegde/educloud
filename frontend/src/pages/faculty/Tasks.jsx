import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  User,
  MessageSquare,
  AlertCircle,
  Send,
  Calendar,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";
import * as studentService from "../../services/studentService";
import { subjects as masterSubjects } from "../../data/mockData";

export default function FacultyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = usePersistentState("facultyTasks");
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedTaskForMessage, setSelectedTaskForMessage] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const toast = useToast();

  const facultyName = user?.name || "Faculty Member";
  const facultyEmail = user?.email || "";

  useEffect(() => {
    async function fetchStudents() {
      const list = await studentService.getStudents();
      setStudents(list || []);
    }
    fetchStudents();
  }, []);

  const facultySubjects = Array.isArray(user?.subjects) && user.subjects.length > 0
    ? user.subjects
    : masterSubjects.map((s) => s.name);

  const emptyForm = {
    title: "",
    subject: facultySubjects[0] || "Data Structures",
    studentId: "ALL", // "ALL" or specific student id
    dueDate: "",
    priority: "Normal",
    message: "",
  };

  const [form, setForm] = useState(emptyForm);

  // Filter tasks created by or visible to this faculty
  const myTasks = (tasks || []).filter(
    (t) => !t.facultyEmail || t.facultyEmail === facultyEmail || t.facultyName === facultyName
  );

  const displayedTasks = myTasks.filter((t) => {
    if (filterStatus === "All") return true;
    return t.status === filterStatus;
  });

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function handleCreate() {
    if (!form.title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    const assignedStudentObj = students.find((s) => s.id === form.studentId || s.email === form.studentId);

    const newTask = {
      id: nextId(tasks, "TSK", { start: 1000 }),
      title: form.title.trim(),
      subject: form.subject,
      studentId: form.studentId,
      studentName: form.studentId === "ALL" ? "All Students" : (assignedStudentObj?.name || "Selected Student"),
      studentEmail: assignedStudentObj?.email || "",
      studentRollNo: assignedStudentObj?.rollNo || "",
      dueDate: form.dueDate || "No deadline",
      priority: form.priority,
      status: "Pending",
      facultyName,
      facultyEmail,
      createdAt: new Date().toLocaleDateString(),
      messages: form.message.trim()
        ? [
            {
              sender: facultyName,
              senderRole: "faculty",
              text: form.message.trim(),
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]
        : [],
    };

    setTasks((prev) => [newTask, ...(prev || [])]);
    toast.success("Task created and assigned to student.");
    setModalOpen(false);
  }

  function toggleStatus(taskId) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === "Completed" ? "Pending" : "Completed";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.info("Task deleted.");
  }

  function openMessageModal(task) {
    setSelectedTaskForMessage(task);
    setMessageText("");
    setMessageModalOpen(true);
  }

  function sendTaskMessage() {
    if (!messageText.trim() || !selectedTaskForMessage) return;

    const newMsg = {
      sender: facultyName,
      senderRole: "faculty",
      text: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === selectedTaskForMessage.id) {
          return {
            ...t,
            messages: [...(t.messages || []), newMsg],
          };
        }
        return t;
      })
    );

    toast.success("Message sent to student for this task.");
    setMessageModalOpen(false);
    setMessageText("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Direct Student Assignments"
        subtitle="Create academic tasks, assign to specific students, and send instructions directly"
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Task
          </button>
        }
      />

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
            {st} ({st === "All" ? myTasks.length : myTasks.filter((t) => t.status === st).length})
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="card p-5">
        {displayedTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No Tasks Found"
            message="You haven't assigned any tasks under this filter. Click 'New Task' to assign work to a student."
          />
        ) : (
          <div className="space-y-3">
            {displayedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-navy-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleStatus(t.id)}
                    className="mt-0.5 text-navy-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={t.status === "Completed" ? "Mark as Pending" : "Mark as Completed"}
                  >
                    {t.status === "Completed" ? (
                      <CheckCircle2 size={19} className="text-emerald-500" />
                    ) : (
                      <Circle size={19} />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-navy-600">{t.id}</span>
                      <h4
                        className={`font-semibold text-sm text-navy-900 ${
                          t.status === "Completed" ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {t.title}
                      </h4>
                      <span className="text-[11px] font-medium bg-slate-100 text-navy-700 px-2 py-0.5 rounded">
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

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-navy-800">
                        <User size={13} className="text-teal-600" />
                        Assigned to: {t.studentName}{" "}
                        {t.studentRollNo && <span className="text-slate-400 font-mono">({t.studentRollNo})</span>}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar size={13} /> Due: {t.dueDate}
                      </span>
                    </div>

                    {/* Messages thread preview */}
                    {t.messages && t.messages.length > 0 && (
                      <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1.5 max-w-xl">
                        <p className="font-semibold text-[11px] text-slate-500 flex items-center gap-1">
                          <MessageSquare size={12} /> Message thread with {t.studentName}:
                        </p>
                        {t.messages.map((m, idx) => (
                          <div key={idx} className="text-slate-700 flex justify-between gap-2">
                            <span>
                              <strong className={m.senderRole === "faculty" ? "text-navy-900" : "text-teal-800"}>
                                {m.sender}:
                              </strong>{" "}
                              {m.text}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">{m.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      t.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : t.status === "In Progress"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {t.status}
                  </span>

                  <button
                    onClick={() => openMessageModal(t)}
                    className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1 text-navy-700"
                    title="Send a direct message on this task"
                  >
                    <MessageSquare size={13} /> Message
                  </button>

                  <button
                    onClick={() => removeTask(t.id)}
                    className="btn-ghost !py-1 !px-2 text-rose-500 hover:text-rose-700"
                    title="Delete Task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create & Assign Student Task"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleCreate}>
              Assign Task
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="label">Task Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Complete Binary Search Tree Implementation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assign To Student</label>
              <select
                className="input"
                value={form.studentId}
                onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              >
                <option value="ALL">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNo || s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Subject</label>
              <select
                className="input"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              >
                {facultySubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Direct Message / Specific Instructions to Student</label>
            <textarea
              rows={3}
              className="input"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Type specific instructions or requirements for this student..."
            />
          </div>
        </div>
      </Modal>

      {/* Send Direct Message Modal */}
      <Modal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title={`Message for Task: ${selectedTaskForMessage?.title || ""}`}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setMessageModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary flex items-center gap-1.5" onClick={sendTaskMessage}>
              <Send size={13} /> Send Message
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Sending message to: <strong>{selectedTaskForMessage?.studentName}</strong>
          </p>
          <textarea
            rows={4}
            className="input"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your instruction or update for the student..."
          />
        </div>
      </Modal>
    </div>
  );
}
