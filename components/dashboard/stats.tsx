"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, CheckSquare, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardStatsProps {
  totalLeads: number
  totalInvestors: number
  totalTasks: number
  pendingTasks: number
}

const stats = [
  {
    title: "Total Leads",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    title: "Investors",
    icon: Building2,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  {
    title: "Total Tasks",
    icon: CheckSquare,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    title: "Pending Tasks",
    icon: Clock,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
  },
]

export function DashboardStats({
  totalLeads,
  totalInvestors,
  totalTasks,
  pendingTasks,
}: DashboardStatsProps) {
  const values = [totalLeads, totalInvestors, totalTasks, pendingTasks]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{values[index].toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
