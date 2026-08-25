"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; score: number };

export function WeeklyTrendChart({ data }: { data: Point[] }) {
  const shortLabels = data.map((d) => ({
    ...d,
    short: d.label.split(" - ")[0],
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={shortLabels} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="short"
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            className="text-zinc-400"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={32}
            className="text-zinc-400"
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Skor"] as [string, string]}
            labelFormatter={(label) => `Minggu ${label}`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.3)",
              fontSize: 12,
              background: "var(--background)",
              color: "var(--foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
