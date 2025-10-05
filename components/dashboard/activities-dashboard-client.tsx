"use client"

import { useEffect, useState } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { ActivityTimelineChart } from "@/components/charts/activity-timeline-chart"
import { ActivityTypeChart } from "@/components/charts/activity-type-chart"
import { UserPerformanceChart } from "@/components/charts/user-performance-chart"
import { Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface KPIData {
  totalActivities: number
  pendingActivities: number
  completedThisMonth: number
  overdueActivities: number
  monthGrowth: number
}

interface TypeData {
  type: string
  count: number
  percentage: number
}

interface TimelineData {
  date: string
  total: number
  [key: string]: any
}

interface UserPerformanceData {
  userId: number
  userName: string
  created: number
  assigned: number
  completed: number
  completionRate: number
}

export function ActivitiesDashboardClient() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [typeData, setTypeData] = useState<TypeData[]>([])
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [userPerformance, setUserPerformance] = useState<UserPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [kpisRes, typeRes, timelineRes, performanceRes] = await Promise.all([
          fetch("/api/analytics/activities/kpis"),
          fetch("/api/analytics/activities/distribution"),
          fetch("/api/analytics/activities/timeline?days=30"),
          fetch("/api/analytics/activities/user-performance"),
        ])

        const [kpisData, typeData, timelineData, performanceData] = await Promise.all([
          kpisRes.json(),
          typeRes.json(),
          timelineRes.json(),
          performanceRes.json(),
        ])

        if (kpisData.success) setKpis(kpisData.data)
        if (typeData.success) setTypeData(typeData.data)
        if (timelineData.success) setTimelineData(timelineData.data)
        if (performanceData.success) setUserPerformance(performanceData.data)

        setError(null)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities Dashboard</h1>
        <p className="text-muted-foreground">
          Track and analyze team activity metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Activities"
          value={kpis?.totalActivities || 0}
          icon={Activity}
          trend={
            kpis
              ? {
                  value: kpis.monthGrowth,
                  label: "from last month",
                  isPositive: kpis.monthGrowth >= 0,
                }
              : undefined
          }
          gradient="from-purple-500 to-pink-500"
          bgColor="bg-purple-50 dark:bg-purple-950/20"
          index={0}
        />
        <KPICard
          title="Pending Activities"
          value={kpis?.pendingActivities || 0}
          icon={Clock}
          description="Awaiting completion"
          gradient="from-yellow-500 to-orange-500"
          bgColor="bg-yellow-50 dark:bg-yellow-950/20"
          index={1}
        />
        <KPICard
          title="Completed This Month"
          value={kpis?.completedThisMonth || 0}
          icon={CheckCircle2}
          description="Successfully finished"
          gradient="from-green-500 to-emerald-500"
          bgColor="bg-green-50 dark:bg-green-950/20"
          index={2}
        />
        <KPICard
          title="Overdue Activities"
          value={kpis?.overdueActivities || 0}
          icon={AlertCircle}
          description="Past scheduled date"
          gradient="from-red-500 to-rose-500"
          bgColor="bg-red-50 dark:bg-red-950/20"
          index={3}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper
          title="Activity Type Distribution"
          description="Breakdown of activities by type"
          isLoading={loading}
          error={error}
          isEmpty={typeData.length === 0}
        >
          <ActivityTypeChart data={typeData} />
        </ChartWrapper>

        <ChartWrapper
          title="User Performance (Top 10)"
          description="Activities created, assigned, and completed per user"
          isLoading={loading}
          error={error}
          isEmpty={userPerformance.length === 0}
        >
          <UserPerformanceChart data={userPerformance} />
        </ChartWrapper>
      </div>

      <ChartWrapper
        title="Activity Timeline (Last 30 Days)"
        description="Daily activity count with status breakdown"
        isLoading={loading}
        error={error}
        isEmpty={timelineData.length === 0}
      >
        <ActivityTimelineChart data={timelineData} />
      </ChartWrapper>
    </div>
  )
}
