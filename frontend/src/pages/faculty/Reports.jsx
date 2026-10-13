import { Download } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import DataTable from "../../components/DataTable";
import { TrendLineChart } from "../../components/StatChart";
import { Users, ClipboardList, ClipboardCheck, TrendingUp } from "lucide-react";
import { currentFaculty, attendanceTrend } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function FacultyReports() {
  const [allAssessments] = usePersistentState("assessments");
  const [allAssignments] = usePersistentState("assignments");
  const [studentsList] = usePersistentState("students");
  const toast = useToast();

  const mySubjectNames = currentFaculty.subjects || [];
  const myAssessments = allAssessments.filter((a) => mySubjectNames.includes(a.subject));
  const myAssignments = allAssignments.filter((a) => mySubjectNames.includes(a.subject));
  const avgAttendance = Math.round(studentsList.reduce((a, s) => a + s.attendance, 0) / (studentsList.length || 1));

  function exportReport() { toast.success("Report export started — this is a mock action in the frontend phase."); }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Attendance, marks, and assignment reports for your classes"
        actions={<button className="btn-primary" onClick={exportReport}><Download size={15} /> Export</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={Users} label="Students" value={studentsList.length} tone="navy" />
        <DashboardCard icon={TrendingUp} label="Avg. Attendance" value={`${avgAttendance}%`} tone="teal" />
        <DashboardCard icon={ClipboardList} label="Assessments" value={myAssessments.length} tone="amber" />
        <DashboardCard icon={ClipboardCheck} label="Assignments" value={myAssignments.length} tone="coral" />
      </div>

      <div className="card p-5 mb-6">
        <p className="font-semibold text-navy-900 mb-4">Class Attendance Trend</p>
        <TrendLineChart data={attendanceTrend} dataKey="percentage" xKey="month" />
      </div>

      <div className="card p-5 mb-6">
        <p className="font-semibold text-navy-900 mb-4">Assessment Report</p>
        <DataTable
          columns={["Title", "Subject", "Date", "Max Marks", "Status"]}
          data={myAssessments}
          emptyMessage="No assessments created yet."
          renderRow={(a) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{a.title}</td>
              <td className="px-3 py-3 text-navy-500">{a.subject}</td>
              <td className="px-3 py-3 text-navy-500">{a.date}</td>
              <td className="px-3 py-3 text-navy-500">{a.maxMarks}</td>
              <td className="px-3 py-3"><span className={a.status === "Published" ? "badge-green" : "badge-blue"}>{a.status}</span></td>
            </>
          )}
        />
      </div>

      <div className="card p-5">
        <p className="font-semibold text-navy-900 mb-4">Assignment Report</p>
        <DataTable
          columns={["Title", "Subject", "Due Date", "Submissions", "Status"]}
          data={myAssignments}
          emptyMessage="No assignments created yet."
          renderRow={(a) => (
            <>
              <td className="px-3 py-3 font-medium text-navy-800">{a.title}</td>
              <td className="px-3 py-3 text-navy-500">{a.subject}</td>
              <td className="px-3 py-3 text-navy-500">{a.dueDate}</td>
              <td className="px-3 py-3 text-navy-500">{a.submissions}/{a.totalStudents}</td>
              <td className="px-3 py-3"><span className={a.status === "Pending" ? "badge-amber" : "badge-green"}>{a.status}</span></td>
            </>
          )}
        />
      </div>
    </div>
  );
}
