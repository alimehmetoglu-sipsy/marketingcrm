"use client"

import { useEffect, useState } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { LeadFunnelChart } from "@/components/charts/lead-funnel-chart"
import { SourcePerformanceChart } from "@/components/charts/source-performance-chart"
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart"
import { Users, TrendingUp, Zap, Clock } from "lucide-react"

interface KPIData {
  totalLeads: number
  leadsThisMonth: number
  monthGrowth: number
  hotLeads: number
  conversionRate: number
  avgResponseTime: {
    hours: number
    formatted: string
  }
}

interface FunnelDataItem {
  status: string
  count: number
  percentage: number
}

interface SourcePerformanceData {
  source: string
  totalLeads: number
  wonLeads: number
  conversionRate: number
}

interface TrendData {
  date: string
  total: number
  [key: string]: any
}

export function LeadsDashboardClient() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelDataItem[]>([])
  const [sourceData, setSourceData] = useState<SourcePerformanceData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [kpisRes, funnelRes, sourceRes, trendsRes] = await Promise.all([
          fetch("/api/analytics/leads/kpis"),
          fetch("/api/analytics/leads/funnel"),
          fetch("/api/analytics/leads/source-performance"),
          fetch("/api/analytics/leads/trends?days=30"),
        ])

        const [kpisData, funnelData, sourceData, trendsData] = await Promise.all([
          kpisRes.json(),
          funnelRes.json(),
          sourceRes.json(),
          trendsRes.json(),
        ])

        if (kpisData.success) setKpis(kpisData.data)
        if (funnelData.success) setFunnelData(funnelData.data.funnel)
        if (sourceData.success) setSourceData(sourceData.data)
        if (trendsData.success) setTrendData(trendsData.data)

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
        <h1 className="text-3xl font-bold tracking-tight">Leads Dashboard</h1>
        <p className="text-muted-foreground">
          Analytics and insights for your lead pipeline
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={kpis?.totalLeads || 0}
          icon={Users}
          trend={
            kpis
              ? {
                  value: kpis.monthGrowth,
                  label: "from last month",
                  isPositive: kpis.monthGrowth >= 0,
                }
              : undefined
          }
          gradient="from-blue-500 to-cyan-500"
          bgColor="bg-blue-50 dark:bg-blue-950/20"
          index={0}
        />
        <KPICard
          title="Conversion Rate"
          value={kpis ? `${kpis.conversionRate}%` : "0%"}
          icon={TrendingUp}
          description="Lead to won ratio"
          gradient="from-green-500 to-emerald-500"
          bgColor="bg-green-50 dark:bg-green-950/20"
          index={1}
        />
        <KPICard
          title="Hot Leads"
          value={kpis?.hotLeads || 0}
          icon={Zap}
          description="Qualified + Proposal + Negotiation"
          gradient="from-orange-500 to-red-500"
          bgColor="bg-orange-50 dark:bg-orange-950/20"
          index={2}
        />
        <KPICard
          title="Avg Response Time"
          value={kpis?.avgResponseTime.formatted || "N/A"}
          icon={Clock}
          description="Time to first activity"
          gradient="from-purple-500 to-pink-500"
          bgColor="bg-purple-50 dark:bg-purple-950/20"
          index={3}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper
          title="Lead Conversion Funnel"
          description="Lead distribution across pipeline stages"
          isLoading={loading}
          error={error}
          isEmpty={funnelData.length === 0}
        >
          <LeadFunnelChart data={funnelData} />
        </ChartWrapper>

        <ChartWrapper
          title="Source Performance"
          description="Lead sources and their conversion rates"
          isLoading={loading}
          error={error}
          isEmpty={sourceData.length === 0}
        >
          <SourcePerformanceChart data={sourceData} />
        </ChartWrapper>
      </div>

      <ChartWrapper
        title="Lead Trends (Last 30 Days)"
        description="Daily lead creation with status breakdown"
        isLoading={loading}
        error={error}
        isEmpty={trendData.length === 0}
      >
        <MonthlyTrendChart data={trendData} />
      </ChartWrapper>
    </div>
  )
}
