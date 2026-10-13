import { useState } from "react";
import { CalendarCheck, TrendingUp, AlertTriangle, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DataTable from "../../components/DataTable";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import { TrendLineChart, CompareBarChart } from "../../components/StatChart";
import { departments, monthlyAttendanceTrend, departmentPerformance } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

function toStatus(pct) {
  if (pct >= 90) return "Excellent";
  if (pct >= 75) return "Good";
  if (pct >= 60) return "Warning";
  return "Critical";
}

export default function AdminAttendance() {
  const [studentsList] = usePersistentState("students");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");

  const filtered = studentsList.filter(
    (s) =>
      (!dept || s.department === dept) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))
  );

  const critical = studentsList.filter((s) => s.attendance < 60).length;
  const avg = Math.round(studentsList.reduce((a, s) => a + s.attendance, 0) / studentsList.length);

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Institution-wide attendance overview and per-student records" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={CalendarCheck} label="Average Attendance" value={`${avg}%`} tone="teal" />
        <DashboardCard icon={Users} label="Students Tracked" value={studentsList.length} tone="navy" />
        <DashboardCard icon={AlertTriangle} label="Below 60% (Critical)" value={critical} tone="coral" />
        <DashboardCard icon={TrendingUp} label="Institution Rate (6mo)" value="82%" tone="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Attendance Trend</p>
          <TrendLineChart data={monthlyAttendanceTrend} dataKey="rate" xKey="month" />
        </div>
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Department-wise Attendance</p>
          <CompareBarChart data={departmentPerformance} xKey="department" bars={[{ key: "avgAttendance", color: "#1f3a6b" }]} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or student ID..." />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
      </div>

      <div className="card p-5">
        <p className="font-semibold text-navy-900 mb-4">Student-wise Attendance Records</p>
        <DataTable
          columns={["Student ID", "Name", "Department", "Course", "Attendance"]}
          data={filtered}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{s.id}</td>
              <td className="px-3 py-3 text-navy-600">{s.name}</td>
              <td className="px-3 py-3 text-navy-500">{s.department}</td>
              <td className="px-3 py-3 text-navy-500">{s.course}</td>
              <td className="px-3 py-3 w-56"><AttendanceStatus percentage={s.attendance} status={toStatus(s.attendance)} /></td>
            </>
          )}
        />
      </div>
    </div>
  );
}
