export default function DataTable({ columns, data, renderRow, emptyMessage = "No records found." }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">{emptyMessage}</div>
    );
  }
  return (
    <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/5 dark:border-white/10">
            {columns.map((col) => (
              <th key={col} className="text-left font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
              {renderRow(row, i)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
