import { useState } from "react";
import { GraduationCap, Pencil, Download } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import DashboardCard from "../../components/DashboardCard";
import { subjects, departments } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function AdminResults() {
  const [studentsList] = usePersistentState("students");
  const [overrides, setOverrides] = usePersistentState("resultsOverrides");

  // Derive a simple mock results roster from the student list, applying any
  // persisted marks edits on top of the deterministic mock baseline.
  const resultsRoster = studentsList.map((s, i) => {
    const baseSgpa = (7 + ((i * 37) % 30) / 10).toFixed(2);
    const baseCgpa = (7.2 + ((i * 23) % 28) / 10).toFixed(2);
    const ov = overrides?.[s.id];
    return { ...s, sgpa: ov?.sgpa ?? baseSgpa, cgpa: ov?.cgpa ?? baseCgpa };
  });

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [marks, setMarks] = useState({ subject: subjects[0]?.name, internal: 0, external: 0 });
  const toast = useToast();

  const filtered = resultsRoster.filter(
    (s) => (!dept || s.department === dept) && s.name.toLowerCase().includes(search.toLowerCase())
  );

  const avgSgpa = (filtered.reduce((a, s) => a + Number(s.sgpa), 0) / (filtered.length || 1)).toFixed(2);

  function saveMarks() {
    const total = marks.internal + marks.external;
    const newSgpa = Math.min(10, total / 10).toFixed(2);
    setOverrides((prev) => ({ ...(prev || {}), [editTarget.id]: { sgpa: newSgpa, cgpa: editTarget.cgpa } }));
    toast.success(`Marks saved for ${editTarget.name} in ${marks.subject}.`);
    setEditTarget(null);
  }

  return (
    <div>
      <PageHeader
        title="Results Management"
        subtitle="Manage and review academic results across the institution"
        actions={<button className="btn-secondary"><Download size={15} /> Export Report</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={GraduationCap} label="Avg. SGPA" value={avgSgpa} tone="navy" />
        <DashboardCard icon={GraduationCap} label="Students Evaluated" value={filtered.length} tone="teal" />
        <DashboardCard icon={GraduationCap} label="Subjects Tracked" value={subjects.length} tone="amber" />
        <DashboardCard icon={GraduationCap} label="Pass Rate" value="91%" tone="coral" />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search student..." />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
      </div>

      <div className="card p-5">
        <DataTable
          columns={["Student ID", "Name", "Department", "SGPA", "CGPA", "Actions"]}
          data={filtered}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{s.id}</td>
              <td className="px-3 py-3 text-navy-600">{s.name}</td>
              <td className="px-3 py-3 text-navy-500">{s.department}</td>
              <td className="px-3 py-3 text-navy-500">{s.sgpa}</td>
              <td className="px-3 py-3 font-semibold text-navy-800">{s.cgpa}</td>
              <td className="px-3 py-3">
                <button className="btn-ghost !py-1.5 !px-2" onClick={() => setEditTarget(s)}><Pencil size={14} /> Edit Marks</button>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `Edit Marks — ${editTarget.name}` : ""}
        footer={<><button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button><button className="btn-primary" onClick={saveMarks}>Save Marks</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Subject</label>
            <select className="input" value={marks.subject} onChange={(e) => setMarks((m) => ({ ...m, subject: e.target.value }))}>
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Internal Marks</label><input type="number" className="input" value={marks.internal} onChange={(e) => setMarks((m) => ({ ...m, internal: Number(e.target.value) }))} /></div>
          <div><label className="label">External Marks</label><input type="number" className="input" value={marks.external} onChange={(e) => setMarks((m) => ({ ...m, external: Number(e.target.value) }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
