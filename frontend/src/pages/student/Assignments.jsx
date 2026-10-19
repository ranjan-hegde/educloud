import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentAssignments() {
  const [items, setItems] = usePersistentState("assignments");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  function openSubmit(a) { setSelected(a); setModalOpen(true); }
  function handleSubmit() {
    setItems((prev) => (prev || []).map((a) => (a.id === selected.id ? { ...a, status: "Submitted", submissions: (a.submissions || 0) + 1 } : a)));
    setModalOpen(false);
    toast.success(`Submission received for "${selected.title}".`);
  }

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Track due dates and submission status" />
      <div className="card p-5">
        <DataTable
          columns={["Title", "Subject", "Due Date", "Status", "Action"]}
          data={Array.isArray(items) ? items : []}
          renderRow={(a) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{a.title}</td>
              <td className="px-3 py-3 text-navy-500">{a.subject}</td>
              <td className="px-3 py-3 text-navy-500">{a.dueDate}</td>
              <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-3 py-3">
                {a.status === "Pending" ? (
                  <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => openSubmit(a)}><Upload size={13} /> Submit</button>
                ) : (
                  <span className="text-xs text-navy-300">Submitted</span>
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
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={handleSubmit}>Submit Assignment</button></>}
      >
        <div className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center">
          <Upload size={28} className="mx-auto text-navy-300 mb-3" />
          <p className="text-sm text-navy-500">Drag & drop your file here, or click to browse</p>
          <p className="text-xs text-navy-300 mt-1">Mock upload UI — file storage not connected in this phase.</p>
        </div>
      </Modal>
    </div>
  );
}
