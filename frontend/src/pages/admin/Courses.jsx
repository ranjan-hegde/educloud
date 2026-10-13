import EntityManager from "../../components/EntityManager";
import { courses } from "../../data/mockData";

const fields = [
  { key: "name", label: "Course Name" },
  { key: "department", label: "Department" },
  { key: "duration", label: "Duration" },
  { key: "students", label: "Enrolled Students", type: "number" },
];

export default function AdminCourses() {
  return (
    <EntityManager
      title="Courses"
      subtitle="Manage courses offered across departments"
      initialData={courses}
      fields={fields}
      idPrefix="CRS"
      storageKey="courses"
      searchKeys={["name", "department", "id"]}
    />
  );
}
