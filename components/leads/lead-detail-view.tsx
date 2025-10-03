"use client"

import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash,
  User,
  Building2,
  Globe,
  Tag,
  Activity,
  Clock,
  AlertCircle,
  Plus,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Target,
  Users,
} from "lucide-react"
import Link from "next/link"
import { DeleteLeadDialog } from "./delete-lead-dialog"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"

interface LeadDetailProps {
  lead: {
    id: number
    full_name: string
    email: string
    phone: string
    source: string
    status: string
    priority: string
    created_at: Date | null
    updated_at: Date | null
    activities?: Array<{
      id: number
      type: string
      subject: string | null
      description: string | null
      status: string
      created_at: Date | null
    }>
    customFieldValues: Array<{
      id: number
      lead_id: number
      lead_field_id: number
      value: string | null
      lead_fields: {
        id: number
        name: string
        label: string
        type: string
        section_key: string | null
        lead_field_options: Array<{
          id: number
          lead_field_id: number
          value: string
          label: string
        }>
      }
    }>
    allFields: Array<{
      id: number
      name: string
      label: string
      type: string
      is_required: boolean
      is_system_field: boolean
      section_key: string | null
      lead_field_options: Array<{
        id: number
        value: string
        label: string
      }>
    }>
    activityTypes: Array<{
      id: number
      name: string
      label: string
      icon: string | null
      color: string | null
      is_active: boolean
      sort_order: number
    }>
    formSections: Array<{
      id: number
      section_key: string
      name: string
      is_visible: boolean
      is_default_open: boolean
      sort_order: number
      icon: string | null
      gradient: string | null
    }>
  }
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  new: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "New" },
  contacted: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Contacted" },
  qualified: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Qualified" },
  proposal: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Proposal" },
  negotiation: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Negotiation" },
  won: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Won" },
  lost: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Lost" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  medium: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Medium", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}

