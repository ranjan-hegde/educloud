import { useState } from "react";
import DataTable from "../../components/DataTable";
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
    ? { ...(base || {}), subjectMarks: (base?.subjectMarks || []).map((r) => (overrides?.[r.subject] ? { ...r, ...overrides[r.subject] } : r)) }
    : (base || { subjectMarks: [] });

  const stats = [
    { label: "Cumulative GPA (CGPA)", value: resultsData?.cgpa ?? "8.0", icon: GraduationCap, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Semester GPA (SGPA)", value: resultsData?.sgpa ?? "8.0", icon: TrendingUp, tone: "text-teal-500 bg-teal-500/10" },
    { label: "Overall Percentage", value: `${resultsData?.percentage ?? 80}%`, icon: Percent, tone: "text-amber-500 bg-amber-500/10" },
  ];

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
          Academic Transcripts
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
          Academic Results
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Performance overview for {resultsData?.semester || "Academic Year"}
        </p>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 soft-line-b divide-y sm:divide-y-0 sm:divide-x divide-black/5 dark:divide-white/10">
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

      {/* 3. SGPA Progress Chart */}
      <div className="p-6 soft-line-b">
        <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight mb-4">SGPA Progression Across Semesters</p>
        <TrendLineChart data={resultsData.semesterHistory} dataKey="sgpa" xKey="semester" color="#0ea5a0" />
      </div>

      {/* 4. Subject-wise Marks Table */}
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
              Subject-wise Marks {isLatest ? "— Current Semester" : "— Previous Semester"}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>SGPA: <strong className="text-slate-800 dark:text-slate-200">{current.sgpa}</strong></span>
              <span>Percentage: <strong className="text-slate-800 dark:text-slate-200">{current.percentage}%</strong></span>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setActiveSemester(sem)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all macos-bouncy ${
                  activeSemester === sem
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-white/60 dark:border-white/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={["Subject", "Credits", "Internal", "External", "Total", "Grade"]}
          data={current.subjectMarks}
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{r.subject}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{r.credits}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{r.internal}</td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{r.external}</td>
              <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">{r.total}/100</td>
              <td className="px-3 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {r.grade}
                </span>
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
}
