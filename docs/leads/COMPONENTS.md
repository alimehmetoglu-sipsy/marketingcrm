# Leads Module - Component Documentation

[← Back to README](./README.md)

---

## Overview

The Leads module components follow the same architecture as the Investors module. For comprehensive component documentation, see [Investors Components Documentation](../investors/COMPONENTS.md).

This document highlights **Lead-specific** components and differences.

---

## Component Hierarchy

```
Leads Page (/leads)
├── LeadsTableWithFilters
│   ├── LeadsTable
│   │   └── DeleteLeadDialog
│   └── Filter Components
└── AddLeadButton

Lead Detail Page (/leads/[id])
├── LeadDetailView
│   ├── Hero Header (Blue/Indigo gradient)
│   ├── Tabbed Interface
│   │   ├── Lead Information Tab
│   │   └── Activity Timeline Tab
│   ├── DeleteLeadDialog
│   └── AddActivityDialog

Lead Create/Edit Page (/leads/new|[id]/edit)
└── LeadFormClient
    ├── LeadEditHero (edit mode only)
    ├── CollapsibleSection (Contact Info)
    ├── CollapsibleSection (Dynamic Fields)
    │   └── LeadDynamicField (multiple)
    └── Sidebar: LeadFormProgress
```

---

## Core Components

### 1. LeadFormClient

**File:** `/components/leads/lead-form-client.tsx`

**Purpose:** Main form for creating/editing leads with dynamic custom fields

**Props:**
```typescript
interface LeadFormClientProps {
  lead?: Lead                    // Optional, only for edit mode
  customFields: CustomField[]    // Dynamic fields from lead_fields table
}
```

**Key Features:**
- React Hook Form for validation
- Custom fields state management
- Form completion tracking
- Section-based layout
- BigInt serialization

**Usage:**
```tsx
import { LeadFormClient } from "@/components/leads/lead-form-client"

<LeadFormClient
  lead={lead}                    // undefined for create mode
  customFields={customFields}
/>
```

---

### 2. LeadsTableWithFilters

**File:** `/components/leads/leads-table-with-filters.tsx`

**Purpose:** Filterable lead list with search and custom field filters

**Props:**
```typescript
interface LeadsTableWithFiltersProps {
  leads: Lead[]
  leadFields: LeadField[]
}
```

**Features:**
- Search (name, email, phone)
- System field filters (source, status, priority)
- Custom field filters (select/multiselect types only)
- Real-time client-side filtering

---

### 3. LeadDetailView

**File:** `/components/leads/lead-detail-view.tsx`

**Purpose:** Detailed lead view with tabs and activities

**Props:**
```typescript
interface LeadDetailProps {
  lead: {
    id: number
    full_name: string
    email: string
    phone: string
    source: string
    status: string
    priority: string | null
    created_at: Date | null
    customFieldValues: Array<{...}>
    allFields: Array<{...}>
    formSections: Array<{...}>
    activityTypes: Array<{...}>
    activities?: Array<{...}>
  }
}
```

**Features:**
- Hero header with blue/indigo gradient
- Status & priority badges
- Tabbed interface (Information | Activities)
- Section-based dynamic fields display
- Activity timeline
- Quick actions (Edit, Delete)

---

### 4. LeadEditHero

**File:** `/components/leads/lead-edit-hero.tsx`

**Purpose:** Hero header for edit mode

**Props:**
```typescript
interface LeadEditHeroProps {
  lead: {
    id: number
    full_name: string
    email: string
    phone: string
    source: string
    status: string
    priority: string
    created_at: Date | null
  }
  isSubmitting: boolean
  onSave: () => void
  onCancel: () => void
}
```

**Design:**
- Blue/indigo gradient background
- Large avatar with initials
- "Editing" badge
- Save/Cancel actions

---

## Helper Components

### LeadsTable

**File:** `/components/leads/leads-table.tsx`

**Features:**
- Avatar with initials (blue gradient)
- Status/Priority badges
- Contact actions (email, phone)
- Row click → navigate to detail
- Dropdown actions menu

---

### AddLeadButton

**File:** `/components/leads/add-lead-button.tsx`

**Design:**
```tsx
<Link href="/leads/new">
  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
    <Plus className="mr-2 h-4 h-4" />
    Add Lead
  </Button>
</Link>
```

---

### LeadFormProgress

**File:** `/components/leads/lead-form-progress.tsx`

**Purpose:** Visual progress bar for form completion

**Props:**
```typescript
interface LeadFormProgressProps {
  completedFields: number
  totalFields: number
  className?: string
}
```

**Colors:**
- 100% complete: Blue gradient `from-blue-500 to-indigo-500`
- Incomplete: Orange gradient `from-[#FF7A59] to-[#FF9B82]`

---

### DeleteLeadDialog

**File:** `/components/leads/delete-lead-dialog.tsx`

**Purpose:** Confirmation dialog for lead deletion

**Props:**
```typescript
interface DeleteLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadName: string
}
```

---

## Field Components

### LeadDynamicField

**File:** `/components/fields/lead-dynamic-field.tsx`

**Purpose:** Renders dynamic fields based on type

**Supported Types:**
1. Text/Email/URL → `<Input>`
2. Phone → `<PhoneInput>` with country code
3. Number → `<Input type="number">`
4. Date → `<Input type="date">`
5. Textarea → `<Textarea>`
6. Select → `<Select>` (shadcn/ui)
7. Multiselect → Vertical `<Checkbox>` list
8. Multiselect Dropdown → `<Popover>` with badges

