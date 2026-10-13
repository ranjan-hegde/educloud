import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

const requestTypes = ["Leave Request", "Class Replacement Request", "Timetable Change Request", "Classroom Request"];
const emptyForm = { type: requestTypes[0], date: "", reason: "", description: "" };

export default function FacultyRequests() {
  const [items, setItems] = usePersistentState("requests");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  function submit() {
    if (!form.date || !form.reason) { toast.error("Date and reason are required."); return; }
    const entry = { ...form, id: nextId(items, "REQ", { start: 1000 }), status: "Pending" };
    setItems((prev) => [entry, ...prev]);
    toast.success("Request submitted for admin review.");
    setModalOpen(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <PageHeader
        title="Leave / Class Requests"
        subtitle="Submit leave, replacement, or scheduling requests for admin review"
        actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={15} /> New Request</button>}
      />

      <div className="card p-5">
        <DataTable
          columns={["Type", "Date", "Reason", "Status"]}
          data={items}
          emptyMessage="You haven't submitted any requests yet."
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{r.type}</td>
              <td className="px-3 py-3 text-navy-500">{r.date}</td>
              <td className="px-3 py-3 text-navy-500">{r.reason}</td>
              <td className="px-3 py-3">
                <span className={r.status === "Approved" ? "badge-green" : r.status === "Rejected" ? "badge-red" : "badge-amber"}>{r.status}</span>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Request"
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={submit}>Submit</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Request Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {requestTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
          <div><label className="label">Reason</label><input className="input" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Medical appointment" /></div>
          <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <p className="text-xs text-navy-400">Requests are reviewed by Admin. Approval workflow will be connected once the backend is available.</p>
        </div>
      </Modal>
    </div>
  );
}
