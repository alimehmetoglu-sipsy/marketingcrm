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

interface UserPerformanceData {
  userId: number
  userName: string
  created: number
  assigned: number
  completed: number
  completionRate: number
}

interface UserPerformanceChartProps {
  data: UserPerformanceData[]
}

export function UserPerformanceChart({ data }: UserPerformanceChartProps) {
  // Limit to top 10 users for better visualization
  const topUsers = data.slice(0, 10)

  const chartData = topUsers.map((user) => ({
    name: user.userName,
    Created: user.created,
    Assigned: user.assigned,
    Completed: user.completed,
    "Completion Rate (%)": user.completionRate,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-muted-foreground"
          angle={-45}
          textAnchor="end"
          height={80}
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
        <Bar dataKey="Created" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Assigned" fill="#a855f7" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
