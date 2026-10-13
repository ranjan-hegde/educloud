import { useState } from "react";
import { Download, Users, GraduationCap, CalendarCheck, QrCode } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Filter from "../../components/Filter";
import DashboardCard from "../../components/DashboardCard";
import DataTable from "../../components/DataTable";
import { TrendLineChart, CompareBarChart } from "../../components/StatChart";
import { reportStats, departmentPerformance, monthlyAttendanceTrend, departments, qrAttendanceHistory } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

const reportTypes = ["Student Performance", "Attendance", "Faculty", "Course", "Department", "QR Attendance", "Location-based Attendance"];

export default function AdminReports() {
  const [reportType, setReportType] = useState("");
  const [dept, setDept] = useState("");
  const [dateRange, setDateRange] = useState("Last 6 months");
  const toast = useToast();

  function exportReport() { toast.success("Report export started — this is a mock action in the frontend phase."); }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Institution-wide analytics and downloadable reports"
        actions={<button className="btn-primary" onClick={exportReport}><Download size={15} /> Export</button>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Filter label="All report types" value={reportType} onChange={setReportType} options={reportTypes} />
        <Filter label="All departments" value={dept} onChange={setDept} options={departments.map((d) => d.name)} />
        <Filter label="Date range" value={dateRange} onChange={setDateRange} options={["Last 30 days", "Last 3 months", "Last 6 months", "This academic year"]} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={Users} label="Total Students" value={reportStats.totalStudents.toLocaleString()} tone="navy" />
        <DashboardCard icon={GraduationCap} label="Total Faculty" value={reportStats.totalFaculty} tone="teal" />
        <DashboardCard icon={CalendarCheck} label="Attendance Rate" value={`${reportStats.attendanceRate}%`} tone="amber" />
        <DashboardCard icon={QrCode} label="Total Courses" value={reportStats.totalCourses} tone="coral" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Attendance Trend</p>
          <TrendLineChart data={monthlyAttendanceTrend} dataKey="rate" xKey="month" />
        </div>
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Department Performance</p>
          <CompareBarChart data={departmentPerformance} xKey="department" bars={[{ key: "avgAttendance", color: "#1f3a6b" }, { key: "avgResult", color: "#0ea5a0" }]} />
        </div>
      </div>

      <div className="card p-5">
        <p className="font-semibold text-navy-900 mb-4">QR & Location-based Attendance Log</p>
        <DataTable
          columns={["Subject", "Date", "Time", "Status", "Location Check"]}
          data={qrAttendanceHistory}
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{r.subject}</td>
              <td className="px-3 py-3 text-navy-500">{r.date}</td>
              <td className="px-3 py-3 text-navy-500">{r.time}</td>
              <td className="px-3 py-3"><span className={r.status === "Present" ? "badge-green" : "badge-red"}>{r.status}</span></td>
              <td className="px-3 py-3 text-navy-500">{r.location}</td>
            </>
          )}
        />
      </div>
    </div>
  );
}
