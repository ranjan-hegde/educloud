import { useState } from "react";
import { TrendingUp, Users, AlertTriangle, Award } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import { CompareBarChart } from "../../components/StatChart";
import { currentFaculty } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

// Deterministic mock average-marks generator so numbers stay stable across renders.
function avgMarksFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 97;
  return 55 + (hash % 40);
}

function statusFor(attendance, avgMarks) {
  if (attendance < 75 && avgMarks < 60) return "Needs Attention";
  if (attendance < 75) return "Low Attendance";
  if (avgMarks < 60) return "Needs Attention";
  return "Good";
}

export default function FacultyStudentPerformance() {
  const [studentsList] = usePersistentState("students");
  const [search, setSearch] = useState("");

  const roster = studentsList
    .filter((s) => s.department === currentFaculty.department || true) // faculty's assigned cohort in this demo model
    .map((s) => {
      const avgMarks = avgMarksFor(s.id);
      return { ...s, avgMarks, status: statusFor(s.attendance, avgMarks) };
    });

  const filtered = roster.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const atRisk = roster.filter((s) => s.status !== "Good");
  const avgAttendance = Math.round(roster.reduce((a, s) => a + s.attendance, 0) / (roster.length || 1));
  const avgMarksOverall = Math.round(roster.reduce((a, s) => a + s.avgMarks, 0) / (roster.length || 1));

  return (
    <div>
      <PageHeader title="Student Performance" subtitle="Track attendance, marks, and identify students who may need support" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={Users} label="Students Tracked" value={roster.length} tone="navy" />
        <DashboardCard icon={TrendingUp} label="Avg. Attendance" value={`${avgAttendance}%`} tone="teal" />
        <DashboardCard icon={Award} label="Avg. Marks" value={`${avgMarksOverall}/100`} tone="amber" />
        <DashboardCard icon={AlertTriangle} label="At Risk" value={atRisk.length} tone="coral" />
      </div>

      <div className="card p-5 mb-6">
        <p className="font-semibold text-navy-900 mb-4">Attendance vs. Marks</p>
        <CompareBarChart
          data={filtered.slice(0, 8).map((s) => ({ name: s.name.split(" ")[0], attendance: s.attendance, marks: s.avgMarks }))}
          xKey="name"
          bars={[{ key: "attendance", color: "#1f3a6b" }, { key: "marks", color: "#0ea5a0" }]}
        />
      </div>

      <div className="mb-5"><SearchBar value={search} onChange={setSearch} placeholder="Search students..." /></div>

      <div className="card p-5">
        <DataTable
          columns={["Student", "Attendance", "Avg. Marks", "Status", "Overall"]}
          data={filtered}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{s.name}</td>
              <td className="px-3 py-3 text-navy-500">{s.attendance}%</td>
              <td className="px-3 py-3 text-navy-500">{s.avgMarks}/100</td>
              <td className="px-3 py-3">
                <span className={s.status === "Good" ? "badge-green" : s.status === "Low Attendance" ? "badge-amber" : "badge-red"}>{s.status}</span>
              </td>
              <td className="px-3 py-3 text-navy-500">{s.status === "Good" ? "On track" : "Review recommended"}</td>
            </>
          )}
        />
      </div>
    </div>
  );
}
