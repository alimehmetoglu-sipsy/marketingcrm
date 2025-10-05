"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface FunnelDataItem {
  status: string
  count: number
  percentage: number
}

interface LeadFunnelChartProps {
  data: FunnelDataItem[]
}

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",          // blue-500
  contacted: "#eab308",     // yellow-500
  qualified: "#22c55e",     // green-500
  proposal: "#a855f7",      // purple-500
  negotiation: "#f97316",   // orange-500
  won: "#10b981",          // emerald-500
  lost: "#ef4444",         // red-500
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
}

export function LeadFunnelChart({ data }: LeadFunnelChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: STATUS_LABELS[item.status] || item.status,
    fill: STATUS_COLORS[item.status] || "#94a3b8",
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" className="text-muted-foreground" />
        <YAxis
          dataKey="name"
          type="category"
          width={100}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} leads (${props.payload.percentage}%)`,
            props.payload.name,
          ]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
