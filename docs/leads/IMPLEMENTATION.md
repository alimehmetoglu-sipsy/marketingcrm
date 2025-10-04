# Leads Module - Implementation Guide

[← Back to README](./README.md)

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Creating a Lead](#creating-a-lead)
- [Viewing Leads](#viewing-leads)
- [Updating a Lead](#updating-a-lead)
- [Deleting a Lead](#deleting-a-lead)
- [Managing Custom Fields](#managing-custom-fields)
- [Form Configuration](#form-configuration)
- [Common Patterns](#common-patterns)

---

## Quick Start

### Setup Checklist

1. ✅ Database migrated with Prisma
2. ✅ Lead fields seeded (system fields: source, status, priority)
3. ✅ Form sections configured
4. ✅ NextAuth configured
5. ✅ Environment variables set

### Verify Installation

```bash
# Check database tables exist
npx prisma db pull

# Seed default fields (if not done)
npx tsx scripts/seed-lead-fields.ts
npx tsx scripts/seed-lead-form-sections.ts
```

---

## Creating a Lead

### Method 1: Via UI

**Step 1:** Navigate to leads page
```
/leads
```

**Step 2:** Click "Add Lead" button

**Step 3:** Fill required fields
- Full Name
- Email (must be unique)
- Phone (must be unique)

**Step 4:** Fill custom fields
- Source (dropdown)
- Status (dropdown)
- Priority (dropdown)
- Any other active custom fields

**Step 5:** Click "Create Lead"

---

### Method 2: Via API

```typescript
const createLead = async () => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+90 555 123 4567",
      customFields: {
        "1": "website",        // source field ID
        "2": "new",            // status field ID
        "3": "high",           // priority field ID
        "4": "Real Estate",    // custom text field
        "5": ["Investment", "Consultation"]  // multiselect
      }
    })
  })

  if (response.ok) {
    const lead = await response.json()
    console.log('Created:', lead)
  } else {
    const error = await response.json()
    console.error('Error:', error)
  }
}
```

---

### Method 3: Direct Prisma (Server-side only)

```typescript
import { prisma } from "@/lib/prisma"

async function createLeadDirect() {
  // 1. Create lead
  const lead = await prisma.leads.create({
    data: {
      full_name: "Jane Smith",
      email: "jane@example.com",
      phone: "+90 555 987 6543",
      source: "social_media",
      status: "new",
      priority: "medium",
      created_at: new Date(),
      updated_at: new Date(),
    }
  })

  // 2. Create custom field values
  await prisma.lead_field_values.createMany({
    data: [
      {
        lead_id: lead.id,
        lead_field_id: BigInt(4),  // interest_area field
        value: "Commercial Real Estate",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lead_id: lead.id,
        lead_field_id: BigInt(5),  // services field (multiselect)
        value: JSON.stringify(["Consultation", "Investment"]),
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]
  })

  return lead
}
```

---

## Viewing Leads

### List All Leads

**UI:** Navigate to `/leads`

**Features:**
- Search by name, email, phone
- Filter by source, status, priority
- Filter by custom field values
- Sort by created date (default: newest first)

**API:**
```typescript
const fetchLeads = async () => {
  const response = await fetch('/api/leads')
  const leads = await response.json()
  return leads
}
```

**Prisma Query:**
```typescript
const leads = await prisma.leads.findMany({
  include: {
    lead_field_values: {
      include: {
        lead_fields: {
          include: { lead_field_options: true }
        }
      }
    }
  },
  orderBy: { created_at: 'desc' },
  take: 100
})
```

---

### View Single Lead

**UI:** Navigate to `/leads/[id]`

**Features:**
- Hero header with lead info
- Tabbed interface:
  - Tab 1: Lead Information (static + dynamic fields)
  - Tab 2: Activity Timeline
- Quick actions (Edit, Delete)

**API:**
```typescript
const fetchLead = async (id: number) => {
  const response = await fetch(`/api/leads/${id}`)
  const lead = await response.json()
  return lead
}
```

**Prisma Query:**
```typescript
const lead = await prisma.leads.findUnique({
  where: { id: BigInt(leadId) },
  include: {
    lead_field_values: {
      include: {
        lead_fields: {
          include: { lead_field_options: true }
        }
      }
    },
    activities: {
      orderBy: { created_at: 'desc' },
      take: 10
    }
  }
})
```

---

## Updating a Lead

### Method 1: Via UI

**Step 1:** Navigate to `/leads/[id]/edit`

**Step 2:** Modify fields

**Step 3:** Click "Save Changes"

---

### Method 2: Via API

```typescript
const updateLead = async (id: number) => {
  const response = await fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: "John Doe Updated",
      email: "john.new@example.com",
      phone: "+90 555 123 4567",
      customFields: {
        "1": "referral",       // changed source
        "2": "contacted",      // changed status
        "3": "urgent",         // changed priority
        "4": "Residential Real Estate"  // updated custom field
      }
    })
  })

  if (response.ok) {
    const updated = await response.json()
    console.log('Updated:', updated)
  }
}
```

---

### Method 3: Direct Prisma (Server-side)

```typescript
async function updateLeadDirect(leadId: bigint) {
  // 1. Update lead table
  await prisma.leads.update({
    where: { id: leadId },
    data: {
      full_name: "John Doe Updated",
      status: "contacted",
      priority: "high",
      updated_at: new Date()
    }
  })

  // 2. Delete and recreate custom field values
  await prisma.lead_field_values.deleteMany({
    where: { lead_id: leadId }
  })

  await prisma.lead_field_values.createMany({
    data: [
      {
        lead_id: leadId,
        lead_field_id: BigInt(4),
        value: "New value",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]
  })
}
```

---

## Deleting a Lead

### Via UI

**Step 1:** Navigate to `/leads/[id]`

**Step 2:** Click "Delete" button

**Step 3:** Confirm deletion

---

### Via API

```typescript
const deleteLead = async (id: number) => {
  const response = await fetch(`/api/leads/${id}`, {
    method: 'DELETE'
  })

  if (response.ok) {
    console.log('Lead deleted successfully')
  }
}
```

**Important:** Cascade deletes:
- All `lead_field_values` for this lead
- All `activities` for this lead
- All `notes` for this lead

---

## Managing Custom Fields

### Create New Field

**UI:** Settings → Lead Fields → Create Property

```typescript
const createField = async () => {
  const response = await fetch('/api/settings/lead-fields', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "budget",
      label: "Budget Range",
      type: "select",
      is_required: false,
      is_active: true,
      section_key: "lead_details",
      placeholder: "Select budget range...",
      help_text: "Estimated budget for the lead",
      options: [
        { value: "0-50k", label: "Under $50k" },
        { value: "50k-100k", label: "$50k - $100k" },
        { value: "100k+", label: "Over $100k" }
      ]
    })
  })

  const field = await response.json()
  console.log('Created field:', field)
}
```

---

### Update Field

```typescript
const updateField = async (fieldId: number) => {
  await fetch(`/api/settings/lead-fields/${fieldId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      label: "Investment Budget",
      is_required: true,
      help_text: "Required field for budget estimation"
    })
  })
}
```

---

### Delete Field

```typescript
const deleteField = async (fieldId: number) => {
  // Note: System fields cannot be deleted
  const response = await fetch(`/api/settings/lead-fields/${fieldId}`, {
    method: 'DELETE'
  })

  if (response.status === 403) {
    console.error('Cannot delete system field')
  }
}
```

---

### Reorder Fields

```typescript
const reorderFields = async (orderedIds: number[]) => {
  await fetch('/api/settings/lead-fields/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fieldIds: orderedIds  // [5, 3, 1, 7, 2, 4]
    })
  })
}
```

---

## Form Configuration

### Manage Sections

**UI:** Settings → Lead Fields → Form Layout

```typescript
const updateSections = async () => {
  const sections = [
    {
      id: 1,
      section_key: "contact_information",
      name: "Contact Information",
      is_visible: true,
      is_default_open: true,
      sort_order: 0,
      icon: "user",
      gradient: "bg-gradient-to-br from-blue-600 to-indigo-500"
    },
    {
      id: 2,
      section_key: "lead_details",
      name: "Lead Details",
      is_visible: true,
      is_default_open: false,
      sort_order: 1,
      icon: "briefcase",
      gradient: "bg-gradient-to-r from-blue-50 to-indigo-50"
    }
  ]

  await fetch('/api/settings/lead-form-sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sections)
  })
}
```

---

### Assign Fields to Sections

```typescript
const assignFieldsToSections = async () => {
  await fetch('/api/settings/lead-fields/assign-sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [
        { id: 1, section_key: "lead_information" },  // source
        { id: 2, section_key: "lead_details" },      // status
        { id: 3, section_key: "lead_details" },      // priority
        { id: 4, section_key: "lead_details" },      // interest_area
        { id: 5, section_key: null }                 // unassigned
      ]
    })
  })
}
```

---

## Common Patterns

### Pattern 1: Search Leads by Custom Field

```typescript
const searchByCustomField = async (fieldName: string, value: string) => {
  const leads = await prisma.leads.findMany({
    where: {
      lead_field_values: {
        some: {
          lead_fields: { name: fieldName },
          value: value
        }
      }
    },
    include: {
      lead_field_values: {
        include: { lead_fields: true }
      }
    }
  })

  return leads
}

