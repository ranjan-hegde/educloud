import PageHeader from "../../components/PageHeader";
import { BookOpen, User, Award, FileText } from "lucide-react";
import { subjects, currentStudent } from "../../data/mockData";
import { usePersistentState } from "../../hooks/usePersistentState";

export default function StudentSubjects() {
  const [courseMaterials] = usePersistentState("courseMaterials");
  const mySubjects = subjects.filter((s) => s.course === currentStudent.course);
  return (
    <div>
      <PageHeader title="Subjects" subtitle={`Your enrolled subjects for ${currentStudent.semester}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mySubjects.map((s) => {
          const materials = courseMaterials.filter((m) => m.subject === s.name);
          return (
            <div key={s.id} className="card p-5">
              <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center mb-4">
                <BookOpen size={18} />
              </div>
              <p className="font-semibold text-navy-900">{s.name}</p>
              <p className="text-xs text-navy-400 mt-0.5">{s.code}</p>
              <div className="mt-4 space-y-1.5 text-xs text-navy-500">
                <p className="flex items-center gap-1.5"><User size={12} /> {s.faculty}</p>
                <p className="flex items-center gap-1.5"><Award size={12} /> {s.credits} Credits</p>
              </div>
              {materials.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-border">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-2">Materials</p>
                  <div className="space-y-1.5">
                    {materials.map((m) => (
                      <div key={m.id} className="flex items-center gap-1.5 text-xs text-navy-600">
                        <FileText size={12} className="text-navy-400 shrink-0" />
                        <span className="truncate">{m.title}</span>
                        <span className="badge-blue !py-0.5 !px-1.5 shrink-0">{m.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
