import DataTable from "../DataTable";
import StatusBadge from "../StatusBadge";

export default function AttendanceTable({ records }) {
  return (
    <DataTable
      columns={["Student ID", "Name", "Time", "Location", "Status"]}
      data={records}
      emptyMessage="No students have scanned yet."
      renderRow={(r) => (
        <>
          <td className="px-3 py-3 font-medium text-navy-800">{r.id}</td>
          <td className="px-3 py-3 text-navy-600">{r.name}</td>
          <td className="px-3 py-3 text-navy-500">{r.time}</td>
          <td className="px-3 py-3 text-navy-500">{r.location}</td>
          <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
        </>
      )}
    />
  );
}
