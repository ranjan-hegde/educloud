import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { Check, X, Clock3, Save, CheckCheck, XCircle } from "lucide-react";
import { subjects, currentFaculty, currentStudent } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);
const MARK_OPTIONS = [
  { key: "Present", icon: Check, active: "bg-emerald-500 text-white" },
  { key: "Absent", icon: X, active: "bg-rose-500 text-white" },
  { key: "Late", icon: Clock3, active: "bg-amber-500 text-white" },
];

function statusFor(pct) {
  if (pct >= 90) return "Excellent";
  if (pct >= 75) return "Good";
  if (pct >= 60) return "Warning";
  return "Critical";
}

export default function FacultyAttendance() {
  const [subject, setSubject] = useState(mySubjects[0]?.name || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceRecords, setAttendanceRecords] = usePersistentState("attendanceRecords");
  const [subjectAttendance, setSubjectAttendance] = usePersistentState("subjectAttendance");
  const [attendanceSummary, setAttendanceSummary] = usePersistentState("attendanceSummary");
  const [savedLog, setSavedLog] = usePersistentState("attendanceSavedLog");
  const [records, setRecords] = useState(
    attendanceRecords.map((s) => ({ ...s, mark: s.status === "Present" ? "Present" : s.status === "Late" ? "Late" : "Absent" }))
  );
  const toast = useToast();
  const activeSubject = mySubjects.find((s) => s.name === subject);
  // Already-recorded for this exact subject + date? Prevents re-saving from
  // silently double-counting the same day into the running totals.
  const alreadySaved = (savedLog || []).some((e) => e.subject === subject && e.date === date);

  function setMark(id, mark) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, mark } : r)));
  }
  function markAll(mark) {
    setRecords((prev) => prev.map((r) => ({ ...r, mark })));
  }

  function save() {
    // Persist the roster so admin/faculty QR "live attendance" views stay in sync.
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedRecords = records.map((r) => ({
      id: r.id,
      name: r.name,
      time: r.mark !== "Absent" ? now : "--",
      location: r.mark !== "Absent" ? "Verified" : "--",
      status: r.mark,
    }));
    setAttendanceRecords(updatedRecords);

    // BUG FIX: attendance for the same subject+date could previously be
    // saved over and over, incrementing `total`/`present`/`absent` every
    // single time and inflating the percentage. Only count it once per
    // subject+date; later saves on the same day just correct statuses.
    if (alreadySaved) {
      toast.info(`Attendance for ${subject} on ${date} was already recorded today — statuses updated, totals unchanged.`);
      return;
    }

    // If the logged-in demo student was part of this roster, reflect the
    // change in their own subject-wise and overall attendance immediately.
    // Late still counts as present for the attendance percentage.
    const demoRecord = records.find((r) => r.id === currentStudent.id);
    if (demoRecord) {
      const wasPresent = demoRecord.mark !== "Absent";
      setSubjectAttendance((prev) => {
        const idx = prev.findIndex((s) => s.subject === subject);
        if (idx === -1) return prev;
        const row = { ...prev[idx] };
        row.total += 1;
        if (wasPresent) row.present += 1;
        else row.absent += 1;
        row.percentage = Math.round((row.present / row.total) * 100);
        row.status = statusFor(row.percentage);
        const next = [...prev];
        next[idx] = row;
        return next;
      });
      setAttendanceSummary((prev) => {
        const total = prev.total + 1;
        const present = prev.present + (wasPresent ? 1 : 0);
        const absent = prev.absent + (wasPresent ? 0 : 1);
        return { overall: Math.round((present / total) * 100), present, absent, total };
      });
    }

    setSavedLog((prev) => [...(prev || []), { subject, date }]);
    toast.success(`Attendance saved for ${subject} on ${date}.`);
  }

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark attendance manually for your classes" />

      <div className="card p-5 mb-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Class</label>
            <input className="input" disabled value={activeSubject ? `${activeSubject.course} ${activeSubject.semester}th Semester` : "—"} />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-semibold text-navy-900">Student List — {records.filter((r) => r.mark !== "Absent").length}/{records.length} Present</p>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => markAll("Present")}><CheckCheck size={13} /> All Present</button>
            <button className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => markAll("Absent")}><XCircle size={13} /> All Absent</button>
            <button className="btn-primary !py-1.5" onClick={save}><Save size={15} /> Save Attendance</button>
          </div>
        </div>
        {alreadySaved && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Attendance for {subject} on {date} was already recorded. Saving again will update statuses but won't double-count totals.
          </p>
        )}
        <div className="divide-y divide-surface-border">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-navy-800">{r.name}</p>
                <p className="text-xs text-navy-400">{r.id}</p>
              </div>
              <div className="flex gap-2">
                {MARK_OPTIONS.map(({ key, icon: Icon, active }) => (
                  <button
                    key={key}
                    title={key}
                    onClick={() => setMark(r.id, key)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${r.mark === key ? active : "bg-navy-50 text-navy-300"}`}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
