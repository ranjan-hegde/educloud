import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import { ClipboardList, Calendar } from "lucide-react";
import { subjects, currentStudent } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useAuth } from "../../context/AuthContext";

export default function StudentAssessments() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const [allAssessments] = usePersistentState("assessments");
  const mySubjectNames = subjects.filter((s) => !student.course || s.course === student.course).map((s) => s.name);
  const items = (allAssessments || []).filter((a) => mySubjectNames.includes(a.subject) && a.status === "Published");

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Evaluations &amp; Exams
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Assessments &amp; Tests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upcoming assessments, midterms, and lab practicals for your subjects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/60 dark:bg-slate-800/60 text-teal-600 dark:text-teal-400 border border-white/60 dark:border-white/10 shadow-xs">
              <ClipboardList size={13} /> {items.length} Active Tests
            </span>
          </div>
        </div>
      </div>

      {/* 2. Content */}
      <div className="p-6">
        {items.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assessments yet" message="Your faculty haven't published any assessments right now." />
        ) : (
          <DataTable
            columns={["Title", "Subject", "Type", "Date & Time", "Max Marks", "Instructions"]}
            data={items}
            renderRow={(a) => (
              <>
                <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-xs">
                      <Calendar size={14} />
                    </div>
                    <span>{a.title}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{a.subject}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    {a.type}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{a.date} {a.startTime && `· ${a.startTime}`}</td>
                <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">{a.maxMarks}</td>
                <td className="px-3 py-3 text-slate-400 dark:text-slate-500 text-xs">{a.instructions}</td>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}
