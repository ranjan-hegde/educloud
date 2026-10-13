import { Link } from "react-router-dom";
import {
  Users, UserCog, BookMarked, Building2, CalendarCheck, QrCode, MessageSquareText, FileClock,
  Bell, Activity, GraduationCap, BookOpen, Settings, ClipboardList,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import EmptyState from "../../components/EmptyState";
import { TrendLineChart, CompareBarChart } from "../../components/StatChart";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { monthlyAttendanceTrend, departmentPerformance } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const quickActions = [
  { label: "Manage Students", to: "/admin/students", icon: Users },
  { label: "Manage Faculty", to: "/admin/faculty", icon: UserCog },
  { label: "Manage Courses", to: "/admin/courses", icon: BookMarked },
  { label: "Manage Subjects", to: "/admin/subjects", icon: BookOpen },
  { label: "View Attendance", to: "/admin/attendance", icon: CalendarCheck },
  { label: "Manage Timetable", to: "/admin/timetable", icon: GraduationCap },
  { label: "View Reports", to: "/admin/reports", icon: ClipboardList },
  { label: "Manage Notifications", to: "/admin/notifications", icon: Bell },
  { label: "System Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const [students] = usePersistentState("students");
  const [faculty] = usePersistentState("faculty");
  const [subjects] = usePersistentState("subjects");
  const [qrSessions] = usePersistentState("qrSessions");
  const [requests] = usePersistentState("requests");
  const [feedback] = usePersistentState("feedback");
  const [notifications] = usePersistentState("notifications");

  const totalClasses = new Set(qrSessions.map((s) => s.class)).size;
  const avgAttendance = students.length ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) : 0;
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const newFeedback = feedback.filter((f) => f.status === "NEW");
  const activeSessions = qrSessions.filter((s) => s.status === "ACTIVE");

  const recentActivities = [
    students[0] && { icon: Users, text: `New student registered: ${students[0].name}` },
    qrSessions[0] && { icon: QrCode, text: `Attendance session for ${qrSessions[0].subject} — ${qrSessions[0].status.toLowerCase()}` },
    feedback[0] && { icon: MessageSquareText, text: `${feedback[0].studentName} submitted feedback on ${feedback[0].subjectName}` },
    notifications[0] && { icon: Bell, text: notifications[0].title },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Institution-wide overview and system health" />

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <DashboardCard icon={Users} label="Total Students" value={students.length.toLocaleString()} tone="navy" />
        <DashboardCard icon={UserCog} label="Total Faculty" value={faculty.length} tone="teal" />
        <DashboardCard icon={Building2} label="Total Classes" value={totalClasses} tone="amber" />
        <DashboardCard icon={BookMarked} label="Total Subjects" value={subjects.length} tone="navy" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={CalendarCheck} label="Today's Attendance" value={`${avgAttendance}%`} tone="teal" />
        <DashboardCard icon={QrCode} label="Active QR Sessions" value={activeSessions.length} tone="coral" />
        <DashboardCard icon={MessageSquareText} label="New Feedback" value={newFeedback.length} tone="coral" />
        <DashboardCard icon={FileClock} label="Pending Requests" value={pendingRequests.length} tone="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Institution-wide Attendance Trend</p>
          <TrendLineChart data={monthlyAttendanceTrend} dataKey="rate" xKey="month" />
        </div>
        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Department Performance</p>
          <CompareBarChart data={departmentPerformance} xKey="department" bars={[{ key: "avgAttendance", color: "#1f3a6b" }, { key: "avgResult", color: "#0ea5a0" }]} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">System Notifications</p>
            <Link to="/admin/notifications" className="text-xs font-semibold text-navy-600 hover:underline">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" message="System and announcement notifications will appear here." />
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="text-sm">
                  <p className="font-medium text-navy-800">{n.title}</p>
                  <p className="text-xs text-navy-400 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <p className="font-semibold text-navy-900 mb-4">Recent Activities</p>
          {recentActivities.length === 0 ? (
            <EmptyState icon={Activity} title="No recent activity" message="System activity will show up here as it happens." />
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center shrink-0"><a.icon size={14} /></div>
                  <p className="text-navy-700">{a.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-navy-900">Active & Recent QR Attendance Sessions</p>
          <Link to="/admin/qr-attendance" className="text-xs font-semibold text-navy-600 hover:underline">Manage</Link>
        </div>
        {qrSessions.length === 0 ? (
          <EmptyState icon={QrCode} title="No active QR attendance sessions" message="Create a QR attendance session to get started." />
        ) : (
          <DataTable
            columns={["Subject", "Class", "Faculty", "Room", "Status", "Present/Total"]}
            data={qrSessions}
            renderRow={(s) => (
              <>
                <td className="px-3 py-3 font-medium text-navy-800">{s.subject}</td>
                <td className="px-3 py-3 text-navy-500">{s.class}</td>
                <td className="px-3 py-3 text-navy-500">{s.faculty}</td>
                <td className="px-3 py-3 text-navy-500">{s.room}</td>
                <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-3 py-3 text-navy-600 font-medium">{s.present}/{s.total}</td>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}
