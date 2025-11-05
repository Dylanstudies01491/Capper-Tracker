"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ChartPoint {
  date: string;
  profit: number;
}

export function CapperProfitChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
          <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}u`} />
          <Tooltip
            contentStyle={{ background: "#0f172a", borderRadius: 12, border: "1px solid rgba(148,163,184,0.4)", color: "white" }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            formatter={(value: number) => [`${value.toFixed(2)}u`, "Cumulative Profit"]}
          />
          <Area type="monotone" dataKey="profit" stroke="#34d399" fill="url(#profitGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
