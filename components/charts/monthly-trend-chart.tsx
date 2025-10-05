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

interface TrendData {
  date: string
  total: number
  new?: number
  contacted?: number
  qualified?: number
  proposal?: number
  negotiation?: number
  won?: number
  lost?: number
}

interface MonthlyTrendChartProps {
  data: TrendData[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
          dataKey="new"
          stackId="1"
          stroke="#3b82f6"
          fill="url(#colorNew)"
          name="New"
        />
        <Area
          type="monotone"
          dataKey="qualified"
          stackId="1"
          stroke="#22c55e"
          fill="url(#colorQualified)"
          name="Qualified"
        />
        <Area
          type="monotone"
          dataKey="won"
          stackId="1"
          stroke="#10b981"
          fill="url(#colorWon)"
          name="Won"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
