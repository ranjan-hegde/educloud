import { Clock, MapPin, Users } from "lucide-react";
import StatusBadge from "../StatusBadge";
import { Link } from "react-router-dom";

export default function AttendanceSessionCard({ session, actions, linkTo }) {
  const Wrapper = linkTo ? Link : "div";
  return (
    <Wrapper to={linkTo} className="card p-5 flex flex-col gap-3 hover:shadow-pop transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-navy-900">{session.subject}</p>
          <p className="text-xs text-navy-400">{session.class}</p>
        </div>
        <StatusBadge status={session.status || session.qrStatus} />
      </div>
      <div className="text-xs text-navy-500 space-y-1.5">
        <p className="flex items-center gap-1.5"><Clock size={13} /> {session.startTime} – {session.endTime}</p>
        <p className="flex items-center gap-1.5"><MapPin size={13} /> {session.location}</p>
        {session.total != null && (
          <p className="flex items-center gap-1.5"><Users size={13} /> Present: {session.present} / {session.total}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 pt-1">{actions}</div>}
    </Wrapper>
  );
}
