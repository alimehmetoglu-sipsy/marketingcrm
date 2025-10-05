"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PipelineDataItem {
  status: string
  count: number
  percentage: number
}

interface InvestorPipelineChartProps {
  data: PipelineDataItem[]
}

const STATUS_COLORS: Record<string, string> = {
  prospecting: "#3b82f6",    // blue-500
  qualified: "#22c55e",       // green-500
  meeting: "#a855f7",         // purple-500
  proposal: "#f97316",        // orange-500
  negotiation: "#eab308",     // yellow-500
  closed: "#10b981",          // emerald-500
  lost: "#ef4444",            // red-500
  inactive: "#94a3b8",        // slate-400
}

const STATUS_LABELS: Record<string, string> = {
  prospecting: "Prospecting",
  qualified: "Qualified",
  meeting: "Meeting",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed: "Closed",
  lost: "Lost",
  inactive: "Inactive",
}

export function InvestorPipelineChart({ data }: InvestorPipelineChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    fill: STATUS_COLORS[item.status] || "#94a3b8",
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} investors (${props.payload.percentage}%)`,
            props.payload.name,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
