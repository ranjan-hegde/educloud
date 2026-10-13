import StatusBadge from "../StatusBadge";

export default function AttendanceStatus({ percentage, status }) {
  const color = percentage >= 85 ? "bg-emerald-500" : percentage >= 75 ? "bg-navy-600" : percentage >= 60 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-3">
      <div className="w-full h-2 rounded-full bg-navy-50 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-sm font-semibold text-navy-700 w-10 text-right">{percentage}%</span>
      {status && <StatusBadge status={status} />}
    </div>
  );
}
