import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import FacultyLayout from "../layouts/FacultyLayout";
import AdminLayout from "../layouts/AdminLayout";

import Landing from "../pages/common/Landing";
import NotFound from "../pages/common/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import StudentDashboard from "../pages/student/Dashboard";
import StudentProfile from "../pages/student/Profile";
import StudentAttendance from "../pages/student/Attendance";
import StudentQRAttendance from "../pages/student/QRAttendance";
import StudentSubjects from "../pages/student/Subjects";
import StudentTimetable from "../pages/student/Timetable";
import StudentResults from "../pages/student/Results";
import StudentFees from "../pages/student/Fees";
import StudentAssessments from "../pages/student/Assessments";
import StudentAssignments from "../pages/student/Assignments";
import StudentFeedback from "../pages/student/Feedback";
import StudentNotifications from "../pages/student/Notifications";
import StudentChatbot from "../pages/student/Chatbot";
import StudentSettings from "../pages/student/Settings";

import FacultyDashboard from "../pages/faculty/Dashboard";
import FacultyProfile from "../pages/faculty/Profile";
import FacultyMyClasses from "../pages/faculty/MyClasses";
import FacultySubjects from "../pages/faculty/Subjects";
import FacultyStudents from "../pages/faculty/Students";
import FacultyAttendance from "../pages/faculty/Attendance";
import FacultyQRAttendance from "../pages/faculty/QRAttendance";
import FacultyMarks from "../pages/faculty/Marks";
import FacultyAssessments from "../pages/faculty/Assessments";
import FacultyAssignments from "../pages/faculty/Assignments";
import FacultyCourseMaterials from "../pages/faculty/CourseMaterials";
import FacultyAnnouncements from "../pages/faculty/Announcements";
import FacultyNotifications from "../pages/faculty/Notifications";
import FacultyStudentPerformance from "../pages/faculty/StudentPerformance";
import FacultyFeedback from "../pages/faculty/Feedback";
import FacultyRequests from "../pages/faculty/Requests";
import FacultyReports from "../pages/faculty/Reports";
import FacultyTasks from "../pages/faculty/Tasks";
import FacultyChatbot from "../pages/faculty/Chatbot";
import FacultySettings from "../pages/faculty/Settings";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminStudents from "../pages/admin/Students";
import AdminFaculty from "../pages/admin/Faculty";
import AdminRequests from "../pages/admin/Requests";
import AdminDepartments from "../pages/admin/Departments";
import AdminCourses from "../pages/admin/Courses";
import AdminSubjects from "../pages/admin/Subjects";
import AdminAttendance from "../pages/admin/Attendance";
import AdminQRManagement from "../pages/admin/QRManagement";
import AdminLocations from "../pages/admin/LocationManagement";
import AdminResults from "../pages/admin/Results";
import AdminTimetable from "../pages/admin/Timetable";
import AdminNotifications from "../pages/admin/Notifications";
import AdminReports from "../pages/admin/Reports";
import AdminChatbot from "../pages/admin/Chatbot";
import AdminSettings from "../pages/admin/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="qr-attendance" element={<StudentQRAttendance />} />
        <Route path="subjects" element={<StudentSubjects />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="assessments" element={<StudentAssessments />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="feedback" element={<StudentFeedback />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="chatbot" element={<StudentChatbot />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      {/* Faculty */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="profile" element={<FacultyProfile />} />
        <Route path="my-classes" element={<FacultyMyClasses />} />
        <Route path="subjects" element={<FacultySubjects />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="qr-attendance" element={<FacultyQRAttendance />} />
        <Route path="marks" element={<FacultyMarks />} />
        <Route path="assessments" element={<FacultyAssessments />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="materials" element={<FacultyCourseMaterials />} />
        <Route path="announcements" element={<FacultyAnnouncements />} />
        <Route path="notifications" element={<FacultyNotifications />} />
        <Route path="performance" element={<FacultyStudentPerformance />} />
        <Route path="feedback" element={<FacultyFeedback />} />
        <Route path="requests" element={<FacultyRequests />} />
        <Route path="reports" element={<FacultyReports />} />
        <Route path="tasks" element={<FacultyTasks />} />
        <Route path="chatbot" element={<FacultyChatbot />} />
        <Route path="settings" element={<FacultySettings />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="qr-attendance" element={<AdminQRManagement />} />
        <Route path="locations" element={<AdminLocations />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="chatbot" element={<AdminChatbot />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
