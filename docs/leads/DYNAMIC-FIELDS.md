# Leads Module - Dynamic Fields System

[← Back to README](./README.md)

---

## Overview

The dynamic fields system for Leads is **identical in architecture** to the Investors module. For comprehensive documentation on the field system, please refer to [Investors Dynamic Fields Documentation](../investors/DYNAMIC-FIELDS.md).

This document highlights **Lead-specific** differences and configurations.

---

## Key Differences from Investors

| Aspect | Leads | Investors |
|--------|-------|-----------|
| **Table Prefix** | `lead_` | `investor_` |
| **System Fields** | source, status, priority | source, status, priority |
| **Default Sections** | contact_information, lead_details | investor_information, investment_details |
| **Theme Colors** | Blue/Indigo/Purple | Emerald/Green/Teal |
| **Field Options Table** | `lead_field_options` | `investor_field_options` |

---

## Database Tables

### Lead-Specific Tables

1. **`lead_fields`** - Field definitions
2. **`lead_field_values`** - Field value storage
3. **`lead_field_options`** - Select/multiselect options
4. **`lead_form_sections`** - Form organization

**Schema:** See [DATABASE.md](./DATABASE.md)

---

## Supported Field Types

Same as investors module (9 types):

1. `text` - Single-line text
2. `email` - Email address
3. `url` - Website URL
4. `phone` - Phone number (with country code)
5. `number` - Numeric values
6. `date` - Date picker
7. `textarea` - Multi-line text
8. `select` - Single choice dropdown
9. `multiselect` - Multiple checkboxes
10. `multiselect_dropdown` - Multiple choice dropdown with badges

---

## System Fields

### Default System Fields

```typescript
[
  {
    name: "source",
    label: "Source",
    type: "select",
    is_system_field: true,
    section_key: "lead_information",
    options: [
      { value: "website", label: "Website" },
      { value: "social_media", label: "Social Media" },
      { value: "referral", label: "Referral" },
      { value: "event", label: "Event" },
      { value: "advertisement", label: "Advertisement" },
      { value: "other", label: "Other" }
    ]
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    is_system_field: true,
    section_key: "lead_details",
    options: [
      { value: "new", label: "New" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "converted", label: "Converted" },
      { value: "lost", label: "Lost" }
    ]
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    is_system_field: true,
    section_key: "lead_details",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" }
    ]
  }
]
```

---

## Form Sections

### Default Sections

```typescript
[
  {
    section_key: "contact_information",
    name: "Contact Information",
    is_visible: true,
    is_default_open: true,
    sort_order: 0,
    icon: "user",
    gradient: "bg-gradient-to-br from-blue-600 to-indigo-500"
  },
  {
    section_key: "lead_details",
    name: "Lead Details",
    is_visible: true,
    is_default_open: true,
    sort_order: 1,
    icon: "briefcase",
    gradient: "bg-gradient-to-r from-blue-50 to-indigo-50"
  }
]
```

---

## Component Usage

### LeadDynamicField Component

**Location:** `/components/fields/lead-dynamic-field.tsx`

**Usage:**
```tsx
import { LeadDynamicField } from "@/components/fields/lead-dynamic-field"

<LeadDynamicField
  field={{
    id: 5,
    name: "interest_area",
    label: "Interest Area",
    type: "multiselect_dropdown",
    is_required: false,
    placeholder: "Select areas...",
    help_text: "Lead's areas of interest",
    lead_field_options: [
      { id: 1, value: "real_estate", label: "Real Estate" },
      { id: 2, value: "investment", label: "Investment" },
      { id: 3, value: "consultation", label: "Consultation" }
    ]
  }}
  value={["real_estate", "investment"]}
  onChange={(newValue) => handleFieldChange(5, newValue)}
/>
```

---

## API Integration

### Creating Lead with Custom Fields

```typescript
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+90 555 123 4567",
    customFields: {
      "1": "website",              // source (system field)
      "2": "new",                  // status (system field)
      "3": "high",                 // priority (system field)
      "4": "Real Estate",          // custom text field
      "5": ["Investment", "Consultation"]  // multiselect field
    }
  })
})
```

---

## Multiselect Storage

### JSON Array Format

**Saving:**
```typescript
value: JSON.stringify(["option1", "option2", "option3"])
```

**Reading:**
```typescript
let parsedValue = []
try {
  parsedValue = JSON.parse(fieldValue.value)
} catch {
  parsedValue = []
}
```

**Displaying:**
```tsx
{Array.isArray(value) && value.map(val => {
  const option = field.lead_field_options.find(opt => opt.value === val)
  return (
    <Badge key={val} className="bg-blue-100 text-blue-700">
      {option?.label || val}
    </Badge>
  )
})}
```

---

## Field Management

### Via Settings UI

**Location:** `/settings/lead-fields`

**Features:**
- Create/Edit/Delete fields
- Reorder fields (drag & drop)
- Toggle field visibility
- Assign fields to sections
- Configure field options

---

### Via API

**Create Field:**
```typescript
POST /api/settings/lead-fields
{
  "name": "budget",
  "label": "Budget Range",
  "type": "select",
  "is_required": false,
  "section_key": "lead_details",
  "options": [
    { "value": "0-50k", "label": "Under $50k" },
    { "value": "50k-100k", "label": "$50k - $100k" },
    { "value": "100k+", "label": "Over $100k" }
  ]
}
```

---

## Validation

### Server-Side

```typescript
// Check required fields
const requiredFields = await prisma.lead_fields.findMany({
  where: { is_required: true, is_active: true }
})

for (const field of requiredFields) {
  const value = customFields[field.id]
  if (!value || value === "") {
    return NextResponse.json(
      {
        error: "Required fields are missing",
        details: `${field.label} is required`,
        missingFields: [field.label]
      },
      { status: 400 }
    )
  }
}
```

---

## Best Practices

1. **Field Naming:** Use snake_case for `name`, Title Case for `label`
2. **Section Organization:** Group related fields logically
3. **Option Count:** Keep select options under 10 items
4. **Performance:** Limit total custom fields to 20-30
5. **Validation:** Always validate server-side

---

## Seed Script Example

```typescript
// scripts/seed-lead-custom-fields.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create custom field
  const field = await prisma.lead_fields.create({
    data: {
      name: 'interest_area',
      label: 'Interest Area',
      type: 'multiselect_dropdown',
      is_required: false,
      is_active: true,
      is_system_field: false,
      sort_order: 50,
      section_key: 'lead_details',
      placeholder: 'Select interest areas...',
      help_text: 'What is the lead interested in?',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Create options
  const options = [
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'investment', label: 'Investment' },
    { value: 'consultation', label: 'Consultation' },
  ]

  for (let i = 0; i < options.length; i++) {
    await prisma.lead_field_options.create({
      data: {
        lead_field_id: field.id,
        value: options[i].value,
        label: options[i].label,
        sort_order: i,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Further Reading

For comprehensive field system documentation including:
- Detailed architecture diagrams
- All 9 field type specifications
- Advanced validation rules
- Form configurator UI
- Component implementation details

**See:** [Investors Dynamic Fields Documentation](../investors/DYNAMIC-FIELDS.md)

(All concepts apply to Leads by substituting `investor` → `lead` and `emerald` → `blue` theme)

---

[← Back to README](./README.md) | [Next: Components Documentation →](./COMPONENTS.md)

**Last Updated:** 2025-01-04
**Version:** 1.0.0
