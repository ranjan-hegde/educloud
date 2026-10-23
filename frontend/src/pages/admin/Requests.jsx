import { useState } from "react";
import { Check, X, FileClock, Filter, MessageSquare, AlertCircle, Calendar, User, Search } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useToast } from "../../context/ToastContext";
import * as notificationService from "../../services/notificationService";

const statuses = ["All", "Pending", "Approved", "Rejected"];

export default function AdminRequests() {
  const [requests, setRequests] = usePersistentState("requests");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // 'approve' | 'reject'
  const [adminRemarks, setAdminRemarks] = useState("");
  const toast = useToast();

  const filtered = (requests || []).filter((r) => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const query = search.toLowerCase();
    const matchesSearch =
      (r.facultyName || "").toLowerCase().includes(query) ||
      (r.type || "").toLowerCase().includes(query) ||
      (r.reason || "").toLowerCase().includes(query) ||
      (r.id || "").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = (requests || []).filter((r) => r.status === "Pending").length;

  function openReview(request, action) {
    setSelectedRequest(request);
    setReviewAction(action);
    setAdminRemarks("");
  }

  async function submitReview() {
    if (!selectedRequest || !reviewAction) return;

    const newStatus = reviewAction === "approve" ? "Approved" : "Rejected";
    const updated = (requests || []).map((r) =>
      r.id === selectedRequest.id
        ? {
            ...r,
            status: newStatus,
            adminRemarks: adminRemarks.trim() || (newStatus === "Approved" ? "Approved by Administration." : "Declined."),
            reviewedAt: new Date().toLocaleDateString(),
          }
        : r
    );

    setRequests(updated);

    // Notify the faculty member
    await notificationService.sendAnnouncement({
      title: `Request ${newStatus}: ${selectedRequest.type}`,
      message: `Your ${selectedRequest.type} for ${selectedRequest.date || "requested date"} has been ${newStatus.toUpperCase()}.${
        adminRemarks ? ` Remarks: "${adminRemarks}"` : ""
      }`,
      category: "Academic",
      recipient: selectedRequest.facultyName || "Faculty",
      postedBy: "admin",
      postedByName: "Campus Administrator",
      priority: newStatus === "Approved" ? "Normal" : "Important",
    });

    toast.success(`Request ${newStatus.toLowerCase()} successfully.`);
    setSelectedRequest(null);
    setReviewAction(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Requests & Approvals"
        subtitle={`Review leave, replacement, and scheduling requests (${pendingCount} pending)`}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {statuses.map((s) => {
            const count = s === "All" ? requests?.length || 0 : (requests || []).filter((r) => r.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterStatus === s
                    ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                    : "bg-white text-navy-700 border-slate-200 hover:border-teal-400"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-10 text-xs !py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty, type, or reason..."
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="card p-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileClock}
            title="No requests found"
            message="No faculty requests match the selected status filter."
          />
        ) : (
          <DataTable
            columns={["Request ID", "Faculty Member", "Request Type", "Date / Period", "Reason", "Status", "Actions"]}
            data={filtered}
            renderRow={(r) => (
              <>
                <td className="px-3 py-3 font-mono font-medium text-navy-900">{r.id}</td>
                <td className="px-3 py-3 font-semibold text-navy-950">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-teal-50 text-accent-teal font-bold flex items-center justify-center text-[10px]">
                      {r.facultyName?.slice(0, 2).toUpperCase() || "FC"}
                    </div>
                    <div>
                      <p>{r.facultyName || "Faculty Member"}</p>
                      <span className="text-[10px] text-slate-400">{r.department || "Academic Dept"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 font-medium text-navy-800">{r.type}</td>
                <td className="px-3 py-3 text-slate-500 font-mono">{r.date || "—"}</td>
                <td className="px-3 py-3 text-slate-600 max-w-xs">
                  <p className="truncate font-medium">{r.reason}</p>
                  {r.description && <p className="text-[11px] text-slate-400 truncate mt-0.5">{r.description}</p>}
                  {r.adminRemarks && (
                    <p className="text-[11px] text-emerald-700 italic mt-0.5">Admin: {r.adminRemarks}</p>
                  )}
                </td>
                <td className="px-3 py-3">
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
                <td className="px-3 py-3">
                  {r.status === "Pending" ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openReview(r, "approve")}
                        className="btn-primary !py-1 !px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                        title="Approve Request"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => openReview(r, "reject")}
                        className="btn-secondary !py-1 !px-2.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 flex items-center gap-1"
                        title="Reject Request"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                  )}
                </td>
              </>
            )}
          />
        )}
      </div>

      {/* Review Modal */}
      <Modal
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={reviewAction === "approve" ? "Approve Faculty Request" : "Reject Faculty Request"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelectedRequest(null)}>
              Cancel
            </button>
            <button
              className={reviewAction === "approve" ? "btn-primary bg-emerald-600 hover:bg-emerald-700" : "btn-primary bg-rose-600 hover:bg-rose-700"}
              onClick={submitReview}
            >
              Confirm {reviewAction === "approve" ? "Approval" : "Rejection"}
            </button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Faculty:</span>
                <span className="font-semibold text-navy-950">{selectedRequest.facultyName || "Faculty Member"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Request Type:</span>
                <span className="font-medium text-navy-900">{selectedRequest.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-mono text-navy-800">{selectedRequest.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reason:</span>
                <span className="text-navy-800 font-medium">{selectedRequest.reason}</span>
              </div>
              {selectedRequest.description && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Details:</span>
                  <p className="text-navy-700 leading-relaxed">{selectedRequest.description}</p>
                </div>
              )}
            </div>

            <div>
              <label className="label">Admin Remarks / Notes (Optional)</label>
              <textarea
                rows={3}
                className="input"
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder={
                  reviewAction === "approve"
                    ? "e.g. Approved. Please ensure replacement teacher is arranged."
                    : "e.g. Declined due to scheduled institutional examinations."
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
