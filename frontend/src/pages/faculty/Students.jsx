import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function FacultyStudents() {
  const [studentsList] = usePersistentState("students");
  const departments = [...new Set(studentsList.map((s) => s.department))];
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = studentsList.filter((s) =>
    (!dept || s.department === dept) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <PageHeader title="Students" subtitle="Search and view details of enrolled students" />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID..." />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments} />
      </div>
      <div className="card p-5">
        <DataTable
          columns={["Student ID", "Name", "Course", "Semester", "Attendance", "Action"]}
          data={filtered}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{s.id}</td>
              <td className="px-3 py-3 text-navy-600">{s.name}</td>
              <td className="px-3 py-3 text-navy-500">{s.course}</td>
              <td className="px-3 py-3 text-navy-500">{s.semester}</td>
              <td className="px-3 py-3 w-40"><AttendanceStatus percentage={s.attendance} /></td>
              <td className="px-3 py-3"><button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={() => setSelected(s)}>View</button></td>
            </>
          )}
        />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-navy-400">Student ID</span><span className="font-medium text-navy-800">{selected.id}</span></div>
            <div className="flex justify-between"><span className="text-navy-400">Email</span><span className="font-medium text-navy-800">{selected.email}</span></div>
            <div className="flex justify-between"><span className="text-navy-400">Phone</span><span className="font-medium text-navy-800">{selected.phone}</span></div>
            <div className="flex justify-between"><span className="text-navy-400">Department</span><span className="font-medium text-navy-800">{selected.department}</span></div>
            <div className="flex justify-between"><span className="text-navy-400">Attendance</span><span className="font-medium text-navy-800">{selected.attendance}%</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
