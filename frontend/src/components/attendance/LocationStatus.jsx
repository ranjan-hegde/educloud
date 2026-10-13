import { MapPin, CheckCircle2, XCircle } from "lucide-react";

export default function LocationStatus({ locationName, radius, distance, checking }) {
  if (checking) {
    return (
      <div className="flex items-center gap-2 text-sm text-navy-500">
        <MapPin size={16} className="animate-pulse text-navy-400" />
        Checking your location...
      </div>
    );
  }
  if (distance == null) return null;
  const verified = distance <= radius;
  return (
    <div className={`rounded-xl border p-3.5 ${verified ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <MapPin size={15} className="text-navy-500" />
        <p className="text-sm font-medium text-navy-800">{locationName}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-navy-500">
        <span>Allowed radius: {radius}m · Your distance: {distance}m</span>
        {verified ? (
          <span className="flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 size={14} /> Location Verified</span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-rose-600"><XCircle size={14} /> Outside Allowed Location</span>
        )}
      </div>
    </div>
  );
}
