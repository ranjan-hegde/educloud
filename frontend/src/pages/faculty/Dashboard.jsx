import { Link } from "react-router-dom";
import {
  Users, BookOpen, CalendarDays, ClipboardList, TrendingUp, ArrowRight, CalendarCheck,
  QrCode, GraduationCap, ClipboardEdit, MessageSquareText, Bell, FolderOpen,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { TrendLineChart } from "../../components/StatChart";
import { useAuth } from "../../context/AuthContext";
import { currentFaculty, attendanceTrend, subjects as subjectsMaster } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const quickActions = [
  { label: "Create Attendance QR", to: "/faculty/qr-attendance", icon: QrCode },
  { label: "Mark Attendance", to: "/faculty/attendance", icon: CalendarCheck },
  { label: "Update Marks", to: "/faculty/marks", icon: GraduationCap },
  { label: "Create Assessment", to: "/faculty/assessments", icon: ClipboardEdit },
  { label: "Manage Assignments", to: "/faculty/assignments", icon: ClipboardList },
  { label: "View Timetable", to: "/faculty/timetable", icon: CalendarDays },
  { label: "Course Materials", to: "/faculty/materials", icon: FolderOpen },
  { label: "Student Feedback", to: "/faculty/feedback", icon: MessageSquareText },
  { label: "Student Performance", to: "/faculty/performance", icon: TrendingUp },
];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const faculty = user || currentFaculty;

  const [allAssessments] = usePersistentState("assessments");
  const [allAssignments] = usePersistentState("assignments");
  const [allFeedback] = usePersistentState("feedback");
  const [qrSessions] = usePersistentState("qrSessions");
  const [studentsList] = usePersistentState("students");
  const [notifications] = usePersistentState("notifications");

  const mySubjectNames = faculty.subjects || currentFaculty.subjects || [];
  const todayISO = new Date().toISOString().slice(0, 10);
  const mySessions = qrSessions.filter((s) => s.faculty === faculty.name && s.date === todayISO);
  const myAssessments = allAssessments.filter((a) => mySubjectNames.includes(a.subject));
  const myAssignments = allAssignments.filter((a) => mySubjectNames.includes(a.subject));
  const myFeedback = allFeedback.filter((f) => f.facultyId === faculty.id || (!f.facultyId && mySubjectNames.includes(f.subjectName)));
  const myNotifications = notifications.filter((n) => n.postedBy !== "faculty").slice(0, 4);

  const pendingAssessments = myAssessments.filter((a) => a.status !== "Published");
  const pendingAssignments = myAssignments.filter((a) => a.status === "Pending");
  const newFeedback = myFeedback.filter((f) => f.status === "NEW");

  const myClasses = new Set(
    subjectsMaster
      .filter((s) => mySubjectNames.includes(s.name))
      .map((s) => `${s.course} ${s.semester}th Semester`)
  );
  const assignedStudents = studentsList.filter((s) => myClasses.has(`${s.course} ${s.semester}th Semester`)).length;
  const avgAttendance = studentsList.length ? Math.round(studentsList.reduce((a, s) => a + s.attendance, 0) / studentsList.length) : 0;
  const activeToday = mySessions.filter((s) => s.status === "ACTIVE");
  const todaysAttendancePct = activeToday.length
    ? Math.round(activeToday.reduce((a, s) => a + (s.present / (s.total || 1)) * 100, 0) / activeToday.length)
    : null;

  const stats = [
    { label: "Assigned Students", value: assignedStudents, icon: Users, tone: "text-blue-500 bg-blue-500/10" },
    { label: "My Subjects", value: mySubjectNames.length, icon: BookOpen, tone: "text-teal-500 bg-teal-500/10" },
    { label: "Today's Classes", value: mySessions.length, icon: CalendarDays, tone: "text-amber-500 bg-amber-500/10" },
    { label: "Today's Attendance", value: todaysAttendancePct !== null ? `${todaysAttendancePct}%` : "—", icon: TrendingUp, tone: "text-indigo-500 bg-indigo-500/10" },
    { label: "Pending Tests", value: pendingAssessments.length, icon: ClipboardEdit, tone: "text-rose-500 bg-rose-500/10" },
    { label: "New Feedback", value: newFeedback.length, icon: MessageSquareText, tone: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header & Quick Actions Strip */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                Faculty Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome, {faculty.name || "Faculty"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {faculty.designation || "Associate Professor"} · {faculty.department || "Computer Applications"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all macos-bouncy shadow-xs"
              >
                <a.icon size={13} className="text-teal-500" />
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row — Divided by soft vertical lines (NO cards) */}
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

      {/* 3. Average Attendance Trend & Today's Classes */}
      <div className="grid lg:grid-cols-3 soft-line-b">
        <div className="lg:col-span-2 p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Average Class Attendance Trend</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Aggregated attendance across all assigned subjects</p>
            </div>
            <Link to="/faculty/attendance" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 macos-bouncy">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" color="#0ea5a0" />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Today's Classes</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{mySessions.length} active sessions</p>
            </div>
            <Link to="/faculty/qr-attendance" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline macos-bouncy">
              QR Sessions
            </Link>
          </div>
          {mySessions.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No classes today" message="Create an attendance session to get started." action={<Link to="/faculty/qr-attendance" className="btn-secondary !py-1.5 text-xs macos-bouncy">Create Session</Link>} />
          ) : (
            <div className="space-y-3">
              {mySessions.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm soft-line-b last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{c.subject}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.room} · {c.class}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg">{c.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Assignments Needing Review, Student Feedback, Notifications (3 Columns divided by soft lines) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 soft-line-b">
        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Assignments Needing Review</p>
            <Link to="/faculty/assignments" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending assignments" message="Everything has been reviewed." />
          ) : (
            <div className="space-y-3">
              {pendingAssignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{a.title}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{a.subject}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg">
                    {a.submissions}/{a.totalStudents}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">New Student Feedback</p>
            <Link to="/faculty/feedback" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {newFeedback.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No new feedback" message="Feedback submitted by students will appear here." />
          ) : (
            <div className="space-y-3">
              {newFeedback.slice(0, 4).map((f) => (
                <div key={f.id} className="text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{f.studentName}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">{f.subjectName} · {f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Notifications</p>
            <Link to="/faculty/notifications" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {myNotifications.length === 0 ? (
            <EmptyState icon={Bell} title="No new notifications" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {myNotifications.map((n) => (
                <div key={n.id} className="text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{n.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Performance Banner Strip */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-xs">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Institution-wide average attendance: {avgAttendance}%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Review individual student performance and at-risk students</p>
          </div>
        </div>
        <Link to="/faculty/performance" className="btn-secondary !py-1.5 !px-3.5 text-xs macos-bouncy">
          Student Performance
        </Link>
      </div>
    </div>
  );
}
