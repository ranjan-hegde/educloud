import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, Maximize2, CheckCircle2, ShieldCheck, User, Sparkles, Calendar, BookOpen, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { currentStudent } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { buildStudentQrPayload } from "../../services/qrIdentity";
import { useToast } from "../../context/ToastContext";

export default function StudentQRAttendance() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const [marks] = usePersistentState("studentAttendanceMarks");
  const [attendanceSummary] = usePersistentState("attendanceSummary");
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [fullScreenModal, setFullScreenModal] = useState(false);
  const toast = useToast();

  const studentRollNo = student.rollNo || student.studentId || student.id || "STU2301";
  const studentClass = `${student.course || "BCA"} ${student.semester || "5th Semester"}`;

  // Unique QR payload that will NOT change — permanently bound to this student's identity
  const qrPayload = buildStudentQrPayload(student);

  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      width: 360,
      margin: 1,
      color: {
        dark: "#0b192c",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating student QR:", err));
  }, [qrPayload]);

  // Filter attendance records specifically belonging to this student
  const myMarks = (marks || []).filter(
    (m) =>
      m.studentId === student.id ||
      m.studentId === studentRollNo ||
      m.studentEmail === student.email ||
      m.rollNo === studentRollNo
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysMarks = myMarks.filter((m) => m.date === todayStr);

  function downloadQrCode() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${studentRollNo}_attendance_qr.png`;
    a.click();
    toast.success("QR Pass downloaded successfully!");
  }

  const overallPct = attendanceSummary?.overall ?? (myMarks.length > 0 ? 92 : 88);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student QR Attendance Pass"
        subtitle="Your unique, permanent digital QR badge for quick in-class attendance"
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary !py-2" onClick={() => setFullScreenModal(true)}>
              <Maximize2 size={15} /> Present Fullscreen
            </button>
            <button className="btn-primary !py-2" onClick={downloadQrCode}>
              <Download size={15} /> Save QR Pass
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Digital Student QR ID Badge */}
        <div className="lg:col-span-5">
          <div className="card overflow-hidden border-2 border-slate-200/90 shadow-glass-lg bg-gradient-to-b from-white via-white to-slate-50 relative">
            {/* Top decorative header band */}
            <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-accent-teal to-teal-400 flex items-center justify-center text-navy-950 font-bold font-display text-sm">
                  E
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm tracking-tight leading-none">EduCloud Campus</h4>
                  <span className="text-[10px] text-teal-300 font-medium">Verified Student Identity</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-teal-300 border border-white/15">
                <ShieldCheck size={12} /> Active Pass
              </span>
            </div>

            {/* QR Section */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="p-3.5 bg-white rounded-3xl border-2 border-slate-200 shadow-md mb-4 relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Attendance QR for ${student.name}`}
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl">
                    <span className="text-xs text-slate-400">Generating permanent QR...</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-navy-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center cursor-pointer pointer-events-none">
                  <span className="bg-white/95 text-navy-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                    Static QR Pass
                  </span>
                </div>
              </div>

              {/* Student details */}
              <h3 className="text-xl font-display font-bold text-navy-950">{student.name}</h3>
              <p className="text-sm font-semibold text-accent-teal mt-0.5">{studentRollNo}</p>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>{studentClass} · {student.department || "Computer Applications"}</p>
                <p className="text-slate-400">Academic Year: {student.academicYear || "2026 - 2027"}</p>
              </div>

              <div className="mt-5 w-full pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 size={14} /> Scan-Ready
                </span>
                <span className="text-[11px] text-slate-400">Permanent ID (Will not change)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Overview & Scan History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-display font-bold text-emerald-600">{overallPct}%</p>
              <p className="text-xs font-semibold text-navy-700 mt-1">Overall Attendance</p>
              <span className="text-[10px] text-slate-400">Good Standing</span>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-display font-bold text-navy-900">{myMarks.length + 24}</p>
              <p className="text-xs font-semibold text-navy-700 mt-1">Total Classes</p>
              <span className="text-[10px] text-slate-400">Current Semester</span>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-display font-bold text-accent-teal">{myMarks.length + 22}</p>
              <p className="text-xs font-semibold text-navy-700 mt-1">Present Marked</p>
              <span className="text-[10px] text-emerald-600 font-medium">Verified by Teacher</span>
            </div>
          </div>

          {/* Today's Scanned Status */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent-teal" />
                <h4 className="font-semibold text-navy-900 text-sm">Today's Class Attendance</h4>
              </div>
              <span className="badge-blue text-xs">{todayStr}</span>
            </div>

            {todaysMarks.length > 0 ? (
              <div className="space-y-2">
                {todaysMarks.map((mark, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-950">{mark.subject || "Subject Attendance"}</p>
                        <p className="text-emerald-700">Marked by {mark.markedBy || "Teacher"} at {mark.time}</p>
                      </div>
                    </div>
                    <span className="badge-green">Present</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                <Clock size={20} className="mx-auto text-slate-400 mb-1.5" />
                No attendance scanned yet today. Show your QR pass to your teacher when class begins.
              </div>
            )}
          </div>

          {/* Recent Attendance Log */}
          <div className="card p-5">
            <h4 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-accent-teal" /> Attendance History
            </h4>
            <DataTable
              columns={["Date", "Subject", "Marked By", "Time", "Status"]}
              data={
                myMarks.length > 0
                  ? myMarks
                  : [
                      {
                        date: todayStr,
                        subject: "Java Programming",
                        markedBy: "Dr. Robert Smith",
                        time: "10:15 AM",
                        status: "Present",
                      },
                      {
                        date: "2026-10-22",
                        subject: "Cloud Computing",
                        markedBy: "Prof. Sarah Jenkins",
                        time: "02:00 PM",
                        status: "Present",
                      },
                      {
                        date: "2026-10-21",
                        subject: "Web Technologies",
                        markedBy: "Prof. Anita Roy",
                        time: "11:30 AM",
                        status: "Present",
                      },
                    ]
              }
              renderRow={(row, i) => (
                <tr key={i} className="border-b border-surface-border text-xs">
                  <td className="px-3 py-3 font-medium text-navy-800">{row.date}</td>
                  <td className="px-3 py-3 text-navy-700">{row.subject}</td>
                  <td className="px-3 py-3 text-slate-500">{row.markedBy || "Faculty"}</td>
                  <td className="px-3 py-3 text-slate-500">{row.time || "--"}</td>
                  <td className="px-3 py-3">
                    <span className="badge-green">Present</span>
                  </td>
                </tr>
              )}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal for Classroom Presentation */}
      <Modal
        open={fullScreenModal}
        onClose={() => setFullScreenModal(false)}
        title="Student QR Attendance Card"
      >
        <div className="flex flex-col items-center text-center p-4 space-y-4">
          {qrDataUrl && (
            <div className="p-4 bg-white rounded-3xl border-2 border-slate-300 shadow-xl">
              <img src={qrDataUrl} alt="Fullscreen QR" className="w-72 h-72 object-contain" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-display font-bold text-navy-950">{student.name}</h3>
            <p className="text-sm font-semibold text-accent-teal">{studentRollNo}</p>
            <p className="text-xs text-slate-500 mt-1">{studentClass} · {student.department}</p>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Hold your screen towards the teacher's camera to scan your unique attendance QR badge.
          </p>
          <button className="btn-primary w-full !py-2.5" onClick={() => setFullScreenModal(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
