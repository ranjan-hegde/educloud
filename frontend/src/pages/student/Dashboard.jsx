import { Link } from "react-router-dom";
import {
  CalendarCheck, BookOpen, ClipboardList, Bell, GraduationCap, ArrowRight, Clock,
  QrCode, ClipboardEdit, FolderOpen, MessageSquareText, Award, CalendarDays,
} from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import PageHeader from "../../components/PageHeader";
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${(student.name || "Student").split(" ")[0]}`}
        subtitle={`${student.course || "BCA"} · ${student.semester || "1st Semester"} · ${student.department || "Computer Applications"}`}
      />

      {/* Quick Actions in Liquid Glass Card */}
      <div className="card p-5">
        <p className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3.5">Quick Actions</p>
        <div className="flex flex-wrap gap-2.5">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className="btn-secondary !py-2 text-xs">
              <a.icon size={14} className="text-blue-500" /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <DashboardCard icon={CalendarCheck} label="Attendance" value={`${overallAttendance}%`} tone="teal" />
        <DashboardCard icon={BookOpen} label="Subjects" value={mySubjectNames.length} tone="blue" />
        <DashboardCard icon={Clock} label="Today's Classes" value={todaysClasses.length} tone="amber" />
        <DashboardCard icon={ClipboardList} label="Pending Assignments" value={safeAssignments.filter((a) => a.status === "Pending").length} tone="coral" />
        <DashboardCard icon={ClipboardEdit} label="Upcoming Tests" value={upcomingAssessments.length} tone="purple" />
        <DashboardCard icon={Bell} label="Notifications" value={safeNotifications.filter((n) => !n.read).length} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Attendance Trend</p>
            <Link to="/student/attendance" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View details <ArrowRight size={12} />
            </Link>
          </div>
          <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Today's Classes</p>
            <Link to="/student/timetable" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Timetable</Link>
          </div>
          {todaysClasses.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No classes today" message="Check your timetable for the full weekly schedule." />
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b border-black/5 dark:border-white/10 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{c.subject}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{c.room} · {c.faculty}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Pending Assignments</p>
            <Link to="/student/assignments" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending assignments" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{a.subject}</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">Due {a.dueDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Recent Notifications</p>
            <Link to="/student/notifications" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {unread.length === 0 ? (
            <EmptyState icon={Bell} title="No new notifications" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {unread.map((n) => (
                <div key={n.id} className="text-sm">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Upcoming Assessments</p>
            <Link to="/student/assessments" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {upcomingAssessments.length === 0 ? (
            <EmptyState icon={ClipboardEdit} title="No upcoming assessments" message="Your faculty haven't published any yet." action={<Link to="/student/assessments" className="btn-secondary !py-1.5 text-xs">View Assessments</Link>} />
          ) : (
            <div className="space-y-3">
              {upcomingAssessments.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{a.subject}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{a.title} · {a.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Course Materials</p>
            <Link to="/student/subjects" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {recentMaterials.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No materials yet" message="Notes, slides, and links from your faculty will appear here." />
          ) : (
            <div className="space-y-3">
              {recentMaterials.map((m) => (
                <div key={m.id} className="text-sm">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{m.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{m.subject} · {m.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">Recent Feedback</p>
            <Link to="/student/feedback" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {myFeedback.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No feedback submitted" message="Share feedback on your subjects and faculty." action={<Link to="/student/feedback" className="btn-secondary !py-1.5 text-xs">Submit Feedback</Link>} />
          ) : (
            <div className="space-y-3">
              {myFeedback.map((f) => (
                <div key={f.id} className="text-sm">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{f.subjectName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Latest SGPA: {resultsData?.sgpa ?? "8.5"}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">CGPA {resultsData?.cgpa ?? "8.4"} · {student.semester || resultsData?.semester || "1st Semester"}</p>
            </div>
          </div>
          <Link to="/student/results" className="btn-secondary !py-2 text-xs">View Results</Link>
        </div>

        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award size={22} />
            </div>
            {recentMark ? (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Recent Marks: {recentMark.subject}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{recentMark.total}/100 · Grade {recentMark.grade}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">No new marks yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Updated marks will appear here once entered by faculty.</p>
              </div>
            )}
          </div>
          <Link to="/student/results" className="btn-secondary !py-2 text-xs">View Results</Link>
        </div>
      </div>
    </div>
  );
}
