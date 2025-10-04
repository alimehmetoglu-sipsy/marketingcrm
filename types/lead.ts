// Central type definition for Lead based on Prisma schema
// This ensures type consistency across all components

export type LeadFieldValue = {
  lead_field_id?: number
  value?: string | null
  [key: string]: any // Allow additional Prisma fields
}

export type Lead = {
  id: number
  full_name: string
  email: string | null
  phone: string
  source?: string | null
  status?: string | null
  priority?: string | null
  notes_text?: string | null
  created_at?: Date | null
  updated_at?: Date | null
  lead_field_values?: LeadFieldValue[]
  [key: string]: any // Allow additional fields from Prisma
}

// Simplified type for table/list views
export type LeadListItem = {
  id: number
  full_name: string
  email: string | null
  phone: string
  source?: string | null
  status?: string | null
  priority?: string | null
  created_at?: Date | null
  [key: string]: any // Allow additional fields
}
