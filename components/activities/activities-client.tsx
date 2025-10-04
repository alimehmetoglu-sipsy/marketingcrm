"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow, format } from "date-fns"
import {
  Activity,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  User,
  Building2,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Download,
  LayoutGrid,
  List,
  ArrowRight,
} from "lucide-react"
import { getActivityIconComponent, getActivityBgColor } from "@/lib/activity-icons"

// Types
interface ActivityType {
  id: number
  name: string
  label: string
  icon: string | null
  color: string | null
}

interface UserInfo {
  id: number
  name: string
  email: string
}

interface LeadInfo {
  id: number
  full_name: string
  email: string
  status: string
}

interface InvestorInfo {
  id: number
  full_name: string
  email: string
  status: string
}

interface ActivityData {
  id: number
  type: string
  subject: string | null
  description: string | null
  status: string
  created_at: Date | null
  scheduled_at: Date | null
  completed_at: Date | null
  activity_date: Date | null
  lead_id: number | null
  investor_id: number | null
  user_id: number | null
  assigned_to: number | null
  activity_types: ActivityType | null
  leads: LeadInfo | null
  investors: InvestorInfo | null
  users: UserInfo | null
  assignedUser: UserInfo | null
}

interface ActivitiesClientProps {
  activities: ActivityData[]
  activityTypes: ActivityType[]
  users: UserInfo[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
}

const sourceColors = {
  lead: "bg-blue-100 text-blue-700 border-blue-200",
  investor: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

export function ActivitiesClient({ activities, activityTypes, users }: ActivitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all") // all, lead, investor
  const [userFilter, setUserFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")

  // Calculate stats
  const stats = useMemo(() => {
    const activityTypeCounts = activityTypes.map(type => ({
      ...type,
      count: activities.filter(a => a.type === type.name).length,
    }))

    return {
      total: activities.length,
      pending: activities.filter(a => a.status === "pending").length,
      completed: activities.filter(a => a.status === "completed").length,
      byType: activityTypeCounts,
      fromLeads: activities.filter(a => a.leads !== null).length,
      fromInvestors: activities.filter(a => a.investors !== null).length,
    }
  }, [activities, activityTypes])

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        activity.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.leads?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.investors?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.users?.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const matchesType = typeFilter === "all" || activity.type === typeFilter

      // Status filter
      const matchesStatus = statusFilter === "all" || activity.status === statusFilter

      // Source filter
      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "lead" && activity.leads !== null) ||
        (sourceFilter === "investor" && activity.investors !== null)

      // User filter
      const matchesUser = userFilter === "all" || activity.user_id === parseInt(userFilter)

      return matchesSearch && matchesType && matchesStatus && matchesSource && matchesUser
    })
  }, [activities, searchQuery, typeFilter, statusFilter, sourceFilter, userFilter])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(n => n)
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Modern Hero Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Hub</h1>
              <p className="text-white/90 mt-1">
                Track all interactions with your leads and investors
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Activities */}
        <Card className="border-2 hover:shadow-lg transition-all hover:border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.fromLeads} from leads, {stats.fromInvestors} from investors
            </p>
          </CardContent>
        </Card>

        {/* Top Activity Type */}
        {stats.byType.length > 0 && (
          <Card className="border-2 hover:shadow-lg transition-all hover:border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Most Active Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {Math.max(...stats.byType.map(t => t.count))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.byType.sort((a, b) => b.count - a.count)[0]?.label || "N/A"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completed */}
        <Card className="border-2 hover:shadow-lg transition-all hover:border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-2 hover:shadow-lg transition-all hover:border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities, leads, investors, or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "timeline" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("timeline")}
                  title="Timeline View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="lead">Leads Only</SelectItem>
                  <SelectItem value="investor">Investors Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Created By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Active Filters Summary */}
            {(typeFilter !== "all" || statusFilter !== "all" || sourceFilter !== "all" || userFilter !== "all" || searchQuery) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>
                  Showing {filteredActivities.length} of {activities.length} activities
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setTypeFilter("all")
                    setStatusFilter("all")
                    setSourceFilter("all")
                    setUserFilter("all")
                  }}
                  className="h-7 text-xs"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all" || sourceFilter !== "all" || userFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No activities have been created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => {
            const activityType = activity.activity_types
            const IconComponent = getActivityIconComponent(activityType?.icon || null)
            const bgColor = getActivityBgColor(activityType?.color || null)
            const source = activity.leads ? "lead" : activity.investors ? "investor" : null
            const sourceEntity = activity.leads || activity.investors

            return (
              <Card
                key={activity.id}
                className="border-2 hover:shadow-lg transition-all cursor-pointer hover:border-indigo-200"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Activity Type Icon */}
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 border-2"
                      style={{
                        backgroundColor: bgColor,
                        borderColor: activityType?.color ? `${activityType.color}40` : "#e5e7eb",
                      }}
                    >
                      <IconComponent
                        className="h-7 w-7"
                        style={{ color: activityType?.color || "#6b7280" }}
                      />
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate mb-1">
                            {activity.subject || activityType?.label || "Activity"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-2"
                              style={{
                                borderColor: activityType?.color || "#e5e7eb",
                                color: activityType?.color || "#6b7280",
                                backgroundColor: bgColor,
                              }}
                            >
                              {activityType?.label || activity.type}
                            </Badge>
                            <Badge className={`${statusColors[activity.status]} text-white capitalize`}>
                              {activity.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {activity.created_at && (
                            <div className="text-xs text-muted-foreground text-right">
                              <div className="font-medium">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                              </div>
                              <div className="text-[10px]">
                                {format(new Date(activity.created_at), "MMM d, yyyy 'at' HH:mm")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {activity.description}
                        </p>
                      )}

                      <Separator className="my-3" />

                      {/* Footer Row - Source and User Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {/* Source (Lead/Investor) */}
                        {sourceEntity && source && (
                          <Link
                            href={`/${source === "lead" ? "leads" : "investors"}/${sourceEntity.id}`}
                            className="flex items-center gap-2 hover:underline group"
                          >
                            <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                              <AvatarFallback className={source === "lead" ? "bg-blue-500 text-white text-xs" : "bg-emerald-500 text-white text-xs"}>
                                {getInitials(sourceEntity.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium group-hover:text-indigo-600 transition-colors">
                                {sourceEntity.full_name}
                              </span>
                              <Badge variant="outline" className={`text-[10px] h-5 ${sourceColors[source]}`}>
                                {source === "lead" ? "Lead" : "Investor"}
                              </Badge>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        )}

                        {/* Created By User */}
                        {activity.users && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="text-xs">
                              Created by <span className="font-medium text-foreground">{activity.users.name}</span>
                            </span>
                          </div>
                        )}

                        {/* Assigned To */}
                        {activity.assignedUser && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-xs">
                              Assigned to: <span className="font-medium text-foreground">{activity.assignedUser.name}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
