import { useState } from "react";
import { Clock, MapPin, User, CheckCircle2, XCircle, CalendarDays, ListChecks } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import DashboardCard from "../../components/DashboardCard";
import QRScanner from "../../components/attendance/QRScanner";
import AttendanceVerification from "../../components/attendance/AttendanceVerification";
import LocationStatus from "../../components/attendance/LocationStatus";
import DataTable from "../../components/DataTable";
import { subjects, currentStudent, qrAttendanceHistory } from "../../data/mockData";
import { parseQrPayload } from "../../services/qrIdentity";
import * as qrAttendanceService from "../../services/qrAttendanceService";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

import { useAuth } from "../../context/AuthContext";

function statusFor(pct) {
  if (pct >= 90) return "Excellent";
  if (pct >= 75) return "Good";
  if (pct >= 60) return "Warning";
  return "Critical";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function StudentQRAttendance() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const studentClass = `${student.course || "BCA"} ${student.semester || "1st Semester"}`;

  // The Faculty/Admin-controlled sessions ARE the single source of truth —
  // the student view reads the exact same shared "qrSessions" collection,
  // filtered to the student's own class.
  const [qrSessions, setQrSessions] = usePersistentState("qrSessions");
  const [marks, setMarks] = usePersistentState("studentAttendanceMarks");
  const [attendanceSummary, setAttendanceSummary] = usePersistentState("attendanceSummary");
  const [subjectAttendance, setSubjectAttendance] = usePersistentState("subjectAttendance");

  const mySessions = (qrSessions || []).filter((s) => s.class === studentClass);
  const myMarks = (marks || []).filter((m) => m.studentId === student.id || m.studentEmail === student.email);

  const [selectedId, setSelectedId] = useState(mySessions.find((s) => s.status === "ACTIVE")?.id || mySessions[0]?.id);
  const [status, setStatus] = useState("idle"); // idle | checking | done
  const [result, setResult] = useState(null);
  const toast = useToast();

  const selected = mySessions.find((s) => s.id === selectedId) || mySessions[0];
  const alreadyMarkedSelected = selected ? myMarks.some((m) => m.sessionId === selected.id) : false;

  // Today's Classes + attendance status, computed from real session/mark data.
  const todaysSessions = mySessions.filter((s) => s.date === todayISO());
  function classStatusFor(session) {
    const mark = myMarks.find((m) => m.sessionId === session.id);
    if (mark) return { status: "PRESENT", time: mark.time };
    if (session.status === "CLOSED" || session.status === "COMPLETED") return { status: "ABSENT", time: null };
    return { status: "NOT MARKED", time: null };
  }
  const todaysRows = todaysSessions.map((s) => ({ session: s, ...classStatusFor(s) }));
  const presentCount = todaysRows.filter((r) => r.status === "PRESENT").length;
  const absentCount = todaysRows.filter((r) => r.status === "ABSENT").length;
  const attendancePct = todaysRows.length ? Math.round((presentCount / todaysRows.length) * 100) : 0;

  // ONE shared handler for all three input methods (camera / uploaded image
  // / manual entry) — all funnel into the same validateAttendanceSession().
  async function handleScan(rawValue) {
    if (status === "checking") return;

    // Camera/upload produce our JSON QR payload; manual entry is the raw
    // Session ID text. Either way we end up with a plain sessionId string.
    const parsed = parseQrPayload(rawValue);
    const sessionId = parsed?.sessionId || rawValue?.trim();

    setStatus("checking");
    setResult(null);

    const targetSession = qrSessions.find((s) => s.id === sessionId);
    const alreadyMarked = targetSession ? myMarks.some((m) => m.sessionId === targetSession.id) : false;

    const res = await qrAttendanceService.validateAttendanceSession(sessionId, {
      qrSessions,
      subjects,
      studentClass,
      alreadyMarked,
    });
    setResult(res);
    setStatus("done");

    // Reflect whichever session was actually validated, even if it wasn't
    // the one highlighted in the list.
    if (res.session) setSelectedId(res.session.id);

    if (res.success) {
      toast.success(res.message);
      const now = new Date();
      const scanTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMarks((prev) => [
        {
          id: `MRK${Date.now()}`,
          sessionId: res.session.id,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          subject: res.session.subject,
          date: res.session.date,
          time: scanTime,
          status: "Present",
        },
        ...prev,
      ]);

      setQrSessions((prev) =>
        prev.map((s) => (s.id === res.session.id ? { ...s, present: s.present + 1, absent: Math.max(0, s.absent - 1) } : s))
      );

      setSubjectAttendance((prev) => {
        const idx = prev.findIndex((s) => s.subject === res.session.subject);
        if (idx === -1) return prev;
        const row = { ...prev[idx] };
        row.total += 1;
        row.present += 1;
        row.percentage = Math.round((row.present / row.total) * 100);
        row.status = statusFor(row.percentage);
        const next = [...prev];
        next[idx] = row;
        return next;
      });
      setAttendanceSummary((prev) => {
        const total = prev.total + 1;
        const present = prev.present + 1;
        return { overall: Math.round((present / total) * 100), present, absent: prev.absent, total };
      });
    } else {
      toast.error(res.message);
    }
  }

  const history = [
    ...myMarks.map((m) => ({ id: m.id, subject: m.subject, date: m.date, time: m.time, status: m.status, location: "Verified" })),
    ...qrAttendanceHistory,
  ];

  return (
    <div>
      <PageHeader title="QR Attendance" subtitle="Scan your class QR code to mark attendance instantly" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <DashboardCard icon={CalendarDays} label="Today's Classes" value={todaysRows.length} tone="navy" />
        <DashboardCard icon={CheckCircle2} label="Present" value={presentCount} tone="teal" />
        <DashboardCard icon={XCircle} label="Absent" value={absentCount} tone="coral" />
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-navy-900 flex items-center gap-2"><ListChecks size={16} /> Today's Classes</p>
          <span className="text-xs text-navy-400">{attendancePct}% attended today</span>
        </div>
        {todaysRows.length === 0 ? (
          <p className="text-sm text-navy-400 text-center py-6">No classes scheduled for your class today.</p>
        ) : (
          <DataTable
            columns={["Subject", "Time", "Faculty", "Location", "Status"]}
            data={todaysRows}
            renderRow={(r) => (
              <>
                <td className="px-3 py-3 font-medium text-navy-800">{r.session.subject}</td>
                <td className="px-3 py-3 text-navy-500 whitespace-nowrap">{r.session.startTime} – {r.session.endTime}</td>
                <td className="px-3 py-3 text-navy-500">{r.session.faculty}</td>
                <td className="px-3 py-3 text-navy-500">{r.session.location}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status === "PRESENT" ? "Present" : r.status === "ABSENT" ? "Absent" : r.status} />
                  {r.status === "PRESENT" && r.time && <span className="text-xs text-navy-400 ml-2">at {r.time}</span>}
                </td>
              </>
            )}
          />
        )}
      </div>

      {!selected ? (
        <div className="card p-10 text-center text-sm text-navy-400">No attendance sessions are scheduled for your class right now.</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 px-1">Your Sessions</p>
            {mySessions.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedId(s.id); setStatus("idle"); setResult(null); }}
                className={`w-full text-left card p-4 transition-all ${selectedId === s.id ? "ring-2 ring-navy-700" : "hover:shadow-pop"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-navy-900 text-sm">{s.subject}</p>
                  <StatusBadge status={s.status} />
                </div>
                <div className="text-xs text-navy-400 space-y-1">
                  <p className="flex items-center gap-1.5"><User size={12} /> {s.faculty}</p>
                  <p className="flex items-center gap-1.5"><Clock size={12} /> {s.startTime} – {s.endTime}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={12} /> {s.location}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-surface-border">
              <div>
                <p className="font-semibold text-navy-900">{selected.subject}</p>
                <p className="text-xs text-navy-400 mt-0.5">{selected.room} · {selected.startTime} – {selected.endTime}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {alreadyMarkedSelected ? (
              <div className="flex flex-col items-center text-center py-10">
                <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
                <p className="font-semibold text-navy-900">Attendance already marked</p>
                <p className="text-sm text-navy-400 mt-1">You've already checked in for this class.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <QRScanner onScan={handleScan} disabled={status === "checking"} />
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-2.5">Verification</p>
                    <AttendanceVerification status={status} checks={result?.checks} />
                  </div>
                  {status === "done" && (
                    <div className={`rounded-xl p-3.5 text-sm ${result.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      <div className="flex items-center gap-2 font-medium">
                        {result.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {result.message}
                      </div>
                      {result.success && result.session && (
                        <div className="mt-2.5 pt-2.5 border-t border-emerald-200/60 text-xs space-y-1 text-emerald-800">
                          <p>Subject: {result.session.subject}</p>
                          <p>Faculty: {result.session.faculty}</p>
                          <p>Date: {result.session.date}</p>
                          <p>Location: {result.session.location}</p>
                          <p>Status: PRESENT</p>
                        </div>
                      )}
                    </div>
                  )}
                  {result?.session && (
                    <LocationStatus
                      locationName={result.session.location}
                      radius={result.session.radius}
                      distance={result?.distance ?? null}
                      checking={status === "checking"}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-navy-900">Attendance History</p>
          <span className="text-xs text-navy-400">Overall: {attendanceSummary.overall}%</span>
        </div>
        <DataTable
          columns={["Subject", "Date", "Time", "Location", "Status"]}
          data={history}
          renderRow={(r) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{r.subject}</td>
              <td className="px-3 py-3 text-navy-500">{r.date}</td>
              <td className="px-3 py-3 text-navy-500">{r.time}</td>
              <td className="px-3 py-3 text-navy-500">{r.location}</td>
              <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
            </>
          )}
        />
      </div>
    </div>
  );
}
