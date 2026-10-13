import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STEPS = [
  { key: "sessionActive", label: "QR session active" },
  { key: "classAssigned", label: "Class assignment verified" },
  { key: "withinTime", label: "Attendance time verified" },
  { key: "locationVerified", label: "Location verified" },
  { key: "notDuplicate", label: "No duplicate attendance" },
];

export default function AttendanceVerification({ status, checks }) {
  return (
    <div className="space-y-2.5">
      {STEPS.map((step) => {
        const done = checks && checks[step.key] !== undefined;
        const passed = checks?.[step.key];
        return (
          <div key={step.key} className="flex items-center gap-2.5 text-sm">
            {status === "checking" && !done ? (
              <Loader2 size={16} className="text-navy-300 animate-spin" />
            ) : done ? (
              passed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-rose-400" />
            ) : (
              <Circle size={16} className="text-navy-200" />
            )}
            <span className={done ? (passed ? "text-navy-800" : "text-rose-500") : "text-navy-400"}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
