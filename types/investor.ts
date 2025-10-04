// Central type definition for Investor based on Prisma schema
// This ensures type consistency across all components
// Uses Partial to accommodate Prisma's flexible query results

export type InvestorFieldValue = {
  investor_field_id?: number
  value?: string | null
  [key: string]: any // Allow additional Prisma fields
}

export type Investor = {
  id: number
  lead_id?: number | null
  full_name: string
  email: string
  phone?: string | null
  company?: string | null
  position?: string | null
  website?: string | null
  industry?: string | null
  status: string
  priority?: string | null
  budget?: string | null
  timeline?: string | null
  notes?: string | null
  important_notes?: string | null
  investment_preferences?: string | null
  risk_tolerance?: string | null | any
  communication_preferences?: string | null | any
  representative_id?: bigint | null | number
  source: string
  last_activity_at?: Date | null
  activity_status?: string | any
  created_by?: bigint | null | number
  updated_by?: bigint | null | number
  created_at?: Date | null
  updated_at?: Date | null
  investor_field_values?: InvestorFieldValue[]
  [key: string]: any // Allow additional fields from Prisma
}

// Simplified type for table/list views - only essential fields
export type InvestorListItem = {
  id: number
  full_name: string
  email: string
  phone?: string | null
  company?: string | null
  position?: string | null
  status: string
  priority?: string | null
  source: string
  created_at?: Date | null
  [key: string]: any // Allow additional fields
}
