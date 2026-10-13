import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { departments, subjects } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";

const emptyForm = { name: "", email: "", department: "", designation: "", subjectNames: [], subjects: 0, status: "Active" };

export default function AdminFaculty() {
  const [items, setItems] = usePersistentState("faculty");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const filtered = items.filter((f) =>
    (!dept || f.department === dept) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(f) { setEditing(f); setForm({ ...f, subjectNames: f.subjectNames || [] }); setModalOpen(true); }

  function save() {
    if (!form.name || !form.email) { toast.error("Name and email are required."); return; }
    const payload = { ...form, subjects: (form.subjectNames || []).length };
    if (editing) {
      setItems((prev) => prev.map((f) => (f.id === editing.id ? { ...payload, id: editing.id } : f)));
      toast.success("Faculty updated successfully.");
    } else {
      setItems((prev) => [{ ...payload, id: nextId(prev, "FAC", { start: 1040 }) }, ...prev]);
      toast.success("Faculty added successfully.");
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setItems((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} removed.`);
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Faculty Management" subtitle={`${items.length} faculty members`} actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Faculty</button>} />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID..." />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
      </div>

      <div className="card p-5">
        <DataTable
          columns={["Faculty ID", "Name", "Department", "Designation", "Subjects", "Status", "Actions"]}
          data={filtered}
          renderRow={(f) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{f.id}</td>
              <td className="px-3 py-3 text-navy-600">{f.name}</td>
              <td className="px-3 py-3 text-navy-500">{f.department}</td>
              <td className="px-3 py-3 text-navy-500">{f.designation}</td>
              <td className="px-3 py-3 text-navy-500">{f.subjects}</td>
              <td className="px-3 py-3"><StatusBadge status={f.status} /></td>
              <td className="px-3 py-3 flex gap-1">
                <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(f)}><Pencil size={14} /></button>
                <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteTarget(f)}><Trash2 size={14} /></button>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Faculty" : "Add Faculty"}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? "Save Changes" : "Add Faculty"}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div><label className="label">Designation</label><input className="input" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} /></div>
          <div>
            <label className="label">Assign Subjects</label>
            <select
              className="input"
              multiple
              value={form.subjectNames || []}
              onChange={(e) => setForm((f) => ({ ...f, subjectNames: Array.from(e.target.selectedOptions).map((o) => o.value) }))}
            >
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <p className="text-xs text-navy-400 mt-1">Hold Ctrl/Cmd to select multiple. {form.subjectNames?.length || 0} selected.</p>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option>Active</option><option>On Leave</option><option>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Faculty"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