**Usage:**
```tsx
<LeadDynamicField
  field={field}
  value={fieldValues[field.id]}
  onChange={(value) => setFieldValues({ ...fieldValues, [field.id]: value })}
/>
```

---

## State Management Patterns

### Form State (React Hook Form)

```typescript
const form = useForm<LeadFormValues>({
  resolver: zodResolver(leadSchema),
  defaultValues: lead ? {
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone
  } : {
    full_name: "",
    email: "",
    phone: ""
  }
})
```

---

### Custom Fields State

```typescript
const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(() => {
  if (!lead) return {}

  const values: Record<string, any> = {}

  // Initialize from lead_field_values
  lead.lead_field_values?.forEach(fv => {
    const field = fv.lead_fields
    let parsedValue = fv.value

    // Parse JSON for multiselect
    if (field.type === 'multiselect' && parsedValue) {
      try {
        parsedValue = JSON.parse(parsedValue)
      } catch {}
    }

    values[field.id] = parsedValue
  })

  // Add system fields
  const sourceField = customFields.find(f => f.name === 'source')
  if (sourceField) values[sourceField.id] = lead.source

  const statusField = customFields.find(f => f.name === 'status')
  if (statusField) values[statusField.id] = lead.status

  const priorityField = customFields.find(f => f.name === 'priority')
  if (priorityField) values[priorityField.id] = lead.priority

  return values
})
```

---

### Filter State

```typescript
const [searchTerm, setSearchTerm] = useState("")
const [filters, setFilters] = useState<Record<string, string>>({})

const filteredLeads = useMemo(() => {
  let result = leads

  // Search
  if (searchTerm) {
    result = result.filter(lead =>
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchTerm))
    )
  }

  // Filters
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all") return

    if (key === "source") result = result.filter(l => l.source === value)
    if (key === "status") result = result.filter(l => l.status === value)
    if (key === "priority") result = result.filter(l => l.priority === value)

    // Custom field filters
    // ... implementation
  })

  return result
}, [leads, searchTerm, filters])
```

---

## Event Handlers

### Form Submission

```typescript
const onSubmit = async (values: LeadFormValues) => {
  try {
    setIsSubmitting(true)

    const payload = {
      ...values,
      customFields: customFieldValues
    }

    const url = lead ? `/api/leads/${lead.id}` : '/api/leads'
    const method = lead ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || error.error)
    }

    router.push('/leads')
    router.refresh()
  } catch (error: any) {
    alert(error.message)
  } finally {
    setIsSubmitting(false)
  }
}
```

---

### Delete Handler

```typescript
const handleDelete = async () => {
  setDeleting(true)
  try {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'DELETE'
    })

    if (!res.ok) throw new Error('Failed to delete lead')

    toast.success('Lead deleted successfully')
    router.push('/leads')
    router.refresh()
  } catch (error) {
    toast.error('Failed to delete lead')
    setDeleting(false)
  }
}
```

---

## TypeScript Interfaces

### Central Lead Type

**File:** `/types/lead.ts` (if exists, or inline in components)

```typescript
export type Lead = {
  id: number
  full_name: string
  email: string
  phone: string
  source: string
  status: string
  priority?: string | null
  notes_text?: string | null
  created_at?: Date | null
  updated_at?: Date | null
  lead_field_values?: LeadFieldValue[]
  [key: string]: any
}

export type LeadFieldValue = {
  lead_field_id?: number
  value?: string | null
  [key: string]: any
}
```

---

## Usage Examples

### Complete Page Implementation

```tsx
// app/leads/page.tsx

import { LeadsTableWithFilters } from "@/components/leads/leads-table-with-filters"
import { AddLeadButton } from "@/components/leads/add-lead-button"
import prisma from "@/lib/prisma"

export default async function LeadsPage() {
  const [leads, leadFields] = await Promise.all([
    prisma.leads.findMany({
      include: {
        lead_field_values: {
          include: { lead_fields: true }
        }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.lead_fields.findMany({
      where: { is_active: true },
      include: { lead_field_options: true },
      orderBy: { sort_order: 'asc' }
    })
  ])

  // Serialize BigInt
  const serializedLeads = leads.map(lead => ({
    ...lead,
    id: Number(lead.id),
    lead_field_values: lead.lead_field_values.map(fv => ({
      ...fv,
      id: Number(fv.id),
      lead_id: Number(fv.lead_id),
      lead_field_id: Number(fv.lead_field_id)
    }))
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-600 mt-1">Manage your sales pipeline</p>
        </div>
        <AddLeadButton />
      </div>

      <LeadsTableWithFilters
        leads={serializedLeads}
        leadFields={leadFields}
      />
    </div>
  )
}
```

---

## Best Practices

1. **BigInt Serialization:** Always convert BigInt to Number before passing to client components
2. **Type Safety:** Use TypeScript interfaces for all props
3. **State Management:** Separate React Hook Form (static fields) from local state (dynamic fields)
4. **Error Handling:** Try-catch with user-friendly messages
5. **Router Refresh:** Call `router.refresh()` after mutations

---

## Further Reading

For comprehensive component documentation including:
- Detailed prop specifications
- All event handler implementations
- Complete state management patterns
- Testing examples

**See:** [Investors Components Documentation](../investors/COMPONENTS.md)

(All patterns apply to Leads with `investor` → `lead` substitutions)

---

[← Back to README](./README.md)

**Last Updated:** 2025-01-04
**Version:** 1.0.0
