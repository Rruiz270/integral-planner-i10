"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { YearProjection } from "@/lib/types";
import { formatCurrencyCompact } from "@/lib/utils";

interface RevenueChartProps {
  data: YearProjection[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        Sem dados para exibir.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickFormatter={(v: number) => formatCurrencyCompact(v)}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          width={70}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrencyCompact(Number(value)),
            String(name),
          ]}
          labelStyle={{ fontWeight: 600, color: "#0A2463" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="i10Revenue"
          name="Receita i10"
          fill="#0A2463"
          stackId="revenue"
          radius={[0, 0, 0, 0]}
          barSize={32}
        />
        <Bar
          dataKey="muniRevenue"
          name="Receita Municipio"
          fill="#00E5A0"
          stackId="revenue"
          radius={[4, 4, 0, 0]}
          barSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
