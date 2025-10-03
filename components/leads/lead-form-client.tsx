"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, User as UserIcon, ChevronDown, ChevronUp, TrendingUp, CheckCircle2, AlertCircle, Calendar, Clock } from "lucide-react"
import { PhoneInput } from "@/components/ui/phone-input"
import { LeadDynamicField } from "@/components/fields/lead-dynamic-field"
import { LeadFormHeader } from "./lead-form-header"
import { LeadFormProgress } from "./lead-form-progress"
import { LeadEditHero } from "./lead-edit-hero"
import { Separator } from "@/components/ui/separator"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Dynamic schema builder that includes custom fields validation
const buildLeadSchema = (
  customFields: CustomField[],
  sourceRequired: boolean,
  statusRequired: boolean,
  priorityRequired: boolean
) => {
  // Base schema for contact info
  const baseSchema: any = {
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
  }

  // Add custom fields to schema
  const customFieldsSchema: any = {}

  // Add system fields (source, status, priority)
  if (sourceRequired) {
    customFieldsSchema.source = z.string().min(1, "Source is required")
  }
  if (statusRequired) {
    customFieldsSchema.status = z.string().min(1, "Status is required")
  }
  if (priorityRequired) {
    customFieldsSchema.priority = z.string().min(1, "Priority is required")
  }

  // Add other custom fields
  customFields.forEach((field) => {
    if (field.is_required && !["source", "status", "priority"].includes(field.name)) {
      const fieldKey = field.id.toString()

      if (field.type === "email") {
        customFieldsSchema[fieldKey] = z.string().email(`Invalid ${field.label}`)
      } else if (field.type === "url") {
        customFieldsSchema[fieldKey] = z.string().url(`Invalid ${field.label}`)
      } else if (field.type === "number") {
        customFieldsSchema[fieldKey] = z.string().min(1, `${field.label} is required`)
      } else {
        customFieldsSchema[fieldKey] = z.string().min(1, `${field.label} is required`)
      }
    }
  })

  return z.object({
    ...baseSchema,
    customFields: z.object(customFieldsSchema).optional(),
  })
}

type LeadFormValues = {
  full_name: string
  email: string
  phone: string
  customFields?: Record<string, any>
}

type CustomField = {
  id: number
  name: string
  label: string
  type: string
  is_required: boolean
  placeholder: string | null
  help_text: string | null
  default_value: string | null
  section_key: string | null
  lead_field_options?: Array<{
    id: number
    value: string
    label: string
  }>
}

type Lead = {
  id: number
  full_name: string
  email: string
  phone: string
  source: string
  status: string
  priority: string
  notes: string | null
  created_at: Date | null
  updated_at: Date | null
  lead_field_values?: Array<{
    lead_field_id: number
    value: string
  }>
}

type FormSection = {
  id: number
  section_key: string
  name: string
  is_visible: boolean
  is_default_open: boolean
  sort_order: number
  icon: string
  gradient: string
}

interface LeadFormClientProps {
  lead?: Lead
  customFields: CustomField[]
  sources: Array<{ value: string; label: string }>
  statuses: Array<{ value: string; label: string }>
  priorities: Array<{ value: string; label: string }>
  sourceRequired?: boolean
  statusRequired?: boolean
  priorityRequired?: boolean
}

