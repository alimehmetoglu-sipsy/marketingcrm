"use client"

import { useEffect, useState } from "react"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { InvestorPipelineChart } from "@/components/charts/investor-pipeline-chart"
import { InvestorTrendChart } from "@/components/charts/investor-trend-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, TrendingUp, DollarSign } from "lucide-react"

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

export function InvestorReportsTab() {
  const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>([])
  const [sourceData, setSourceData] = useState<SourceData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [pipelineRes, sourceRes, trendsRes] = await Promise.all([
          fetch("/api/analytics/investors/pipeline"),
          fetch("/api/analytics/investors/source-distribution"),
          fetch("/api/analytics/investors/trends?days=30"),
        ])

        const [pipelineData, sourceData, trendsData] = await Promise.all([
          pipelineRes.json(),
          sourceRes.json(),
          trendsRes.json(),
        ])

        if (pipelineData.success) setPipelineData(pipelineData.data.pipeline)
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

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Placeholder - based on custom fields</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineData.reduce((sum, item) => sum + item.count, 0)}</div>
            <p className="text-xs text-muted-foreground">All statuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Placeholder - calculated from data</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Pipeline */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartWrapper
          title="Investment Pipeline Overview"
          description="Investor distribution by pipeline stage"
          isLoading={loading}
          error={error}
          isEmpty={pipelineData.length === 0}
        >
          <InvestorPipelineChart data={pipelineData} />
        </ChartWrapper>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Breakdown</CardTitle>
            <CardDescription>Detailed investor count per stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipelineData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{item.status}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Investor Source Analysis</CardTitle>
          <CardDescription>Where your investors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Investor Trends */}
      <ChartWrapper
        title="Investor Acquisition Trends (Last 30 Days)"
        description="Daily new investor acquisitions over time"
        isLoading={loading}
        error={error}
        isEmpty={trendData.length === 0}
      >
        <InvestorTrendChart data={trendData} />
      </ChartWrapper>

      {/* Deal Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Flow Summary</CardTitle>
          <CardDescription>Investment deal metrics (placeholder)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Time to Close</p>
              <p className="text-2xl font-bold">45 days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
              <p className="text-2xl font-bold">28%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Monthly Deal Volume</p>
              <p className="text-2xl font-bold">12 deals</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pipeline Velocity</p>
              <p className="text-2xl font-bold">+15%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
