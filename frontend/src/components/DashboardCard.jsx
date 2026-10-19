export default function DashboardCard({ icon: Icon, label, value, sub, tone = "navy" }) {
  const tones = {
    navy: "bg-navy-500/10 text-navy-800 border border-navy-500/20",
    teal: "bg-teal-500/10 text-teal-700 border border-teal-500/20",
    amber: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    coral: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
  };
  return (
    <div className="card p-5 flex items-start justify-between animate-fade-in relative overflow-hidden group hover:-translate-y-0.5 transition-all">
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">{label}</p>
        <p className="mt-2 text-2xl font-display font-semibold text-navy-900 tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-navy-400">{sub}</p>}
      </div>
      {Icon && (
        <div className={`rounded-xl p-2.5 backdrop-blur-md transition-all duration-200 group-hover:scale-105 shadow-sm ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
