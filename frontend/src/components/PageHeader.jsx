export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 leading-snug">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">{actions}</div>}
    </div>
  );
}
