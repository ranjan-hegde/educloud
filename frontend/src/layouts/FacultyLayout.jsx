import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, User, BookOpen, Users, CalendarCheck, QrCode, GraduationCap, ClipboardList, Bell, MessageSquare, Settings, LayoutGrid, ClipboardEdit, FolderOpen, Megaphone, TrendingUp, MessageSquareText, FileClock, BarChart3, ListTodo } from "lucide-react";
import DashboardShell from "./DashboardShell";

const items = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/my-classes", label: "My Classes", icon: LayoutGrid },
  { path: "/subjects", label: "My Subjects", icon: BookOpen },
  { path: "/students", label: "Students", icon: Users },
  { path: "/attendance", label: "Attendance", icon: CalendarCheck },
  { path: "/qr-attendance", label: "QR Attendance", icon: QrCode },
  { path: "/marks", label: "Marks", icon: GraduationCap },
  { path: "/assessments", label: "Assessments", icon: ClipboardEdit },
  { path: "/assignments", label: "Assignments", icon: ClipboardList },
  { path: "/materials", label: "Course Materials", icon: FolderOpen },
  { path: "/announcements", label: "Announcements", icon: Megaphone },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/performance", label: "Student Performance", icon: TrendingUp },
  { path: "/feedback", label: "Feedback", icon: MessageSquareText },
  { path: "/requests", label: "Requests", icon: FileClock },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/tasks", label: "Tasks", icon: ListTodo },
  { path: "/chatbot", label: "AI Assistant", icon: MessageSquare },
  { path: "/settings", label: "Settings", icon: Settings },
];

const titles = {
  "": "Dashboard", "/profile": "Profile", "/my-classes": "My Classes", "/subjects": "My Subjects", "/students": "Students",
  "/attendance": "Attendance", "/qr-attendance": "QR Attendance Management", "/marks": "Marks",
  "/assessments": "Assessments", "/assignments": "Assignments", "/materials": "Course Materials",
  "/announcements": "Announcements", "/notifications": "Notifications", "/performance": "Student Performance",
  "/feedback": "Feedback", "/requests": "Leave / Class Requests", "/reports": "Reports", "/tasks": "Tasks & Activities",
  "/chatbot": "AI Assistant", "/settings": "Settings",
};

export default function FacultyLayout() {
  const loc = useLocation();
  const sub = loc.pathname.replace("/faculty/dashboard", "").replace("/faculty", "") || "";
  const title = titles[sub] ?? "Dashboard";
  return (
    <DashboardShell items={items} basePath="/faculty" roleLabel="Faculty Portal" title={title}>
      <Outlet />
    </DashboardShell>
  );
}
