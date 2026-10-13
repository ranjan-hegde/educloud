import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import DashboardCard from "../../components/DashboardCard";
import { TrendLineChart } from "../../components/StatChart";
import { CalendarCheck, CalendarX, ListChecks } from "lucide-react";
import { attendanceTrend } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentAttendance() {
  const [attendanceSummary] = usePersistentState("attendanceSummary");
  const [subjectAttendance] = usePersistentState("subjectAttendance");

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Track your overall and subject-wise attendance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={CalendarCheck} label="Overall Attendance" value={`${attendanceSummary.overall}%`} tone="teal" />
        <DashboardCard icon={ListChecks} label="Present Days" value={attendanceSummary.present} tone="navy" />
        <DashboardCard icon={CalendarX} label="Absent Days" value={attendanceSummary.absent} tone="coral" />
        <DashboardCard icon={CalendarCheck} label="Total Classes" value={attendanceSummary.total} tone="amber" />
      </div>

      <div className="card p-5 mb-6">
        <p className="font-semibold text-navy-900 mb-4">6-Month Attendance Trend</p>
        <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" />
      </div>

      <div className="card p-5">
        <p className="font-semibold text-navy-900 mb-4">Subject-wise Attendance</p>
        <DataTable
          columns={["Subject", "Total Classes", "Present", "Absent", "Attendance"]}
          data={subjectAttendance}
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{r.subject}</td>
              <td className="px-3 py-3 text-navy-500">{r.total}</td>
              <td className="px-3 py-3 text-navy-500">{r.present}</td>
              <td className="px-3 py-3 text-navy-500">{r.absent}</td>
              <td className="px-3 py-3 w-56"><AttendanceStatus percentage={r.percentage} status={r.status} /></td>
            </>
          )}
        />
      </div>
    </div>
  );
}
