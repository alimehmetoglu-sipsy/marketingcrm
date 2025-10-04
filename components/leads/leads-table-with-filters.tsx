"use client"

import { useState, useMemo } from "react"
import type { Lead as LeadType } from "@/types/lead"
import { LeadsTable } from "./leads-table"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Using central type - all fields optional for maximum flexibility
type Lead = LeadType & {
  [key: string]: any // Allow any additional fields from Prisma queries
}

type LeadField = {
  id: number
  name: string
  label: string
  type: string
  lead_field_options: Array<{
    id: number
    value: string
    label: string
  }>
}

type User = {
  id: number
  name: string | null
  email: string
}

interface LeadsTableWithFiltersProps {
  leads: Lead[]
  leadFields: LeadField[]
  activeUsers: User[]
}

const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "cold_call", label: "Cold Call" },
  { value: "email", label: "Email" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
]

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function LeadsTableWithFilters({ leads, leadFields, activeUsers }: LeadsTableWithFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Get filterable custom fields (select and multiselect types only)
  const filterableCustomFields = useMemo(() => {
    return leadFields.filter(
      (field) =>
        (field.type === "select" || field.type === "multiselect" || field.type === "multiselect_dropdown") &&
        !["source", "status", "priority"].includes(field.name) &&
        field.lead_field_options.length > 0
    )
  }, [leadFields])

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    let result = leads

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.full_name.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchTerm)
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([fieldName, filterValue]) => {
      if (!filterValue || filterValue === "all") return

      result = result.filter((lead) => {
        // System fields
        if (fieldName === "source") return lead.source === filterValue
        if (fieldName === "status") return lead.status === filterValue
        if (fieldName === "priority") return lead.priority === filterValue

        // Assigned User filter
        if (fieldName === "assigned_user") {
          if (filterValue === "unassigned") {
            return !lead.assignedUser
          }
          return lead.assignedUser?.id === parseInt(filterValue)
        }

        // Custom fields
        const fieldValue = lead.lead_field_values?.find(
          (fv) => fv.lead_fields.name === fieldName
        )

        if (!fieldValue?.value) return false

        // Handle multiselect - value might be array
        if (Array.isArray(fieldValue.value)) {
          return fieldValue.value.includes(filterValue)
        }

        return fieldValue.value === filterValue
      })
    })

    return result
  }, [leads, searchTerm, filters])

  const handleFilterChange = (fieldName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setFilters({})
  }

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== "all").length + (searchTerm ? 1 : 0)

  // Convert to table format
  const tableLeads = filteredLeads.map((lead) => ({
    id: lead.id,
    full_name: lead.full_name,
    email: lead.email || "",
    phone: lead.phone,
    source: lead.source || "",
    status: lead.status || "new",
    priority: lead.priority || null,
    created_at: lead.created_at || null,
    assigned_user: lead.assignedUser || null,
  }))

  return (
    <div className="space-y-4">
      {/* Filter Bar - Single Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Source Filter */}
        <Select value={filters.source || "all"} onValueChange={(v) => handleFilterChange("source", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status || "all"} onValueChange={(v) => handleFilterChange("status", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority || "all"} onValueChange={(v) => handleFilterChange("priority", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assigned User Filter */}
        <Select value={filters.assigned_user || "all"} onValueChange={(v) => handleFilterChange("assigned_user", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {activeUsers.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Field Filters - Dynamic */}
        {filterableCustomFields.map((field) => (
          <Select
            key={field.id}
            value={filters[field.name] || "all"}
            onValueChange={(v) => handleFilterChange(field.name, v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={`All ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {field.label}</SelectItem>
              {field.lead_field_options.map((opt) => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto">
            <X className="h-4 w-4 mr-2" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Results Counter */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filteredLeads.length}</span> of{" "}
        <span className="font-semibold text-gray-900">{leads.length}</span> leads
      </div>

      {/* Leads Table */}
      <LeadsTable leads={tableLeads} />
    </div>
  )
}
