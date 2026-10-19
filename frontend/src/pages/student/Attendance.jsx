import DataTable from "../../components/DataTable";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import { TrendLineChart } from "../../components/StatChart";
import { CalendarCheck, CalendarX, ListChecks } from "lucide-react";
import { attendanceTrend } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentAttendance() {
  const [attendanceSummary] = usePersistentState("attendanceSummary");
  const [subjectAttendance] = usePersistentState("subjectAttendance");

  const stats = [
    { label: "Overall Attendance", value: `${attendanceSummary?.overall ?? 0}%`, icon: CalendarCheck, tone: "text-emerald-500 bg-emerald-500/10" },
    { label: "Present Days", value: attendanceSummary?.present ?? 0, icon: ListChecks, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Absent Days", value: attendanceSummary?.absent ?? 0, icon: CalendarX, tone: "text-rose-500 bg-rose-500/10" },
    { label: "Total Classes", value: attendanceSummary?.total ?? 0, icon: CalendarCheck, tone: "text-amber-500 bg-amber-500/10" },
  ];

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
          Attendance Record
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
          Student Attendance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your overall and subject-wise attendance performance across the semester
        </p>
      </div>

      {/* 2. Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 soft-line-b divide-y sm:divide-y-0 sm:divide-x divide-black/5 dark:divide-white/10">
        {stats.map((s) => (
          <div key={s.label} className="p-4 sm:p-5 flex items-center justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                {s.value}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs border border-white/40 dark:border-white/10 ${s.tone}`}>
              <s.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. 6-Month Attendance Trend */}
      <div className="p-6 soft-line-b">
        <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight mb-4">6-Month Attendance Trend</p>
        <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" color="#0ea5a0" />
      </div>

      {/* 4. Subject-wise Attendance Table */}
      <div className="p-6">
        <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight mb-4">Subject-wise Attendance</p>
        <DataTable
          columns={["Subject", "Total Classes", "Present", "Absent", "Attendance"]}
          data={Array.isArray(subjectAttendance) ? subjectAttendance : []}
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{r.subject}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{r.total}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{r.present}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{r.absent}</td>
              <td className="px-3 py-3 w-56"><AttendanceStatus percentage={r.percentage} status={r.status} /></td>
            </>
          )}
        />
      </div>
    </div>
  );
}