export function LeadDetailView({ lead }: LeadDetailProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addActivityOpen, setAddActivityOpen] = useState(false)

  const status = statusConfig[lead.status]
  const priority = priorityConfig[lead.priority]

  // Get field value helper
  const getFieldValue = (fieldName: string) => {
    const fieldValue = lead.customFieldValues.find(
      (cfv) => cfv.lead_fields.name === fieldName
    )
    return fieldValue?.value || null
  }

  // Get field display value helper
  const getFieldDisplayValue = (fieldName: string) => {
    const fieldValue = lead.customFieldValues.find(
      (cfv) => cfv.lead_fields.name === fieldName
    )

    if (!fieldValue?.value) return "-"

    const field = fieldValue.lead_fields
    const value = fieldValue.value

    // Handle multiselect types - value is already parsed from server
    if (field.type === "multiselect" || field.type === "multiselect_dropdown") {
      if (Array.isArray(value)) {
        return value
          .map((val) => {
            const option = field.lead_field_options.find((opt) => opt.value === val)
            return option?.label || val
          })
          .join(", ")
      }
      // Fallback for unparsed string values
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) {
            return parsed
              .map((val) => {
                const option = field.lead_field_options.find((opt) => opt.value === val)
                return option?.label || val
              })
              .join(", ")
          }
        } catch (e) {
          // If parsing fails, return as is
        }
      }
      return String(value)
    }

    // Handle select type
    if (field.type === "select") {
      const option = field.lead_field_options.find(
        (opt) => opt.value === value
      )
      return option?.label || value
    }

    return String(value)
  }

  // Get icon component mapping
  const iconMapping: Record<string, any> = {
    user: User,
    briefcase: Building2,
    document: Building2,
    layout: Tag,
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Modern Hero Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

          <div className="relative">
            {/* Back Button & Actions */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/leads">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white border border-white/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Link href={`/leads/${lead.id}/edit`}>
                  <Button variant="secondary" className="bg-white/95 hover:bg-white text-gray-900 shadow-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lead
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Lead Info */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                <AvatarFallback className="text-2xl font-bold bg-white/90 text-indigo-600">
                  {getInitials(lead.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                  {lead.full_name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
                    {status.label}
                  </Badge>
                  {lead.priority && priority && (
                    <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    <Globe className="h-3 w-3 mr-1" />
                    {lead.source.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{lead.email}</span>
                  </a>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{lead.phone}</span>
                  </a>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Created {lead.created_at ? format(new Date(lead.created_at), "MMM dd, yyyy") : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {lead.activities?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custom Fields</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {lead.allFields.filter(f => !f.is_system_field && f.name !== "source" && f.name !== "status" && f.name !== "priority").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Active</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {lead.created_at
                      ? Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {status.label === "Won" ? "100%" : "0%"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="details" className="text-base">
                  <Building2 className="h-4 w-4 mr-2" />
                  Lead Information
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-base">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Timeline
                </TabsTrigger>
              </TabsList>

              {/* Details Tab - Merged Overview + Details with Dynamic Sections */}
              <TabsContent value="details" className="mt-6 space-y-6">
                {/* Contact Information Section - Static Fields */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Full Name</span>
                        </div>
                        <p className="text-gray-900 font-medium ml-6">{lead.full_name}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Email</span>
                        </div>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium ml-6 block"
                        >
                          {lead.email}
                        </a>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Phone</span>
                        </div>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-blue-600 hover:text-blue-700 font-medium ml-6 block"
                        >
                          {lead.phone}
                        </a>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Source</span>
                        </div>
                        <div className="ml-6">
                          <Badge variant="outline" className="capitalize border-gray-200 bg-gray-50">
                            {lead.source.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Sections from lead_form_sections */}
                {lead.formSections.map((section) => {
                  // Get fields for this section
                  const sectionFields = lead.allFields.filter(
                    (field) => field.section_key === section.section_key &&
                    !field.is_system_field &&
                    field.name !== "source" &&
                    field.name !== "status" &&
                    field.name !== "priority"
                  )

                  // Skip if no fields in this section
                  if (sectionFields.length === 0) return null

                  const SectionIcon = iconMapping[section.icon || 'layout'] || Tag

                  // Generate gradient class - either from DB or default
                  const gradientClass = section.gradient || 'bg-gradient-to-r from-gray-50 to-gray-100'

                  // Check if this is the lead_details section
                  const isLeadDetailsSection = section.section_key === 'lead_details'

                  return (
                    <Card key={section.id} className="border-gray-200 shadow-sm">
                      <CardHeader className={`${gradientClass} border-b border-gray-200`}>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <SectionIcon className="h-5 w-5 text-emerald-600" />
                          {section.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* If Lead Details section, add Status and Priority first */}
                          {isLeadDetailsSection && (
                            <>
                              {/* Status */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">Status</span>
                                </div>
                                <div className="ml-6">
                                  <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
                                    {status.label}
                                  </Badge>
                                </div>
                              </div>

                              {/* Priority */}
                              {lead.priority && priority && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">Priority</span>
                                  </div>
                                  <div className="ml-6">
                                    <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                                      <span className="mr-1">{priority.icon}</span>
                                      {priority.label}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {sectionFields.map((field) => {
                            // Get the field value object
                            const fieldValueObj = lead.customFieldValues.find(
                              (cfv) => cfv.lead_fields.name === field.name
                            )
                            const fieldData = fieldValueObj?.lead_fields
                            const value = fieldValueObj?.value

                            // Check if it's a multiselect field
                            const isMultiselect = fieldData?.type === "multiselect" || fieldData?.type === "multiselect_dropdown"

                            // For multiselect, get array of values
                            let multiselectValues: string[] = []
                            if (isMultiselect && value) {
                              if (Array.isArray(value)) {
                                multiselectValues = value
                              } else if (typeof value === 'string') {
                                try {
                                  const parsed = JSON.parse(value)
                                  if (Array.isArray(parsed)) {
                                    multiselectValues = parsed
                                  }
                                } catch (e) {
                                  // If parsing fails, treat as single value
                                }
                              }
                            }

                            return (
                              <div key={field.id} className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Tag className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{field.label}</span>
                                </div>

                                {isMultiselect && multiselectValues.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 ml-6">
                                    {multiselectValues.map((val, idx) => {
                                      const option = fieldData?.lead_field_options.find((opt) => opt.value === val)
                                      const label = option?.label || val
                                      return (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                                        >
                                          {label}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-gray-900 font-medium ml-6">
                                    {getFieldDisplayValue(field.name)}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6 space-y-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {lead.activities && lead.activities.length > 0 ? (
                      <div className="relative space-y-6">
                        {/* Timeline Line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent" />

                        {lead.activities.map((activity, index) => {
                          const activityType = lead.activityTypes.find((t) => t.name === activity.type)
                          const activityTypeColors: Record<string, string> = {
                            call: "bg-blue-500",
                            email: "bg-purple-500",
                            meeting: "bg-green-500",
                            note: "bg-orange-500",
                          }
                          const activityIcons: Record<string, any> = {
                            call: Phone,
                            email: Mail,
                            meeting: Calendar,
                            note: MessageSquare,
                          }
                          const Icon = activityIcons[activity.type] || MessageSquare
                          const color = activityType?.color || activityTypeColors[activity.type] || "bg-gray-500"

                          return (
                            <div key={activity.id} className="relative flex gap-4 group">
                              {/* Timeline Dot */}
                              <div
                                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 shadow-lg ring-4 ring-white transition-transform group-hover:scale-110"
                                style={{ backgroundColor: activityType?.color || color }}
                              >
                                <Icon className="h-5 w-5" />
                              </div>

                              {/* Activity Card */}
                              <div className="flex-1 mb-6">
                                <Card className="border-gray-200 hover:shadow-md transition-all duration-300 group-hover:border-gray-300">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-semibold text-base text-gray-900">
                                        {activity.subject || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className="shrink-0"
                                        style={{
                                          borderColor: activityType?.color || color,
                                          color: activityType?.color || color
                                        }}
                                      >
                                        {activityType?.label || activity.type}
                                      </Badge>
                                    </div>

                                    {activity.description && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {activity.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {activity.status}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Start tracking your lead interactions</p>
                        <Button onClick={() => setAddActivityOpen(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Activity
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md"
                  onClick={() => setAddActivityOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
                <a href={`mailto:${lead.email}`} className="block">
                  <Button variant="outline" className="w-full justify-start border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                <a href={`tel:${lead.phone}`} className="block">
                  <Button variant="outline" className="w-full justify-start border-gray-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Lead
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Dates Info */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Created Date
                    </div>
                    <p className="text-sm text-gray-900 font-medium ml-6">
                      {lead.created_at
                        ? format(new Date(lead.created_at), "MMM dd, yyyy")
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-500 ml-6">
                      {lead.created_at
                        ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
                        : "-"}
                    </p>
                  </div>

                  {lead.updated_at && (
                    <div className="space-y-2 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Clock className="h-4 w-4 text-purple-600" />
                        Last Updated
                      </div>
                      <p className="text-sm text-gray-900 font-medium ml-6">
                        {format(new Date(lead.updated_at), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500 ml-6">
                        {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <DeleteLeadDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        leadId={String(lead.id)}
        leadName={lead.full_name}
      />

      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        leadId={lead.id}
      />
    </>
  )
}
