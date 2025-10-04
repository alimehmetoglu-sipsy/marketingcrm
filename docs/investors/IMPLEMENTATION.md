# Investor System - Implementation Guide

> Complete implementation guide for the Marketing CRM Investor Management System

## Table of Contents

- [Overview](#overview)
- [Data Flow Architecture](#data-flow-architecture)
- [CRUD Operations](#crud-operations)
- [User Assignment System](#user-assignment-system)
- [Dynamic Fields System](#dynamic-fields-system)
- [Filtering & Search](#filtering--search)
- [Activity Integration](#activity-integration)
- [Best Practices](#best-practices)
- [Advanced Examples](#advanced-examples)
- [Error Handling](#error-handling)

---

## Overview

The Investor System is a comprehensive CRM solution for managing investor relationships with:

- ✅ **Dynamic Custom Fields** - Unlimited custom fields per investor
- ✅ **User Assignment** - Assign investors to team members
- ✅ **Activity Tracking** - Complete timeline of interactions
- ✅ **Advanced Filtering** - Multi-field filtering with search
- ✅ **Form Sections** - Organized field grouping with drag & drop

### Core Technologies

```typescript
// Frontend Stack
Next.js 15.5.4          // App Router + Server Components
React 19.1.0            // UI Library
TypeScript 5.x          // Type Safety
Tailwind CSS 4.x        // Styling
shadcn/ui               // Component Library

// Backend Stack
Prisma 6.16.3           // ORM
MySQL 8.0               // Database
NextAuth 5.0.0-beta.29  // Authentication
```

---

## Data Flow Architecture

### System Architecture (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Investor List│  │ Investor Form│  │  Investor Detail     │ │
│  │   /investors │  │ /investors/  │  │  /investors/[id]     │ │
│  │              │  │   new/[id]   │  │                      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                      │             │
└─────────┼─────────────────┼──────────────────────┼─────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  GET    /api/investors          → List all investors    │  │
│  │  POST   /api/investors          → Create investor       │  │
│  │  GET    /api/investors/[id]     → Get single investor   │  │
│  │  PUT    /api/investors/[id]     → Update investor       │  │
│  │  PATCH  /api/investors/[id]     → Assign user           │  │
│  │  DELETE /api/investors/[id]     → Delete investor       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (MySQL)                     │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │    investors     │  │ investor_fields  │  │  activities  │ │
│  │  (Core Table)    │  │ (Field Metadata) │  │  (Timeline)  │ │
│  │                  │  │                  │  │              │ │
│  │ • id             │  │ • id             │  │ • id         │ │
│  │ • full_name      │  │ • name           │  │ • investor_id│ │
│  │ • email          │  │ • label          │  │ • type       │ │
│  │ • phone (unique) │  │ • type           │  │ • subject    │ │
│  │ • source         │  │ • is_required    │  │ • status     │ │
│  │ • status         │  │ • section_key    │  │ • created_at │ │
│  │ • priority       │  │ • sort_order     │  └──────────────┘ │
│  │ • notes          │  └──────────────────┘                   │
│  │ • created_at     │                                         │
│  └────────┬─────────┘                                         │
│           │                                                   │
│           │  ┌─────────────────────────┐  ┌───────────────┐ │
│           └──│ investor_field_values   │  │user_assignments│
│              │ (Dynamic Field Values)  │  │(User Assign)  │ │
│              │                         │  │               │ │
│              │ • id                    │  │ • id          │ │
│              │ • investor_id (FK)      │  │ • user_id     │ │
│              │ • investor_field_id (FK)│  │ • entity_type │ │
│              │ • value (TEXT/JSON)     │  │ • entity_id   │ │
│              │ • created_at            │  │ • assigned_by │ │
│              └─────────────────────────┘  └───────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │        investor_form_sections (Form Layout)            │  │
│  │                                                        │  │
│  │  • id, section_key, name                              │  │
│  │  • is_visible, is_default_open                        │  │
│  │  • sort_order, icon, gradient                         │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → Client Component → API Route → Prisma ORM → MySQL Database
                                                  ↓
                                            Response JSON
                                                  ↓
                                           Client Update → UI Render
```

---

## CRUD Operations

### 1. CREATE - Add New Investor

#### Frontend Implementation

```typescript
// /app/(dashboard)/investors/new/page.tsx
import { InvestorFormClient } from "@/components/investors/investor-form-client"

export default async function NewInvestorPage() {
  // Fetch dynamic fields configuration
  const fields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: "asc" }
  })

  return <InvestorFormClient customFields={fields} />
}
```

#### API Endpoint

```typescript
// POST /api/investors/route.ts
export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { customFields, ...investorData } = body

  // 1. Validate required fields
  const requiredFields = await prisma.investor_fields.findMany({
    where: { is_required: true, is_active: true }
  })

  const missingFields = []
  for (const field of requiredFields) {
    if (!customFields?.[field.id.toString()]) {
      missingFields.push(field.label)
    }
  }

  if (missingFields.length > 0) {
    return NextResponse.json({
      error: "Required fields missing",
      missingFields
    }, { status: 400 })
  }

  // 2. Check unique phone constraint
  if (investorData.phone) {
    const exists = await prisma.investors.findUnique({
      where: { phone: investorData.phone }
    })
    if (exists) {
      return NextResponse.json({
        error: "Phone number already exists"
      }, { status: 400 })
    }
  }

  // 3. Create investor record
  const investor = await prisma.investors.create({
    data: {
      full_name: investorData.full_name,
      email: investorData.email,
      phone: investorData.phone || null,
      source: customFields?.["1"] || "referral", // Field ID for source
      status: customFields?.["2"] || "potential", // Field ID for status
      priority: customFields?.["3"] || null,      // Field ID for priority
      created_at: new Date(),
      updated_at: new Date()
    }
  })

  // 4. Save custom field values
  if (customFields) {
    const fieldValues = Object.entries(customFields)
      .filter(([_, value]) => value !== null && value !== "")
      .map(([fieldId, value]) => ({
        investor_id: investor.id,
        investor_field_id: BigInt(fieldId),
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
        created_at: new Date()
      }))

    await prisma.investor_field_values.createMany({
      data: fieldValues
    })
  }

  return NextResponse.json({ ...investor, id: Number(investor.id) }, { status: 201 })
}
```

#### Client Component

```typescript
// components/investors/investor-form-client.tsx
"use client"

export function InvestorFormClient({ customFields, investor }) {
  const [customFieldValues, setCustomFieldValues] = useState({})
  const form = useForm({
    defaultValues: {
      full_name: investor?.full_name || "",
      email: investor?.email || "",
      phone: investor?.phone || ""
    }
  })

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      customFields: customFieldValues
    }

    const response = await fetch("/api/investors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      toast.error(error.error || "Failed to create investor")
      return
    }

    toast.success("Investor created successfully")
    router.push("/investors")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Static contact fields */}
        <FormField name="full_name" ... />
        <FormField name="email" ... />
        <FormField name="phone" ... />

        {/* Dynamic custom fields */}
        {customFields.map(field => (
          <InvestorDynamicField
            key={field.id}
            field={field}
            value={customFieldValues[field.id]}
            onChange={(value) =>
              setCustomFieldValues(prev => ({ ...prev, [field.id]: value }))
            }
          />
        ))}

        <Button type="submit">Save Investor</Button>
      </form>
    </Form>
  )
}
```

**✅ Good Practice:**

```typescript
// Validate before submit
const validateForm = () => {
  const errors = []

  // Check required static fields
  if (!values.full_name) errors.push("Full name is required")
  if (!values.email) errors.push("Email is required")

  // Check required custom fields
  requiredFields.forEach(field => {
    if (!customFieldValues[field.id]) {
      errors.push(`${field.label} is required`)
    }
  })

  return errors
}
```

**❌ Bad Practice:**

```typescript
// Don't skip validation
const onSubmit = async (values) => {
  // ❌ Directly sending without validation
  await fetch("/api/investors", {
    method: "POST",
    body: JSON.stringify(values) // Missing customFields!
  })
}
```

---

### 2. READ - Fetch Investor(s)

#### List All Investors

```typescript
// GET /api/investors
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const investors = await prisma.investors.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    include: {
      investor_field_values: {
        include: {
          investor_fields: {
            include: { investor_field_options: true }
          }
        }
      }
    }
  })

  // Convert BigInt to number for JSON serialization
  return NextResponse.json(
    investors.map(inv => ({
      ...inv,
      id: Number(inv.id),
      lead_id: inv.lead_id ? Number(inv.lead_id) : null
    }))
  )
}
```

#### Get Single Investor with Full Details

```typescript
// GET /api/investors/[id]
export async function GET(request: Request, { params }) {
  const { id } = await params

  const investor = await prisma.investors.findUnique({
    where: { id: BigInt(id) },
    include: {
      investor_field_values: {
        include: {
          investor_fields: {
            include: { investor_field_options: true }
          }
        }
      },
      activities: {
        orderBy: { created_at: "desc" },
        take: 50
      }
    }
  })

  if (!investor) {
    return NextResponse.json({ error: "Investor not found" }, { status: 404 })
  }

  // Get assigned user
  const assignment = await prisma.user_assignments.findFirst({
    where: {
      entity_type: "investor",
      entity_id: BigInt(id)
    },
    include: {
      user_assigned: { select: { id: true, name: true, email: true } },
      user_assigner: { select: { id: true, name: true } }
    }
  })

  return NextResponse.json({
    ...investor,
    id: Number(investor.id),
    assigned_user: assignment ? {
      id: Number(assignment.user_assigned.id),
      name: assignment.user_assigned.name,
      email: assignment.user_assigned.email,
      assigned_at: assignment.assigned_at,
      assigned_by: {
        id: Number(assignment.user_assigner.id),
        name: assignment.user_assigner.name
      }
    } : null
  })
}
```

#### Server Component for Investor Detail

```typescript
// /app/(dashboard)/investors/[id]/page.tsx
export default async function InvestorDetailPage({ params }) {
  const { id } = await params

  // Fetch investor with all relations
  const investor = await prisma.investors.findUnique({
    where: { id: BigInt(id) },
    include: {
      investor_field_values: {
        include: {
          investor_fields: {
            include: { investor_field_options: true }
          }
        }
      },
      activities: {
        orderBy: { created_at: "desc" }
      }
    }
  })

  // Fetch form sections for organized display
  const formSections = await prisma.investor_form_sections.findMany({
    where: { is_visible: true },
    orderBy: { sort_order: "asc" }
  })

  // Fetch all fields metadata
  const allFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: { investor_field_options: true },
    orderBy: { sort_order: "asc" }
  })

  // Fetch active users for assignment dropdown
  const activeUsers = await prisma.users.findMany({
    where: { status: "active" },
    select: { id: true, name: true, email: true }
  })

  return (
    <InvestorDetailView
      investor={{
        ...investor,
        id: Number(investor.id),
        customFieldValues: investor.investor_field_values,
        formSections,
        allFields,
        activeUsers
      }}
    />
  )
}
```

**✅ Good Practice:**

```typescript
// Include all necessary relations
const investor = await prisma.investors.findUnique({
  where: { id: BigInt(id) },
  include: {
    investor_field_values: {
      include: { investor_fields: true }
    },
    activities: true
  }
})

