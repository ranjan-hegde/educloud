import { useState } from "react";
import { Plus, Clock, CheckCircle2, XCircle, FileClock, AlertCircle, MessageSquare } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { currentFaculty } from "../../data/mockData";
import { nextId } from "../../utils/idGenerator";

const requestTypes = [
  "Leave Request",
  "Class Replacement Request",
  "Timetable Change Request",
  "Classroom Request",
  "Equipment & Lab Request",
];

const emptyForm = {
  type: requestTypes[0],
  date: "",
  reason: "",
  description: "",
};

export default function FacultyRequests() {
  const { user } = useAuth();
  const [items, setItems] = usePersistentState("requests");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  const facultyName = user?.name || currentFaculty.name;
  const facultyEmail = user?.email || currentFaculty.email;
  const department = user?.department || currentFaculty.department || "Computer Science";
  const facultyId = user?.id || currentFaculty.id;

  // Filter requests that belong to this faculty or are shared institution requests
  const myRequests = (items || []).filter(
    (r) => !r.facultyEmail || r.facultyEmail === facultyEmail || r.facultyName === facultyName
  );

  const displayedRequests = myRequests.filter((r) => {
    if (statusFilter === "All") return true;
    return r.status === statusFilter;
  });

  const pendingCount = myRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = myRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = myRequests.filter((r) => r.status === "Rejected").length;

  function submit() {
    if (!form.date || !form.reason.trim()) {
      toast.error("Date and reason are required.");
      return;
    }

    const entry = {
      ...form,
      id: nextId(items, "REQ", { start: 1000 }),
      status: "Pending",
      facultyId,
      facultyName,
      facultyEmail,
      department,
      submittedAt: new Date().toLocaleDateString(),
      adminRemarks: "",
      reviewedAt: null,
    };

    setItems((prev) => [entry, ...(prev || [])]);
    toast.success("Request submitted to Campus Administration for review.");
    setModalOpen(false);
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Requests & Approvals"
        subtitle="Submit and track leave, class replacement, and facility requests reviewed by Admin"
        actions={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New Request
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center justify-between border-l-4 border-navy-700">
          <div>
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-bold text-navy-900 mt-1">{myRequests.length}</p>
          </div>
          <FileClock className="text-navy-400" size={26} />
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4 border-amber-500">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</p>
          </div>
          <Clock className="text-amber-500" size={26} />
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4 border-emerald-500">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{approvedCount}</p>
          </div>
          <CheckCircle2 className="text-emerald-500" size={26} />
        </div>
        <div className="card p-4 flex items-center justify-between border-l-4 border-rose-500">
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Declined</p>
            <p className="text-2xl font-bold text-rose-800 mt-1">{rejectedCount}</p>
          </div>
          <XCircle className="text-rose-500" size={26} />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === status
                ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                : "bg-white text-navy-700 border-slate-200 hover:border-teal-400"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests Data Table */}
      <div className="card p-5">
        <DataTable
          columns={["ID", "Type", "Date Requested", "Reason & Details", "Status", "Admin Remarks"]}
          data={displayedRequests}
          emptyMessage="No requests found under this filter."
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-mono text-xs font-semibold text-navy-600">{r.id}</td>
              <td className="px-3 py-3 font-semibold text-navy-800">
                <div>{r.type}</div>
                {r.submittedAt && <div className="text-[11px] font-normal text-slate-400">Submitted: {r.submittedAt}</div>}
              </td>
              <td className="px-3 py-3 text-navy-600 whitespace-nowrap">{r.date}</td>
              <td className="px-3 py-3 max-w-xs">
                <p className="text-sm font-medium text-navy-800">{r.reason}</p>
                {r.description && <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{r.description}</p>}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <span
                  className={
                    r.status === "Approved"
                      ? "badge-green"
                      : r.status === "Rejected"
                      ? "badge-red"
                      : "badge-amber"
                  }
                >
                  {r.status}
                </span>
              </td>
              <td className="px-3 py-3 max-w-sm">
                {r.adminRemarks ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                    <p className="font-medium text-navy-800">{r.adminRemarks}</p>
                    {r.reviewedAt && (
                      <p className="text-[10px] text-slate-400 mt-1">Reviewed on {r.reviewedAt}</p>
                    )}
                  </div>
                ) : r.status === "Pending" ? (
                  <span className="text-xs text-amber-600 flex items-center gap-1 italic">
                    <Clock size={12} /> Awaiting admin review
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </>
          )}
        />
      </div>

      {/* Submission Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit New Faculty Request"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit}>
              Submit Request
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
            Submitting as <strong>{facultyName}</strong> ({department}) • Reviewed directly by the Administrator.
          </div>

          <div>
            <label className="label">Request Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {requestTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Target Date</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Reason / Subject</label>
            <input
              className="input"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Attending National AI Conference / Medical Leave"
            />
          </div>

          <div>
            <label className="label">Detailed Description</label>
            <textarea
              rows={3}
              className="input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Explain any arrangements made (e.g. substitute faculty, rescheduled lecture times)..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
