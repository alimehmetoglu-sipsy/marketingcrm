"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface ActivityTypeData {
  type: string
  count: number
  percentage: number
}

interface ActivityTypeChartProps {
  data: ActivityTypeData[]
}

const TYPE_COLORS: string[] = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#f97316", // orange
  "#eab308", // yellow
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
]

export function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count,
    percentage: item.percentage,
    fill: TYPE_COLORS[index % TYPE_COLORS.length],
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
            `${value} activities (${props.payload.percentage}%)`,
            props.payload.name,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