// Handle BigInt serialization
return { ...investor, id: Number(investor.id) }
```

**❌ Bad Practice:**

```typescript
// ❌ Missing includes - leads to N+1 queries
const investor = await prisma.investors.findUnique({
  where: { id: BigInt(id) }
})

// ❌ Then fetching related data in separate queries
const fieldValues = await prisma.investor_field_values.findMany({
  where: { investor_id: investor.id }
})
```

---

### 3. UPDATE - Edit Investor

#### API Endpoint

```typescript
// PUT /api/investors/[id]
export async function PUT(request: Request, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { customFields, ...investorData } = body

  // Get system field definitions
  const systemFields = await prisma.investor_fields.findMany({
    where: { name: { in: ['source', 'status', 'priority'] } }
  })

  const sourceField = systemFields.find(f => f.name === 'source')
  const statusField = systemFields.find(f => f.name === 'status')
  const priorityField = systemFields.find(f => f.name === 'priority')

  // Prepare update data
  const updateData = {
    full_name: investorData.full_name,
    email: investorData.email,
    phone: investorData.phone,
    source: customFields?.[sourceField?.id.toString()] || investorData.source,
    status: customFields?.[statusField?.id.toString()] || investorData.status,
    priority: customFields?.[priorityField?.id.toString()] || investorData.priority || null,
    notes: investorData.notes,
    updated_at: new Date()
  }

  // Update investor
  const investor = await prisma.investors.update({
    where: { id: BigInt(id) },
    data: updateData
  })

  // Update custom field values
  if (customFields) {
    // Delete existing values
    await prisma.investor_field_values.deleteMany({
      where: { investor_id: BigInt(id) }
    })

    // Insert new values (excluding system fields)
    const systemFieldIds = [
      sourceField?.id.toString(),
      statusField?.id.toString(),
      priorityField?.id.toString()
    ].filter(Boolean)

    const fieldValues = Object.entries(customFields)
      .filter(([key, value]) => {
        return !systemFieldIds.includes(key) &&
               value !== null &&
               value !== "" &&
               !isNaN(parseInt(key))
      })
      .map(([fieldId, value]) => ({
        investor_id: BigInt(id),
        investor_field_id: parseInt(fieldId),
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
        created_at: new Date()
      }))

    if (fieldValues.length > 0) {
      await prisma.investor_field_values.createMany({
        data: fieldValues
      })
    }
  }

  return NextResponse.json({
    ...investor,
    id: Number(investor.id)
  })
}
```

#### Edit Page

```typescript
// /app/(dashboard)/investors/[id]/edit/page.tsx
export default async function EditInvestorPage({ params }) {
  const { id } = await params

  const [investor, fields] = await Promise.all([
    prisma.investors.findUnique({
      where: { id: BigInt(id) },
      include: {
        investor_field_values: {
          include: { investor_fields: true }
        }
      }
    }),
    prisma.investor_fields.findMany({
      where: { is_active: true },
      include: { investor_field_options: true },
      orderBy: { sort_order: "asc" }
    })
  ])

  return (
    <InvestorFormClient
      investor={{
        ...investor,
        id: Number(investor.id)
      }}
      customFields={fields}
    />
  )
}
```

**✅ Good Practice:**

```typescript
// Use transaction for data consistency
await prisma.$transaction(async (tx) => {
  // 1. Update investor
  await tx.investors.update({ where: { id }, data: updateData })

  // 2. Delete old field values
  await tx.investor_field_values.deleteMany({ where: { investor_id: id } })

  // 3. Insert new field values
  await tx.investor_field_values.createMany({ data: fieldValues })
})
```

**❌ Bad Practice:**

```typescript
// ❌ Don't update without proper field handling
await prisma.investors.update({
  where: { id },
  data: {
    ...body, // ❌ Might include unwanted fields
    customFields // ❌ Wrong - customFields not in schema
  }
})
```

---

### 4. DELETE - Remove Investor

#### API Endpoint

```typescript
// DELETE /api/investors/[id]
export async function DELETE(request: Request, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    // Cascade delete will handle:
    // - investor_field_values (via FK constraint)
    // - activities (via FK constraint)
    // - user_assignments (via FK constraint)
    await prisma.investors.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting investor:", error)
    return NextResponse.json({
      error: "Failed to delete investor"
    }, { status: 500 })
  }
}
```

#### Client-Side Delete Dialog

```typescript
// components/investors/delete-investor-dialog.tsx
"use client"

