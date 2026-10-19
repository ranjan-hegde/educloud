import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { useState } from "react";
import { Upload, FileText, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentAssignments() {
  const [items, setItems] = usePersistentState("assignments");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  const pendingCount = (items || []).filter((a) => a.status === "Pending").length;
  const submittedCount = (items || []).filter((a) => a.status === "Submitted").length;

  function openSubmit(a) { setSelected(a); setModalOpen(true); }
  function handleSubmit() {
    setItems((prev) => (prev || []).map((a) => (a.id === selected.id ? { ...a, status: "Submitted", submissions: (a.submissions || 0) + 1 } : a)));
    setModalOpen(false);
    toast.success(`Submission received for "${selected.title}".`);
  }

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Coursework &amp; Submissions
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Assignments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track due dates, upload deliverables, and monitor submission status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock size={13} /> {pendingCount} Pending
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={13} /> {submittedCount} Submitted
            </span>
          </div>
        </div>
      </div>

      {/* 2. Table Section */}
      <div className="p-6">
        <DataTable
          columns={["Title", "Subject", "Due Date", "Status", "Action"]}
          data={Array.isArray(items) ? items : []}
          renderRow={(a) => (
            <>
              <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-xs">
                    <FileText size={14} />
                  </div>
                  <span>{a.title}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{a.subject}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{a.dueDate}</td>
              <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-3 py-3">
                {a.status === "Pending" ? (
                  <button className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5 macos-bouncy" onClick={() => openSubmit(a)}>
                    <Upload size={12} /> Submit
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Completed</span>
                )}
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Submit: ${selected?.title || ""}`}
        footer={<><button className="btn-secondary macos-bouncy" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary macos-bouncy" onClick={handleSubmit}>Submit Assignment</button></>}
      >
        <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-8 text-center bg-black/[0.015] dark:bg-white/[0.02]">
          <Upload size={28} className="mx-auto text-teal-500 mb-3" />
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Drag &amp; drop your file here, or click to browse</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Mock upload UI — file storage not connected in this phase.</p>
        </div>
      </Modal>
    </div>
  );
}
