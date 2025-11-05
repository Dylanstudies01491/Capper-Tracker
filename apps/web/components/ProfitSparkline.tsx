"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

interface SparklinePoint {
  date: string;
  profit: number;
}

export function ProfitSparkline({ data }: { data: SparklinePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} dot={false} />
        <Tooltip
          contentStyle={{ background: "#0f172a", borderRadius: 12, border: "1px solid rgba(148,163,184,0.4)", color: "white" }}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
          formatter={(value: number) => [`${value.toFixed(2)}u`, "Profit"]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
