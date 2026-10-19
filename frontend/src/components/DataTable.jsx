export default function DataTable({ columns, data, renderRow, emptyMessage = "No records found." }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-navy-400">{emptyMessage}</div>
    );
  }
  return (
    <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th key={col} className="text-left font-semibold text-navy-500 text-xs uppercase tracking-wide px-3 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-surface-border last:border-0 hover:bg-navy-50/50 transition-colors">
              {renderRow(row, i)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
