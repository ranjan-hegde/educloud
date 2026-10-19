export default function DashboardCard({ icon: Icon, label, value, sub, tone = "blue" }) {
  const tones = {
    navy: "from-slate-500/15 to-slate-600/25 text-slate-700 dark:text-slate-200 border-slate-300/40 dark:border-white/10",
    blue: "from-blue-500/15 to-blue-600/25 text-blue-600 dark:text-blue-400 border-blue-400/30 dark:border-blue-400/20",
    teal: "from-teal-500/15 to-teal-600/25 text-teal-600 dark:text-teal-400 border-teal-400/30 dark:border-teal-400/20",
    amber: "from-amber-500/15 to-amber-600/25 text-amber-600 dark:text-amber-400 border-amber-400/30 dark:border-amber-400/20",
    coral: "from-rose-500/15 to-rose-600/25 text-rose-600 dark:text-rose-400 border-rose-400/30 dark:border-rose-400/20",
    purple: "from-purple-500/15 to-purple-600/25 text-purple-600 dark:text-purple-400 border-purple-400/30 dark:border-purple-400/20",
  };

  const selectedTone = tones[tone] || tones.blue;

  return (
    <div className="card p-5 flex items-start justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
      {Icon && (
        <div className={`rounded-xl p-2.5 bg-gradient-to-br backdrop-blur-md transition-all duration-200 group-hover:scale-110 shadow-xs border ${selectedTone}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