// Usage
const realEstateLeads = await searchByCustomField('interest_area', 'Real Estate')
```

---

### Pattern 2: Get Leads by Status with Count

```typescript
const getLeadsByStatus = async () => {
  const statusGroups = await prisma.leads.groupBy({
    by: ['status'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })

  return statusGroups
  // Result: [
  //   { status: 'new', _count: { id: 25 } },
  //   { status: 'contacted', _count: { id: 15 } },
  //   { status: 'qualified', _count: { id: 10 } }
  // ]
}
```

---

### Pattern 3: Recently Created Leads

```typescript
const getRecentLeads = async (days: number = 7) => {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const leads = await prisma.leads.findMany({
    where: {
      created_at: { gte: since }
    },
    orderBy: { created_at: 'desc' },
    take: 20
  })

  return leads
}
```

---

### Pattern 4: Lead Conversion to Investor

```typescript
const convertLeadToInvestor = async (leadId: bigint) => {
  const lead = await prisma.leads.findUnique({
    where: { id: leadId },
    include: { lead_field_values: { include: { lead_fields: true } } }
  })

  if (!lead) throw new Error('Lead not found')

  // Create investor
  const investor = await prisma.investors.create({
    data: {
      lead_id: leadId,
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: "potential",  // Default investor status
      priority: lead.priority,
      created_at: new Date(),
      updated_at: new Date(),
    }
  })

  // Copy custom field values (if field exists in both)
  // TODO: Implement field mapping logic

  return investor
}
```

---

### Pattern 5: Bulk Status Update

```typescript
const bulkUpdateStatus = async (leadIds: bigint[], newStatus: string) => {
  await prisma.leads.updateMany({
    where: { id: { in: leadIds } },
    data: {
      status: newStatus,
      updated_at: new Date()
    }
  })
}

// Usage
await bulkUpdateStatus([BigInt(1), BigInt(2), BigInt(3)], 'contacted')
```

---

### Pattern 6: Get Lead with Full Custom Field Info

```typescript
const getLeadWithFullInfo = async (leadId: bigint) => {
  const lead = await prisma.leads.findUnique({
    where: { id: leadId },
    include: {
      lead_field_values: {
        include: {
          lead_fields: {
            include: { lead_field_options: true }
          }
        }
      },
      activities: {
        orderBy: { created_at: 'desc' },
        take: 10
      },
      notes: {
        orderBy: { created_at: 'desc' }
      }
    }
  })

  // Serialize BigInt
  return {
    ...lead,
    id: Number(lead.id),
    lead_field_values: lead.lead_field_values.map(fv => ({
      ...fv,
      id: Number(fv.id),
      lead_id: Number(fv.lead_id),
      lead_field_id: Number(fv.lead_field_id),
      value: fv.lead_fields.type === 'multiselect' && fv.value
        ? JSON.parse(fv.value)
        : fv.value
    }))
  }
}
```

---

## Testing

### Unit Tests

```typescript
describe('Lead Creation', () => {
  it('creates lead with required fields', async () => {
    const lead = await createLead({
      full_name: "Test User",
      email: "test@example.com",
      phone: "+90 555 000 0000"
    })

    expect(lead.id).toBeDefined()
    expect(lead.email).toBe("test@example.com")
  })

  it('validates email uniqueness', async () => {
    await createLead({ email: "duplicate@example.com" })

    await expect(
      createLead({ email: "duplicate@example.com" })
    ).rejects.toThrow('A lead with this email already exists')
  })
})
```

---

### Integration Tests

```typescript
describe('Lead API', () => {
  it('creates and retrieves lead', async () => {
    // Create
    const createRes = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    })
    const created = await createRes.json()

    // Retrieve
    const getRes = await fetch(`/api/leads/${created.id}`)
    const retrieved = await getRes.json()

    expect(retrieved.email).toBe(leadData.email)
  })
})
```

---

[← Back to README](./README.md) | [Next: Visual Guide →](./VISUAL-GUIDE.md)

**Last Updated:** 2025-01-04
**Version:** 1.0.0
