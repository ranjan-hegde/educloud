import { useState } from "react";
import { Plus, Play, Square, Pencil, QrCode as QrIcon, Users, MapPin } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import QRDisplay from "../../components/attendance/QRDisplay";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import { subjects, currentAdmin } from "../../data/mockData";
import { buildSessionQrPayload, generateSessionId, nextSessionSequence, to12HourTime } from "../../services/qrIdentity";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

const TABS = ["ACTIVE", "SCHEDULED", "COMPLETED", "CLOSED"];

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

const emptyForm = {
  subject: "", class: "BCA 5th Semester", faculty: "", room: "", location: "",
  latitude: "", longitude: "", radius: 50, date: new Date().toISOString().slice(0, 10), startTime: "", endTime: "", status: "SCHEDULED",
};

export default function AdminQRManagement() {
  const [sessions, setSessions] = usePersistentState("qrSessions");
  const [savedLocations] = usePersistentState("locations");
  const [facultyList] = usePersistentState("faculty");
  const [studentsList] = usePersistentState("students");
  const [marks] = usePersistentState("studentAttendanceMarks");
  const [notifications, setNotifications] = usePersistentState("notifications");
  const [tab, setTab] = useState("ACTIVE");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [qrTarget, setQrTarget] = useState(null);
  const [attendanceTarget, setAttendanceTarget] = useState(null);
  const toast = useToast();

  const filtered = sessions.filter((s) => s.status === tab);

  // Genuine per-session roster: every student in the session's class, shown
  // Present (with the real scan time) if a matching QR mark exists.
  function rosterFor(session) {
    if (!session) return [];
    return studentsList
      .filter((s) => `${s.course} ${s.semester}th Semester` === session.class)
      .map((s) => {
        const mark = marks.find((m) => m.sessionId === session.id && m.studentId === s.id);
        return { id: s.id, name: s.name, time: mark ? mark.time : "--", location: mark ? "Verified" : "--", status: mark ? "Present" : "Absent" };
      });
  }

  function notifyEligibleStudents(session) {
    const entry = {
      id: `NOTIF${Date.now()}`,
      studentId: null,
      type: "QR_ATTENDANCE_STARTED",
      category: "Attendance",
      title: "QR Attendance Started",
      message: `${session.subject} attendance has started for ${session.class}. Faculty: ${session.faculty}. Time: ${session.startTime} – ${session.endTime}. Scan the QR code to mark your attendance.`,
      sessionId: session.id,
      classId: session.class,
      subjectId: session.subject,
      facultyId: facultyList.find((f) => f.name === session.faculty)?.id || null,
      date: session.date,
      time: session.startTime,
      read: false,
      postedBy: "admin",
      postedByName: currentAdmin.name,
    };
    setNotifications((prev) => [entry, ...prev]);
  }

  function openSession(id) {
    const target = sessions.find((s) => s.id === id);
    const today = new Date().toISOString().slice(0, 10);
    const hasRealSchedule = target?.date === today && target?.startTime && target?.endTime;

    if (hasRealSchedule) {
      // Already has a real, meaningful schedule for today — keep it exactly.
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "ACTIVE" } : s)));
    } else {
      // Stale/demo session — set a genuine current date and real time
      // window (now → +60 minutes), not a hardcoded placeholder.
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "ACTIVE", date: now.toISOString().slice(0, 10), startTime: formatTime(now), endTime: formatTime(end) } : s
        )
      );
    }

    if (target) {
      notifyEligibleStudents({ ...target, date: hasRealSchedule ? target.date : new Date().toISOString().slice(0, 10) });
    }
    toast.success("Attendance session opened. QR is now live and students have been notified.");
  }

  function closeSession(id) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "CLOSED" } : s)));
    toast.info("Attendance session closed.");
  }

  function createSession() {
    if (!form.subject || !form.faculty || !form.room) {
      toast.error("Subject, faculty, and room are required.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Select a location with configured GPS coordinates.");
      return;
    }
    const id = generateSessionId(form.date, nextSessionSequence(sessions, form.date));
    const total = studentsList.filter((s) => `${s.course} ${s.semester}th Semester` === form.class).length;
    setSessions((prev) => [{ ...form, id, present: 0, absent: 0, total }, ...prev]);
    toast.success("Attendance session created and scheduled.");
    setCreateOpen(false);
    setForm(emptyForm);
    setTab("SCHEDULED");
  }

  return (
    <div>
      <PageHeader
        title="QR Attendance Management"
        subtitle="Create, monitor, and control QR attendance sessions institution-wide"
        actions={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={15} /> Create Session</button>}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? "bg-navy-800 text-white" : "bg-white border border-surface-border text-navy-600 hover:bg-navy-50"}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()} Sessions
            <span className="ml-1.5 text-xs opacity-70">({sessions.filter((s) => s.status === t).length})</span>
          </button>
        ))}
      </div>

      <div className="card p-5">
        <DataTable
          columns={["Class", "Subject", "Faculty", "Room", "Location", "Date", "Time", "Status", "Present/Absent", "Actions"]}
          data={filtered}
          emptyMessage={`No ${tab.toLowerCase()} sessions.`}
          renderRow={(s) => (
            <>
              <td className="px-3 py-3 text-navy-600">{s.class}</td>
              <td className="px-3 py-3 font-medium text-navy-800">{s.subject}</td>
              <td className="px-3 py-3 text-navy-500">{s.faculty}</td>
              <td className="px-3 py-3 text-navy-500">{s.room}</td>
              <td className="px-3 py-3 text-navy-500">{s.location}</td>
              <td className="px-3 py-3 text-navy-500 whitespace-nowrap">{s.date}</td>
              <td className="px-3 py-3 text-navy-500 whitespace-nowrap">{s.startTime} – {s.endTime}</td>
              <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-3 py-3 text-navy-600 font-medium">{s.present}/{s.absent}</td>
              <td className="px-3 py-3">
                <div className="flex gap-1 flex-wrap">
                  {s.status === "SCHEDULED" && (
                    <button className="btn-ghost !py-1.5 !px-2 text-emerald-600" onClick={() => openSession(s.id)} title="Open session"><Play size={14} /></button>
                  )}
                  {s.status === "ACTIVE" && (
                    <button className="btn-ghost !py-1.5 !px-2 text-accent-coral" onClick={() => closeSession(s.id)} title="Close session"><Square size={14} /></button>
                  )}
                  <button className="btn-ghost !py-1.5 !px-2" onClick={() => setQrTarget(s)} title="View QR"><QrIcon size={14} /></button>
                  <button className="btn-ghost !py-1.5 !px-2" onClick={() => setAttendanceTarget(s)} title="View attendance"><Users size={14} /></button>
                  <button className="btn-ghost !py-1.5 !px-2" title="Edit"><Pencil size={14} /></button>
                </div>
              </td>
            </>
          )}
        />
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Attendance Session"
        size="lg"
        footer={<><button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button><button className="btn-primary" onClick={createSession}>Create Session</button></>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Class</label>
            <input className="input" value={form.class} onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))} />
          </div>
          <div>
            <label className="label">Faculty</label>
            <select className="input" value={form.faculty} onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value }))}>
              <option value="">Select faculty</option>
              {facultyList.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Classroom / Location</label>
            <select
              className="input"
              value={form.room}
              onChange={(e) => {
                const loc = savedLocations.find((l) => l.room === e.target.value);
                setForm((f) => ({
                  ...f,
                  room: e.target.value,
                  location: loc?.name || "",
                  radius: loc?.radius || 50,
                  latitude: loc?.latitude || "",
                  longitude: loc?.longitude || "",
                }));
              }}
            >
              <option value="">Select room</option>
              {savedLocations.map((l) => <option key={l.id} value={l.room}>{l.room}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Allowed Radius (meters)</label>
            <input type="number" className="input" value={form.radius} onChange={(e) => setForm((f) => ({ ...f, radius: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
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
            <div className="sm:col-span-2 text-xs text-navy-400 flex items-center gap-1.5">
              <MapPin size={12} /> GPS: {form.latitude}, {form.longitude} · {form.radius}m allowed radius
            </div>
          )}
        </div>
        <p className="text-xs text-navy-400 mt-4">
          Attendance will be marked only if all conditions — active session, class assignment, valid time window, and verified location — are met. This is simulated on the frontend for now.
        </p>
      </Modal>

      <Modal open={!!qrTarget} onClose={() => setQrTarget(null)} title={qrTarget ? `QR Code — ${qrTarget.subject}` : ""} size="sm">
        {qrTarget && (
          <div>
            <QRDisplay payload={buildSessionQrPayload(qrTarget)} sessionId={qrTarget.id} active={qrTarget.status === "ACTIVE"} />
            <p className="text-xs text-navy-400 text-center flex items-center justify-center gap-1.5"><MapPin size={12} /> {qrTarget.location} · {qrTarget.radius}m radius</p>
          </div>
        )}
      </Modal>

      <Modal open={!!attendanceTarget} onClose={() => setAttendanceTarget(null)} title={attendanceTarget ? `Attendance — ${attendanceTarget.subject}` : ""} size="lg">
        {attendanceTarget && <AttendanceTable records={rosterFor(attendanceTarget)} />}
      </Modal>
    </div>
  );
}
