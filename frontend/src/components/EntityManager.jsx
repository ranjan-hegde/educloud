import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "./PageHeader";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { usePersistentState } from "../hooks/usePersistentState";
import { nextId } from "../utils/idGenerator";

// Generic CRUD list manager used for Departments / Courses / Subjects.
// fields: [{ key, label, type }] — type: text | number
// storageKey: if provided, the list is persisted via storageService (localStorage)
// so changes survive navigation/refresh and are shared across dashboards.
export default function EntityManager({ title, subtitle, initialData, fields, idPrefix, searchKeys, storageKey }) {
  const persistent = usePersistentState(storageKey || "__entity_manager_unused__");
  const local = useState(initialData);
  const [items, setItems] = storageKey ? persistent : local;
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const filtered = items.filter((item) =>
    searchKeys.some((k) => String(item[k] || "").toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() {
    const empty = {};
    fields.forEach((f) => (empty[f.key] = f.type === "number" ? 0 : ""));
    setForm(empty);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setForm(item);
    setEditing(item);
    setModalOpen(true);
  }

  function save() {
    if (!form[fields[0].key]) { toast.error(`${fields[0].label} is required.`); return; }
    if (editing) {
      setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...form, id: editing.id } : i)));
      toast.success(`${title.slice(0, -1)} updated successfully.`);
    } else {
      setItems((prev) => [{ ...form, id: nextId(prev, idPrefix, { pad: 2 }) }, ...prev]);
      toast.success(`${title.slice(0, -1)} added successfully.`);
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success("Removed successfully.");
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add New</button>} />

      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
      </div>

      <div className="card p-5">
        <DataTable
          columns={[...fields.map((f) => f.label), "Actions"]}
          data={filtered}
          renderRow={(item) => (
            <>
              {fields.map((f) => (
                <td key={f.key} className="px-3 py-3 text-navy-600">{item[f.key]}</td>
              ))}
              <td className="px-3 py-3 flex gap-1">
                <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteTarget(item)}><Trash2 size={14} /></button>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? "Save Changes" : "Add"}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <label className="label">{f.label}</label>
              <input
                type={f.type === "number" ? "number" : "text"}
                className="input"
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Record"
        message="Are you sure you want to remove this record? This action cannot be undone."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
