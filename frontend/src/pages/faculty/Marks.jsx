import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { Save } from "lucide-react";
import { subjects, currentFaculty, currentStudent } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);

function gradeFor(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  return "F";
}

function rosterForSubject(subjectName, studentsList) {
  const subj = mySubjects.find((s) => s.name === subjectName);
  if (!subj) return [];
  // Only students actually enrolled in this subject's course + semester —
  // never an arbitrary/hardcoded slice of the whole institution.
  return studentsList.filter((s) => s.course === subj.course && Number(s.semester) === Number(subj.semester));
}

export default function FacultyMarks() {
  const [subject, setSubject] = useState(mySubjects[0]?.name || "");
  const [studentsList] = usePersistentState("students");
  const [marksRecords, setMarksRecords] = usePersistentState("marksRecords");
  const [overrides, setOverrides] = usePersistentState("studentMarksOverrides");
  const toast = useToast();

  const savedForSubject = marksRecords?.[subject];
  const roster = rosterForSubject(subject, studentsList);
  const activeSubject = mySubjects.find((s) => s.name === subject);
  const [marks, setMarks] = useState(
    savedForSubject || roster.map((s) => ({ id: s.id, name: s.name, internal: 20, external: 45 }))
  );

  function changeSubject(next) {
    setSubject(next);
    const saved = marksRecords?.[next];
    const nextRoster = rosterForSubject(next, studentsList);
    setMarks(saved || nextRoster.map((s) => ({ id: s.id, name: s.name, internal: 20, external: 45 })));
  }

  const MAX_INTERNAL = 30;
  const MAX_EXTERNAL = 70;

  function update(id, key, value, max) {
    // Enforce the same "cannot be negative / cannot exceed maximum marks"
    // rule the UI implies, regardless of what's typed into the field.
    let n = Number(value);
    if (Number.isNaN(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    setMarks((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: n } : m)));
  }

  function saveMarks() {
    if (roster.length === 0) {
      toast.error("No students found for this subject's class.");
      return;
    }
    // Persist every student's marks for this subject.
    setMarksRecords((prev) => ({ ...(prev || {}), [subject]: marks }));

    // If the logged-in demo student's marks were part of this save, update
    // their override so the Results page reflects the new numbers immediately.
    const demoEntry = marks.find((m) => m.id === currentStudent.id);
    if (demoEntry) {
      const total = demoEntry.internal + demoEntry.external;
      setOverrides((prev) => ({
        ...(prev || {}),
        [subject]: { internal: demoEntry.internal, external: demoEntry.external, total, grade: gradeFor(total) },
      }));
    }

    toast.success(`Marks saved for ${subject}.`);
  }

  return (
    <div>
      <PageHeader title="Marks Entry" subtitle="Enter and manage subject-wise marks" />

      <div className="card p-5 mb-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={subject} onChange={(e) => changeSubject(e.target.value)}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Semester</label><input className="input" disabled value={activeSubject ? `${activeSubject.semester}th Semester` : "—"} /></div>
          <div><label className="label">Class</label><input className="input" disabled value={activeSubject ? `${activeSubject.course} ${activeSubject.semester}th Semester` : "—"} /></div>
        </div>
      </div>

      <div className="card p-5">
        {roster.length === 0 ? (
          <p className="text-sm text-navy-400 text-center py-8">No students found for this subject's class.</p>
        ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-navy-500">
                <th className="text-left px-3 py-3">Student</th>
                <th className="text-left px-3 py-3">Internal (30)</th>
                <th className="text-left px-3 py-3">External (70)</th>
                <th className="text-left px-3 py-3">Total</th>
                <th className="text-left px-3 py-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => {
                const total = m.internal + m.external;
                return (
                  <tr key={m.id} className="border-b border-surface-border last:border-0">
                    <td className="px-3 py-2.5 font-medium text-navy-800">{m.name}</td>
                    <td className="px-3 py-2.5"><input type="number" min={0} max={MAX_INTERNAL} className="input !py-1.5 w-20" value={m.internal} onChange={(e) => update(m.id, "internal", e.target.value, MAX_INTERNAL)} /></td>
                    <td className="px-3 py-2.5"><input type="number" min={0} max={MAX_EXTERNAL} className="input !py-1.5 w-20" value={m.external} onChange={(e) => update(m.id, "external", e.target.value, MAX_EXTERNAL)} /></td>
                    <td className="px-3 py-2.5 font-semibold text-navy-800">{total}/100</td>
                    <td className="px-3 py-2.5"><span className="badge-green">{gradeFor(total)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        <button className="btn-primary mt-5" onClick={saveMarks} disabled={roster.length === 0}><Save size={15} /> Save Marks</button>
      </div>
    </div>
  );
}
