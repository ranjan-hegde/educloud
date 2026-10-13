import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function SessionTimer({ endTime, active }) {
  const [remaining, setRemaining] = useState(active ? "04:32" : "--:--");

  useEffect(() => {
    if (!active) return;
    let [min, sec] = remaining.split(":").map(Number);
    const interval = setInterval(() => {
      sec -= 1;
      if (sec < 0) { sec = 59; min -= 1; }
      if (min < 0) { clearInterval(interval); return; }
      setRemaining(`${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
      <Clock size={15} className={active ? "text-emerald-500" : "text-navy-300"} />
      {active ? `${remaining} remaining` : "Not active"}
    </div>
  );
}
