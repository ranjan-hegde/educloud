import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Users,
  BookOpen,
  Clock,
  Calendar,
  Check,
  X,
  Sparkles,
  QrCode,
  Download,
  Maximize2,
  ShieldCheck,
  User,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import QRScanner from "../../components/attendance/QRScanner";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { parseStudentQrPayload, buildFacultyQrPayload } from "../../services/qrIdentity";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useAuth } from "../../context/AuthContext";
import { subjects as masterSubjects } from "../../data/mockData";
import api from "../../services/api";

export default function FacultyQRAttendance() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("STUDENT_SCANNER"); // "STUDENT_SCANNER" | "MY_FACULTY_PASS"
  const [studentsList] = usePersistentState("students");
  const [marks, setMarks] = usePersistentState("studentAttendanceMarks");
  const [facultyAttendanceLogs] = usePersistentState("facultyAttendanceLog");

  const facultyName = user?.name || "Faculty Member";
  const facultyId = String(user?.id || user?.facultyId || "FAC2601");
  const facultyEmail = user?.email || "";
  const department = user?.department || "Computer Science";
  const designation = user?.designation || "Assistant Professor";

  const facultySubjects = Array.isArray(user?.subjects) && user.subjects.length > 0
    ? user.subjects
    : masterSubjects.map((s) => s.name);

  const [selectedSubject, setSelectedSubject] = useState(facultySubjects[0] || "Data Structures");
  const [selectedClass, setSelectedClass] = useState("BCA 5th Semester");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [lastScanned, setLastScanned] = useState(null);
  const [scanMessage, setScanMessage] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [fullscreenModal, setFullscreenModal] = useState(false);
  const toast = useToast();

  // Generate Faculty QR Attendance Pass
  const facultyQrPayload = buildFacultyQrPayload({
    id: facultyId,
    facultyId,
    name: facultyName,
    email: facultyEmail,
    department,
    designation,
  });

  useEffect(() => {
    QRCode.toDataURL(facultyQrPayload, {
      width: 360,
      margin: 1,
      color: {
        dark: "#0b192c",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating faculty QR:", err));
  }, [facultyQrPayload]);

  // Filter students enrolled in this class
  const classStudents = (studentsList || []).filter(
    (s) =>
      `${s.course || "BCA"} ${s.semester ? `${s.semester}th Semester` : "5th Semester"}` === selectedClass ||
      s.course === selectedClass.split(" ")[0]
  );

  // Today's marks for this subject and class
  const sessionMarks = (marks || []).filter(
    (m) =>
      m.date === selectedDate &&
      (m.subject === selectedSubject || !m.subject) &&
      (m.class === selectedClass || !m.class)
  );

  const presentStudentIds = new Set(sessionMarks.map((m) => m.rollNo || m.studentId));

  // Faculty's own attendance records scanned by Admin
  const myFacultyCheckins = (facultyAttendanceLogs || []).filter(
    (log) => log.facultyId === facultyId || log.email === facultyEmail || log.name === facultyName
  );

  // Handle student camera scanner output
  async function handleScan(decodedText) {
    if (!decodedText) return;
    const studentInfo = parseStudentQrPayload(decodedText);

    if (!studentInfo) {
      setScanMessage({
        type: "error",
        text: "Invalid QR code. Please scan a valid EduCloud Student Attendance pass.",
      });
      toast.error("Invalid QR Code: Not an EduCloud student pass.");
      return;
    }

    const studentRollNo = studentInfo.rollNo || studentInfo.studentId;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Check duplicate scan
    const isAlreadyMarked = sessionMarks.some(
      (m) => m.rollNo === studentRollNo || m.studentId === studentInfo.studentId
    );

    if (isAlreadyMarked) {
      setScanMessage({
        type: "warning",
        text: `${studentInfo.name} (${studentRollNo}) has ALREADY been marked Present today!`,
      });
      playBeep(440, 200);
      return;
    }

    // New attendance record
    const newRecord = {
      id: `ATT-${Date.now()}`,
      studentId: studentInfo.studentId,
      rollNo: studentRollNo,
      name: studentInfo.name,
      studentEmail: studentInfo.email,
      course: studentInfo.course,
      semester: studentInfo.semester,
      subject: selectedSubject,
      class: selectedClass,
      date: selectedDate,
      time: nowTime,
      faculty: facultyName,
      status: "Present",
    };

    setMarks((prev) => [newRecord, ...(prev || [])]);
    setLastScanned({ ...studentInfo, time: nowTime });
    setScanMessage({
      type: "success",
      text: `Marked Present: ${studentInfo.name} (${studentRollNo}) at ${nowTime}`,
    });

    playSuccessChime();
    toast.success(`Present: ${studentInfo.name}`);

    // Sync to backend if available
    try {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          rollNo: studentRollNo,
          subject: selectedSubject,
          class: selectedClass,
          date: selectedDate,
          time: nowTime,
          status: "PRESENT",
        }),
      });
    } catch {
      // offline
    }
  }

  function playSuccessChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not supported
    }
  }

  function playBeep(freq = 440, duration = 200) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch {
      // ignore
    }
  }

  function downloadFacultyQr() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${facultyId}_Faculty_Attendance_Pass.png`;
    a.click();
    toast.success("Faculty Attendance Pass downloaded.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Attendance System"
        subtitle="Live camera scanner for student attendance and your personal Faculty QR Attendance Pass"
      />

      {/* Main Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("STUDENT_SCANNER")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "STUDENT_SCANNER"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          <Camera size={14} /> Scan Student Attendance (Camera)
        </button>
        <button
          onClick={() => setActiveTab("MY_FACULTY_PASS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "MY_FACULTY_PASS"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          <QrCode size={14} /> My Faculty Attendance QR Pass
        </button>
      </div>

      {activeTab === "MY_FACULTY_PASS" ? (
        /* Faculty's Digital Attendance Pass (to be scanned by Admin) */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6 text-center space-y-4 border-2 border-teal-500/20 bg-gradient-to-b from-teal-50/20 to-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-semibold border border-teal-200">
                <ShieldCheck size={14} /> Digital Faculty Attendance Pass
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Faculty Attendance QR Code"
                    className="w-56 h-56 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                    Generating Faculty QR...
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy-950">{facultyName}</h3>
                <p className="text-xs font-mono font-semibold text-teal-700">{facultyId}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {designation} • {department}
                </p>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setFullscreenModal(true)}
                  className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5"
                >
                  <Maximize2 size={13} /> Fullscreen
                </button>
                <button
                  onClick={downloadFacultyQr}
                  className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1.5"
                >
                  <Download size={13} /> Download Pass
                </button>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Show this permanent QR code to Campus Administration to verify your daily check-in.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-navy-950 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-teal-600" /> My Admin Check-in History
              </h3>
              <DataTable
                columns={["Date", "Check-in Time", "Department", "Status", "Verified By"]}
                data={myFacultyCheckins}
                emptyMessage="No attendance scans recorded by Admin yet. Show your QR pass to Administration to check in."
                renderRow={(log) => (
                  <>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-navy-800">{log.date}</td>
                    <td className="px-3 py-3 text-slate-600 text-xs font-medium">{log.time}</td>
                    <td className="px-3 py-3 text-slate-600 text-xs">{log.department || department}</td>
                    <td className="px-3 py-3">
                      <span className="badge-green text-xs">Present</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{log.scannedBy || "Campus Admin"}</td>
                  </>
                )}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Teacher's Camera Scanner for Student Attendance */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="card p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Select Subject</label>
                <select
                  className="input"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {facultySubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Class / Cohort</label>
                <select
                  className="input"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="BCA 5th Semester">BCA 5th Semester</option>
                  <option value="BCA 3rd Semester">BCA 3rd Semester</option>
                  <option value="B.Tech 3rd Semester">B.Tech 3rd Semester</option>
                  <option value="MCA 1st Semester">MCA 1st Semester</option>
                </select>
              </div>

              <div>
                <label className="label">Attendance Date</label>
                <input
                  type="date"
                  className="input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Camera Scanner View */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy-950 flex items-center gap-2">
                  <Camera size={18} className="text-teal-600" /> Live Classroom Scanner
                </h3>
                <span className="text-xs text-slate-400">Point at student&apos;s Attendance Pass</span>
              </div>

              <QRScanner onScan={handleScan} />

              {/* Status Banner */}
              {scanMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    scanMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : scanMessage.type === "warning"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {scanMessage.type === "success" && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
                  {scanMessage.type === "warning" && <AlertTriangle size={16} className="shrink-0 text-amber-600" />}
                  {scanMessage.type === "error" && <X size={16} className="shrink-0 text-rose-600" />}
                  <span>{scanMessage.text}</span>
                </div>
              )}
            </div>

            {/* Live Class Attendance Roster */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-950 flex items-center gap-2">
                    <Users size={17} className="text-navy-600" /> Attendance Roster
                  </h3>
                  <p className="text-xs text-slate-500">
                    {presentStudentIds.size} of {classStudents.length} present
                  </p>
                </div>
                <span className="badge-teal text-xs">
                  {classStudents.length ? Math.round((presentStudentIds.size / classStudents.length) * 100) : 0}% Present
                </span>
              </div>

              <DataTable
                columns={["Roll No", "Student Name", "Scan Time", "Status"]}
                data={classStudents}
                emptyMessage="No students found in this class."
                renderRow={(s) => {
                  const roll = s.rollNo || s.id;
                  const isPresent = presentStudentIds.has(roll) || presentStudentIds.has(s.id);
                  const mark = sessionMarks.find((m) => m.rollNo === roll || m.studentId === s.id);
                  return (
                    <>
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-navy-700">{roll}</td>
                      <td className="px-3 py-2.5 font-medium text-navy-900 text-xs">{s.name}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500 font-mono">
                        {mark ? mark.time : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={isPresent ? "badge-green text-xs" : "badge-red text-xs"}>
                          {isPresent ? "Present" : "Absent"}
                        </span>
                      </td>
                    </>
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Faculty QR Modal */}
      <Modal
        open={fullscreenModal}
        onClose={() => setFullscreenModal(false)}
        title="Faculty Attendance Pass"
        footer={
          <button className="btn-secondary" onClick={() => setFullscreenModal(false)}>
            Close
          </button>
        }
      >
        <div className="text-center p-6 space-y-4">
          {qrDataUrl && (
            <img src={qrDataUrl} alt="Faculty QR Pass" className="w-80 h-80 mx-auto object-contain" />
          )}
          <h3 className="text-xl font-bold text-navy-950">{facultyName}</h3>
          <p className="font-mono text-sm font-semibold text-teal-700">{facultyId}</p>
          <p className="text-xs text-slate-500">{department}</p>
        </div>
      </Modal>
    </div>
  );
}
