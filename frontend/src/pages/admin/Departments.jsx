import EntityManager from "../../components/EntityManager";
import { departments } from "../../data/mockData";

const fields = [
  { key: "name", label: "Department Name" },
  { key: "head", label: "Head of Department" },
  { key: "faculty", label: "Faculty Count", type: "number" },
  { key: "students", label: "Student Count", type: "number" },
];

export default function AdminDepartments() {
  return (
    <EntityManager
      title="Departments"
      subtitle="Manage academic departments across the institution"
      initialData={departments}
      fields={fields}
      idPrefix="DEP"
      storageKey="departments"
      searchKeys={["name", "head", "id"]}
    />
  );
}
