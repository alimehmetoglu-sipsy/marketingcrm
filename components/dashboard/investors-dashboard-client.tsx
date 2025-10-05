"use client"

import { useEffect, useState } from "react"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { InvestorPipelineChart } from "@/components/charts/investor-pipeline-chart"
import { InvestorTrendChart } from "@/components/charts/investor-trend-chart"
import { Building2, TrendingUp, DollarSign, BarChart3 } from "lucide-react"

interface KPIData {
  totalInvestors: number
  investorsThisMonth: number
  monthGrowth: number
  totalInvestmentValue: number
  avgDealSize: number
  portfolioGrowthRate: number
}

interface PipelineDataItem {
  status: string
  count: number
  percentage: number
}

interface SourceData {
  source: string
  count: number
  percentage: number
}

interface TrendData {
  date: string
  count: number
}

export function InvestorsDashboardClient() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>([])
  const [sourceData, setSourceData] = useState<SourceData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [kpisRes, pipelineRes, sourceRes, trendsRes] = await Promise.all([
          fetch("/api/analytics/investors/kpis"),
          fetch("/api/analytics/investors/pipeline"),
          fetch("/api/analytics/investors/source-distribution"),
          fetch("/api/analytics/investors/trends?days=30"),
        ])

        const [kpisData, pipelineData, sourceData, trendsData] = await Promise.all([
          kpisRes.json(),
          pipelineRes.json(),
          sourceRes.json(),
          trendsRes.json(),
        ])

        if (kpisData.success) setKpis(kpisData.data)
        if (pipelineData.success) setPipelineData(pipelineData.data.pipeline)
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
        <h1 className="text-3xl font-bold tracking-tight">Investors Dashboard</h1>
        <p className="text-muted-foreground">
          Portfolio insights and investment analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Investors"
          value={kpis?.totalInvestors || 0}
          icon={Building2}
          trend={
            kpis
              ? {
                  value: kpis.monthGrowth,
                  label: "from last month",
                  isPositive: kpis.monthGrowth >= 0,
                }
              : undefined
          }
          gradient="from-emerald-500 to-teal-500"
          bgColor="bg-emerald-50 dark:bg-emerald-950/20"
          index={0}
        />
        <KPICard
          title="Total Investment Value"
          value={kpis ? `$${(kpis.totalInvestmentValue / 1000).toFixed(0)}K` : "$0"}
          icon={DollarSign}
          description="Placeholder - based on custom fields"
          gradient="from-green-500 to-emerald-500"
          bgColor="bg-green-50 dark:bg-green-950/20"
          index={1}
        />
        <KPICard
          title="Average Deal Size"
          value={kpis ? `$${kpis.avgDealSize.toFixed(0)}` : "$0"}
          icon={BarChart3}
          description="Per investor average"
          gradient="from-blue-500 to-cyan-500"
          bgColor="bg-blue-50 dark:bg-blue-950/20"
          index={2}
        />
        <KPICard
          title="Portfolio Growth"
          value={kpis ? `${kpis.portfolioGrowthRate}%` : "0%"}
          icon={TrendingUp}
          description="Month over month"
          gradient="from-purple-500 to-pink-500"
          bgColor="bg-purple-50 dark:bg-purple-950/20"
          index={3}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper
          title="Investment Pipeline"
          description="Investor distribution by status"
          isLoading={loading}
          error={error}
          isEmpty={pipelineData.length === 0}
        >
          <InvestorPipelineChart data={pipelineData} />
        </ChartWrapper>

        <ChartWrapper
          title="Source Distribution"
          description="Where investors are coming from"
          isLoading={loading}
          error={error}
          isEmpty={sourceData.length === 0}
        >
          <div className="space-y-4">
            {sourceData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.source}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>

      <ChartWrapper
        title="Investor Trends (Last 30 Days)"
        description="Daily new investor acquisitions"
        isLoading={loading}
        error={error}
        isEmpty={trendData.length === 0}
      >
        <InvestorTrendChart data={trendData} />
      </ChartWrapper>
    </div>
  )
}
