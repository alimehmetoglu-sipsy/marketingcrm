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
  }
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Active" },
  prospect: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Prospect" },
  interested: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Interested" },
  negotiating: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Negotiating" },
  invested: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Invested" },
  inactive: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Inactive" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  medium: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Medium", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}

export function InvestorDetailView({ investor }: InvestorDetailProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const status = statusConfig[investor.status] || statusConfig.active
  const priority = investor.priority ? (priorityConfig[investor.priority] || priorityConfig.medium) : null

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

        {/* Quick Stats Cards - EMERALD THEME */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {investor.activities?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600" />
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
                    {investor.allFields.filter(f => !f.is_system_field && f.name !== "source" && f.name !== "status" && f.name !== "priority").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-teal-600" />
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
                    {investor.created_at
                      ? Math.floor((new Date().getTime() - new Date(investor.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investment</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {status.label === "Invested" ? "✓" : "-"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
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
                  const isInvestorDetailsSection = section.section_key === 'investor_details'

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
                              {/* Status */}
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

                              {/* Priority */}
                              {investor.priority && priority && (
                                <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
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
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {investor.activities && investor.activities.length > 0 ? (
                      <div className="space-y-4">
                        {investor.activities.map((activity, index) => (
                          <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-emerald-600" />
                              </div>
                              {index !== investor.activities!.length - 1 && (
                                <div className="w-px h-full bg-gray-200 mt-2" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {activity.subject || activity.type}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {activity.created_at ? format(new Date(activity.created_at), "MMM dd, HH:mm") : "-"}
                                </span>
                              </div>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              )}
                              <Badge variant="outline" className="mt-2 text-xs">
                                {activity.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
                        <p className="text-gray-600 mb-4">Get started by adding the first activity for this investor.</p>
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
              <CardContent className="p-4 space-y-2">
                <Link href={`/investors/${investor.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:border-emerald-300 hover:bg-emerald-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Investor
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
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
    </>
  )
}
