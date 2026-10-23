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

  // Today's faculty check-ins
  const todaysFacultyLogs = (facultyAttendanceLogs || []).filter((l) => l.date === todayStr);
  const checkedInFacultyIds = new Set(todaysFacultyLogs.map((l) => l.facultyId || l.email));

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

  function handleFacultyScan(decodedText) {
    if (!decodedText) return;
    const facultyInfo = parseFacultyQrPayload(decodedText);

    if (!facultyInfo) {
      setScanMessage({
        type: "error",
        text: "Invalid QR code. Please scan a valid EduCloud Faculty Attendance Pass.",
      });
      toast.error("Not an EduCloud Faculty Pass.");
      return;
    }

    const fid = facultyInfo.facultyId;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Check if faculty already checked in today
    const alreadyScanned = (facultyAttendanceLogs || []).find(
      (l) => l.date === todayStr && (l.facultyId === fid || (facultyInfo.email && l.email === facultyInfo.email))
    );

    if (alreadyScanned) {
      setScanMessage({
        type: "warning",
        text: `${facultyInfo.name} (${fid}) was ALREADY checked in today at ${alreadyScanned.time}!`,
      });
      toast.warning(`${facultyInfo.name} already checked in today.`);
      return;
    }

    // Record check-in
    const newEntry = {
      id: `FATT-${Date.now()}`,
      facultyId: fid,
      name: facultyInfo.name,
      email: facultyInfo.email,
      department: facultyInfo.department || "Academic Department",
      designation: facultyInfo.designation || "Faculty Member",
      date: todayStr,
      time: nowTime,
      status: "Present",
      scannedBy: "Campus Administrator",
    };

    setFacultyAttendanceLogs((prev) => [newEntry, ...(prev || [])]);
    setScanMessage({
      type: "success",
      text: `Successfully verified check-in: ${facultyInfo.name} (${fid}) at ${nowTime}`,
    });

    playSuccessChime();
    toast.success(`Faculty Checked In: ${facultyInfo.name}`);
  }

  // Filtered logs for the historical view
  const filteredFacultyLogs = (facultyAttendanceLogs || []).filter((l) => {
    const q = search.toLowerCase();
    return (
      (l.name || "").toLowerCase().includes(q) ||
      (l.facultyId || "").toLowerCase().includes(q) ||
      (l.department || "").toLowerCase().includes(q) ||
      (l.date || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Attendance & QR Verification"
        subtitle="Live camera scanner to scan teacher attendance passes and track institution check-ins"
      />

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("FACULTY_SCANNER")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "FACULTY_SCANNER"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          <Camera size={14} /> Scan Teacher Attendance
        </button>
        <button
          onClick={() => setActiveTab("FACULTY_LOGS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "FACULTY_LOGS"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          <Clock size={14} /> Faculty Attendance Logs ({facultyAttendanceLogs?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("STUDENT_LOGS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "STUDENT_LOGS"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          <Users size={14} /> Student Attendance Records ({studentMarks?.length || 0})
        </button>
      </div>

      {activeTab === "FACULTY_SCANNER" && (
        <div className="space-y-6">
          {/* Summary KPIs for Today */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 border-l-4 border-navy-700">
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Faculty Roster</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{realFacultyList.length}</p>
            </div>
            <div className="card p-4 border-l-4 border-emerald-500">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Checked In Today</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{todaysFacultyLogs.length}</p>
            </div>
            <div className="card p-4 border-l-4 border-amber-500">
              <p className="text-xs font-semibold text-amber-600 uppercase">Awaiting Check-in</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">
                {Math.max(0, realFacultyList.length - todaysFacultyLogs.length)}
              </p>
            </div>
            <div className="card p-4 border-l-4 border-teal-500">
              <p className="text-xs font-semibold text-teal-600 uppercase">Today&apos;s Check-in Rate</p>
              <p className="text-2xl font-bold text-teal-800 mt-1">
                {realFacultyList.length ? Math.round((todaysFacultyLogs.length / realFacultyList.length) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Live Camera Scanner Box */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-950 flex items-center gap-2">
                    <Camera size={18} className="text-teal-600" /> Admin Camera Scanner
                  </h3>
                  <p className="text-xs text-slate-500">Point camera at teacher&apos;s Faculty QR Pass</p>
                </div>
                <span className="badge-teal text-xs">Live Scanner Ready</span>
              </div>

              <QRScanner onScan={handleFacultyScan} />

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

            {/* Today's Checked-in Faculty List */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-950 flex items-center gap-2">
                    <UserCheck size={18} className="text-emerald-600" /> Faculty Checked In Today
                  </h3>
                  <p className="text-xs text-slate-500">Date: {todayStr}</p>
                </div>
                <span className="badge-green text-xs font-semibold">
                  {todaysFacultyLogs.length} Checked In
                </span>
              </div>

              <DataTable
                columns={["Faculty ID", "Name", "Department", "Check-in Time", "Status"]}
                data={todaysFacultyLogs}
                emptyMessage="No faculty check-ins scanned yet today. Point camera at teacher's QR pass to record attendance."
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
        <div className="card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-navy-950">Complete Faculty Attendance Records</h3>
            <div className="relative min-w-[240px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="input pl-9 text-xs !py-1.5"
                placeholder="Search faculty, date, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            columns={["Record ID", "Date", "Faculty Member", "Department", "Check-in Time", "Status", "Verified By"]}
            data={filteredFacultyLogs}
            emptyMessage="No faculty attendance records found."
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
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-navy-950">Student Attendance Scans (Verified by Teachers)</h3>
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
