"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

export function MiniTrendChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Tooltip
            formatter={(value) => [`${value}`, "Nilai"]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.3)",
              fontSize: 11,
              padding: "4px 8px",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
            labelFormatter={() => ""}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
