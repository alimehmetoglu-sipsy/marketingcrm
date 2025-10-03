"use client"

import { useState, useMemo } from "react"
import { InvestorsTable } from "./investors-table"
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

type Investor = {
  id: number
  full_name: string
  email: string
  phone: string
  source: string
  status: string
  priority: string
  created_at: Date | null
  investor_field_values: Array<{
    id: number
    lead_id: number
    investor_field_id: number
    value: any
    investor_fields: {
      id: number
      name: string
      label: string
      type: string
    }
  }>
}

type InvestorField = {
  id: number
  name: string
  label: string
  type: string
  investor_field_options: Array<{
    id: number
    value: string
    label: string
  }>
}

interface InvestorsTableWithFiltersProps {
  investors: Investor[]
  investorFields: InvestorField[]
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

export function InvestorsTableWithFilters({ investors, investorFields }: InvestorsTableWithFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Get filterable custom fields (select and multiselect types only)
  const filterableCustomFields = useMemo(() => {
    return investorFields.filter(
      (field) =>
        (field.type === "select" || field.type === "multiselect" || field.type === "multiselect_dropdown") &&
        !["source", "status", "priority"].includes(field.name) &&
        field.investor_field_options.length > 0
    )
  }, [investorFields])

  // Filter investors based on search and filters
  const filteredInvestors = useMemo(() => {
    let result = investors

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.full_name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
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

        // Custom fields
        const fieldValue = lead.investor_field_values.find(
          (fv) => fv.investor_fields.name === fieldName
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
  }, [investors, searchTerm, filters])

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
  const tableInvestors = filteredInvestors.map((lead) => ({
    id: lead.id,
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    created_at: lead.created_at,
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
              {field.investor_field_options.map((opt) => (
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
        Showing <span className="font-semibold text-gray-900">{filteredInvestors.length}</span> of{" "}
        <span className="font-semibold text-gray-900">{investors.length}</span> investors
      </div>

      {/* Investors Table */}
      <InvestorsTable investors={tableInvestors} />
    </div>
  )
}
