import { useState } from "react";
import { Star, MessageSquareText, Users, Sparkles, CheckCheck, TrendingUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import Filter from "../../components/Filter";
import DashboardCard from "../../components/DashboardCard";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import { subjects, currentFaculty } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

const mySubjectNames = currentFaculty.subjects || [];
const categories = ["Teaching", "Subject", "Class", "Course Material", "Assessment", "Assignment", "Attendance", "General", "Other"];
const ratings = ["5", "4", "3", "2", "1"];
const statuses = ["New", "Read"];

export default function FacultyFeedback() {
  const [allFeedback, setAllFeedback] = usePersistentState("feedback");
  // Faculty can only READ feedback for their own assigned students/subjects
  // — never write, edit, or delete a student's feedback. Match by the
  // reliable faculty ID first (as IDs should be), falling back to a
  // subject-name match so older or loosely-tagged records aren't hidden.
  const items = allFeedback.filter(
    (f) => f.facultyId === currentFaculty.id || (!f.facultyId && mySubjectNames.includes(f.subjectName))
  );

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("");
  const [viewing, setViewing] = useState(null);

  const filtered = items.filter((f) =>
    (!subject || f.subjectName === subject) &&
    (!category || f.category === category) &&
    (!rating || String(f.rating) === rating) &&
    (!status || (status === "New" ? f.status === "NEW" : f.status === "READ")) &&
    (f.studentName.toLowerCase().includes(search.toLowerCase()) || f.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  const total = items.length;
  const newCount = items.filter((f) => f.status === "NEW").length;
  const readCount = total - newCount;
  const avgRating = items.length ? (items.reduce((a, f) => a + (f.rating || 0), 0) / items.filter((f) => f.rating).length || 0).toFixed(1) : "0.0";

  function openFeedback(f) {
    setViewing(f);
    if (f.status === "NEW") {
      setAllFeedback((prev) => prev.map((x) => (x.id === f.id ? { ...x, status: "READ" } : x)));
    }
  }

  return (
    <div>
      <PageHeader title="Student Feedback" subtitle="Feedback submitted by students in your classes and subjects" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard icon={Users} label="Total Feedback" value={total} tone="navy" />
        <DashboardCard icon={Sparkles} label="New" value={newCount} tone="coral" />
        <DashboardCard icon={CheckCheck} label="Read" value={readCount} tone="teal" />
        <DashboardCard icon={TrendingUp} label="Average Rating" value={`${avgRating}/5`} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student name or ID..." />
        <Filter label="All subjects" value={subject} onChange={setSubject} options={[...new Set(items.map((f) => f.subjectName))]} />
        <Filter label="All categories" value={category} onChange={setCategory} options={categories} />
        <Filter label="All ratings" value={rating} onChange={setRating} options={ratings} />
        <Filter label="All statuses" value={status} onChange={setStatus} options={statuses} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title={items.length === 0 ? "No student feedback available." : "No feedback found"}
          message={items.length === 0 ? "Feedback submitted by your students will appear here." : "Nothing matches your current filters."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <button key={f.id} onClick={() => openFeedback(f)} className="card p-4 w-full text-left flex items-start justify-between gap-4 hover:shadow-pop transition-shadow">
              <div className="flex gap-3">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${f.status === "NEW" ? "bg-accent-coral" : "bg-transparent"}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-navy-900 text-sm">{f.studentName}</p>
                    <span className="text-xs text-navy-300">{f.studentId}</span>
                    <span className="badge-blue">{f.category}</span>
                    <span className="text-xs text-navy-400">{f.subjectName}</span>
                  </div>
                  <p className="text-sm text-navy-500 mt-1.5 line-clamp-2">{f.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {f.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={12} className={n <= f.rating ? "fill-amber-400 text-amber-400" : "text-navy-200"} />)}
                      </span>
                    )}
                    <span className="text-xs text-navy-300">{f.date}</span>
                  </div>
                </div>
              </div>
              <span className={f.status === "NEW" ? "badge-amber shrink-0" : "badge-gray shrink-0"}>{f.status === "NEW" ? "New" : "Read"}</span>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Feedback Detail">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-navy-400">Student</p><p className="font-medium text-navy-800">{viewing.studentName} ({viewing.studentId})</p></div>
              <div><p className="text-xs text-navy-400">Subject</p><p className="font-medium text-navy-800">{viewing.subjectName}</p></div>
              <div><p className="text-xs text-navy-400">Category</p><p className="font-medium text-navy-800">{viewing.category}</p></div>
              <div><p className="text-xs text-navy-400">Date</p><p className="font-medium text-navy-800">{viewing.date}</p></div>
            </div>
            {viewing.rating > 0 && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= viewing.rating ? "fill-amber-400 text-amber-400" : "text-navy-200"} />)}
              </div>
            )}
            <div className="rounded-xl bg-navy-50 p-3.5 text-navy-700">{viewing.message}</div>
            <p className="text-xs text-navy-400">Feedback is read-only — the student's original message cannot be edited here.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
