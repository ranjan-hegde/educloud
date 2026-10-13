import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserCog, Building2, BookMarked, Library, CalendarCheck, QrCode, GraduationCap, CalendarDays, Bell, BarChart3, Settings, MessageSquare, MapPin } from "lucide-react";
import DashboardShell from "./DashboardShell";

const items = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/students", label: "Students", icon: Users },
  { path: "/faculty", label: "Faculty", icon: UserCog },
  { path: "/departments", label: "Departments", icon: Building2 },
  { path: "/courses", label: "Courses", icon: BookMarked },
  { path: "/subjects", label: "Subjects", icon: Library },
  { path: "/attendance", label: "Attendance", icon: CalendarCheck },
  { path: "/qr-attendance", label: "QR Attendance Mgmt", icon: QrCode },
  { path: "/locations", label: "Locations", icon: MapPin },
  { path: "/results", label: "Results", icon: GraduationCap },
  { path: "/timetable", label: "Timetable", icon: CalendarDays },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/chatbot", label: "AI Assistant", icon: MessageSquare },
  { path: "/settings", label: "System Settings", icon: Settings },
];

const titles = {
  "": "Dashboard", "/students": "Student Management", "/faculty": "Faculty Management",
  "/departments": "Departments", "/courses": "Courses", "/subjects": "Subjects",
  "/attendance": "Attendance", "/qr-attendance": "QR Attendance Management", "/locations": "Location Management",
  "/results": "Results Management", "/timetable": "Timetable Management", "/notifications": "Notifications & Announcements",
  "/reports": "Reports", "/chatbot": "AI Assistant", "/settings": "System Settings",
};

export default function AdminLayout() {
  const loc = useLocation();
  const sub = loc.pathname.replace("/admin/dashboard", "").replace("/admin", "") || "";
  const title = titles[sub] ?? "Dashboard";
  return (
    <DashboardShell items={items} basePath="/admin" roleLabel="Admin Portal" title={title}>
      <Outlet />
    </DashboardShell>
  );
}
