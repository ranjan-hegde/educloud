import { useState } from "react";
import { Clock, Calendar, MapPin, UserCheck } from "lucide-react";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentTimetable() {
  const [timetable] = usePersistentState("timetable");
  const days = Object.keys(timetable || {});
  const [activeDay, setActiveDay] = useState(days[0] || "Monday");
  const currentDayClasses = timetable && activeDay ? (timetable[activeDay] || []) : [];

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Weekly Schedule
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Class Timetable
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your weekly schedule of lectures, lab sessions, and classroom assignments
            </p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 shrink-0">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all macos-bouncy ${
                  activeDay === d
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-white/60 dark:border-white/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Schedule List (Single unified list divided by soft lines — NO separate cards) */}
      <div className="divide-y divide-black/5 dark:divide-white/10">
        {currentDayClasses.map((cls, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-xs mt-0.5">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-semibold text-base text-slate-900 dark:text-white tracking-tight">{cls.subject}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><UserCheck size={13} className="text-teal-500" /> {cls.faculty}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><MapPin size={13} className="text-teal-500" /> {cls.room}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/60 dark:bg-slate-800/60 text-teal-600 dark:text-teal-400 border border-white/60 dark:border-white/10 shadow-xs">
                <Clock size={12} />
                {cls.time}
              </span>
            </div>
          </div>
        ))}

        {currentDayClasses.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
            No classes scheduled for {activeDay}. Enjoy your break!
          </div>
        )}
      </div>
    </div>
  );
}
