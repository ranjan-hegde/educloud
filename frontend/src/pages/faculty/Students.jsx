import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import { usePersistentState } from "../../hooks/usePersistentState";
import * as studentService from "../../services/studentService";

export default function FacultyStudents() {
  const [studentsList, setStudentsList] = usePersistentState("students");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically fetch real students from backend and newly registered student accounts
    studentService.getStudents().then((fresh) => {
      if (fresh && fresh.length > 0) {
        setStudentsList(fresh);
      }
    });
  }, [setStudentsList]);

  const departments = [...new Set((studentsList || []).map((s) => s.department).filter(Boolean))];
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = (studentsList || []).filter((s) =>
    (!dept || s.department === dept) &&
    ((s.name || "").toLowerCase().includes(search.toLowerCase()) || (s.id || s.rollNo || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Students Roster"
        subtitle={`Viewing ${filtered.length} enrolled student accounts`}
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student name or roll number..." />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments.length ? departments : ["Computer Applications", "Computer Science", "Commerce"]} />
      </div>
      <div className="card p-5">
        <DataTable
          columns={["Roll / Student ID", "Name", "Course", "Semester", "Department", "Attendance", "Action"]}
          data={filtered}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 font-mono font-medium text-navy-800">{s.rollNo || s.id}</td>
              <td className="px-3 py-3 font-semibold text-navy-950">
                {s.name}
                {s.isNew && <span className="ml-2 badge-green text-[10px]">New</span>}
              </td>
              <td className="px-3 py-3 text-navy-600">{s.course || "BCA"}</td>
              <td className="px-3 py-3 text-navy-500">{s.semester || "1st"}</td>
              <td className="px-3 py-3 text-navy-500">{s.department || "Computer Applications"}</td>
              <td className="px-3 py-3 w-36"><AttendanceStatus percentage={s.attendance ?? 95} /></td>
              <td className="px-3 py-3">
                <button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={() => setSelected(s)}>
                  View Profile
                </button>
              </td>
            </>
          )}
        />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || "Student Profile"}>
        {selected && (
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Roll / Student ID</span>
              <span className="font-mono font-semibold text-navy-900">{selected.rollNo || selected.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Email Address</span>
              <span className="font-medium text-navy-800">{selected.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Phone</span>
              <span className="font-medium text-navy-800">{selected.phone || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Course & Semester</span>
              <span className="font-medium text-navy-800">{selected.course || "BCA"} · {selected.semester || "1st Semester"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Department</span>
              <span className="font-medium text-navy-800">{selected.department || "Computer Applications"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Current Attendance</span>
              <span className="font-bold text-emerald-600">{selected.attendance ?? 95}%</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