export function DeleteInvestorDialog({ investor, open, onOpenChange }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/investors/${investor.id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete investor")
      }

      toast.success("Investor deleted successfully")
      router.push("/investors")
      router.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Investor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {investor.full_name}?
            This action cannot be undone and will also delete:
            <ul className="list-disc list-inside mt-2">
              <li>All custom field values</li>
              <li>All activities and notes</li>
              <li>User assignments</li>
            </ul>
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
  )
}
```

**✅ Good Practice:**

```typescript
// Show confirmation with details
<AlertDialogDescription>
  This will delete:
  - Investor: {investor.full_name}
  - {investor.activities?.length || 0} activities
  - All custom field data
  - User assignments
</AlertDialogDescription>
```

**❌ Bad Practice:**

```typescript
// ❌ Direct delete without confirmation
const handleDelete = () => {
  fetch(`/api/investors/${id}`, { method: "DELETE" })
  router.push("/investors")
}
```

---

## User Assignment System

### Architecture

```
┌────────────────────────────────────────────────────────┐
│            user_assignments Table                      │
│                                                        │
│  user_id (FK) ──→ users.id (assigned person)          │
│  entity_type   ──→ "investor" | "lead"                │
│  entity_id (FK)──→ investors.id | leads.id            │
│  assigned_by (FK)→ users.id (who assigned)            │
│  assigned_at   ──→ timestamp                          │
│                                                        │
│  UNIQUE constraint: (user_id, entity_type, entity_id) │
└────────────────────────────────────────────────────────┘
```

### 1. Assign User to Investor

```typescript
// PATCH /api/investors/[id]
export async function PATCH(request: Request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { user_id } = await request.json()

  // Check investor exists
  const investor = await prisma.investors.findUnique({
    where: { id: BigInt(id) }
  })

  if (!investor) {
    return NextResponse.json({ error: "Investor not found" }, { status: 404 })
  }

  // Handle unassignment
  if (user_id === null) {
    await prisma.user_assignments.deleteMany({
      where: {
        entity_type: "investor",
        entity_id: BigInt(id)
      }
    })
    return NextResponse.json({ success: true, assigned_user: null })
  }

  // Validate user exists and is active
  const user = await prisma.users.findUnique({
    where: { id: BigInt(user_id) }
  })

  if (!user || user.status !== "active") {
    return NextResponse.json({
      error: "User not found or inactive"
    }, { status: 400 })
  }

  // Delete existing assignment
  await prisma.user_assignments.deleteMany({
    where: {
      entity_type: "investor",
      entity_id: BigInt(id)
    }
  })

  // Create new assignment
  const assignment = await prisma.user_assignments.create({
    data: {
      user_id: BigInt(user_id),
      entity_type: "investor",
      entity_id: BigInt(id),
      assigned_by: BigInt(session.user.id),
      assigned_at: new Date()
    },
    include: {
      user_assigned: {
        select: { id: true, name: true, email: true }
      },
      user_assigner: {
        select: { id: true, name: true }
      }
    }
  })

  return NextResponse.json({
    success: true,
    assigned_user: {
      id: Number(assignment.user_assigned.id),
      name: assignment.user_assigned.name,
      email: assignment.user_assigned.email,
      assigned_at: assignment.assigned_at,
      assigned_by: {
        id: Number(assignment.user_assigner.id),
        name: assignment.user_assigner.name
      }
    }
  })
}
```

### 2. Assignment UI Component

```typescript
// components/investors/assign-user-dialog.tsx
"use client"

