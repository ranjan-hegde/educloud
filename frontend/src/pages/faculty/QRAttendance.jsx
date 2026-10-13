import { useState } from "react";
import { Play, Square, QrCode as QrIcon, Users, CalendarDays, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import QRDisplay from "../../components/attendance/QRDisplay";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import Modal from "../../components/Modal";
import { currentFaculty, subjects } from "../../data/mockData";
import { buildSessionQrPayload, generateSessionId, nextSessionSequence, to12HourTime } from "../../services/qrIdentity";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function emptyForm() {
  return {
    subject: mySubjects[0]?.name || "",
    class: "BCA 5th Semester",
    room: "",
    location: "",
    latitude: "",
    longitude: "",
    radius: 50,
    date: new Date().toISOString().slice(0, 10),
    startTime: "",
    endTime: "",
  };
}

export default function FacultyQRAttendance() {
  const [allSessions, setAllSessions] = usePersistentState("qrSessions");
  const [savedLocations] = usePersistentState("locations");
  const [studentsList] = usePersistentState("students");
  const [marks] = usePersistentState("studentAttendanceMarks");
  const [notifications, setNotifications] = usePersistentState("notifications");
  const sessions = allSessions.filter((s) => s.faculty === currentFaculty.name);
  const displaySessions = sessions.length ? sessions : allSessions;
  const [activeId, setActiveId] = useState(displaySessions[0]?.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const toast = useToast();

  const active = displaySessions.find((s) => s.id === activeId) || displaySessions[0];

  // The genuine roster for THIS session: every student in the class, shown
  // Present (with real scan time) if they have a matching QR mark, else
  // Absent — built from the actual shared attendance-marks ledger, not a
  // generic mock list.
  const rosterForActive = studentsList
    .filter((s) => `${s.course} ${s.semester}th Semester` === active.class)
    .map((s) => {
      const mark = marks.find((m) => m.sessionId === active.id && m.studentId === s.id);
      return {
        id: s.id,
        name: s.name,
        time: mark ? mark.time : "--",
        location: mark ? "Verified" : "--",
        status: mark ? "Present" : "Absent",
      };
    });

  function notifyEligibleStudents(session) {
    const entry = {
      id: `NOTIF${Date.now()}`,
      studentId: null, // shared list, scoped to the class via classId below
      type: "QR_ATTENDANCE_STARTED",
      category: "Attendance",
      title: "QR Attendance Started",
      message: `${session.subject} attendance has started for ${session.class}. Faculty: ${session.faculty}. Time: ${session.startTime} – ${session.endTime}. Scan the QR code to mark your attendance.`,
      sessionId: session.id,
      classId: session.class,
      subjectId: session.subject,
      facultyId: currentFaculty.id,
      date: session.date,
      time: session.startTime,
      read: false,
      postedBy: "faculty",
      postedByName: currentFaculty.name,
    };
    setNotifications((prev) => [entry, ...prev]);
  }

  function startSession() {
    const today = new Date().toISOString().slice(0, 10);
    const hasRealSchedule = active.date === today && active.startTime && active.endTime;

    if (hasRealSchedule) {
      // Faculty already configured a real date/time for today — respect it exactly.
      setAllSessions((prev) => prev.map((s) => (s.id === active.id ? { ...s, status: "ACTIVE" } : s)));
    } else {
      // Stale/demo session with no meaningful schedule yet — set a genuine
      // current date and a real time window (now → +60 minutes) so it's
      // testable right away, rather than a hardcoded placeholder.
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      setAllSessions((prev) =>
        prev.map((s) =>
          s.id === active.id
            ? { ...s, status: "ACTIVE", date: now.toISOString().slice(0, 10), startTime: formatTime(now), endTime: formatTime(end) }
            : s
        )
      );
    }

    notifyEligibleStudents({
      ...active,
      date: hasRealSchedule ? active.date : new Date().toISOString().slice(0, 10),
    });
    toast.success(`Attendance session started for ${active.subject}. Students have been notified.`);
  }

  function closeSession() {
    setAllSessions((prev) => prev.map((s) => (s.id === active.id ? { ...s, status: "CLOSED" } : s)));
    toast.info(`Attendance session closed for ${active.subject}.`);
  }

  function createSession() {
    if (!form.subject || !form.room || !form.date || !form.startTime || !form.endTime) {
      toast.error("Subject, location, date, and start/end time are required.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Select a location with configured GPS coordinates.");
      return;
    }
    const newSession = {
      id: generateSessionId(form.date, nextSessionSequence(allSessions, form.date)),
      subject: form.subject,
      class: form.class,
      faculty: currentFaculty.name, // Always the currently logged-in Faculty — never assignable to anyone else.
      room: form.room,
      location: form.location,
      latitude: form.latitude,
      longitude: form.longitude,
      radius: form.radius,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      status: "SCHEDULED",
      present: 0,
      absent: 0,
      total: studentsList.filter((s) => `${s.course} ${s.semester}th Semester` === form.class).length,
    };
    setAllSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    setCreateOpen(false);
    setForm(emptyForm());
    toast.success(`Attendance session created for ${newSession.subject}. Click "Start Attendance" to open it to students.`);
  }

  return (
    <div>
      <PageHeader
        title="QR Attendance Management"
        subtitle="Create, start, monitor, and close attendance sessions for your classes"
        actions={<button className="btn-primary" onClick={() => { setForm(emptyForm()); setCreateOpen(true); }}><Plus size={15} /> Create / Assign Attendance</button>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 px-1">Your Sessions</p>
          {displaySessions.map((s) => (
            <button key={s.id} onClick={() => setActiveId(s.id)} className={`w-full text-left card p-4 ${activeId === s.id ? "ring-2 ring-navy-700" : "hover:shadow-pop"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-semibold text-navy-900 text-sm">{s.subject}</p>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-navy-400">{s.class} · {s.room}</p>
              <p className="text-xs text-navy-400 mt-0.5">{s.date} · {s.startTime} – {s.endTime}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-surface-border">
              <div>
                <p className="font-semibold text-navy-900">{active.subject}</p>
                <p className="text-xs text-navy-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{active.class} · {active.room} · {active.location}</span>
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> {active.date}</span>
                  <span>· {active.startTime} – {active.endTime}</span>
                </p>
              </div>
              <StatusBadge status={active.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <QRDisplay payload={buildSessionQrPayload(active)} sessionId={active.id} active={active.status === "ACTIVE"} />
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-navy-50 p-3"><p className="text-lg font-display font-semibold text-navy-800">{active.present}</p><p className="text-[11px] text-navy-400">Present</p></div>
                  <div className="rounded-xl bg-navy-50 p-3"><p className="text-lg font-display font-semibold text-rose-500">{active.absent}</p><p className="text-[11px] text-navy-400">Absent</p></div>
                  <div className="rounded-xl bg-navy-50 p-3"><p className="text-lg font-display font-semibold text-navy-800">{active.total}</p><p className="text-[11px] text-navy-400">Total</p></div>
                </div>
                <div className="flex gap-2">
                  {active.status !== "ACTIVE" ? (
                    <button className="btn-primary flex-1" onClick={startSession} disabled={active.status === "CLOSED" || active.status === "COMPLETED"}>
                      <Play size={15} /> Start Attendance
                    </button>
                  ) : (
                    <button className="btn-danger flex-1" onClick={closeSession}><Square size={15} /> Close Attendance</button>
                  )}
                </div>
                <p className="text-xs text-navy-400 flex items-center gap-1.5"><Users size={13} /> Allowed radius: {active.radius}m from {active.room}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-navy-900 flex items-center gap-2"><QrIcon size={16} /> Live Attendance</p>
              <span className="text-xs text-navy-400">Updates as students scan</span>
            </div>
            <AttendanceTable records={rosterForActive} />
          </div>
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create / Assign Attendance"
        size="lg"
        footer={<><button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button><button className="btn-primary" onClick={createSession}>Create / Assign Attendance</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              {mySubjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Class</label>
            <input className="input" value={form.class} onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))} />
          </div>
          <div>
            <label className="label">Faculty</label>
            <input className="input" value={currentFaculty.name} disabled />
          </div>
          <div>
            <label className="label">Location</label>
            <select
              className="input"
              value={form.room}
              onChange={(e) => {
                const loc = savedLocations.find((l) => l.room === e.target.value);
                setForm((f) => ({ ...f, room: e.target.value, location: loc?.name || "", radius: loc?.radius || 50, latitude: loc?.latitude || "", longitude: loc?.longitude || "" }));
              }}
            >
              <option value="">Select a configured location</option>
              {savedLocations.map((l) => <option key={l.id} value={l.room}>{l.room}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="label">Allowed Radius (meters)</label>
            <input type="number" className="input" value={form.radius} onChange={(e) => setForm((f) => ({ ...f, radius: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Start Time (AM/PM)</label>
            <input type="time" className="input" onChange={(e) => setForm((f) => ({ ...f, startTime: to12HourTime(e.target.value) }))} />
            {form.startTime && <p className="text-xs text-navy-400 mt-1">Selected: {form.startTime}</p>}
          </div>
          <div>
            <label className="label">End Time (AM/PM)</label>
            <input type="time" className="input" onChange={(e) => setForm((f) => ({ ...f, endTime: to12HourTime(e.target.value) }))} />
            {form.endTime && <p className="text-xs text-navy-400 mt-1">Selected: {form.endTime}</p>}
          </div>
          {form.latitude && (
            <div className="sm:col-span-2 text-xs text-navy-400">GPS: {form.latitude}, {form.longitude} · {form.radius}m allowed radius</div>
          )}
        </div>
        <p className="text-xs text-navy-400 mt-4">
          This creates the session as SCHEDULED. Click "Start Attendance" from the session list to open it to students with a real current date/time window.
        </p>
      </Modal>
    </div>
  );
}
