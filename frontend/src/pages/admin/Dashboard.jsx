import { Link } from "react-router-dom";
import {
  Users, UserCog, BookMarked, Building2, CalendarCheck, QrCode, MessageSquareText, FileClock,
  Bell, Activity, GraduationCap, BookOpen, Settings, ClipboardList, ArrowRight, ShieldCheck,
} from "lucide-react";
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

  const stats = [
    { label: "Total Students", value: students.length.toLocaleString(), icon: Users, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Total Faculty", value: faculty.length, icon: UserCog, tone: "text-teal-500 bg-teal-500/10" },
    { label: "Total Classes", value: totalClasses, icon: Building2, tone: "text-amber-500 bg-amber-500/10" },
    { label: "Total Subjects", value: subjects.length, icon: BookMarked, tone: "text-indigo-500 bg-indigo-500/10" },
    { label: "Today's Attendance", value: `${avgAttendance}%`, icon: CalendarCheck, tone: "text-emerald-500 bg-emerald-500/10" },
    { label: "Active QR Sessions", value: activeSessions.length, icon: QrCode, tone: "text-rose-500 bg-rose-500/10" },
    { label: "New Feedback", value: newFeedback.length, icon: MessageSquareText, tone: "text-purple-500 bg-purple-500/10" },
    { label: "Pending Requests", value: pendingRequests.length, icon: FileClock, tone: "text-orange-500 bg-orange-500/10" },
  ];

  return (
    <div className="liquid-glass-studio rounded-3xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 mb-8">
      {/* 1. Header & Quick Actions Strip */}
      <div className="p-6 sm:p-7 soft-line-b">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                <ShieldCheck size={12} /> Institution Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Institution-wide overview, system health, and administrative workflows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all macos-bouncy shadow-xs"
              >
                <a.icon size={13} className="text-indigo-500" />
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row — Single row divided by soft lines (NO cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 soft-line-b divide-y sm:divide-y-0 sm:divide-x divide-black/5 dark:divide-white/10">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {stat.label}
              </span>
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border border-white/40 dark:border-white/10 ${stat.tone}`}>
                <stat.icon size={12} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Institution Attendance Trend & Department Performance (Divided by soft vertical line) */}
      <div className="grid lg:grid-cols-2 soft-line-b">
        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Institution Attendance Trend</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monthly average student attendance across campus</p>
            </div>
            <Link to="/admin/attendance" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 macos-bouncy">
              Details <ArrowRight size={12} />
            </Link>
          </div>
          <TrendLineChart data={monthlyAttendanceTrend} dataKey="rate" xKey="month" color="#3b82f6" />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Department Performance</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Attendance vs. Academic Results by Department</p>
            </div>
            <Link to="/admin/reports" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 macos-bouncy">
              Reports <ArrowRight size={12} />
            </Link>
          </div>
          <CompareBarChart
            data={departmentPerformance}
            xKey="department"
            bars={[
              { key: "avgAttendance", color: "#3b82f6" },
              { key: "avgResult", color: "#10b981" },
            ]}
          />
        </div>
      </div>

      {/* 4. System Notifications & Recent Activities (Divided by soft vertical line) */}
      <div className="grid lg:grid-cols-2 soft-line-b">
        <div className="p-6 lg:soft-line-r">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">System Notifications</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Recent alerts and campus-wide broadcasts</p>
            </div>
            <Link to="/admin/notifications" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline macos-bouncy">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" message="System and announcement notifications will appear here." />
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{n.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Recent Activities</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Live feed of institutional events</p>
            </div>
          </div>
          {recentActivities.length === 0 ? (
            <EmptyState icon={Activity} title="No recent activity" message="System activity will show up here as it happens." />
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm soft-line-b last:border-0 pb-2.5 last:pb-0">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-xs">
                    <a.icon size={14} />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{a.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Active & Recent QR Attendance Sessions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Active & Recent QR Attendance Sessions</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Live monitoring of QR check-in activity</p>
          </div>
          <Link to="/admin/attendance" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline macos-bouncy">Manage Sessions</Link>
        </div>
        {qrSessions.length === 0 ? (
          <EmptyState icon={QrCode} title="No active QR attendance sessions" message="Create a QR attendance session to get started." />
        ) : (
          <DataTable
            columns={["Subject", "Class", "Faculty", "Room", "Status", "Present/Total"]}
            data={qrSessions}
            renderRow={(s) => (
              <>
                <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{s.subject}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{s.class}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{s.faculty}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{s.room}</td>
                <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-3 py-3 text-indigo-600 dark:text-indigo-400 font-semibold">{s.present}/{s.total}</td>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}
