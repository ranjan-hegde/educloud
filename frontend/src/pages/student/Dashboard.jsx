import { Link } from "react-router-dom";
import {
  CalendarCheck, BookOpen, ClipboardList, Bell, GraduationCap, ArrowRight, Clock,
  QrCode, ClipboardEdit, FolderOpen, MessageSquareText, Award, CalendarDays,
} from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { TrendLineChart } from "../../components/StatChart";
import { currentStudent, attendanceTrend, resultsData, subjects } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const studentClass = `${currentStudent.course} ${currentStudent.semester}`;
const mySubjectNames = subjects.filter((s) => s.course === currentStudent.course).map((s) => s.name);

const quickActions = [
  { label: "Scan Attendance QR", to: "/student/qr-attendance", icon: QrCode },
  { label: "View Timetable", to: "/student/timetable", icon: CalendarDays },
  { label: "View Assignments", to: "/student/assignments", icon: ClipboardList },
  { label: "View Results", to: "/student/results", icon: GraduationCap },
  { label: "View Assessments", to: "/student/assessments", icon: ClipboardEdit },
  { label: "Submit Feedback", to: "/student/feedback", icon: MessageSquareText },
];

export default function StudentDashboard() {
  const [assignments] = usePersistentState("assignments");
  const [notifications] = usePersistentState("notifications");
  const [assessments] = usePersistentState("assessments");
  const [courseMaterials] = usePersistentState("courseMaterials");
  const [feedback] = usePersistentState("feedback");
  const [attendanceSummary] = usePersistentState("attendanceSummary");
  const [qrSessions] = usePersistentState("qrSessions");
  const [marksOverrides] = usePersistentState("studentMarksOverrides");

  const pending = assignments.filter((a) => a.status === "Pending").slice(0, 4);
  const unread = notifications.filter((n) => !n.read).slice(0, 4);
  const upcomingAssessments = assessments.filter((a) => mySubjectNames.includes(a.subject) && a.status === "Published").slice(0, 4);
  const recentMaterials = courseMaterials.filter((m) => mySubjectNames.includes(m.subject)).slice(0, 4);
  const myFeedback = feedback.filter((f) => f.studentId === currentStudent.id).slice(0, 3);
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysClasses = qrSessions.filter((s) => s.class === studentClass && s.date === todayISO);

  const overrideEntries = Object.entries(marksOverrides || {});
  const recentMark = overrideEntries.length
    ? { subject: overrideEntries[overrideEntries.length - 1][0], ...overrideEntries[overrideEntries.length - 1][1] }
    : null;

  return (
    <div>
      <PageHeader title={`Welcome back, ${currentStudent.name.split(" ")[0]}`} subtitle={`${currentStudent.course} · ${currentStudent.semester} · ${currentStudent.department}`} />

      <div className="card p-5 mb-6">
        <p className="font-semibold text-navy-900 mb-4">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className="btn-secondary !py-2 text-xs">
              <a.icon size={14} /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <DashboardCard icon={CalendarCheck} label="Attendance" value={`${attendanceSummary.overall}%`} tone="teal" />
        <DashboardCard icon={BookOpen} label="Subjects" value={mySubjectNames.length} tone="navy" />
        <DashboardCard icon={Clock} label="Today's Classes" value={todaysClasses.length} tone="amber" />
        <DashboardCard icon={ClipboardList} label="Pending Assignments" value={assignments.filter((a) => a.status === "Pending").length} tone="coral" />
        <DashboardCard icon={ClipboardEdit} label="Upcoming Assessments" value={upcomingAssessments.length} tone="amber" />
        <DashboardCard icon={Bell} label="Notifications" value={notifications.filter((n) => !n.read).length} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Attendance Trend</p>
            <Link to="/student/attendance" className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1">View details <ArrowRight size={12} /></Link>
          </div>
          <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Today's Classes</p>
            <Link to="/student/timetable" className="text-xs font-semibold text-navy-600 hover:underline">Timetable</Link>
          </div>
          {todaysClasses.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No classes today" message="Check your timetable for the full weekly schedule." />
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b border-surface-border last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-navy-800">{c.subject}</p>
                    <p className="text-xs text-navy-400">{c.room} · {c.faculty}</p>
                  </div>
                  <span className="text-xs font-semibold text-navy-500">{c.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Pending Assignments</p>
            <Link to="/student/assignments" className="text-xs font-semibold text-navy-600 hover:underline">View all</Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending assignments" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-navy-800">{a.title}</p>
                    <p className="text-xs text-navy-400">{a.subject}</p>
                  </div>
                  <span className="text-xs font-semibold text-accent-coral">Due {a.dueDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Recent Notifications</p>
            <Link to="/student/notifications" className="text-xs font-semibold text-navy-600 hover:underline">View all</Link>
          </div>
          {unread.length === 0 ? (
            <EmptyState icon={Bell} title="No new notifications" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {unread.map((n) => (
                <div key={n.id} className="text-sm">
                  <p className="font-medium text-navy-800">{n.title}</p>
                  <p className="text-xs text-navy-400 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Upcoming Assessments</p>
            <Link to="/student/assessments" className="text-xs font-semibold text-navy-600 hover:underline">View all</Link>
          </div>
          {upcomingAssessments.length === 0 ? (
            <EmptyState icon={ClipboardEdit} title="No upcoming assessments" message="Your faculty haven't published any yet." action={<Link to="/student/assessments" className="btn-secondary !py-1.5 text-xs">View Assessments</Link>} />
          ) : (
            <div className="space-y-3">
              {upcomingAssessments.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium text-navy-800">{a.subject}</p>
                  <p className="text-xs text-navy-400">{a.title} · {a.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Course Materials</p>
            <Link to="/student/subjects" className="text-xs font-semibold text-navy-600 hover:underline">View all</Link>
          </div>
          {recentMaterials.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No materials yet" message="Notes, slides, and links from your faculty will appear here." />
          ) : (
            <div className="space-y-3">
              {recentMaterials.map((m) => (
                <div key={m.id} className="text-sm">
                  <p className="font-medium text-navy-800">{m.title}</p>
                  <p className="text-xs text-navy-400">{m.subject} · {m.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Recent Feedback</p>
            <Link to="/student/feedback" className="text-xs font-semibold text-navy-600 hover:underline">View all</Link>
          </div>
          {myFeedback.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No feedback submitted" message="Share feedback on your subjects and faculty." action={<Link to="/student/feedback" className="btn-secondary !py-1.5 text-xs">Submit Feedback</Link>} />
          ) : (
            <div className="space-y-3">
              {myFeedback.map((f) => (
                <div key={f.id} className="text-sm">
                  <p className="font-medium text-navy-800">{f.subjectName}</p>
                  <p className="text-xs text-navy-400 line-clamp-1">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-6">
        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap size={20} className="text-navy-700" />
            <div>
              <p className="font-semibold text-navy-900 text-sm">Latest SGPA: {resultsData.sgpa}</p>
              <p className="text-xs text-navy-400">CGPA {resultsData.cgpa} · {resultsData.semester}</p>
            </div>
          </div>
          <Link to="/student/results" className="btn-secondary !py-2">View Results</Link>
        </div>

        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award size={20} className="text-navy-700" />
            {recentMark ? (
              <div>
                <p className="font-semibold text-navy-900 text-sm">Recent Marks: {recentMark.subject}</p>
                <p className="text-xs text-navy-400">{recentMark.total}/100 · Grade {recentMark.grade}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-navy-900 text-sm">No new marks yet</p>
                <p className="text-xs text-navy-400">Updated marks will appear here once entered by faculty.</p>
              </div>
            )}
          </div>
          <Link to="/student/results" className="btn-secondary !py-2">View Results</Link>
        </div>
      </div>
    </div>
  );
}
