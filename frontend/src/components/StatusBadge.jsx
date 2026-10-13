const MAP = {
  Excellent: "badge-green", Good: "badge-blue", Warning: "badge-amber", Critical: "badge-red",
  Active: "badge-green", Inactive: "badge-gray", "On Leave": "badge-amber",
  Present: "badge-green", Absent: "badge-red", Late: "badge-amber", "NOT MARKED": "badge-gray",
  Pending: "badge-amber", Submitted: "badge-green",
  ACTIVE: "badge-green", SCHEDULED: "badge-blue", CLOSED: "badge-gray",
  COMPLETED: "badge-green", OPEN: "badge-blue", EXPIRED: "badge-red", CANCELLED: "badge-gray",
  Verified: "badge-green", "--": "badge-gray",
};

export default function StatusBadge({ status }) {
  const cls = MAP[status] || "badge-gray";
  return <span className={cls}>{status}</span>;
}
