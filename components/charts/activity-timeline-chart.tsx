"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface TimelineData {
  date: string
  total: number
  pending?: number
  completed?: number
  cancelled?: number
}

interface ActivityTimelineChartProps {
  data: TimelineData[]
}

export function ActivityTimelineChart({ data }: ActivityTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-muted-foreground"
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString()
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="pending"
          stackId="1"
          stroke="#eab308"
          fill="url(#colorPending)"
          name="Pending"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stackId="1"
          stroke="#22c55e"
          fill="url(#colorCompleted)"
          name="Completed"
        />
        <Area
          type="monotone"
          dataKey="cancelled"
          stackId="1"
          stroke="#ef4444"
          fill="url(#colorCancelled)"
          name="Cancelled"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
