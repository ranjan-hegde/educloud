import { useState } from "react";
import { Send, Pencil, Trash2, Star, MessageSquareText } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import { subjects, currentStudent } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

import { useAuth } from "../../context/AuthContext";

const categories = ["Teaching", "Subject", "Class", "Course Material", "Assessment", "Assignment", "Attendance", "General", "Other"];

export default function StudentFeedback() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const mySubjects = subjects.filter((s) => !student.course || s.course === student.course);
  const studentClass = `${student.course || "BCA"} ${student.semester || "1st Semester"}`;

  function emptyForm() {
    const first = mySubjects[0];
    return { subjectId: first?.id || "", category: categories[0], rating: 0, message: "" };
  }

  const [allFeedback, setAllFeedback] = usePersistentState("feedback");
  const [facultyList] = usePersistentState("faculty");
  const mine = (allFeedback || []).filter((f) => f.studentId === student.id || f.studentEmail === student.email);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  function resolveFacultyId(facultyName) {
    return (facultyList || []).find((f) => f.name === facultyName)?.id || null;
  }

  function openAdd() { setEditing(null); setForm(emptyForm()); setModalOpen(true); }
  function openEdit(f) {
    setEditing(f);
    setForm({ subjectId: f.subjectId, category: f.category, rating: f.rating, message: f.message });
    setModalOpen(true);
  }

  function submit() {
    const subject = mySubjects.find((s) => s.id === form.subjectId);
    if (!subject || !form.message.trim()) { toast.error("Subject and feedback message are required."); return; }
    const facultyId = resolveFacultyId(subject.faculty);

    if (editing) {
      setAllFeedback((prev) =>
        (prev || []).map((f) =>
          f.id === editing.id
            ? { ...f, subjectId: subject.id, subjectName: subject.name, facultyId, facultyName: subject.faculty, category: form.category, rating: form.rating, message: form.message }
            : f
        )
      );
      toast.success("Feedback updated.");
    } else {
      const entry = {
        id: nextId(allFeedback, "FB", { start: 1000 }),
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        classId: studentClass,
        subjectId: subject.id,
        subjectName: subject.name,
        facultyId,
        facultyName: subject.faculty,
        category: form.category,
        rating: form.rating,
        message: form.message,
        date: new Date().toISOString().slice(0, 10),
        status: "NEW",
      };
      setAllFeedback((prev) => [entry, ...(prev || [])]);
      toast.success("Feedback submitted. Your faculty will be able to view it.");
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setAllFeedback((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    toast.success("Feedback deleted.");
    setDeleteTarget(null);
  }

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Student Voice
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Course &amp; Faculty Feedback
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share constructive feedback on your subjects, faculty, and classroom experience
            </p>
          </div>

          <button className="btn-primary inline-flex items-center gap-2 macos-bouncy" onClick={openAdd}>
            <Send size={15} /> Submit Feedback
          </button>
        </div>
      </div>

      {/* 2. Content */}
      <div className="p-6">
        {mine.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="No feedback submitted yet" message="Your feedback helps faculty improve the course experience." />
        ) : (
          <DataTable
            columns={["Subject", "Faculty", "Category", "Rating", "Feedback", "Date", "Status", "Actions"]}
            data={mine}
            renderRow={(f) => (
              <>
                <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{f.subjectName}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{f.facultyName}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    {f.category}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{f.rating ? `${f.rating}/5` : "—"}</td>
                <td className="px-3 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={f.message}>{f.message}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{f.date}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                    f.status === "READ"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}>
                    {f.status === "READ" ? "Reviewed" : "Submitted"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {f.status === "NEW" ? (
                    <div className="flex gap-1">
                      <button className="btn-ghost !py-1.5 !px-2 macos-bouncy" onClick={() => openEdit(f)}><Pencil size={14} /></button>
                      <button className="btn-ghost !py-1.5 !px-2 text-rose-500 hover:text-rose-600 macos-bouncy" onClick={() => setDeleteTarget(f)}><Trash2 size={14} /></button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">Reviewed by faculty</span>
                  )}
                </td>
              </>
            )}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Feedback" : "Submit Feedback"}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={submit}>{editing ? "Save Changes" : "Submit Feedback"}</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}>
              {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Faculty</label>
            <input className="input" disabled value={mySubjects.find((s) => s.id === form.subjectId)?.faculty || ""} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Rating (optional)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: f.rating === n ? 0 : n }))}>
                  <Star size={22} className={n <= form.rating ? "fill-amber-400 text-amber-400" : "text-navy-200"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Feedback</label>
            <textarea rows={4} className="input" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="The explanations were clear and the practical examples helped me understand the concepts better." />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
