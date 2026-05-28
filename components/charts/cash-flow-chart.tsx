"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import type { MonthlyCashFlow } from "@/lib/types";
import { formatCurrencyCompact } from "@/lib/utils";

interface CashFlowChartProps {
  data: MonthlyCashFlow[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        Sem dados para exibir.
      </div>
    );
  }

  // Find gap period boundaries
  const gapStart = data.find((d) => d.isGapPeriod);
  const gapEntries = data.filter((d) => d.isGapPeriod);
  const gapEnd = gapEntries[gapEntries.length - 1];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

        {/* Gap period highlight */}
        {gapStart && gapEnd && (
          <ReferenceArea
            x1={gapStart.label}
            x2={gapEnd.label}
            fill="#D4553A"
            fillOpacity={0.06}
            strokeOpacity={0}
          />
        )}

        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          interval="preserveStartEnd"
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
          dataKey="revenue"
          name="Receita"
          fill="#00E5A0"
          radius={[2, 2, 0, 0]}
          barSize={8}
        />
        <Bar
          dataKey="cost"
          name="Custo"
          fill="#D4553A"
          radius={[2, 2, 0, 0]}
          barSize={8}
        />
        <Line
          dataKey="cumulativeCashFlow"
          name="Fluxo Acumulado"
          stroke="#0A2463"
          strokeWidth={2}
          dot={false}
          type="monotone"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
