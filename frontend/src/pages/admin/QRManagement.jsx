import { useState, useEffect } from "react";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Calendar,
  X,
  ShieldCheck,
  UserCheck,
  Building2,
  Search,
  Sparkles,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import QRScanner from "../../components/attendance/QRScanner";
import DataTable from "../../components/DataTable";
import { parseFacultyQrPayload } from "../../services/qrIdentity";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useToast } from "../../context/ToastContext";
import * as facultyService from "../../services/facultyService";

export default function AdminQRManagement() {
  const [activeTab, setActiveTab] = useState("FACULTY_SCANNER"); // "FACULTY_SCANNER" | "FACULTY_LOGS" | "STUDENT_LOGS"
  const [facultyAttendanceLogs, setFacultyAttendanceLogs] = usePersistentState("facultyAttendanceLog");
  const [studentMarks] = usePersistentState("studentAttendanceMarks");
  const [realFacultyList, setRealFacultyList] = useState([]);
  const [scanMessage, setScanMessage] = useState(null);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function loadFaculty() {
      const list = await facultyService.getFacultyList();
      setRealFacultyList(list || []);
    }
    loadFaculty();
  }, []);

  // Today's teacher check-ins
  const todaysTeacherLogs = (facultyAttendanceLogs || []).filter((l) => l.date === todayStr);

  function playSuccessChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable
    }
  }

  function handleTeacherScan(decodedText) {
    if (!decodedText) return;
    const teacherInfo = parseFacultyQrPayload(decodedText);

    if (!teacherInfo) {
      setScanMessage({
        type: "error",
        text: "Invalid QR code. Please scan a valid Teacher Attendance Pass.",
      });
      toast.error("Not an EduCloud Teacher Pass.");
      return;
    }

    const fid = teacherInfo.facultyId;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Check if teacher was already checked in today
    const alreadyScanned = (facultyAttendanceLogs || []).find(
      (l) => l.date === todayStr && (l.facultyId === fid || (teacherInfo.email && l.email === teacherInfo.email))
    );

    if (alreadyScanned) {
      setScanMessage({
        type: "warning",
        text: `Teacher ${teacherInfo.name} (${fid}) was ALREADY checked in today at ${alreadyScanned.time}!`,
      });
      toast.warning(`${teacherInfo.name} already checked in today.`);
      return;
    }

    // Record teacher check-in
    const newEntry = {
      id: `FATT-${Date.now()}`,
      facultyId: fid,
      name: teacherInfo.name,
      email: teacherInfo.email,
      department: teacherInfo.department || "Academic Department",
      designation: teacherInfo.designation || "Teacher",
      date: todayStr,
      time: nowTime,
      status: "Present",
      scannedBy: "Campus Administrator",
    };

    setFacultyAttendanceLogs((prev) => [newEntry, ...(prev || [])]);
    setScanMessage({
      type: "success",
      text: `Teacher Verified: ${teacherInfo.name} (${fid}) checked in at ${nowTime}`,
    });

    playSuccessChime();
    toast.success(`Teacher Checked In: ${teacherInfo.name}`);
  }

  // Filtered logs for the historical view
  const filteredTeacherLogs = (facultyAttendanceLogs || []).filter((l) => {
    const q = search.toLowerCase();
    return (
      (l.name || "").toLowerCase().includes(q) ||
      (l.facultyId || "").toLowerCase().includes(q) ||
      (l.department || "").toLowerCase().includes(q) ||
      (l.date || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Teacher Attendance Scanner"
        subtitle="Live camera scanner to scan teacher attendance QR passes at entrance and record institution check-ins"
      />

      {/* Mode Tabs - Horizontally scrollable for mobile */}
      <div className="overflow-x-auto scrollbar-none pb-1">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit shrink-0">
          <button
            onClick={() => setActiveTab("FACULTY_SCANNER")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "FACULTY_SCANNER"
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-700 hover:text-navy-950"
            }`}
          >
            <Camera size={14} /> Scan Teacher QR Passes
          </button>
          <button
            onClick={() => setActiveTab("FACULTY_LOGS")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "FACULTY_LOGS"
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-700 hover:text-navy-950"
            }`}
          >
            <Clock size={14} /> Teacher Attendance History ({facultyAttendanceLogs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("STUDENT_LOGS")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "STUDENT_LOGS"
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-700 hover:text-navy-950"
            }`}
          >
            <Users size={14} /> Student Attendance Records ({studentMarks?.length || 0})
          </button>
        </div>
      </div>

      {activeTab === "FACULTY_SCANNER" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary KPIs explicitly showing TEACHERS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="card p-4 border-l-4 border-navy-700">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Teachers</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{realFacultyList.length}</p>
            </div>
            <div className="card p-4 border-l-4 border-emerald-500">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Teachers Checked In Today</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{todaysTeacherLogs.length}</p>
            </div>
            <div className="card p-4 border-l-4 border-amber-500">
              <p className="text-xs font-semibold text-amber-600 uppercase">Teachers Awaiting Check-In</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">
                {Math.max(0, realFacultyList.length - todaysTeacherLogs.length)}
              </p>
            </div>
            <div className="card p-4 border-l-4 border-teal-500">
              <p className="text-xs font-semibold text-teal-600 uppercase">Teacher Check-In Rate</p>
              <p className="text-2xl font-bold text-teal-800 mt-1">
                {realFacultyList.length ? Math.round((todaysTeacherLogs.length / realFacultyList.length) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Live Camera Scanner Box */}
            <div className="card p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-950 flex items-center gap-2 text-sm sm:text-base">
                    <Camera size={18} className="text-teal-600" /> Live Teacher Scanner
                  </h3>
                  <p className="text-xs text-slate-500">Point camera at teacher&apos;s phone screen or QR pass</p>
                </div>
                <span className="badge-teal text-[11px]">Ready</span>
              </div>

              <QRScanner onScan={handleTeacherScan} />

              {/* Status Alert */}
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

            {/* Today's Checked-in Teachers List */}
            <div className="card p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-950 flex items-center gap-2 text-sm sm:text-base">
                    <UserCheck size={18} className="text-emerald-600" /> Teachers Checked In Today
                  </h3>
                  <p className="text-xs text-slate-500">Date: {todayStr}</p>
                </div>
                <span className="badge-green text-xs font-semibold">
                  {todaysTeacherLogs.length} Checked In
                </span>
              </div>

              <DataTable
                columns={["Teacher ID", "Teacher Name", "Department", "Check-in Time", "Status"]}
                data={todaysTeacherLogs}
                emptyMessage="No teachers checked in yet today. Point camera at teacher's QR pass to record attendance."
                renderRow={(log) => (
                  <>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-navy-700">{log.facultyId}</td>
                    <td className="px-3 py-3 font-semibold text-navy-900 text-xs">
                      <div>{log.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{log.designation}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 text-xs">{log.department}</td>
                    <td className="px-3 py-3 font-mono text-xs text-navy-800 font-medium">{log.time}</td>
                    <td className="px-3 py-3">
                      <span className="badge-green text-xs">Present</span>
                    </td>
                  </>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "FACULTY_LOGS" && (
        <div className="card p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-navy-950 text-sm sm:text-base">Teacher Attendance History</h3>
            <div className="relative min-w-[240px] w-full sm:w-auto">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="input pl-9 text-xs !py-1.5 w-full"
                placeholder="Search teacher, date, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            columns={["Record ID", "Date", "Teacher", "Department", "Check-in Time", "Status", "Verified By"]}
            data={filteredTeacherLogs}
            emptyMessage="No teacher attendance records found."
            renderRow={(log) => (
              <>
                <td className="px-3 py-3 font-mono text-xs font-medium text-slate-500">{log.id}</td>
                <td className="px-3 py-3 font-mono text-xs font-semibold text-navy-800">{log.date}</td>
                <td className="px-3 py-3 font-semibold text-navy-900 text-xs">
                  <div>{log.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{log.facultyId} • {log.designation}</div>
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs">{log.department}</td>
                <td className="px-3 py-3 font-mono text-xs text-navy-800">{log.time}</td>
                <td className="px-3 py-3">
                  <span className="badge-green text-xs">{log.status}</span>
                </td>
                <td className="px-3 py-3 text-xs text-slate-500">{log.scannedBy}</td>
              </>
            )}
          />
        </div>
      )}

      {activeTab === "STUDENT_LOGS" && (
        <div className="card p-4 sm:p-5 space-y-4">
          <h3 className="font-semibold text-navy-950 text-sm sm:text-base">Student Attendance Scans (Verified by Teachers)</h3>
          <DataTable
            columns={["Student Roll No", "Name", "Subject", "Class", "Date", "Time", "Teacher", "Status"]}
            data={studentMarks || []}
            emptyMessage="No student attendance marks recorded yet."
            renderRow={(m) => (
              <>
                <td className="px-3 py-3 font-mono text-xs font-semibold text-navy-800">{m.rollNo || m.studentId}</td>
                <td className="px-3 py-3 font-medium text-navy-900 text-xs">{m.name || "Student"}</td>
                <td className="px-3 py-3 text-slate-600 text-xs">{m.subject || "Subject"}</td>
                <td className="px-3 py-3 text-slate-500 text-xs">{m.class || "Class"}</td>
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{m.date}</td>
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{m.time}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{m.faculty || "Faculty"}</td>
                <td className="px-3 py-3">
                  <span className="badge-green text-xs">{m.status || "Present"}</span>
                </td>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}
