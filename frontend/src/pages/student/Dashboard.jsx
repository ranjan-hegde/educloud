import { Link } from "react-router-dom";
import {
  CalendarCheck, BookOpen, ClipboardList, Bell, GraduationCap, ArrowRight, Clock,
  QrCode, ClipboardEdit, FolderOpen, MessageSquareText, Award, CalendarDays,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { TrendLineChart } from "../../components/StatChart";
import { useAuth } from "../../context/AuthContext";
import { currentStudent, attendanceTrend, resultsData, subjects } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const quickActions = [
  { label: "Scan Attendance QR", to: "/student/qr-attendance", icon: QrCode },
  { label: "View Timetable", to: "/student/timetable", icon: CalendarDays },
  { label: "View Assignments", to: "/student/assignments", icon: ClipboardList },
  { label: "View Results", to: "/student/results", icon: GraduationCap },
  { label: "View Assessments", to: "/student/assessments", icon: ClipboardEdit },
  { label: "Submit Feedback", to: "/student/feedback", icon: MessageSquareText },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const studentClass = `${student.course || "BCA"} ${student.semester || "5th Semester"}`;
  const mySubjectNames = subjects.filter((s) => !student.course || s.course === student.course).map((s) => s.name);

  const [assignments] = usePersistentState("assignments");
  const [notifications] = usePersistentState("notifications");
  const [assessments] = usePersistentState("assessments");
  const [courseMaterials] = usePersistentState("courseMaterials");
  const [feedback] = usePersistentState("feedback");
  const [attendanceSummary] = usePersistentState("attendanceSummary");
  const [qrSessions] = usePersistentState("qrSessions");
  const [marksOverrides] = usePersistentState("studentMarksOverrides");

  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const safeCourseMaterials = Array.isArray(courseMaterials) ? courseMaterials : [];
  const safeFeedback = Array.isArray(feedback) ? feedback : [];
  const safeQrSessions = Array.isArray(qrSessions) ? qrSessions : [];

  const pending = safeAssignments.filter((a) => a.status === "Pending").slice(0, 4);
  const unread = safeNotifications.filter((n) => !n.read).slice(0, 4);
  const upcomingAssessments = safeAssessments.filter((a) => mySubjectNames.includes(a.subject) && a.status === "Published").slice(0, 4);
  const recentMaterials = safeCourseMaterials.filter((m) => mySubjectNames.includes(m.subject)).slice(0, 4);
  const myFeedback = safeFeedback.filter((f) => f.studentId === student.id).slice(0, 3);
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysClasses = safeQrSessions.filter((s) => s.class === studentClass && s.date === todayISO);

  const overrideEntries = Object.entries(marksOverrides || {});
  const recentMark = overrideEntries.length
    ? { subject: overrideEntries[overrideEntries.length - 1][0], ...overrideEntries[overrideEntries.length - 1][1] }
    : null;

  const overallAttendance = attendanceSummary?.overall ?? 84;

  const stats = [
    { label: "Attendance", value: `${overallAttendance}%`, icon: CalendarCheck, tone: "text-teal-500 bg-teal-500/10" },
    { label: "Subjects", value: mySubjectNames.length, icon: BookOpen, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Today's Classes", value: todaysClasses.length, icon: Clock, tone: "text-amber-500 bg-amber-500/10" },
    { label: "Pending Tasks", value: pending.length, icon: ClipboardList, tone: "text-rose-500 bg-rose-500/10" },
    { label: "Upcoming Tests", value: upcomingAssessments.length, icon: ClipboardEdit, tone: "text-purple-500 bg-purple-500/10" },
    { label: "Alerts", value: unread.length, icon: Bell, tone: "text-sky-500 bg-sky-500/10" },
  ];

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header & Quick Actions Strip */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Academic Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {(student.name || "Student").split(" ")[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {student.course || "BCA"} · {student.semester || "1st Semester"} · {student.department || "Computer Applications"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all macos-bouncy shadow-xs"
              >
                <a.icon size={13} className="text-blue-500" />
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Strip — Unified horizontal statistics row divided by soft vertical lines (NO cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 soft-line-b divide-y sm:divide-y-0 sm:divide-x divide-black/5 dark:divide-white/10">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 sm:p-5 flex items-center justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs border border-white/40 dark:border-white/10 ${stat.tone}`}>
              <stat.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Attendance Analytics & Today's Schedule — Divided by soft lines */}
      <div className="grid lg:grid-cols-3 soft-line-b">
        <div className="lg:col-span-2 p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Attendance Trend</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monthly progress across 6 semesters</p>
            </div>
            <Link to="/student/attendance" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 macos-bouncy">
              View details <ArrowRight size={12} />
            </Link>
          </div>
          <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Today's Classes</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{todaysClasses.length} sessions scheduled</p>
            </div>
            <Link to="/student/timetable" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline macos-bouncy">
              Timetable
            </Link>
          </div>
          {todaysClasses.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No classes today" message="Check your timetable for the full weekly schedule." />
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm soft-line-b last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{c.subject}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.room} · {c.faculty}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg">{c.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Pending Assignments & Recent Notifications — Divided by soft lines */}
      <div className="grid lg:grid-cols-2 soft-line-b">
        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Pending Assignments</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Upcoming coursework deliverables</p>
            </div>
            <Link to="/student/assignments" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline macos-bouncy">
              View all
            </Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending assignments" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm soft-line-b last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{a.title}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{a.subject}</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                    Due {a.dueDate}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Recent Notifications</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Announcements & academic warnings</p>
            </div>
            <Link to="/student/notifications" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline macos-bouncy">
              View all
            </Link>
          </div>
          {unread.length === 0 ? (
            <EmptyState icon={Bell} title="No new notifications" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {unread.map((n) => (
                <div key={n.id} className="text-sm soft-line-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{n.title}</p>
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Upcoming Assessments, Course Materials, and Recent Feedback — 3 columns with soft vertical lines */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 soft-line-b">
        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Upcoming Assessments</p>
            <Link to="/student/assessments" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {upcomingAssessments.length === 0 ? (
            <EmptyState icon={ClipboardEdit} title="No upcoming tests" message="Your faculty haven't published any yet." />
          ) : (
            <div className="space-y-3">
              {upcomingAssessments.map((a) => (
                <div key={a.id} className="text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{a.subject}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{a.title} · {a.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Course Materials</p>
            <Link to="/student/subjects" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {recentMaterials.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No materials yet" message="Notes & slides from faculty appear here." />
          ) : (
            <div className="space-y-3">
              {recentMaterials.map((m) => (
                <div key={m.id} className="text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{m.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{m.subject} · {m.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Recent Feedback</p>
            <Link to="/student/feedback" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {myFeedback.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No feedback submitted" message="Share feedback on your subjects." />
          ) : (
            <div className="space-y-3">
              {myFeedback.map((f) => (
                <div key={f.id} className="text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{f.subjectName}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Academic Results & Recent Marks Performance Strip — Divided by soft line */}
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/5 dark:divide-white/10 p-4 sm:p-5">
        <div className="p-3 sm:p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Latest SGPA: {resultsData?.sgpa ?? "8.5"}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">CGPA {resultsData?.cgpa ?? "8.4"} · {student.semester || resultsData?.semester || "1st Semester"}</p>
            </div>
          </div>
          <Link to="/student/results" className="btn-secondary !py-1.5 !px-3 text-xs macos-bouncy">
            View Results
          </Link>
        </div>

        <div className="p-3 sm:p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
              <Award size={20} />
            </div>
            {recentMark ? (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Recent Marks: {recentMark.subject}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{recentMark.total}/100 · Grade {recentMark.grade}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">No new marks yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Updated marks will appear once entered by faculty.</p>
              </div>
            )}
          </div>
          <Link to="/student/results" className="btn-secondary !py-1.5 !px-3 text-xs macos-bouncy">
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}
