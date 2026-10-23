import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  CalendarCheck,
  QrCode,
  GraduationCap,
  ClipboardEdit,
  MessageSquareText,
  Bell,
  FolderOpen,
  ListTodo,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import EmptyState from "../../components/EmptyState";
import { TrendLineChart } from "../../components/StatChart";
import { useAuth } from "../../context/AuthContext";
import { currentFaculty, attendanceTrend, subjects as subjectsMaster } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const quickActions = [
  { label: "QR Attendance & Pass", to: "/faculty/qr-attendance", icon: QrCode },
  { label: "Assign Student Tasks", to: "/faculty/tasks", icon: ListTodo },
  { label: "Course Materials", to: "/faculty/materials", icon: FolderOpen },
  { label: "Mark Attendance", to: "/faculty/attendance", icon: CalendarCheck },
  { label: "Update Marks", to: "/faculty/marks", icon: GraduationCap },
  { label: "Create Assessment", to: "/faculty/assessments", icon: ClipboardEdit },
  { label: "Manage Assignments", to: "/faculty/assignments", icon: ClipboardList },
  { label: "View Timetable", to: "/faculty/timetable", icon: CalendarDays },
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
  const myFeedback = allFeedback.filter(
    (f) => f.facultyId === faculty.id || (!f.facultyId && mySubjectNames.includes(f.subjectName))
  );
  const myNotifications = notifications.filter((n) => n.postedBy !== "faculty").slice(0, 4);

  const pendingAssessments = myAssessments.filter((a) => a.status !== "Published");
  const pendingAssignments = myAssignments.filter((a) => a.status === "Pending");
  const newFeedback = myFeedback.filter((f) => f.status === "NEW");

  const myClasses = new Set(
    subjectsMaster
      .filter((s) => mySubjectNames.includes(s.name))
      .map((s) => `${s.course} ${s.semester}th Semester`)
  );
  const assignedStudents = studentsList.filter((s) =>
    myClasses.has(`${s.course} ${s.semester}th Semester`)
  ).length;
  const avgAttendance = studentsList.length
    ? Math.round(studentsList.reduce((a, s) => a + s.attendance, 0) / studentsList.length)
    : 0;
  const activeToday = mySessions.filter((s) => s.status === "ACTIVE");
  const todaysAttendancePct = activeToday.length
    ? Math.round(
        activeToday.reduce((a, s) => a + (s.present / (s.total || 1)) * 100, 0) / activeToday.length
      )
    : null;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${faculty.name || "Faculty"}`}
        subtitle={`${faculty.designation || "Assistant Professor"} · ${
          faculty.department || "Department"
        }`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <DashboardCard icon={Users} label="Assigned Students" value={assignedStudents} tone="navy" />
        <DashboardCard icon={BookOpen} label="Subjects" value={mySubjectNames.length} tone="teal" />
        <DashboardCard icon={CalendarDays} label="Today's Classes" value={mySessions.length} tone="amber" />
        <DashboardCard
          icon={TrendingUp}
          label="Today's Attendance"
          value={todaysAttendancePct !== null ? `${todaysAttendancePct}%` : "—"}
          sub={todaysAttendancePct === null ? "No active session" : undefined}
          tone="navy"
        />
        <DashboardCard
          icon={ClipboardEdit}
          label="Pending Assessments"
          value={pendingAssessments.length}
          tone="coral"
        />
        <DashboardCard icon={MessageSquareText} label="New Feedback" value={newFeedback.length} tone="coral" />
      </div>

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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Average Class Attendance Trend</p>
            <Link
              to="/faculty/attendance"
              className="text-xs font-semibold text-navy-600 hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Today&apos;s Classes</p>
            <Link to="/faculty/qr-attendance" className="text-xs font-semibold text-navy-600 hover:underline">
              QR Attendance
            </Link>
          </div>
          {mySessions.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No classes today"
              message="Create an attendance session to get started."
              action={
                <Link to="/faculty/qr-attendance" className="btn-secondary !py-1.5 text-xs">
                  Create Session
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {mySessions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-sm border-b border-surface-border last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-navy-800">{c.subject}</p>
                    <p className="text-xs text-navy-400">
                      {c.room} · {c.class}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-navy-500">{c.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Assignments Needing Review</p>
            <Link to="/faculty/assignments" className="text-xs font-semibold text-navy-600 hover:underline">
              View all
            </Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending assignments" message="Everything has been reviewed." />
          ) : (
            <div className="space-y-3">
              {pendingAssignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm bg-navy-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-navy-800">{a.title}</p>
                    <p className="text-xs text-navy-400">{a.subject}</p>
                  </div>
                  <span className="text-xs font-semibold text-navy-600">
                    {a.submissions}/{a.totalStudents} submitted
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">New Student Feedback</p>
            <Link to="/faculty/feedback" className="text-xs font-semibold text-navy-600 hover:underline">
              View all
            </Link>
          </div>
          {newFeedback.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title="No new feedback"
              message="Feedback submitted by students will appear here."
            />
          ) : (
            <div className="space-y-3">
              {newFeedback.slice(0, 4).map((f) => (
                <div key={f.id} className="text-sm">
                  <p className="font-medium text-navy-800">{f.studentName}</p>
                  <p className="text-xs text-navy-400 line-clamp-1">
                    {f.subjectName} · {f.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Notifications</p>
            <Link to="/faculty/notifications" className="text-xs font-semibold text-navy-600 hover:underline">
              View all
            </Link>
          </div>
          {myNotifications.length === 0 ? (
            <EmptyState icon={Bell} title="No new notifications" message="You're all caught up." />
          ) : (
            <div className="space-y-3">
              {myNotifications.map((n) => (
                <div key={n.id} className="text-sm">
                  <p className="font-medium text-navy-800">{n.title}</p>
                  <p className="text-xs text-navy-400 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5 mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-navy-700" />
          <div>
            <p className="font-semibold text-navy-900 text-sm">
              Institution-wide average attendance: {avgAttendance}%
            </p>
            <p className="text-xs text-navy-400">Review individual student performance and at-risk students</p>
          </div>
        </div>
        <Link to="/faculty/performance" className="btn-secondary !py-2">
          Student Performance
        </Link>
      </div>
    </div>
  );
}
