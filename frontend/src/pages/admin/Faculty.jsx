import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  BookOpen,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { departments } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import * as facultyService from "../../services/facultyService";
import { nextId } from "../../utils/idGenerator";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: departments[0]?.name || "Computer Science",
  designation: "Assistant Professor",
  subjectNames: ["Computer Science"],
  status: "Active",
};

export default function AdminFaculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  async function loadFaculty() {
    const list = await facultyService.getFacultyList();
    setFacultyList(list || []);
  }

  useEffect(() => {
    loadFaculty();
  }, []);

  // Filtered faculty for table
  const filtered = facultyList.filter((f) => {
    const matchesDept = !deptFilter || f.department === deptFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      (f.name || "").toLowerCase().includes(q) ||
      (f.id || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  const selectedTeacher = facultyList.find((f) => f.id === selectedTeacherId || f.name === selectedTeacherId);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(f) {
    setEditing(f);
    setForm({
      name: f.name || "",
      email: f.email || "",
      phone: f.phone || "",
      department: f.department || departments[0]?.name,
      designation: f.designation || "Assistant Professor",
      subjectNames: Array.isArray(f.subjectNames) ? f.subjectNames : [f.department || "Computer Science"],
      status: f.status || "Active",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }

    if (editing) {
      const updated = {
        ...editing,
        ...form,
        subjects: form.subjectNames.length,
      };
      await facultyService.updateFacultyProfile(updated);
      toast.success("Faculty member updated.");
    } else {
      const newEntry = {
        ...form,
        id: nextId(facultyList, "FAC", { start: 2001 }),
        subjects: form.subjectNames.length,
      };
      await facultyService.addFaculty(newEntry);
      toast.success("New faculty member registered.");
    }

    setModalOpen(false);
    await loadFaculty();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await facultyService.deleteFaculty(deleteTarget.id);
    toast.success(`${deleteTarget.name} removed from faculty roster.`);
    if (selectedTeacherId === deleteTarget.id) {
      setSelectedTeacherId("");
    }
    setDeleteTarget(null);
    await loadFaculty();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Management & Roster"
        subtitle={`Institution-verified teachers (${facultyList.length} active faculty)`}
        actions={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Register Faculty
          </button>
        }
      />

      {/* Prominent Real Teachers Dropdown Selector */}
      <div className="card p-5 border-2 border-teal-500/20 bg-gradient-to-r from-teal-50/30 via-white to-slate-50/30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-600" /> Real Teachers Directory
            </label>
            <p className="text-xs text-slate-500">
              Select any verified faculty member to inspect their complete profile and credentials
            </p>
          </div>
          <span className="badge-teal text-xs font-semibold">
            {facultyList.length} Real {facultyList.length === 1 ? "Teacher" : "Teachers"}
          </span>
        </div>

        <div className="relative max-w-xl">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="input pl-10 text-xs font-medium"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">-- Choose a real faculty member from database --</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.department} ({f.designation || "Faculty"}) • {f.email}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Teacher Detailed Profile Card */}
        {selectedTeacher && (
          <div className="p-4 bg-white rounded-2xl border border-teal-200 shadow-sm mt-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-navy-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedTeacher.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy-950">{selectedTeacher.name}</h3>
                    <span className="badge-green text-[10px] font-semibold">{selectedTeacher.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: <strong>{selectedTeacher.id}</strong> • {selectedTeacher.designation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(selectedTeacher)}
                  className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-teal-600 shrink-0" />
                <span className="truncate">{selectedTeacher.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 size={14} className="text-teal-600 shrink-0" />
                <span>{selectedTeacher.department}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen size={14} className="text-teal-600 shrink-0" />
                <span>
                  {Array.isArray(selectedTeacher.subjectNames) && selectedTeacher.subjectNames.length > 0
                    ? selectedTeacher.subjectNames.join(", ")
                    : selectedTeacher.department}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Department Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-10 text-xs !py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty name, ID, or email..."
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="input text-xs !py-2"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Data Table */}
      <div className="card p-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={User}
            title="No Faculty Members Registered"
            message="No verified teachers match the criteria. Click 'Register Faculty' to add real teachers to the institution."
          />
        ) : (
          <DataTable
            columns={["Faculty ID", "Name", "Department", "Designation", "Email", "Status", "Actions"]}
            data={filtered}
            renderRow={(f) => (
              <>
                <td className="px-3 py-3 font-mono text-xs font-semibold text-navy-700">{f.id}</td>
                <td className="px-3 py-3 font-semibold text-navy-950 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                      {f.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{f.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs">{f.department}</td>
                <td className="px-3 py-3 text-slate-600 text-xs">{f.designation}</td>
                <td className="px-3 py-3 text-slate-500 text-xs font-mono">{f.email}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={f.status} />
                </td>
                <td className="px-3 py-3 flex gap-1">
                  <button
                    className="btn-ghost !py-1.5 !px-2"
                    onClick={() => openEdit(f)}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn-ghost !py-1.5 !px-2 text-rose-500 hover:text-rose-700"
                    onClick={() => setDeleteTarget(f)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </>
            )}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Faculty Profile" : "Register Real Faculty Member"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              {editing ? "Save Changes" : "Register Faculty"}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Dr. Ramesh Rao"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="teacher@institution.edu"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Designation</label>
              <input
                className="input"
                value={form.designation}
                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                placeholder="e.g. Associate Professor"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Faculty Member"
        message={`Are you sure you want to remove ${deleteTarget?.name} from the active faculty roster?`}
      />
    </div>
  );
}
