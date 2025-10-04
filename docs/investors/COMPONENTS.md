# Investors Module - Component Documentation

> Comprehensive technical documentation for all investor-related React components

**Last Updated:** 2025-10-04
**Module Path:** `/components/investors/`

---

## Table of Contents

1. [Component Hierarchy](#component-hierarchy)
2. [Core Components](#core-components)
   - [InvestorFormClient](#investorformclient)
   - [InvestorsTableWithFilters](#investorstablewithfilters)
   - [InvestorDetailView](#investordetailview)
   - [InvestorEditHero](#investoredithero)
3. [Helper Components](#helper-components)
   - [InvestorsTable](#investorstable)
   - [AddInvestorButton](#addinvestorbutton)
   - [InvestorFormProgress](#investorformprogress)
   - [InvestorFormHeader](#investorformheader)
   - [DeleteInvestorDialog](#deleteinvestordialog)
4. [TypeScript Interfaces](#typescript-interfaces)
5. [State Management Patterns](#state-management-patterns)
6. [Event Handlers](#event-handlers)
7. [Usage Examples](#usage-examples)

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Investors Page (/investors)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              InvestorsTableWithFilters                     │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                InvestorsTable                        │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │         DeleteInvestorDialog                   │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              AddInvestorButton                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│             Investor Detail Page (/investors/[id])              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              InvestorDetailView                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     Hero Header (Emerald Gradient)                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     Tabbed Interface (Details | Activity)            │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     Assign User Dialog                               │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     AddActivityDialog                                │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│       Investor Create/Edit Page (/investors/new|[id]/edit)      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              InvestorFormClient                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     InvestorEditHero (Edit mode only)                │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     CollapsibleSection (Contact Info)                │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     CollapsibleSection (Dynamic Fields)              │  │  │
│  │  │       → InvestorDynamicField (multiple)              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │     Sidebar: InvestorFormProgress                    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### InvestorFormClient

**File:** `components/investors/investor-form-client.tsx`
**Purpose:** Main form component for creating and editing investors with dynamic custom fields

#### Props Interface

```typescript
interface InvestorFormClientProps {
  investor?: Investor          // Optional, only provided in edit mode
  customFields: CustomField[]  // Dynamic fields from investor_fields table
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
  investor_field_options?: Array<{
    id: number
    value: string
    label: string
  }>
}
```

#### State Management

```typescript
// Form state (React Hook Form)
const form = useForm<InvestorFormValues>({
  resolver: zodResolver(investorSchema),
  defaultValues: investor ? {
    full_name: investor.full_name,
    email: investor.email,
    phone: investor.phone || "",
  } : {
    full_name: "",
    email: "",
    phone: "",
  }
})

// Custom fields state (local state)
const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(() => {
  // Initialize from investor.investor_field_values if editing
  // Parse JSON for multiselect fields
  // Fallback to system fields (status, priority, source)
})

// Form sections configuration
const [formSections, setFormSections] = useState<FormSection[]>([])

// Submission state
const [isSubmitting, setIsSubmitting] = useState(false)
```

#### Form Completion Tracking

```typescript
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
```

#### Submit Handler

```typescript
const onSubmit = async (values: InvestorFormValues) => {
  setIsSubmitting(true)

  const payload = {
    ...values,
    customFields: customFieldValues,
  }

  const url = investor ? `/api/investors/${investor.id}` : "/api/investors"
  const method = investor ? "PUT" : "POST"

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  // Navigate to /investors on success
  router.push("/investors")
  router.refresh()
}
```

#### Usage Example

```tsx
// In app/investors/new/page.tsx or app/investors/[id]/edit/page.tsx

import { InvestorFormClient } from "@/components/investors/investor-form-client"
import prisma from "@/lib/prisma"

export default async function InvestorFormPage({ params }) {
  const investor = params?.id
    ? await prisma.investors.findUnique({
        where: { id: parseInt(params.id) },
        include: { investor_field_values: true }
      })
    : undefined

  const customFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: 'asc' }
  })

  return (
    <InvestorFormClient
      investor={investor}
      customFields={customFields}
    />
  )
}
```

---

### InvestorsTableWithFilters

**File:** `components/investors/investors-table-with-filters.tsx`
**Purpose:** Filterable investor list with search and custom field filters

#### Props Interface

```typescript
interface InvestorsTableWithFiltersProps {
  investors: Investor[]
  investorFields: InvestorField[]
  activeUsers: User[]
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

type User = {
  id: number
  name: string | null
  email: string
}
```

#### State Management

```typescript
// Search state
const [searchTerm, setSearchTerm] = useState("")

// Filter state (dynamic, based on available fields)
const [filters, setFilters] = useState<Record<string, string>>({})
// Example: { source: "website", status: "active", assigned_user: "123" }
```

#### Filter Logic

```typescript
// Get filterable custom fields (select/multiselect types only)
const filterableCustomFields = useMemo(() => {
  return investorFields.filter(
    (field) =>
      (field.type === "select" ||
       field.type === "multiselect" ||
       field.type === "multiselect_dropdown") &&
      !["source", "status", "priority"].includes(field.name) &&
      field.investor_field_options.length > 0
  )
}, [investorFields])

// Apply filters
const filteredInvestors = useMemo(() => {
  let result = investors

  // Search filter (name, email, phone)
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase()
    result = result.filter(
      (investor) =>
        investor.full_name.toLowerCase().includes(searchLower) ||
        investor.email.toLowerCase().includes(searchLower) ||
        (investor.phone && investor.phone.includes(searchTerm))
    )
  }

  // System field filters (source, status, priority, assigned_user)
  Object.entries(filters).forEach(([fieldName, filterValue]) => {
    if (!filterValue || filterValue === "all") return

    result = result.filter((investor) => {
      if (fieldName === "source") return investor.source === filterValue
      if (fieldName === "status") return investor.status === filterValue
      if (fieldName === "priority") return investor.priority === filterValue

      // Assigned user filter
      if (fieldName === "assigned_user") {
        if (filterValue === "unassigned") {
          return !investor.assignedUser
        }
        return investor.assignedUser?.id === parseInt(filterValue)
      }

      // Custom fields
      const fieldValue = investor.investor_field_values?.find(
        (fv) => fv.investor_fields.name === fieldName
      )

      if (!fieldValue?.value) return false

      // Handle multiselect
      if (Array.isArray(fieldValue.value)) {
        return fieldValue.value.includes(filterValue)
      }

      return fieldValue.value === filterValue
    })
  })

  return result
}, [investors, searchTerm, filters])
```

#### Event Handlers

```typescript
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
```

#### Usage Example

```tsx
// In app/investors/page.tsx

import { InvestorsTableWithFilters } from "@/components/investors/investors-table-with-filters"

export default async function InvestorsPage() {
  const investors = await prisma.investors.findMany({
    include: {
      investor_field_values: {
        include: { investor_fields: true }
      },
      assignedUser: {
        include: { user: true }
      }
    }
  })

  const investorFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true }
  })

  const activeUsers = await prisma.users.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, email: true }
  })

  return (
    <InvestorsTableWithFilters
      investors={investors}
      investorFields={investorFields}
      activeUsers={activeUsers}
    />
  )
}
```

---

### InvestorDetailView

**File:** `components/investors/investor-detail-view.tsx`
**Purpose:** Detailed investor view with tabs, user assignment, and activity timeline

#### Props Interface

```typescript
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

    // Relations
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
```

#### State Management

```typescript
// Dialog states
const [deleteOpen, setDeleteOpen] = useState(false)
const [addActivityOpen, setAddActivityOpen] = useState(false)
const [assignDialogOpen, setAssignDialogOpen] = useState(false)

// Assignment state
const [selectedUserId, setSelectedUserId] = useState<string>("")
const [assigning, setAssigning] = useState(false)

// Deletion state
const [deleting, setDeleting] = useState(false)
```

#### User Assignment Handler

```typescript
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
```

#### Dynamic Field Display

```typescript
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
```

#### Section-Based Rendering

```typescript
// Render dynamic sections from investor_form_sections
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

  return (
    <Card key={section.id} className="border-gray-200 shadow-sm">
      <CardHeader className={`${gradientClass} border-b border-gray-200`}>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SectionIcon className="h-5 w-5 text-teal-600" />
          {section.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Render fields */}
      </CardContent>
    </Card>
  )
})}
```

#### Usage Example

```tsx
// In app/investors/[id]/page.tsx

import { InvestorDetailView } from "@/components/investors/investor-detail-view"

export default async function InvestorDetailPage({ params }) {
  const investor = await prisma.investors.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      investor_field_values: {
        include: {
          investor_fields: {
            include: { investor_field_options: true }
          }
        }
      },
      activities: true,
      assignedUser: {
        include: {
          user: true,
          assigned_by_user: true
        }
      }
    }
  })

  const allFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true }
  })

  const formSections = await prisma.investor_form_sections.findMany({
    where: { is_visible: true },
    orderBy: { sort_order: 'asc' }
  })

  const activityTypes = await prisma.activity_types.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' }
  })

  const activeUsers = await prisma.users.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, email: true }
  })

  return (
    <InvestorDetailView
      investor={{
        ...investor,
        allFields,
        formSections,
        activityTypes,
        activeUsers
      }}
    />
  )
}
```

---

### InvestorEditHero

**File:** `components/investors/investor-edit-hero.tsx`
**Purpose:** Modern hero header for investor edit mode with gradient background

#### Props Interface

```typescript
interface InvestorEditHeroProps {
  investor: {
    id: number
    full_name: string
    email: string
    phone: string | null
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

#### Design Features

- **Emerald Gradient Background:** `bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700`
- **Grid Pattern Overlay:** Semi-transparent white grid with gradient mask
- **Large Avatar:** 24x24 (96px) with initials, white/20 border
- **Status & Priority Badges:** Prominent display with configured colors
- **Action Buttons:** Save and Cancel with appropriate styling
- **Editing Badge:** White/20 background indicating edit mode

#### Status & Priority Configuration

```typescript
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
```

#### Usage Example

```tsx
// Used within InvestorFormClient component

{investor && (
  <InvestorEditHero
    investor={investor}
    isSubmitting={isSubmitting}
    onSave={form.handleSubmit(onSubmit)}
    onCancel={handleCancel}
  />
)}
```

---

## Helper Components

### InvestorsTable

**File:** `components/investors/investors-table.tsx`
**Purpose:** Table display with stats cards and row actions

#### Features

- **Stats Cards:** Total, Active, Potential, Committed investors
- **Avatar Initials:** Green gradient circular avatars
- **Contact Actions:** Quick email, phone, WhatsApp links
- **Assigned User Display:** Avatar and name with emerald theme
- **Row Click Navigation:** Navigate to detail page
- **Dropdown Actions:** View, Edit, Delete with icons

#### Props

```typescript
interface InvestorsTableProps {
  investors: Investor[]
}

type Investor = InvestorListItem // From @/types/investor
```

---

### AddInvestorButton

**File:** `components/investors/add-investor-button.tsx`
**Purpose:** Styled button to navigate to create investor page

#### Features

- **Green Gradient:** `from-green-600 to-emerald-600`
- **Hover Effect:** Darker gradient on hover
- **Icon:** Plus icon from Lucide
- **Navigation:** Links to `/investors/new`

#### Usage

```tsx
import { AddInvestorButton } from "@/components/investors/add-investor-button"

<div className="flex justify-end">
  <AddInvestorButton />
</div>
```

---

### InvestorFormProgress

**File:** `components/investors/investor-form-progress.tsx`
**Purpose:** Visual progress bar showing form completion percentage

#### Props

```typescript
interface InvestorFormProgressProps {
  completedFields: number
  totalFields: number
  className?: string
}
```

#### Visual Design

- **Progress Bar:** Rounded full height 2px
- **Color Logic:**
  - 100% complete: Green gradient `from-green-500 to-emerald-500`
  - Incomplete: Orange gradient `from-[#FF7A59] to-[#FF9B82]`
- **Text:** Shows percentage and "X of Y fields completed"

#### Usage

```tsx
<InvestorFormProgress
  completedFields={completedFields.completed}
  totalFields={completedFields.total}
/>
```

---

### InvestorFormHeader

**File:** `components/investors/investor-form-header.tsx`
**Purpose:** Sticky header for investor forms (alternative to InvestorEditHero)

#### Props

```typescript
interface InvestorFormHeaderProps {
  isEditing: boolean
  investorName?: string
  isSubmitting: boolean
  onSave: () => void
  onCancel: () => void
  isSaved?: boolean
}
```

#### Features

- **Sticky Position:** `sticky top-0 z-50`
- **Back Button:** Navigate to `/investors`
- **Title:** "Edit Contact" or "Create Contact"
- **Save Indicator:** Green checkmark when `isSaved` is true
- **Action Buttons:** Cancel and Save with loading states

---

### DeleteInvestorDialog

**File:** `components/investors/delete-investor-dialog.tsx`
**Purpose:** Confirmation dialog for investor deletion

#### Props

```typescript
interface DeleteInvestorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investorId: string
  investorName: string
}
```

#### Features

- **Alert Dialog:** Uses shadcn/ui AlertDialog
- **Confirmation:** Shows investor name in bold
- **Loading State:** Spinner during deletion
- **API Call:** DELETE `/api/investors/${investorId}`
- **Auto Refresh:** Calls `router.refresh()` on success

#### Usage

```tsx
const [deleteInvestor, setDeleteInvestor] = useState<{id: string; name: string} | null>(null)

<DeleteInvestorDialog
  open={!!deleteInvestor}
  onOpenChange={(open) => !open && setDeleteInvestor(null)}
  investorId={deleteInvestor?.id || ""}
  investorName={deleteInvestor?.name || ""}
/>
```

---

## TypeScript Interfaces

### Central Investor Type

**File:** `types/investor.ts`

```typescript
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
  assigned_to?: bigint | null | number
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
```

---

## State Management Patterns

### 1. Form State with React Hook Form

```typescript
// InvestorFormClient
const form = useForm<InvestorFormValues>({
  resolver: zodResolver(investorSchema),
  defaultValues: { /* ... */ }
})

// Watch for changes
const formValues = form.watch()

// Submit handler
const onSubmit = form.handleSubmit(async (values) => {
  // Handle submission
})
```

### 2. Custom Fields State

```typescript
// Separate state for dynamic fields (not in form schema)
const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})

// Update single field
setCustomFieldValues({
  ...customFieldValues,
  [fieldId]: newValue,
})

// Use in InvestorDynamicField
<InvestorDynamicField
  field={field}
  value={customFieldValues[field.id]}
  onChange={(value) =>
    setCustomFieldValues({
      ...customFieldValues,
      [field.id]: value,
    })
  }
/>
```

### 3. Filter State

```typescript
// InvestorsTableWithFilters
const [searchTerm, setSearchTerm] = useState("")
const [filters, setFilters] = useState<Record<string, string>>({})

// Derived state with useMemo
const filteredInvestors = useMemo(() => {
  // Apply search and filters
  return /* filtered result */
}, [investors, searchTerm, filters])
```

### 4. Dialog State

```typescript
// InvestorDetailView
const [deleteOpen, setDeleteOpen] = useState(false)
const [assignDialogOpen, setAssignDialogOpen] = useState(false)
const [selectedUserId, setSelectedUserId] = useState<string>("")

// Open with pre-selected value
const openAssignDialog = () => {
  setSelectedUserId(investor.assignedUser?.id.toString() || "")
  setAssignDialogOpen(true)
}
```

---

## Event Handlers

### 1. Form Submission

```typescript
// InvestorFormClient
const onSubmit = async (values: InvestorFormValues) => {
  try {
    setIsSubmitting(true)

    const payload = {
      ...values,
      customFields: customFieldValues,
    }

    const url = investor ? `/api/investors/${investor.id}` : "/api/investors"
    const method = investor ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || error.error || "Failed to save investor")
    }

    router.push("/investors")
    router.refresh()
  } catch (error: any) {
    alert(error.message || "Failed to save investor")
  } finally {
    setIsSubmitting(false)
  }
}
```

### 2. Filter Change

```typescript
// InvestorsTableWithFilters
const handleFilterChange = (fieldName: string, value: string) => {
  setFilters((prev) => ({
    ...prev,
    [fieldName]: value,
  }))
}

// Usage in Select
<Select
  value={filters.source || "all"}
  onValueChange={(v) => handleFilterChange("source", v)}
>
  {/* options */}
</Select>
```

### 3. User Assignment

```typescript
// InvestorDetailView
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

    if (!res.ok) throw new Error("Failed to assign user")

    toast.success("User assigned successfully")
    setAssignDialogOpen(false)
    router.refresh()
  } catch (error: any) {
    toast.error(error.message)
  } finally {
    setAssigning(false)
  }
}
```

### 4. Delete Confirmation

```typescript
// InvestorDetailView
const handleDelete = async () => {
  setDeleting(true)
  try {
    const res = await fetch(`/api/investors/${investor.id}`, {
      method: "DELETE",
    })

    if (!res.ok) throw new Error("Failed to delete investor")

    toast.success("Investor deleted successfully")
    router.push("/investors")
    router.refresh()
  } catch (error) {
    toast.error("Failed to delete investor")
    setDeleting(false)
  }
}
```

### 5. Row Click Navigation

```typescript
// InvestorsTable
<TableRow
  className="cursor-pointer hover:bg-blue-50 transition-colors"
  onClick={() => router.push(`/investors/${investor.id}`)}
>
  {/* cells */}
</TableRow>

// Prevent propagation for action buttons
<Button onClick={(e) => {
  e.stopPropagation()
  // handle action
}}>
  Delete
</Button>
```

---

## Usage Examples

### Complete Page Implementation

#### 1. Investors List Page

```tsx
// app/investors/page.tsx

import { InvestorsTableWithFilters } from "@/components/investors/investors-table-with-filters"
import { AddInvestorButton } from "@/components/investors/add-investor-button"
import prisma from "@/lib/prisma"

export default async function InvestorsPage() {
  // Fetch investors with relations
  const investors = await prisma.investors.findMany({
    include: {
      investor_field_values: {
        include: {
          investor_fields: {
            include: { investor_field_options: true }
          }
        }
      },
      assignedUser: {
        include: { user: true }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  // Fetch filterable fields
  const investorFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: 'asc' }
  })

  // Fetch active users for assignment filter
  const activeUsers = await prisma.users.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, email: true }
  })

  // Serialize BigInt fields
  const serializedInvestors = investors.map(investor => ({
    ...investor,
    id: Number(investor.id),
    investor_field_values: investor.investor_field_values?.map(fv => ({
      ...fv,
      id: Number(fv.id),
      investor_id: Number(fv.investor_id),
      investor_field_id: Number(fv.investor_field_id),
    }))
  }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-600 mt-1">Manage your investor relationships</p>
        </div>
        <AddInvestorButton />
      </div>

      <InvestorsTableWithFilters
        investors={serializedInvestors}
        investorFields={investorFields}
        activeUsers={activeUsers}
      />
    </div>
  )
}
```

#### 2. Investor Detail Page

```tsx
// app/investors/[id]/page.tsx

import { InvestorDetailView } from "@/components/investors/investor-detail-view"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function InvestorDetailPage({
  params
}: {
  params: { id: string }
}) {
  const investorId = parseInt(params.id)

  // Fetch investor with all relations
  const investor = await prisma.investors.findUnique({
    where: { id: investorId },
    include: {
      investor_field_values: {
        include: {
          investor_fields: {
            include: { investor_field_options: true }
          }
        }
      },
      activities: {
        orderBy: { created_at: 'desc' },
        take: 20
      },
      assignedUser: {
        include: {
          user: true,
          assigned_by_user: true
        }
      }
    }
  })

  if (!investor) notFound()

  // Fetch all fields for display
  const allFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: 'asc' }
  })

  // Fetch form sections
  const formSections = await prisma.investor_form_sections.findMany({
    where: { is_visible: true },
    orderBy: { sort_order: 'asc' }
  })

  // Fetch activity types
  const activityTypes = await prisma.activity_types.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' }
  })

  // Fetch active users
  const activeUsers = await prisma.users.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, email: true }
  })

  // Serialize BigInt
  const serializedInvestor = {
    ...investor,
    id: Number(investor.id),
    customFieldValues: investor.investor_field_values.map(fv => ({
      ...fv,
      id: Number(fv.id),
      investor_id: Number(fv.investor_id),
      investor_field_id: Number(fv.investor_field_id),
    })),
    allFields,
    formSections,
    activityTypes,
    activeUsers,
    assignedUser: investor.assignedUser ? {
      id: Number(investor.assignedUser.user_id),
      name: investor.assignedUser.user.name,
      email: investor.assignedUser.user.email,
      assigned_at: investor.assignedUser.assigned_at,
      assigned_by: {
        id: Number(investor.assignedUser.assigned_by),
        name: investor.assignedUser.assigned_by_user.name
      }
    } : null
  }

  return <InvestorDetailView investor={serializedInvestor} />
}
```

#### 3. Investor Edit Page

```tsx
// app/investors/[id]/edit/page.tsx

import { InvestorFormClient } from "@/components/investors/investor-form-client"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function InvestorEditPage({
  params
}: {
  params: { id: string }
}) {
  const investorId = parseInt(params.id)

  // Fetch investor with field values
  const investor = await prisma.investors.findUnique({
    where: { id: investorId },
    include: {
      investor_field_values: {
        include: {
          investor_fields: true
        }
      }
    }
  })

  if (!investor) notFound()

  // Fetch custom fields
  const customFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: 'asc' }
  })

  // Serialize
  const serializedInvestor = {
    ...investor,
    id: Number(investor.id),
    investor_field_values: investor.investor_field_values.map(fv => ({
      ...fv,
      id: Number(fv.id),
      investor_id: Number(fv.investor_id),
      investor_field_id: Number(fv.investor_field_id),
    }))
  }

  return (
    <InvestorFormClient
      investor={serializedInvestor}
      customFields={customFields}
    />
  )
}
```

#### 4. Create Investor Page

```tsx
// app/investors/new/page.tsx

import { InvestorFormClient } from "@/components/investors/investor-form-client"
import prisma from "@/lib/prisma"

export default async function CreateInvestorPage() {
  // Fetch custom fields
  const customFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: 'asc' }
  })

  return (
    <InvestorFormClient customFields={customFields} />
  )
}
```

---

## Design Patterns & Best Practices

### 1. Color Theming

**Investors Module Theme:** Emerald/Green/Teal

```css
/* Primary gradients */
bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700
bg-gradient-to-r from-emerald-50 to-teal-50
bg-gradient-to-r from-green-600 to-emerald-600

/* Badge colors */
bg-emerald-100 text-emerald-700 border-emerald-200

/* Button colors */
bg-emerald-600 hover:bg-emerald-700
```

### 2. Data Fetching

- **Server Components:** All data fetching in page components
- **Prisma Includes:** Fetch relations upfront to avoid N+1 queries
- **BigInt Serialization:** Convert to Number before passing to client components

### 3. Form Handling

- **React Hook Form:** For static/required fields
- **Local State:** For dynamic custom fields
- **Validation:** Zod schema for type safety
- **Error Handling:** Try-catch with user-friendly messages

### 4. State Updates

- **Router Refresh:** Call after mutations to revalidate server data
- **Optimistic Updates:** Not implemented (uses full refresh)
- **Toast Notifications:** Sonner for success/error feedback

### 5. Type Safety

- **Central Types:** Use `@/types/investor` for consistency
- **Flexible Types:** Include `[key: string]: any` for Prisma flexibility
- **Interface Extensions:** Extend base types in components as needed

---

## API Routes Reference

### Investor CRUD

```typescript
// GET /api/investors - List all investors
// POST /api/investors - Create investor
// GET /api/investors/[id] - Get single investor
// PUT /api/investors/[id] - Update investor
// PATCH /api/investors/[id] - Assign user (partial update)
// DELETE /api/investors/[id] - Delete investor
```

### Request/Response Examples

```typescript
// POST/PUT /api/investors
{
  full_name: string
  email: string
  phone: string
  customFields: {
    [fieldId: string]: any
  }
}

// PATCH /api/investors/[id] - User assignment
{
  user_id: number | null
}

// Response
{
  id: number
  full_name: string
  email: string
  // ... other fields
}
```

---

## Migration Guide

### From Old to New Structure

If migrating from a different investor structure:

1. **Update Prisma Schema:** Ensure `investors` table has all required fields
2. **Create investor_fields:** Set up dynamic field definitions
3. **Migrate Data:** Move old custom fields to investor_field_values
4. **Update Components:** Replace old components with new ones
5. **Test Thoroughly:** Especially multiselect and user assignment features

---

## Troubleshooting

### Common Issues

1. **BigInt Serialization Error**
   - Symptom: "BigInt cannot be serialized to JSON"
   - Solution: Convert to Number before passing to client components

2. **Multiselect Not Displaying**
   - Symptom: Shows as string instead of badges
   - Solution: Check JSON parsing in customFieldValues initialization

3. **User Assignment Not Working**
   - Symptom: Assignment dialog doesn't update
   - Solution: Ensure router.refresh() is called after PATCH

4. **Form Sections Not Rendering**
   - Symptom: Dynamic sections missing
   - Solution: Check investor_form_sections are fetched and passed to component

---

## Performance Considerations

1. **Memoization:** Use `useMemo` for filtered lists and computed values
2. **Lazy Loading:** Consider pagination for large investor lists
3. **Optimistic Updates:** Could be added to improve perceived performance
4. **Index Database:** Ensure indexes on frequently filtered columns
5. **Image Optimization:** Use Next.js Image for avatars if using photos

---

## Future Enhancements

1. **Bulk Operations:** Multi-select and batch actions
2. **Export/Import:** CSV/Excel support
3. **Advanced Filtering:** Date ranges, complex queries
4. **Kanban View:** Drag-and-drop status changes
5. **Real-time Updates:** WebSocket for live data
6. **Mobile App:** React Native version
7. **Email Integration:** Send emails directly from app
8. **Document Attachments:** File upload support
9. **Audit Trail:** Track all changes with history
10. **Advanced Analytics:** Charts and insights

---

**Documentation Version:** 1.0.0
**Last Reviewed:** 2025-10-04
**Maintained By:** Development Team
