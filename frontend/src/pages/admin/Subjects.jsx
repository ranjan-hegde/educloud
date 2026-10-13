import EntityManager from "../../components/EntityManager";
import { subjects } from "../../data/mockData";

const fields = [
  { key: "name", label: "Subject Name" },
  { key: "code", label: "Subject Code" },
  { key: "course", label: "Course" },
  { key: "semester", label: "Semester", type: "number" },
  { key: "credits", label: "Credits", type: "number" },
  { key: "faculty", label: "Assigned Faculty", wide: true },
];

export default function AdminSubjects() {
  return (
    <EntityManager
      title="Subjects"
      subtitle="Manage subjects, credits, and faculty assignment"
      initialData={subjects}
      fields={fields}
      idPrefix="SUB"
      storageKey="subjects"
      searchKeys={["name", "code", "course", "faculty"]}
    />
  );
}
