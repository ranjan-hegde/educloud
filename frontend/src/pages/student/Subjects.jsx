import { BookOpen, User, Award, FileText, CheckCircle2 } from "lucide-react";
import { subjects, currentStudent } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useAuth } from "../../context/AuthContext";

export default function StudentSubjects() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const [courseMaterials] = usePersistentState("courseMaterials");
  const mySubjects = subjects.filter((s) => !student.course || s.course === student.course);
  const totalCredits = mySubjects.reduce((acc, s) => acc + (s.credits || 0), 0);

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Curriculum &amp; Syllabus
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Enrolled Subjects
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active courses for {student.course || "BCA"} · {student.semester || "1st Semester"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/60 dark:bg-slate-800/60 text-teal-600 dark:text-teal-400 border border-white/60 dark:border-white/10 shadow-xs">
              <Award size={13} /> {totalCredits} Total Credits
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <CheckCircle2 size={13} /> {mySubjects.length} Subjects
            </span>
          </div>
        </div>
      </div>

      {/* 2. Subjects Grid inside monolithic pane, divided by soft lines */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-black/5 dark:divide-white/10">
        {mySubjects.map((s, idx) => {
          const materials = courseMaterials.filter((m) => m.subject === s.name);
          return (
            <div
              key={s.id}
              className={`p-6 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors ${
                idx % 3 !== 2 ? "lg:soft-line-r" : ""
              } ${idx % 2 === 0 ? "sm:soft-line-r lg:border-r-0 lg:soft-line-r" : ""} soft-line-b`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-xs">
                  <BookOpen size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  {s.code}
                </span>
              </div>

              <p className="font-semibold text-base text-slate-900 dark:text-white tracking-tight">{s.name}</p>
              
              <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5"><User size={13} className="text-teal-500" /> {s.faculty}</p>
                <p className="flex items-center gap-1.5"><Award size={13} className="text-teal-500" /> {s.credits} Credits</p>
              </div>

              {materials.length > 0 && (
                <div className="mt-4 pt-3 soft-line-t">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Available Study Materials</p>
                  <div className="space-y-1.5">
                    {materials.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-1.5 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                          <FileText size={12} className="text-teal-500 shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded shrink-0">
                          {m.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
