import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import DashboardCard from "../../components/DashboardCard";
import { TrendLineChart } from "../../components/StatChart";
import { GraduationCap, TrendingUp, Percent } from "lucide-react";
import { resultsData, pastSemesterResults } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentResults() {
  const [overrides] = usePersistentState("studentMarksOverrides");
  const semesters = pastSemesterResults.map((s) => s.semester);
  const [activeSemester, setActiveSemester] = useState(semesters[semesters.length - 1]);
  const isLatest = activeSemester === semesters[semesters.length - 1];
  const base = pastSemesterResults.find((s) => s.semester === activeSemester) ?? pastSemesterResults[pastSemesterResults.length - 1];

  // Faculty-entered marks (via Faculty → Marks) are stored as per-subject
  // overrides and only apply to the current/latest semester's marks.
  const current = isLatest
    ? { ...base, subjectMarks: base.subjectMarks.map((r) => (overrides?.[r.subject] ? { ...r, ...overrides[r.subject] } : r)) }
    : base;

  return (
    <div>
      <PageHeader title="Results" subtitle={`Academic performance — ${resultsData.semester} (overall)`} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <DashboardCard icon={GraduationCap} label="CGPA" value={resultsData.cgpa} tone="navy" />
        <DashboardCard icon={TrendingUp} label="SGPA" value={resultsData.sgpa} tone="teal" />
        <DashboardCard icon={Percent} label="Percentage" value={`${resultsData.percentage}%`} tone="amber" />
      </div>

      <div className="card p-5 mb-6">
        <p className="font-semibold text-navy-900 mb-4">SGPA Progress</p>
        <TrendLineChart data={resultsData.semesterHistory} dataKey="sgpa" xKey="semester" color="#0ea5a0" />
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-semibold text-navy-900">
            Subject-wise Marks {isLatest ? "— Current Semester" : "— Previous Semester"}
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setActiveSemester(sem)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeSemester === sem ? "bg-navy-800 text-white" : "bg-white border border-surface-border text-navy-600 hover:bg-navy-50"}`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 text-sm text-navy-500">
          <span>SGPA: <span className="font-semibold text-navy-800">{current.sgpa}</span></span>
          <span>Percentage: <span className="font-semibold text-navy-800">{current.percentage}%</span></span>
        </div>

        <DataTable
          columns={["Subject", "Credits", "Internal", "External", "Total", "Grade"]}
          data={current.subjectMarks}
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{r.subject}</td>
              <td className="px-3 py-3 text-navy-500">{r.credits}</td>
              <td className="px-3 py-3 text-navy-500">{r.internal}</td>
              <td className="px-3 py-3 text-navy-500">{r.external}</td>
              <td className="px-3 py-3 font-semibold text-navy-800">{r.total}/100</td>
              <td className="px-3 py-3"><span className="badge-green">{r.grade}</span></td>
            </>
          )}
        />
      </div>
    </div>
  );
}
