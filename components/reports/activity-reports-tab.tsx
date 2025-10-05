"use client"

import { useEffect, useState } from "react"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { ActivityTimelineChart } from "@/components/charts/activity-timeline-chart"
import { ActivityTypeChart } from "@/components/charts/activity-type-chart"
import { UserPerformanceChart } from "@/components/charts/user-performance-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, Award, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

export function ActivityReportsTab() {
  const [typeData, setTypeData] = useState<TypeData[]>([])
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [userPerformance, setUserPerformance] = useState<UserPerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [typeRes, timelineRes, performanceRes] = await Promise.all([
          fetch("/api/analytics/activities/distribution"),
          fetch("/api/analytics/activities/timeline?days=30"),
          fetch("/api/analytics/activities/user-performance"),
        ])

        const [typeData, timelineData, performanceData] = await Promise.all([
          typeRes.json(),
          timelineRes.json(),
          performanceRes.json(),
        ])

        if (typeData.success) setTypeData(typeData.data)
        if (timelineData.success) setTimelineData(timelineData.data)
        if (performanceData.success) setUserPerformance(performanceData.data)

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

  // Get top performer
  const topPerformer = userPerformance.length > 0
    ? userPerformance.reduce((prev, current) =>
        (prev.completed + prev.created) > (current.completed + current.created) ? prev : current
      )
    : null

  // Get most active activity type
  const mostActiveType = typeData.length > 0
    ? typeData.reduce((prev, current) => (prev.count > current.count ? prev : current))
    : null

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

      {/* Highlights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {topPerformer ? (
              <>
                <div className="text-2xl font-bold">{topPerformer.userName}</div>
                <p className="text-xs text-muted-foreground">
                  {topPerformer.completed} completed • {topPerformer.completionRate}% completion rate
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Active Type</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {mostActiveType ? (
              <>
                <div className="text-2xl font-bold capitalize">{mostActiveType.type}</div>
                <p className="text-xs text-muted-foreground">
                  {mostActiveType.count} activities • {mostActiveType.percentage}% of total
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Effectiveness Dashboard */}
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

        <Card>
          <CardHeader>
            <CardTitle>Activity Type Ranking</CardTitle>
            <CardDescription>Most to least used activity types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {typeData.slice(0, 5).map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium capitalize">{type.type}</p>
                      <p className="text-xs text-muted-foreground">{type.percentage}%</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold">{type.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Productivity Report */}
      <ChartWrapper
        title="User Performance (Top 10)"
        description="Activities created, assigned, and completed per user"
        isLoading={loading}
        error={error}
        isEmpty={userPerformance.length === 0}
      >
        <UserPerformanceChart data={userPerformance} />
      </ChartWrapper>

      {/* Activity Timeline */}
      <ChartWrapper
        title="Activity Timeline (Last 30 Days)"
        description="Daily activity count with status breakdown"
        isLoading={loading}
        error={error}
        isEmpty={timelineData.length === 0}
      >
        <ActivityTimelineChart data={timelineData} />
      </ChartWrapper>

      {/* Team Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Leaderboard</CardTitle>
          <CardDescription>Top performing team members by completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userPerformance
              .sort((a, b) => b.completionRate - a.completionRate)
              .slice(0, 10)
              .map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.assigned} assigned • {user.completed} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{user.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">completion</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Insights</CardTitle>
          <CardDescription>Key takeaways and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Peak Activity Time</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Most activities are created between 9 AM - 11 AM (placeholder insight)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="font-medium text-green-900 dark:text-green-100 mb-1">Best Performing Activity</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Meeting activities have highest conversion rate at 45% (placeholder insight)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">Optimization Opportunity</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                15% of pending activities are overdue - consider workload redistribution (placeholder insight)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
