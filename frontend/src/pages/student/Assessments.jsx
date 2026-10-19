import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import { ClipboardList } from "lucide-react";
import { subjects, currentStudent } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

import { useAuth } from "../../context/AuthContext";

export default function StudentAssessments() {
  const { user } = useAuth();
  const student = user || currentStudent;
  const [allAssessments] = usePersistentState("assessments");
  const mySubjectNames = subjects.filter((s) => !student.course || s.course === student.course).map((s) => s.name);
  const items = (allAssessments || []).filter((a) => mySubjectNames.includes(a.subject) && a.status === "Published");

  return (
    <div>
      <PageHeader title="Assessments" subtitle="Upcoming assessments for your subjects" />
      {items.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assessments yet" message="Your faculty haven't published any assessments right now." />
      ) : (
        <div className="card p-5">
          <DataTable
            columns={["Title", "Subject", "Type", "Date", "Max Marks", "Instructions"]}
            data={items}
            renderRow={(a) => (
              <>
                <td className="px-3 py-3 font-medium text-navy-800">{a.title}</td>
                <td className="px-3 py-3 text-navy-500">{a.subject}</td>
                <td className="px-3 py-3 text-navy-500">{a.type}</td>
                <td className="px-3 py-3 text-navy-500">{a.date} {a.startTime && `· ${a.startTime}`}</td>
                <td className="px-3 py-3 text-navy-500">{a.maxMarks}</td>
                <td className="px-3 py-3 text-navy-400">{a.instructions}</td>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}
