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
  Briefcase,
  UserCircle,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"
import { getActivityIconComponent, getActivityBgColor } from "@/lib/activity-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InvestorDetailProps {
  investor: {
    id: number
    full_name: string
    email: string
    phone: string | null
    company: string | null
    position: string | null
    source: string
    status: string
    priority: string | null
    budget: string | null
    timeline: string | null
    notes: string | null
    created_at: Date | null
    updated_at: Date | null
    lead_id: number | null
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
      investor_id: number
      investor_field_id: number
      value: string | string[] | null
      investor_fields: {
        id: number
        name: string
        label: string
        type: string
        section_key: string | null
        investor_field_options: Array<{
          id: number
          investor_field_id: number
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
      investor_field_options: Array<{
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
    assignedUser: {
      id: number
      name: string
      email: string
      assigned_at: Date
      assigned_by: {
        id: number
        name: string
      }
    } | null
    activeUsers: Array<{
      id: number
      name: string
      email: string
    }>
  }
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  potential: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Potential" },
  contacted: { color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200", label: "Contacted" },
  interested: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Interested" },
  committed: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Committed" },
  active: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Active" },
  inactive: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Inactive" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  normal: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Normal", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}

export function InvestorDetailView({ investor }: InvestorDetailProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [assigning, setAssigning] = useState(false)

  // Get status from dynamic fields (with fallback to static column)
  const getStatusValue = () => {
    const statusField = investor.customFieldValues.find(
      (cfv) => cfv.investor_fields.name === "status"
    )
    return statusField?.value as string || investor.status
  }

  // Get priority from dynamic fields (with fallback to static column)
  const getPriorityValue = () => {
    const priorityField = investor.customFieldValues.find(
      (cfv) => cfv.investor_fields.name === "priority"
    )
    return priorityField?.value as string || investor.priority
  }

  const statusValue = getStatusValue()
  const priorityValue = getPriorityValue()

  const status = statusConfig[statusValue] || statusConfig.active
  const priority = priorityValue ? (priorityConfig[priorityValue] || priorityConfig.normal) : null

  // Get field display value helper
  const getFieldDisplayValue = (fieldName: string) => {
    const fieldValue = investor.customFieldValues.find(
      (cfv) => cfv.investor_fields.name === fieldName
    )

    if (!fieldValue?.value) return "-"

    const field = fieldValue.investor_fields
    const value = fieldValue.value

    // Handle multiselect
    if (field.type === "multiselect" || field.type === "multiselect_dropdown") {
      if (Array.isArray(value)) {
        return value
          .map((val) => {
            const option = field.investor_field_options.find((opt) => opt.value === val)
            return option?.label || val
          })
          .join(", ")
      }
    }

    // Handle select
    if (field.type === "select") {
      const option = field.investor_field_options.find(
        (opt) => opt.value === value
      )
      return option?.label || value
    }

    return String(value)
  }

  // Icon mapping
  const iconMapping: Record<string, any> = {
    user: User,
    briefcase: Building2,
    document: Building2,
    layout: Tag,
  }

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/investors/${investor.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete investor")
      }

      toast.success("Investor deleted successfully")
      router.push("/investors")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete investor")
      setDeleting(false)
    }
  }

  // Handle user assignment
  const handleAssignUser = async () => {
    if (!selectedUserId && selectedUserId !== "unassign") {
      toast.error("Please select a user")
      return
    }

    setAssigning(true)
    try {
      const res = await fetch(`/api/investors/${investor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserId === "unassign" ? null : parseInt(selectedUserId),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to assign user")
      }

      toast.success(
        selectedUserId === "unassign"
          ? "User unassigned successfully"
          : "User assigned successfully"
      )
      setAssignDialogOpen(false)
      setSelectedUserId("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to assign user")
    } finally {
      setAssigning(false)
    }
  }

  // Open assign dialog with current user pre-selected
  const openAssignDialog = () => {
    setSelectedUserId(investor.assignedUser?.id.toString() || "")
    setAssignDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Modern Hero Header - EMERALD THEME */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-8 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

          <div className="relative">
            {/* Back & Actions */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/investors">
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white border border-white/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Link href={`/investors/${investor.id}/edit`}>
                  <Button variant="secondary" className="bg-white/95 hover:bg-white text-gray-900 shadow-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Investor
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

            {/* Investor Info */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                <AvatarFallback className="text-2xl font-bold bg-white/90 text-emerald-600">
                  {getInitials(investor.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                  {investor.full_name}
                </h1>
                {investor.company && (
                  <p className="text-lg text-white/80 mb-4">
                    {investor.position ? `${investor.position} at ` : ''}{investor.company}
                  </p>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
                    {status.label}
                  </Badge>
                  {priority && (
                    <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    <Globe className="h-3 w-3 mr-1" />
                    {investor.source.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <a href={`mailto:${investor.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{investor.email}</span>
                  </a>
                  {investor.phone && (
                    <>
                      <Separator orientation="vertical" className="h-4 bg-white/20" />
                      <a href={`tel:${investor.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{investor.phone}</span>
                      </a>
                    </>
                  )}
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Created {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy") : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="details" className="text-base">
                  <Building2 className="h-4 w-4 mr-2" />
                  Investor Information
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-base">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Timeline
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-6 space-y-6">
                {/* Contact Information - Static */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Full Name</span>
                        </div>
                        <p className="text-gray-900 font-medium ml-6">{investor.full_name}</p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Email</span>
                        </div>
                        <a
                          href={`mailto:${investor.email}`}
                          className="text-emerald-600 hover:text-emerald-700 font-medium ml-6 block"
                        >
                          {investor.email}
                        </a>
                      </div>

                      {investor.phone && (
                        <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Phone</span>
                          </div>
                          <a
                            href={`tel:${investor.phone}`}
                            className="text-emerald-600 hover:text-emerald-700 font-medium ml-6 block"
                          >
                            {investor.phone}
                          </a>
                        </div>
                      )}

                      {investor.company && (
                        <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Company</span>
                          </div>
                          <p className="text-gray-900 font-medium ml-6">{investor.company}</p>
                        </div>
                      )}

                      {investor.position && (
                        <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Position</span>
                          </div>
                          <p className="text-gray-900 font-medium ml-6">{investor.position}</p>
                        </div>
                      )}

                      <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Source</span>
                        </div>
                        <div className="ml-6">
                          <Badge variant="outline" className="capitalize border-gray-200 bg-gray-50">
                            {investor.source.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Sections from investor_form_sections */}
                {investor.formSections.map((section) => {
                  const sectionFields = investor.allFields.filter(
                    (field) => field.section_key === section.section_key &&
                    !field.is_system_field &&
                    field.name !== "source" &&
                    field.name !== "status" &&
                    field.name !== "priority"
                  )

                  if (sectionFields.length === 0) return null

                  const SectionIcon = iconMapping[section.icon || 'layout'] || Tag
                  const gradientClass = section.gradient || 'bg-gradient-to-r from-gray-50 to-gray-100'

                  // Check if this is the Investor Details section
                  const isInvestorDetailsSection = section.section_key === 'investment_details'

                  return (
                    <Card key={section.id} className="border-gray-200 shadow-sm">
                      <CardHeader className={`${gradientClass} border-b border-gray-200`}>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <SectionIcon className="h-5 w-5 text-teal-600" />
                          {section.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Add Status and Priority at the top of Investor Details section */}
                          {isInvestorDetailsSection && (
                            <>
                              {/* Status - Always show */}
                              <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
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

                              {/* Priority - Show always, even if null, display "-" */}
                              <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <AlertCircle className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">Priority</span>
                                </div>
                                <div className="ml-6">
                                  {priority ? (
                                    <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                                      <span className="mr-1">{priority.icon}</span>
                                      {priority.label}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Custom Fields */}
                          {sectionFields.map((field) => {
                            const fieldValueObj = investor.customFieldValues.find(
                              (cfv) => cfv.investor_fields.name === field.name
                            )
                            const fieldData = fieldValueObj?.investor_fields
                            const value = fieldValueObj?.value

                            const isMultiselect = fieldData?.type === "multiselect" || fieldData?.type === "multiselect_dropdown"

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
                                  // Keep empty
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
                                      const option = fieldData?.investor_field_options.find((opt) => opt.value === val)
                                      const label = option?.label || val
                                      return (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                                        >
                                          {label}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                ) : fieldData?.type === "select" ? (
                                  <div className="ml-6">
                                    <Badge
                                      variant="secondary"
                                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                                    >
                                      {getFieldDisplayValue(field.name)}
                                    </Badge>
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

                {/* Additional Fields without section_key (NULL section_key) */}
                {(() => {
                  const fieldsWithoutSection = investor.allFields.filter(
                    (field) => !field.section_key &&
                    !field.is_system_field &&
                    field.name !== "source" &&
                    field.name !== "status" &&
                    field.name !== "priority"
                  )

                  if (fieldsWithoutSection.length === 0) return null

                  return (
                    <Card className="border-gray-200 shadow-sm">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Tag className="h-5 w-5 text-gray-600" />
                          Other Fields
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {fieldsWithoutSection.map((field) => {
                            const fieldValueObj = investor.customFieldValues.find(
                              (cfv) => cfv.investor_fields.name === field.name
                            )
                            const fieldData = fieldValueObj?.investor_fields
                            const value = fieldValueObj?.value

                            const isMultiselect = fieldData?.type === "multiselect" || fieldData?.type === "multiselect_dropdown"

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
                                  // Keep empty
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
                                      const option = fieldData?.investor_field_options.find((opt) => opt.value === val)
                                      const label = option?.label || val
                                      return (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                                        >
                                          {label}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                ) : fieldData?.type === "select" ? (
                                  <div className="ml-6">
                                    <Badge
                                      variant="secondary"
                                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                                    >
                                      {getFieldDisplayValue(field.name)}
                                    </Badge>
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
                })()}

              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6 space-y-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-600" />
                        Activity Timeline
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setAddActivityOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {investor.activities && investor.activities.length > 0 ? (
                      <div className="space-y-4">
                        {investor.activities.map((activity, index) => {
                          // Find matching activity type
                          const activityType = investor.activityTypes.find(
                            (at) => at.name === activity.type
                          )
                          const IconComponent = getActivityIconComponent(activityType?.icon || null)
                          const bgColor = getActivityBgColor(activityType?.color || null)
                          const iconColor = activityType?.color || '#6b7280'

                          return (
                            <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                              <div className="flex flex-col items-center">
                                <div
                                  className="h-10 w-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: bgColor }}
                                >
                                  <IconComponent
                                    className="h-5 w-5"
                                    style={{ color: iconColor }}
                                  />
                                </div>
                                {index !== investor.activities!.length - 1 && (
                                  <div className="w-px h-full bg-gray-200 mt-2" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">
                                      {activity.subject || activityType?.label || activity.type}
                                    </h4>
                                    {activityType && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                        style={{
                                          borderColor: activityType.color || '#e5e7eb',
                                          color: activityType.color || '#6b7280',
                                        }}
                                      >
                                        {activityType.label}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {activity.created_at ? format(new Date(activity.created_at), "MMM dd, HH:mm") : "-"}
                                  </span>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                )}
                                <Badge variant="outline" className="mt-2 text-xs capitalize">
                                  {activity.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
                        <p className="text-gray-600 mb-4">Get started by adding the first activity for this investor.</p>
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
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full justify-start bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => setAddActivityOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
                <Link href={`/investors/${investor.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:border-emerald-300 hover:bg-emerald-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Investor
                  </Button>
                </Link>
                <a href={`mailto:${investor.email}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                {investor.phone && (
                  <a href={`tel:${investor.phone}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Investor
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Assigned To */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-emerald-600" />
                  Assigned To
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {investor.assignedUser ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-emerald-100">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                          {getInitials(investor.assignedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {investor.assignedUser.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {investor.assignedUser.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned {formatDistanceToNow(new Date(investor.assignedUser.assigned_at), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {investor.assignedUser.assigned_by.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                      onClick={openAssignDialog}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Change Assignment
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">No user assigned</p>
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      onClick={openAssignDialog}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign User
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates Info */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {/* Created Date */}
                  <div className="space-y-2 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      Created Date
                    </div>
                    <p className="text-sm text-gray-900 font-medium ml-6">
                      {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy") : "-"}
                    </p>
                    <p className="text-xs text-gray-500 ml-6">
                      {investor.created_at ? formatDistanceToNow(new Date(investor.created_at), { addSuffix: true }) : "-"}
                    </p>
                  </div>

                  {/* Last Updated */}
                  {investor.updated_at && (
                    <div className="space-y-2 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        Last Updated
                      </div>
                      <p className="text-sm text-gray-900 font-medium ml-6">
                        {format(new Date(investor.updated_at), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500 ml-6">
                        {formatDistanceToNow(new Date(investor.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{investor.full_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Activity Dialog */}
      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        investorId={investor.id}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Assign User Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-emerald-600" />
              Assign User
            </DialogTitle>
            <DialogDescription>
              Select a user to assign this investor to, or choose "Unassign" to remove the current assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="user-select" className="text-sm font-medium text-gray-900">
                User
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select" className="w-full">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {investor.assignedUser && (
                    <>
                      <SelectItem value="unassign" className="text-red-600">
                        <span className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4" />
                          Unassign User
                        </span>
                      </SelectItem>
                      <Separator className="my-1" />
                    </>
                  )}
                  {investor.activeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUserId && selectedUserId !== "unassign" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>{investor.activeUsers.find((u) => u.id.toString() === selectedUserId)?.name}</strong> will be assigned to this investor.
                </p>
              </div>
            )}

            {selectedUserId === "unassign" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Current assignment will be removed.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false)
                setSelectedUserId("")
              }}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignUser}
              disabled={!selectedUserId || assigning}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {assigning ? "Assigning..." : selectedUserId === "unassign" ? "Unassign" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
