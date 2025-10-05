"use client"

import { useEffect, useState } from "react"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { LeadFunnelChart } from "@/components/charts/lead-funnel-chart"
import { SourcePerformanceChart } from "@/components/charts/source-performance-chart"
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

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

export function LeadReportsTab() {
  const [funnelData, setFunnelData] = useState<FunnelDataItem[]>([])
  const [sourceData, setSourceData] = useState<SourcePerformanceData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [funnelRes, sourceRes, trendsRes] = await Promise.all([
          fetch("/api/analytics/leads/funnel"),
          fetch("/api/analytics/leads/source-performance"),
          fetch("/api/analytics/leads/trends?days=30"),
        ])

        const [funnelData, sourceData, trendsData] = await Promise.all([
          funnelRes.json(),
          sourceRes.json(),
          trendsRes.json(),
        ])

        if (funnelData.success) setFunnelData(funnelData.data.funnel)
        if (sourceData.success) setSourceData(sourceData.data)
        if (trendsData.success) setTrendData(trendsData.data)

        setError(null)
      } catch (err) {
        console.error("Failed to fetch report data:", err)
        setError("Failed to load report data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExport = () => {
    // Export functionality will be implemented
    alert("Export functionality coming soon!")
  }

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Lead Conversion Funnel */}
      <ChartWrapper
        title="Lead Conversion Funnel"
        description="Full funnel analysis with conversion rates per stage"
        isLoading={loading}
        error={error}
        isEmpty={funnelData.length === 0}
      >
        <LeadFunnelChart data={funnelData} />
      </ChartWrapper>

      {/* Source ROI Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper
          title="Source Performance Analysis"
          description="Lead sources ranked by conversion rate"
          isLoading={loading}
          error={error}
          isEmpty={sourceData.length === 0}
        >
          <SourcePerformanceChart data={sourceData} />
        </ChartWrapper>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Sources</CardTitle>
            <CardDescription>Best converting lead sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sourceData
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .slice(0, 5)
                .map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{source.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.totalLeads} leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{source.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">{source.wonLeads} won</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Trends */}
      <ChartWrapper
        title="Lead Trends (Last 30 Days)"
        description="Daily lead creation with status distribution"
        isLoading={loading}
        error={error}
        isEmpty={trendData.length === 0}
      >
        <MonthlyTrendChart data={trendData} />
      </ChartWrapper>

      {/* Lead Aging Report */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Aging Analysis</CardTitle>
          <CardDescription>
            Distribution of leads by age buckets (placeholder data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { range: "0-7 days", count: 45, color: "bg-green-500" },
              { range: "8-14 days", count: 32, color: "bg-blue-500" },
              { range: "15-30 days", count: 28, color: "bg-yellow-500" },
              { range: "30+ days", count: 18, color: "bg-red-500" },
            ].map((bucket, index) => (
              <div key={index} className="text-center">
                <div className={`${bucket.color} text-white rounded-lg p-4 mb-2`}>
                  <div className="text-3xl font-bold">{bucket.count}</div>
                </div>
                <p className="text-sm font-medium">{bucket.range}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
