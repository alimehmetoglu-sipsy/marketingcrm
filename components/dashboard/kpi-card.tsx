"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  gradient?: string
  bgColor?: string
  description?: string
  index?: number
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  gradient = "from-blue-500 to-cyan-500",
  bgColor = "bg-blue-50 dark:bg-blue-950/20",
  description,
  index = 0,
}: KPICardProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString() : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn("rounded-lg p-2", bgColor)}>
            <Icon className={cn("h-4 w-4 bg-gradient-to-br bg-clip-text text-transparent", gradient)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formattedValue}</div>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive !== false ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">{trend.label}</span>
            </div>
          )}

          {description && !trend && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
