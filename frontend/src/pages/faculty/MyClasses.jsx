import { Link } from "react-router-dom";
import { Users, MapPin, Clock, BookOpen, ArrowRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { subjects, currentFaculty } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);

export default function FacultyMyClasses() {
  const [qrSessions] = usePersistentState("qrSessions");
  const [timetable] = usePersistentState("timetable");

  // Build one "class" card per assigned subject, enriched with schedule and
  // classroom info pulled from the shared timetable / QR session data.
  const classes = mySubjects.map((s) => {
    const session = qrSessions.find((q) => q.subject === s.name);
    const scheduleEntries = Object.entries(timetable)
      .flatMap(([day, entries]) => entries.filter((e) => e.subject === s.name).map((e) => `${day} ${e.time}`));
    return { ...s, room: session?.room || "—", location: session?.location || "—", schedule: scheduleEntries };
  });

  return (
    <div>
      <PageHeader title="My Classes" subtitle="Classes assigned to you this semester" />

      <div className="grid sm:grid-cols-2 gap-5">
        {classes.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center"><BookOpen size={18} /></div>
              <span className="badge-blue">{c.course} · Sem {c.semester}</span>
            </div>
            <p className="font-semibold text-navy-900">{c.name}</p>
            <p className="text-xs text-navy-400 mt-0.5">{c.code} · {c.credits} Credits</p>

            <div className="mt-4 space-y-1.5 text-xs text-navy-500">
              <p className="flex items-center gap-1.5"><Users size={12} /> 40 Students</p>
              <p className="flex items-center gap-1.5"><MapPin size={12} /> {c.room} {c.location !== "—" ? `(${c.location})` : ""}</p>
              {c.schedule.length > 0 && (
                <p className="flex items-center gap-1.5"><Clock size={12} /> {c.schedule.join(", ")}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-border">
              <Link to="/faculty/students" className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1">Students <ArrowRight size={11} /></Link>
              <Link to="/faculty/attendance" className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1">Attendance <ArrowRight size={11} /></Link>
              <Link to="/faculty/performance" className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1">Performance <ArrowRight size={11} /></Link>
              <Link to="/faculty/assessments" className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1">Assessments <ArrowRight size={11} /></Link>
              <Link to="/faculty/assignments" className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1">Assignments <ArrowRight size={11} /></Link>
            </div>
          </div>
        ))}
        {classes.length === 0 && <p className="text-sm text-navy-400 col-span-full text-center py-10">No classes are currently assigned to you.</p>}
      </div>
    </div>
  );
}
