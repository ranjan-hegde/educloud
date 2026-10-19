import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentTimetable() {
  const [timetable] = usePersistentState("timetable");
  const days = Object.keys(timetable || {});
  const [activeDay, setActiveDay] = useState(days[0] || "Monday");
  const currentDayClasses = timetable && activeDay ? (timetable[activeDay] || []) : [];

  return (
    <div>
      <PageHeader title="Timetable" subtitle="Your weekly class schedule" />

      <div className="flex gap-2 overflow-x-auto scrollbar-thin mb-5 pb-1">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeDay === d ? "bg-navy-800 text-white" : "bg-white border border-surface-border text-navy-600 hover:bg-navy-50"}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {currentDayClasses.map((cls, i) => (
          <div key={i} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy-900">{cls.subject}</p>
              <p className="text-xs text-navy-400 mt-0.5">{cls.faculty} · {cls.room}</p>
            </div>
            <span className="badge-blue">{cls.time}</span>
          </div>
        ))}
        {currentDayClasses.length === 0 && <p className="text-sm text-navy-400 text-center py-10">No classes scheduled.</p>}
      </div>
    </div>
  );
}
