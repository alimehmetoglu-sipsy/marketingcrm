"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface SourcePerformanceData {
  source: string
  totalLeads: number
  wonLeads: number
  conversionRate: number
}

interface SourcePerformanceChartProps {
  data: SourcePerformanceData[]
}

export function SourcePerformanceChart({ data }: SourcePerformanceChartProps) {
  const chartData = data.map((item) => ({
    source: item.source.charAt(0).toUpperCase() + item.source.slice(1),
    "Total Leads": item.totalLeads,
    "Won Leads": item.wonLeads,
    "Conversion Rate (%)": item.conversionRate,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="source"
          className="text-muted-foreground"
        />
        <YAxis className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
        <Bar dataKey="Total Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Won Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