interface CollapsibleSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  gradient: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  gradient,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className={cn(
          "p-6 border-b border-gray-200 transition-colors",
          gradient
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>
      </button>

      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          {children}
        </CardContent>
      </div>
    </Card>
  )
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

export function LeadFormClient({
  lead,
  customFields,
  sources,
  statuses,
  priorities,
  sourceRequired = true,
  statusRequired = true,
  priorityRequired = true,
}: LeadFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSections, setFormSections] = useState<FormSection[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(
    () => {
      const initialValues: Record<string, any> = {}

      // Load custom field values from lead_field_values table
      if (lead?.lead_field_values) {
        lead.lead_field_values.forEach(fv => {
          initialValues[fv.lead_field_id] = fv.value
        })
      }

      // Load system fields (source, status, priority) from leads table
      if (lead?.source) {
        initialValues.source = lead.source
      }
      if (lead?.status) {
        initialValues.status = lead.status
      }
      if (lead?.priority) {
        initialValues.priority = lead.priority
      }

      return initialValues
    }
  )

  // Fetch form sections configuration
  useEffect(() => {
    fetch("/api/settings/lead-form-sections")
      .then((res) => res.json())
      .then((data) => {
        // Sort by sort_order
        const sortedSections = data.sort((a: FormSection, b: FormSection) =>
          a.sort_order - b.sort_order
        )
        setFormSections(sortedSections)
      })
      .catch((err) => console.error("Error fetching form sections:", err))
  }, [])

  // Build dynamic schema with required field validation
  const leadSchema = useMemo(
    () => buildLeadSchema(customFields, sourceRequired, statusRequired, priorityRequired),
    [customFields, sourceRequired, statusRequired, priorityRequired]
  )

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          full_name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          customFields: {
            source: lead.source || "",
            status: lead.status || "",
            priority: lead.priority || "",
          },
        }
      : {
          full_name: "",
          email: "",
          phone: "",
          phone_country: "+90",
          customFields: {},
        },
  })

  // Calculate form completion
  const formValues = form.watch()
  const completedFields = useMemo(() => {
    const requiredFields = ["full_name", "email", "phone"]

    let completed = 0
    let total = requiredFields.length + customFields.length

    // Count required contact fields
    requiredFields.forEach(field => {
      if (formValues[field as keyof typeof formValues]) completed++
    })

    // Count custom fields
    Object.keys(customFieldValues).forEach(key => {
      if (customFieldValues[key]) completed++
    })

    return { completed, total }
  }, [formValues, customFieldValues, customFields.length])

  const onSubmit = async (values: LeadFormValues) => {
    try {
      setIsSubmitting(true)

      const payload = {
        ...values,
        customFields: customFieldValues,
      }

      const url = lead ? `/api/leads/${lead.id}` : "/api/leads"
      const method = lead ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("API Error Response:", error)
        throw new Error(error.details || error.error || "Failed to save lead")
      }

      router.push("/leads")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving lead:", error)
      alert(error.message || "Failed to save lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/leads")
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "user":
        return <UserIcon className="w-5 h-5 text-white" />
      case "briefcase":
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case "document":
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case "layout":
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
        )
      default:
        return <UserIcon className="w-5 h-5 text-white" />
    }
  }

  // Get fields for a specific section
  const getFieldsForSection = (sectionKey: string) => {
    return customFields.filter(f => f.section_key === sectionKey)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Modern Hero Header (only for edit mode) */}
          {lead && (
            <LeadEditHero
              lead={lead}
              isSubmitting={isSubmitting}
              onSave={form.handleSubmit(onSubmit)}
              onCancel={handleCancel}
            />
          )}

          {/* Header for new lead */}
          {!lead && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
                <p className="text-gray-600 mt-1">Add a new lead to your CRM</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Save Lead
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Main Form Column */}
            <div className="col-span-8 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information Section */}
                  <CollapsibleSection
                    title="Contact Information"
                    subtitle="Required contact details"
                    icon={<UserIcon className="w-5 h-5 text-blue-600" />}
                    gradient="bg-gradient-to-r from-blue-50 to-sky-50"
                  >
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Full Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              className="border-gray-300 focus:border-[#FF7A59] focus:ring-[#FF7A59]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john.doe@example.com"
                              {...field}
                              className="border-gray-300 focus:border-[#FF7A59] focus:ring-[#FF7A59]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Phone <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+90 555 123 4567"
                              {...field}
                              className="border-gray-300 focus:border-[#FF7A59] focus:ring-[#FF7A59]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleSection>

                  {/* Lead Details Section - All Fields Combined */}
                  <CollapsibleSection
                    title="Lead Details"
                    subtitle="Status, priority and additional information"
                    icon={
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    gradient="bg-gradient-to-r from-blue-50 to-sky-50"
                  >
                    <div className="space-y-4">
                      {/* Source Field */}
                      <FormField
                        control={form.control}
                        name="customFields.source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                              Source
                              {sourceRequired && <span className="text-red-500">*</span>}
                            </FormLabel>
                            <Select
                              value={field.value || customFieldValues.source || lead?.source || ""}
                              onValueChange={(value) => {
                                field.onChange(value)
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  source: value,
                                })
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sources.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Status Field */}
                      <FormField
                        control={form.control}
                        name="customFields.status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                              Status
                              {statusRequired && <span className="text-red-500">*</span>}
                            </FormLabel>
                            <Select
                              value={field.value || customFieldValues.status || lead?.status || ""}
                              onValueChange={(value) => {
                                field.onChange(value)
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  status: value,
                                })
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statuses.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Priority Field */}
                      <FormField
                        control={form.control}
                        name="customFields.priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
                              Priority
                              {priorityRequired && <span className="text-red-500">*</span>}
                            </FormLabel>
                            <Select
                              value={field.value || customFieldValues.priority || lead?.priority || ""}
                              onValueChange={(value) => {
                                field.onChange(value)
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  priority: value,
                                })
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {priorities.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* All Custom Fields (excluding source, status, priority) */}
                      {customFields
                        .filter((field) => !["source", "status", "priority"].includes(field.name))
                        .map((field) => (
                          <LeadDynamicField
                            key={field.id}
                            field={field}
                            value={customFieldValues[field.id]}
                            onChange={(value) =>
                              setCustomFieldValues({
                                ...customFieldValues,
                                [field.id]: value,
                              })
                            }
                          />
                        ))}
                    </div>
                  </CollapsibleSection>
                </form>
              </Form>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Progress Card */}
              <Card className="border-gray-200 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Form Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <LeadFormProgress
                    completedFields={completedFields.completed}
                    totalFields={completedFields.total}
                  />
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-gray-200 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>All contact fields are required and must be unique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Select country code before entering phone number</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Use notes to capture important context</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
