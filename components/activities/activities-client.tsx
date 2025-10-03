"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { Phone, Mail, Calendar, MessageSquare, Search, Filter, Activity } from "lucide-react"

interface Lead {
  full_name: string
}

interface ActivityData {
  id: bigint
  type: string
  subject: string | null
  description: string | null
  status: string
  created_at: Date | null
  leads: Lead | null
}

interface ActivitiesClientProps {
  activities: ActivityData[]
}

const typeIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
}

const typeColors: Record<string, { bg: string; text: string; badge: string }> = {
  call: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", badge: "bg-blue-600" },
  email: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", badge: "bg-purple-600" },
  meeting: { bg: "bg-green-50 border-green-200", text: "text-green-700", badge: "bg-green-600" },
  note: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", badge: "bg-orange-600" },
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
}

export function ActivitiesClient({ activities }: ActivitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: activities.length,
      calls: activities.filter(a => a.type === "call").length,
      emails: activities.filter(a => a.type === "email").length,
      meetings: activities.filter(a => a.type === "meeting").length,
      notes: activities.filter(a => a.type === "note").length,
      pending: activities.filter(a => a.status === "pending").length,
      completed: activities.filter(a => a.status === "completed").length,
    }
  }, [activities])

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch =
        !searchQuery ||
        activity.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.leads?.full_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || activity.type === typeFilter
      const matchesStatus = statusFilter === "all" || activity.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [activities, searchQuery, typeFilter, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">
          Track all interactions with your leads and investors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <Activity className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">{stats.calls}</div>
              <Phone className="h-8 w-8 text-blue-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{stats.meetings}</div>
              <Calendar className="h-8 w-8 text-green-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <Filter className="h-8 w-8 text-yellow-500 opacity-40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
              No activities found matching your filters
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => {
            const Icon = typeIcons[activity.type] || MessageSquare
            const colors = typeColors[activity.type] || { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", badge: "bg-gray-500" }

            return (
              <Card
                key={activity.id.toString()}
                className="border-2 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} border-2 ${colors.text} shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{activity.subject || "No subject"}</h3>
                          {activity.leads && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                                {activity.leads.full_name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                              {activity.leads.full_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex gap-2">
                            <Badge className={`${colors.badge} text-white capitalize`}>
                              {activity.type}
                            </Badge>
                            <Badge className={`${statusColors[activity.status]} text-white capitalize`}>
                              {activity.status}
                            </Badge>
                          </div>
                          {activity.created_at && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
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
