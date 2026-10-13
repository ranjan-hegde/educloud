import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { departments, courses } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { nextId } from "../../utils/idGenerator";
import { useState } from "react";

const emptyForm = { name: "", email: "", phone: "", department: "", course: "", semester: 1, status: "Active" };

export default function AdminStudents() {
  const [items, setItems] = usePersistentState("students");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const filtered = items.filter((s) =>
    (!dept || s.department === dept) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(s) { setEditing(s); setForm(s); setModalOpen(true); }

  function save() {
    if (!form.name || !form.email) { toast.error("Name and email are required."); return; }
    if (editing) {
      setItems((prev) => prev.map((s) => (s.id === editing.id ? { ...form, id: editing.id, attendance: editing.attendance } : s)));
      toast.success("Student updated successfully.");
    } else {
      setItems((prev) => [{ ...form, id: nextId(prev, "STU", { start: 2300 }), attendance: 0 }, ...prev]);
      toast.success("Student added successfully.");
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} removed.`);
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Student Management" subtitle={`${items.length} students enrolled`} actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Student</button>} />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID..." />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
      </div>

      <div className="card p-5">
        <DataTable
          columns={["Student ID", "Name", "Department", "Course", "Attendance", "Status", "Actions"]}
          data={filtered}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{s.id}</td>
              <td className="px-3 py-3 text-navy-600">{s.name}</td>
              <td className="px-3 py-3 text-navy-500">{s.department}</td>
              <td className="px-3 py-3 text-navy-500">{s.course}</td>
              <td className="px-3 py-3 text-navy-500">{s.attendance}%</td>
              <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-3 py-3 flex gap-1">
                <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteTarget(s)}><Trash2 size={14} /></button>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Student" : "Add Student"}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? "Save Changes" : "Add Student"}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Course</label>
            <select className="input" value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
              <option value="">Select</option>
              {courses.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Semester</label>
            <select className="input" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Student"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
