export default function DashboardCard({ icon: Icon, label, value, sub, tone = "navy" }) {
  const tones = {
    navy: "bg-navy-50 text-navy-700",
    teal: "bg-teal-50 text-accent-teal",
    amber: "bg-amber-50 text-accent-amber",
    coral: "bg-rose-50 text-accent-coral",
  };
  return (
    <div className="card p-5 flex items-start justify-between animate-fade-in">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>
        <p className="mt-2 text-2xl font-display font-semibold text-navy-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-navy-400">{sub}</p>}
      </div>
      {Icon && (
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
