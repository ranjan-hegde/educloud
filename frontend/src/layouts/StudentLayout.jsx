import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  QrCode,
  BookOpen,
  BookMarked,
  ListTodo,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  ClipboardEdit,
  Bell,
  MessageSquare,
  MessageSquareText,
  Settings,
  Wallet,
} from "lucide-react";
import DashboardShell from "./DashboardShell";

const items = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/profile", label: "My Profile", icon: User },
  { path: "/attendance", label: "Attendance", icon: CalendarCheck },
  { path: "/qr-attendance", label: "QR Attendance", icon: QrCode },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
  { path: "/materials", label: "Course Materials", icon: BookMarked },
  { path: "/timetable", label: "Timetable", icon: CalendarDays },
  { path: "/results", label: "Results", icon: GraduationCap },
  { path: "/fees", label: "Fees", icon: Wallet },
  { path: "/assessments", label: "Assessments", icon: ClipboardEdit },
  { path: "/assignments", label: "Assignments", icon: ClipboardList },
  { path: "/tasks", label: "My Tasks", icon: ListTodo },
  { path: "/feedback", label: "Feedback", icon: MessageSquareText },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/chatbot", label: "AI Chatbot", icon: MessageSquare },
  { path: "/settings", label: "Settings", icon: Settings },
];

const titles = {
  "": "Dashboard",
  "/profile": "My Profile",
  "/attendance": "Attendance",
  "/qr-attendance": "QR Attendance",
  "/subjects": "Subjects",
  "/materials": "Course Materials & Resources",
  "/timetable": "Timetable",
  "/results": "Results",
  "/fees": "Fees",
  "/assessments": "Assessments",
  "/assignments": "Assignments",
  "/tasks": "My Assigned Tasks",
  "/feedback": "Feedback",
  "/notifications": "Notifications",
  "/chatbot": "AI Chatbot",
  "/settings": "Settings",
};

export default function StudentLayout() {
  const loc = useLocation();
  const sub = loc.pathname.replace("/student/dashboard", "").replace("/student", "") || "";
  const title = titles[sub] ?? "Dashboard";
  return (
    <DashboardShell items={items} basePath="/student" roleLabel="Student Portal" title={title}>
      <Outlet />
    </DashboardShell>
  );
}
