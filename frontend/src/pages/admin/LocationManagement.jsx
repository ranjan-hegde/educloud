import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, LocateFixed, Loader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { getCurrentPosition } from "../../services/geoUtils";
import { nextId } from "../../utils/idGenerator";

const emptyForm = { name: "", room: "", latitude: "", longitude: "", radius: 50 };

export default function AdminLocationManagement() {
  const [items, setItems] = usePersistentState("locations");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState(items[0]);
  const [locating, setLocating] = useState(false);
  const toast = useToast();

  async function useMyLocation() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setForm((f) => ({ ...f, latitude: pos.latitude.toFixed(5), longitude: pos.longitude.toFixed(5) }));
      toast.success("Current device location captured.");
    } catch (err) {
      toast.error(err.message || "Couldn't get your current location.");
    } finally {
      setLocating(false);
    }
  }

  const filtered = items.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(l) { setEditing(l); setForm(l); setModalOpen(true); }

  function save() {
    if (!form.name || !form.room) { toast.error("Location name and room are required."); return; }
    if (editing) {
      setItems((prev) => prev.map((l) => (l.id === editing.id ? { ...form, id: editing.id } : l)));
      toast.success("Location updated successfully.");
    } else {
      const created = { ...form, id: nextId(items, "LOC", { pad: 2 }) };
      setItems((prev) => [created, ...prev]);
      toast.success("Location added successfully.");
    }
    setModalOpen(false);
  }

  function confirmDelete() {
    setItems((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    toast.success("Location removed.");
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Location Management"
        subtitle="Assign physical classroom coordinates and allowed radius for QR attendance"
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Location</button>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-5"><SearchBar value={search} onChange={setSearch} placeholder="Search locations..." /></div>
          <div className="card p-5">
            <DataTable
              columns={["Location", "Room", "Latitude", "Longitude", "Radius", "Actions"]}
              data={filtered}
              renderRow={(l) => (
                <>
                  <td className="px-3 py-3 font-medium text-navy-800 cursor-pointer" onClick={() => setSelected(l)}>{l.name}</td>
                  <td className="px-3 py-3 text-navy-500">{l.room}</td>
                  <td className="px-3 py-3 text-navy-500">{l.latitude}</td>
                  <td className="px-3 py-3 text-navy-500">{l.longitude}</td>
                  <td className="px-3 py-3 text-navy-500">{l.radius}m</td>
                  <td className="px-3 py-3 flex gap-1">
                    <button className="btn-ghost !py-1.5 !px-2" onClick={() => openEdit(l)}><Pencil size={14} /></button>
                    <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => setDeleteTarget(l)}><Trash2 size={14} /></button>
                  </td>
                </>
              )}
            />
          </div>
        </div>

        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Location Preview</p>
          <div className="relative rounded-2xl bg-navy-50 border border-dashed border-navy-200 aspect-square flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#d7e1f0 1px, transparent 1px), linear-gradient(90deg, #d7e1f0 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border-4 border-accent-teal/30 flex items-center justify-center animate-pulse">
                <MapPin size={26} className="text-navy-800" />
              </div>
            </div>
          </div>
          {selected && (
            <div className="mt-4 space-y-1.5 text-sm">
              <p className="font-medium text-navy-900">{selected.name}</p>
              <p className="text-navy-500">Lat: {selected.latitude} · Lng: {selected.longitude}</p>
              <p className="text-navy-500">Allowed radius: {selected.radius} meters</p>
            </div>
          )}
          <p className="text-xs text-navy-400 mt-4">A real interactive map will be connected here once a maps/geolocation API is integrated with the backend.</p>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Location" : "Add Location"}
        footer={<><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? "Save Changes" : "Add Location"}</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Location Name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Room</label><input className="input" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} /></div>
          <div><label className="label">Allowed Radius (m)</label><input type="number" className="input" value={form.radius} onChange={(e) => setForm((f) => ({ ...f, radius: Number(e.target.value) }))} /></div>
          <div><label className="label">Latitude</label><input className="input" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="e.g. 12.29588" /></div>
          <div><label className="label">Longitude</label><input className="input" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="e.g. 76.63941" /></div>
          <div className="sm:col-span-2">
            <button type="button" className="btn-secondary w-full" onClick={useMyLocation} disabled={locating}>
              {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />} {locating ? "Getting current location..." : "Use My Current Location"}
            </button>
            <p className="text-xs text-navy-400 mt-1.5">Uses your device's real GPS via the browser Geolocation API to fill in exact coordinates.</p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Location"
        message="Are you sure you want to remove this location? Sessions using it will need reassignment."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
