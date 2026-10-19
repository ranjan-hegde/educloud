import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { useTheme } from "../context/ThemeContext";

export function TrendLineChart({ data, dataKey, xKey, color }) {
  const { isDark } = useTheme();
  const lineColor = color || (isDark ? "#38bdf8" : "#0284c7");
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(12px)",
            borderRadius: 12,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
            color: isDark ? "#f8fafc" : "#0f172a",
            fontSize: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={2.5} dot={{ r: 3, fill: lineColor }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CompareBarChart({ data, bars, xKey }) {
  const { isDark } = useTheme();
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(12px)",
            borderRadius: 12,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
            color: isDark ? "#f8fafc" : "#0f172a",
            fontSize: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          }}
        />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