export function AssignUserDialog({ investor, users, open, onOpenChange }) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [assigning, setAssigning] = useState(false)
  const router = useRouter()

  const handleAssign = async () => {
    setAssigning(true)

    try {
      const response = await fetch(`/api/investors/${investor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserId === "unassign" ? null : parseInt(selectedUserId)
        })
      })

      if (!response.ok) throw new Error("Failed to assign user")

      toast.success(
        selectedUserId === "unassign"
          ? "User unassigned successfully"
          : "User assigned successfully"
      )

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign User</DialogTitle>
          <DialogDescription>
            Assign {investor.full_name} to a team member
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select user..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassign">Unassign</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || assigning}>
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Display Assigned User

```typescript
// In investor detail view
{investor.assigned_user ? (
  <Card>
    <CardHeader>
      <CardTitle>Assigned To</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {investor.assigned_user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{investor.assigned_user.name}</p>
            <p className="text-sm text-gray-500">
              {investor.assigned_user.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Assigned {formatDistanceToNow(investor.assigned_user.assigned_at)} ago
              by {investor.assigned_user.assigned_by.name}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssignDialogOpen(true)}
        >
          Reassign
        </Button>
      </div>
    </CardContent>
  </Card>
) : (
  <Card>
    <CardContent className="p-6">
      <div className="text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 mb-3">Not assigned to anyone</p>
        <Button onClick={() => setAssignDialogOpen(true)}>
          Assign User
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

**✅ Good Practice:**

```typescript
// Track assignment history
const assignment = {
  user_id: userId,
  entity_type: "investor",
  entity_id: investorId,
  assigned_by: session.user.id,
  assigned_at: new Date()
}

// Show who assigned and when
<p className="text-xs text-gray-500">
  Assigned by {assignment.assigned_by.name} on {format(assignment.assigned_at, 'PPp')}
</p>
```

**❌ Bad Practice:**

```typescript
// ❌ Don't store user_id directly in investors table
await prisma.investors.update({
  where: { id },
  data: { assigned_user_id: userId } // ❌ Wrong approach
})

// ❌ Don't allow multiple assignments
await prisma.user_assignments.create({
  data: { /* ... */ }
}) // ❌ Could create duplicates without unique constraint
```

---

## Dynamic Fields System

### Field Types & Components

```typescript
// Field Type Enum
type FieldType =
  | "text"                    // Single-line text
  | "textarea"                // Multi-line text
  | "email"                   // Email input
  | "phone"                   // Phone with country code
  | "url"                     // URL input
  | "number"                  // Numeric input
  | "date"                    // Date picker
  | "select"                  // Single select dropdown
  | "multiselect"             // Multiple checkboxes
  | "multiselect_dropdown"    // Multiple select dropdown
```

### Dynamic Field Component

```typescript
// components/fields/investor-dynamic-field.tsx
"use client"

export function InvestorDynamicField({ field, value, onChange }) {
  // Text input
  if (field.type === "text" || field.type === "email" || field.type === "url") {
    return (
      <FormItem>
        <FormLabel>
          {field.label}
          {field.is_required && <span className="text-red-500">*</span>}
        </FormLabel>
        <Input
          type={field.type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
        />
        {field.help_text && (
          <FormDescription>{field.help_text}</FormDescription>
        )}
      </FormItem>
    )
  }

  // Textarea
  if (field.type === "textarea") {
    return (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          rows={4}
        />
      </FormItem>
    )
  }

  // Select dropdown
  if (field.type === "select") {
    return (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {field.investor_field_options?.map(option => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    )
  }

  // Multiselect (checkboxes)
  if (field.type === "multiselect") {
    const selectedValues = Array.isArray(value) ? value : []

    const handleToggle = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange(newValues)
    }

    return (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <div className="space-y-2">
          {field.investor_field_options?.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.id}-${option.id}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
              />
              <label
                htmlFor={`${field.id}-${option.id}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </FormItem>
    )
  }

  // Date picker
  if (field.type === "date") {
    return (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </FormItem>
    )
  }

  // Number input
  if (field.type === "number") {
    return (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
        />
      </FormItem>
    )
  }

  return null
}
```

### Field Value Storage

```typescript
// Storing multiselect values as JSON
const saveFieldValue = async (fieldId: number, value: any) => {
  const storedValue = typeof value === "object"
    ? JSON.stringify(value)  // ["value1", "value2"] → '["value1","value2"]'
    : String(value)           // "single_value" → "single_value"

  await prisma.investor_field_values.create({
    data: {
      investor_id: investorId,
      investor_field_id: fieldId,
      value: storedValue
    }
  })
}

// Reading multiselect values from JSON
const loadFieldValue = (fieldValue: string, fieldType: string) => {
  if (fieldType === "multiselect" || fieldType === "multiselect_dropdown") {
    try {
      return JSON.parse(fieldValue) // '["value1","value2"]' → ["value1", "value2"]
    } catch {
      return []
    }
  }
  return fieldValue
}
```

**✅ Good Practice:**

```typescript
// Validate field value based on type
const validateFieldValue = (field: Field, value: any) => {
  if (field.is_required && !value) {
    return `${field.label} is required`
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "Invalid email format"
    }
  }

  if (field.type === "url" && value) {
    try {
      new URL(value)
    } catch {
      return "Invalid URL format"
    }
  }

  return null
}
```

**❌ Bad Practice:**

```typescript
// ❌ Don't store arrays as comma-separated strings
const value = selectedOptions.join(",") // ❌ "option1,option2"

// ❌ This breaks if option contains comma
const parsed = value.split(",") // ["option1", "option2", "option3part1", "part2"]

// ✅ Use JSON instead
const value = JSON.stringify(selectedOptions) // '["option1","option2"]'
const parsed = JSON.parse(value) // ["option1", "option2"]
```

---

## Filtering & Search

### Filter Architecture

```typescript
// components/investors/investors-table-with-filters.tsx
export function InvestorsTableWithFilters({ investors, investorFields, activeUsers }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Get filterable fields (select/multiselect only)
  const filterableFields = investorFields.filter(
    field =>
      (field.type === "select" ||
       field.type === "multiselect" ||
       field.type === "multiselect_dropdown") &&
      !["source", "status", "priority"].includes(field.name) &&
      field.investor_field_options.length > 0
  )

  // Apply filters
  const filteredInvestors = useMemo(() => {
    let result = investors

    // 1. Search filter (name, email, phone)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(inv =>
        inv.full_name.toLowerCase().includes(searchLower) ||
        inv.email.toLowerCase().includes(searchLower) ||
        (inv.phone && inv.phone.includes(searchTerm))
      )
    }

    // 2. System field filters
    Object.entries(filters).forEach(([fieldName, filterValue]) => {
      if (!filterValue || filterValue === "all") return

      result = result.filter(inv => {
        // System fields
        if (fieldName === "source") return inv.source === filterValue
        if (fieldName === "status") return inv.status === filterValue
        if (fieldName === "priority") return inv.priority === filterValue

        // Assigned user filter
        if (fieldName === "assigned_user") {
          if (filterValue === "unassigned") {
            return !inv.assignedUser
          }
          return inv.assignedUser?.id === parseInt(filterValue)
        }

        // Custom fields
        const fieldValue = inv.investor_field_values?.find(
          fv => fv.investor_fields.name === fieldName
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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Source Filter */}
        <Select
          value={filters.source || "all"}
          onValueChange={(v) => setFilters(prev => ({ ...prev, source: v }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="potential">Potential</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>

        {/* Assigned User Filter */}
        <Select
          value={filters.assigned_user || "all"}
          onValueChange={(v) => setFilters(prev => ({ ...prev, assigned_user: v }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {activeUsers.map(user => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dynamic Custom Field Filters */}
        {filterableFields.map(field => (
          <Select
            key={field.id}
            value={filters[field.name] || "all"}
            onValueChange={(v) => setFilters(prev => ({ ...prev, [field.name]: v }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={`All ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {field.label}</SelectItem>
              {field.investor_field_options.map(opt => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Clear Filters */}
        {(searchTerm || Object.values(filters).some(v => v && v !== "all")) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setFilters({})
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Counter */}
      <p className="text-sm text-gray-600">
        Showing <strong>{filteredInvestors.length}</strong> of{" "}
        <strong>{investors.length}</strong> investors
      </p>

      {/* Table */}
      <InvestorsTable investors={filteredInvestors} />
    </div>
  )
}
```

**✅ Good Practice:**

```typescript
// Debounce search input
import { useDebouncedValue } from "@/hooks/use-debounced-value"

const [searchInput, setSearchInput] = useState("")
const debouncedSearch = useDebouncedValue(searchInput, 300)

// Use debounced value in filter
const filtered = useMemo(() => {
  return investors.filter(inv =>
    inv.full_name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )
}, [investors, debouncedSearch])
```

**❌ Bad Practice:**

```typescript
// ❌ Don't filter on every keystroke without debounce
<Input onChange={(e) => {
  const filtered = investors.filter(/* ... */) // ❌ Runs on every keystroke
  setFilteredInvestors(filtered)
}} />

// ❌ Don't use includes() for exact matches
investors.filter(inv => inv.status.includes(filterValue)) // ❌ Wrong
investors.filter(inv => inv.status === filterValue)        // ✅ Correct
```

---

## Activity Integration

### Create Activity for Investor

```typescript
// components/activities/add-activity-dialog.tsx
export function AddActivityDialog({ investor, activityTypes, open, onOpenChange }) {
  const [formData, setFormData] = useState({
    type: "",
    subject: "",
    description: "",
    status: "pending",
    scheduled_at: ""
  })

  const handleSubmit = async () => {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        investor_id: investor.id,
        entity_type: "investor"
      })
    })

    if (!response.ok) throw new Error("Failed to create activity")

    toast.success("Activity created successfully")
    router.refresh()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogDescription>
            Create a new activity for {investor.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select activity type..." />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map(type => (
                <SelectItem key={type.id} value={type.name}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          />

          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />

          <Input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
          />

          <Select
            value={formData.status}
            onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Display Activity Timeline

```typescript
// In investor detail view
<Tabs defaultValue="info">
  <TabsList>
    <TabsTrigger value="info">Information</TabsTrigger>
    <TabsTrigger value="activities">
      Activities
      {investor.activities?.length > 0 && (
        <Badge className="ml-2">{investor.activities.length}</Badge>
      )}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="activities">
    {investor.activities?.length > 0 ? (
      <div className="space-y-4">
        {investor.activities.map((activity, index) => (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Activity Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  getActivityBgColor(activity.type)
                )}>
                  {getActivityIconComponent(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {activity.subject}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <Badge variant={
                      activity.status === "completed" ? "success" :
                      activity.status === "cancelled" ? "destructive" :
                      "secondary"
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(activity.created_at)} ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No activities yet</p>
          <Button onClick={() => setAddActivityOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Activity
          </Button>
        </CardContent>
      </Card>
    )}
  </TabsContent>
</Tabs>
```

**✅ Good Practice:**

```typescript
// Fetch activities with investor
const investor = await prisma.investors.findUnique({
  where: { id },
  include: {
    activities: {
      orderBy: { created_at: "desc" },
      take: 50 // Limit for performance
    }
  }
})

// Create activity with proper entity linking
await prisma.activities.create({
  data: {
    investor_id: investorId,
    type: "meeting",
    subject: "Initial consultation",
    status: "pending",
    scheduled_at: new Date("2025-10-10"),
    created_at: new Date()
  }
})
```

**❌ Bad Practice:**

```typescript
// ❌ Don't fetch activities separately (N+1 problem)
const investor = await prisma.investors.findUnique({ where: { id } })
const activities = await prisma.activities.findMany({ where: { investor_id: id } })

// ❌ Don't forget entity_type when creating
await prisma.activities.create({
  data: {
    entity_id: investorId, // ❌ Missing entity_type
    type: "call"
  }
})
```

---

## Best Practices

### 1. Data Validation

**✅ Good:**

```typescript
// Server-side validation with Zod
import { z } from "zod"

const investorSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  source: z.enum(["website", "referral", "social_media", "cold_call", "email", "event", "other"]),
  status: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional()
})

// Validate before processing
const result = investorSchema.safeParse(body)
if (!result.success) {
  return NextResponse.json({
    error: "Validation failed",
    details: result.error.flatten()
  }, { status: 400 })
}
```

**❌ Bad:**

```typescript
// ❌ Client-side validation only
if (!formData.email) {
  alert("Email required") // ❌ Easy to bypass
  return
}

// ❌ No validation
await prisma.investors.create({ data: body }) // ❌ Accepts any data
```

---

### 2. Error Handling

**✅ Good:**

```typescript
// Comprehensive error handling
try {
  const investor = await prisma.investors.create({ data })
  return NextResponse.json({ success: true, data: investor })
} catch (error) {
  // Check for unique constraint violation
  if (error.code === "P2002") {
    return NextResponse.json({
      error: "Duplicate entry",
      field: error.meta?.target?.[0] || "unknown"
    }, { status: 409 })
  }

  // Check for foreign key constraint
  if (error.code === "P2003") {
    return NextResponse.json({
      error: "Invalid reference",
      details: error.meta
    }, { status: 400 })
  }

  // Log full error for debugging
  console.error("Database error:", error)

  // Return generic error to client
  return NextResponse.json({
    error: "Internal server error"
  }, { status: 500 })
}
```

**❌ Bad:**

```typescript
// ❌ Generic error handling
try {
  await prisma.investors.create({ data })
} catch (error) {
  console.log(error) // ❌ Just logging
  return { error: "Something went wrong" } // ❌ No status code
}
```

---

### 3. Performance Optimization

**✅ Good:**

```typescript
// Use select to fetch only needed fields
const investors = await prisma.investors.findMany({
  select: {
    id: true,
    full_name: true,
    email: true,
    status: true,
    created_at: true
  },
  take: 100
})

// Use include for relations
const investor = await prisma.investors.findUnique({
  where: { id },
  include: {
    investor_field_values: {
      include: { investor_fields: true }
    },
    activities: {
      orderBy: { created_at: "desc" },
      take: 20
    }
  }
})

// Use pagination
const investors = await prisma.investors.findMany({
  skip: (page - 1) * perPage,
  take: perPage,
  orderBy: { created_at: "desc" }
})
```

**❌ Bad:**

```typescript
// ❌ Fetching all fields when not needed
const investors = await prisma.investors.findMany() // ❌ Gets everything

// ❌ N+1 query problem
const investors = await prisma.investors.findMany()
for (const investor of investors) {
  const activities = await prisma.activities.findMany({ // ❌ Separate query each
    where: { investor_id: investor.id }
  })
}

// ❌ No pagination
const allInvestors = await prisma.investors.findMany() // ❌ Could be thousands
```

---

### 4. Type Safety

**✅ Good:**

```typescript
// Define proper types
interface InvestorWithFields {
  id: number
  full_name: string
  email: string
  phone: string | null
  source: string
  status: string
  priority: string | null
  investor_field_values: Array<{
    id: number
    value: string | string[]
    investor_fields: {
      id: number
      name: string
      label: string
      type: string
    }
  }>
  assigned_user: {
    id: number
    name: string
    email: string
  } | null
}

// Use strict typing
const getInvestor = async (id: number): Promise<InvestorWithFields | null> => {
  return await prisma.investors.findUnique({
    where: { id: BigInt(id) },
    include: { /* ... */ }
  })
}
```

**❌ Bad:**

```typescript
// ❌ Using 'any'
const getInvestor = async (id: any): Promise<any> => {
  return await prisma.investors.findUnique({ where: { id } })
}

// ❌ No return type
const fetchInvestors = async () => {
  return await prisma.investors.findMany()
}
```

---

## Advanced Examples

### 1. Bulk Operations

```typescript
// Bulk assign users to multiple investors
async function bulkAssignUsers(
  investorIds: number[],
  userId: number,
  assignedBy: number
) {
  // Delete existing assignments
  await prisma.user_assignments.deleteMany({
    where: {
      entity_type: "investor",
      entity_id: { in: investorIds.map(BigInt) }
    }
  })

  // Create new assignments
  await prisma.user_assignments.createMany({
    data: investorIds.map(investorId => ({
      user_id: BigInt(userId),
      entity_type: "investor",
      entity_id: BigInt(investorId),
      assigned_by: BigInt(assignedBy),
      assigned_at: new Date()
    }))
  })
}

// Bulk update status
async function bulkUpdateStatus(investorIds: number[], status: string) {
  await prisma.investors.updateMany({
    where: {
      id: { in: investorIds.map(BigInt) }
    },
    data: {
      status,
      updated_at: new Date()
    }
  })
}
```

---

### 2. Advanced Filtering with Stats

```typescript
// Get investors with statistics
async function getInvestorsWithStats(filters: any) {
  const where = {
    ...(filters.source && { source: filters.source }),
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.assigned_user && {
      user_assignments: {
        some: {
          user_id: BigInt(filters.assigned_user),
          entity_type: "investor"
        }
      }
    })
  }

  const [investors, total, stats] = await Promise.all([
    // Get investors
    prisma.investors.findMany({
      where,
      include: {
        investor_field_values: {
          include: { investor_fields: true }
        },
        activities: {
          select: { id: true }
        }
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * perPage,
      take: perPage
    }),

    // Get total count
    prisma.investors.count({ where }),

    // Get statistics
    prisma.investors.groupBy({
      by: ['status'],
      _count: { id: true },
      where
    })
  ])

  return {
    investors,
    total,
    stats: stats.reduce((acc, s) => ({
      ...acc,
      [s.status]: s._count.id
    }), {})
  }
}
```

---

### 3. Complex Custom Field Queries

```typescript
// Find investors with specific custom field values
async function findInvestorsWithFieldValue(
  fieldName: string,
  fieldValue: string
) {
  return await prisma.investors.findMany({
    where: {
      investor_field_values: {
        some: {
          investor_fields: {
            name: fieldName
          },
          value: fieldValue
        }
      }
    },
    include: {
      investor_field_values: {
        include: { investor_fields: true }
      }
    }
  })
}

// Find investors missing required fields
async function findInvestorsWithMissingFields() {
  const requiredFields = await prisma.investor_fields.findMany({
    where: { is_required: true, is_active: true }
  })

  const investors = await prisma.investors.findMany({
    include: {
      investor_field_values: {
        include: { investor_fields: true }
      }
    }
  })

  return investors.filter(investor => {
    const filledFieldIds = investor.investor_field_values.map(
      fv => fv.investor_field_id
    )

    return requiredFields.some(
      rf => !filledFieldIds.includes(rf.id)
    )
  })
}
```

---

## Error Handling

### Common Error Patterns

```typescript
// API Error Response Format
interface ApiError {
  error: string
  details?: string
  field?: string
  code?: string
}

// Error Handler Utility
export function handlePrismaError(error: any): Response {
  // Unique constraint violation
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field"
    return NextResponse.json({
      error: `Duplicate ${field}`,
      details: `A record with this ${field} already exists`,
      field,
      code: "DUPLICATE"
    }, { status: 409 })
  }

  // Foreign key constraint
  if (error.code === "P2003") {
    return NextResponse.json({
      error: "Invalid reference",
      details: "Referenced record does not exist",
      code: "INVALID_REFERENCE"
    }, { status: 400 })
  }

  // Record not found
  if (error.code === "P2025") {
    return NextResponse.json({
      error: "Record not found",
      details: "The requested record does not exist",
      code: "NOT_FOUND"
    }, { status: 404 })
  }

  // Generic error
  console.error("Unexpected error:", error)
  return NextResponse.json({
    error: "Internal server error",
    code: "INTERNAL_ERROR"
  }, { status: 500 })
}

// Usage in API routes
try {
  const investor = await prisma.investors.create({ data })
  return NextResponse.json(investor)
} catch (error) {
  return handlePrismaError(error)
}
```

### Client-Side Error Display

```typescript
// components/ui/error-alert.tsx
export function ErrorAlert({ error }: { error: ApiError }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{error.error}</AlertTitle>
      {error.details && (
        <AlertDescription>{error.details}</AlertDescription>
      )}
    </Alert>
  )
}

// Usage in forms
const [error, setError] = useState<ApiError | null>(null)

const onSubmit = async (data: any) => {
  try {
    const response = await fetch("/api/investors", {
      method: "POST",
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      setError(errorData)
      return
    }

    router.push("/investors")
  } catch (err) {
    setError({
      error: "Network error",
      details: "Failed to connect to server"
    })
  }
}

// Display error
{error && <ErrorAlert error={error} />}
```

---

## Summary

This implementation guide covers the complete Investor Management System:

1. **CRUD Operations** - Create, Read, Update, Delete with full examples
2. **User Assignment** - Assign investors to team members with tracking
3. **Dynamic Fields** - Unlimited custom fields with multiple types
4. **Filtering & Search** - Advanced multi-field filtering
5. **Activity Integration** - Complete timeline tracking
6. **Best Practices** - Validation, error handling, performance, type safety
7. **Advanced Examples** - Bulk operations, complex queries, statistics

### Key Takeaways

- ✅ Always validate data server-side
- ✅ Use transactions for related operations
- ✅ Handle BigInt serialization for JSON responses
- ✅ Include necessary relations to avoid N+1 queries
- ✅ Implement proper error handling with user-friendly messages
- ✅ Use TypeScript for type safety
- ✅ Store multiselect values as JSON, not CSV
- ✅ Track assignment history with assigned_by and assigned_at
- ✅ Debounce search inputs for performance
- ✅ Use pagination for large datasets

### File Locations

- **API Routes:** `/app/api/investors/`
- **Pages:** `/app/(dashboard)/investors/`
- **Components:** `/components/investors/`
- **Database:** `prisma/schema.prisma`
- **Types:** `/types/investor.ts`

---

**Version:** 1.0.0
**Last Updated:** 2025-10-04
