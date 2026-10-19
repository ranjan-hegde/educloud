import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export function TrendLineChart({ data, dataKey, xKey, color = "#1f3a6b" }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f2" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#5c81bd" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#5c81bd" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f2", fontSize: 13 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CompareBarChart({ data, bars, xKey }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f2" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#5c81bd" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#5c81bd" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e9f2", fontSize: 13 }} />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
