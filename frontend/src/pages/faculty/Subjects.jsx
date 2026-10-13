import PageHeader from "../../components/PageHeader";
import { BookOpen, Users, Award } from "lucide-react";
import { subjects, currentFaculty } from "../../data/mockData";

export default function FacultySubjects() {
  const mySubjects = subjects.filter((s) => s.faculty === currentFaculty.name);
  return (
    <div>
      <PageHeader title="My Subjects" subtitle="Subjects assigned to you this semester" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mySubjects.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center mb-4"><BookOpen size={18} /></div>
            <p className="font-semibold text-navy-900">{s.name}</p>
            <p className="text-xs text-navy-400 mt-0.5">{s.code} · {s.course} Sem {s.semester}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-navy-500">
              <span className="flex items-center gap-1.5"><Users size={12} /> 40 Students</span>
              <span className="flex items-center gap-1.5"><Award size={12} /> {s.credits} Credits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
