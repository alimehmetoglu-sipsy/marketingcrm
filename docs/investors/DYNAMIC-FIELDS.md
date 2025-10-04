# Dynamic Fields System Documentation

> Comprehensive guide to the flexible and extensible dynamic field architecture for Investors

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Field Types](#field-types)
- [Database Schema](#database-schema)
- [Section-Based Organization](#section-based-organization)
- [Field Value Storage](#field-value-storage)
- [Form Configurator](#form-configurator)
- [Adding New Fields](#adding-new-fields)
- [Field Validation](#field-validation)
- [System Fields vs Custom Fields](#system-fields-vs-custom-fields)
- [API Reference](#api-reference)
- [Component Examples](#component-examples)

---

## Architecture Overview

The dynamic fields system allows complete customization of the investor data model without modifying the database schema. It consists of four main components:

### Core Components

1. **Field Definitions** (`investor_fields` table)
   - Metadata about each field (type, label, validation rules)
   - System vs custom field distinction
   - Section assignment for organization

2. **Field Options** (`investor_field_options` table)
   - Dropdown/multiselect option values
   - Label-value pairs with ordering

3. **Field Values** (`investor_field_values` table)
   - Actual field data for each investor
   - Polymorphic storage (text, JSON for arrays)

4. **Form Sections** (`investor_form_sections` table)
   - Visual grouping of related fields
   - Icons, gradients, visibility settings

### Key Features

- **Type-Safe**: Full TypeScript support with Prisma schema
- **Extensible**: Add unlimited custom fields without schema changes
- **Organized**: Section-based field grouping
- **Flexible**: 9 different field types
- **Performant**: Optimized queries with proper indexing
- **User-Friendly**: Drag-and-drop field management UI

---

## Field Types

The system supports **9 different field types**, each with specific rendering and validation logic:

### 1. Text (`text`)
**Use Case**: Single-line text input (names, short descriptions)

```typescript
{
  type: "text",
  placeholder: "Enter text...",
  validation_rules: {
    minLength: 3,
    maxLength: 100
  }
}
```

**Renders As**: `<Input type="text" />`

---

### 2. Email (`email`)
**Use Case**: Email addresses with built-in validation

```typescript
{
  type: "email",
  placeholder: "user@example.com",
  is_required: true
}
```

**Renders As**: `<Input type="email" />` with HTML5 validation

---

### 3. URL (`url`)
**Use Case**: Website links

```typescript
{
  type: "url",
  placeholder: "https://example.com",
  help_text: "Include http:// or https://"
}
```

**Renders As**: `<Input type="url" />` with URL validation

---

### 4. Number (`number`)
**Use Case**: Numeric values (investment amounts, counts)

```typescript
{
  type: "number",
  placeholder: "0",
  validation_rules: {
    min: 0,
    max: 1000000
  }
}
```

**Renders As**: `<Input type="number" />` with numeric constraints

---

### 5. Date (`date`)
**Use Case**: Date selection (investment date, deadlines)

```typescript
{
  type: "date",
  default_value: "2025-01-01"
}
```

**Renders As**: `<Input type="date" />` with native date picker

---

### 6. Textarea (`textarea`)
**Use Case**: Multi-line text (notes, descriptions)

```typescript
{
  type: "textarea",
  placeholder: "Enter detailed notes...",
  help_text: "Provide comprehensive details"
}
```

**Renders As**: `<Textarea rows={3} />`

---

### 7. Select (`select`)
**Use Case**: Single choice from predefined options (status, priority)

```typescript
{
  type: "select",
  investor_field_options: [
    { value: "potential", label: "Potential" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ]
}
```

**Renders As**: `<Select>` with shadcn/ui dropdown

**Storage**: Single value string (e.g., `"active"`)

---

### 8. Multiselect (`multiselect`)
**Use Case**: Multiple choices with checkboxes (investment types, preferences)

```typescript
{
  type: "multiselect",
  investor_field_options: [
    { value: "stocks", label: "Stocks" },
    { value: "bonds", label: "Bonds" },
    { value: "real_estate", label: "Real Estate" }
  ]
}
```

**Renders As**: Vertical list of `<Checkbox>` components

**Storage**: JSON array `["stocks", "bonds"]`

---

### 9. Multiselect Dropdown (`multiselect_dropdown`)
**Use Case**: Multiple choices in compact dropdown with badges

```typescript
{
  type: "multiselect_dropdown",
  placeholder: "Select investment areas...",
  investor_field_options: [
    { value: "tech", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" }
  ]
}
```

**Renders As**: `<Popover>` with badge UI for selected items

**Storage**: JSON array `["tech", "finance"]`

**Features**:
- Badge display of selected values
- Click badge to remove
- Searchable dropdown
- Check indicators

---

## Database Schema

### investor_fields Table

```sql
CREATE TABLE investor_fields (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name              VARCHAR(255) UNIQUE NOT NULL,      -- Field identifier (snake_case)
  label             VARCHAR(255) NOT NULL,             -- Display label
  type              ENUM(...) DEFAULT 'text',          -- Field type
  is_required       BOOLEAN DEFAULT false,             -- Validation
  is_active         BOOLEAN DEFAULT true,              -- Visibility
  is_system_field   BOOLEAN DEFAULT false,             -- Protected fields
  sort_order        INT DEFAULT 0,                     -- Display order
  section_key       VARCHAR(255),                      -- Section assignment
  placeholder       TEXT,                              -- Input placeholder
  help_text         TEXT,                              -- Helper text
  default_value     TEXT,                              -- Default value
  validation_rules  JSON,                              -- Custom validation
  options           JSON,                              -- Legacy (use investor_field_options)
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP,

  INDEX idx_active_sort (is_active, sort_order),
  INDEX idx_section (section_key)
);
```

**Field Types Enum**:
```sql
ENUM('text', 'select', 'multiselect', 'multiselect_dropdown',
     'date', 'number', 'textarea', 'email', 'url')
```

---

### investor_field_options Table

```sql
CREATE TABLE investor_field_options (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  investor_field_id BIGINT UNSIGNED NOT NULL,          -- FK to investor_fields
  value             VARCHAR(255) NOT NULL,             -- Option value (stored)
  label             VARCHAR(255) NOT NULL,             -- Option label (displayed)
  sort_order        INT DEFAULT 0,                     -- Display order
  is_active         BOOLEAN DEFAULT true,              -- Visibility
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP,

  FOREIGN KEY (investor_field_id)
    REFERENCES investor_fields(id) ON DELETE CASCADE,
  UNIQUE KEY unique_field_value (investor_field_id, value)
);
```

**Example Options**:
```json
[
  { "value": "potential", "label": "Potential", "sort_order": 0 },
  { "value": "contacted", "label": "Contacted", "sort_order": 1 },
  { "value": "active", "label": "Active", "sort_order": 2 }
]
```

---

### investor_field_values Table

```sql
CREATE TABLE investor_field_values (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  investor_id       BIGINT UNSIGNED NOT NULL,          -- FK to investors
  investor_field_id BIGINT UNSIGNED NOT NULL,          -- FK to investor_fields
  value             TEXT,                              -- Stored value (string or JSON)
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP,

  FOREIGN KEY (investor_id)
    REFERENCES investors(id) ON DELETE CASCADE,
  FOREIGN KEY (investor_field_id)
    REFERENCES investor_fields(id) ON DELETE CASCADE,
  UNIQUE KEY unique_investor_field (investor_id, investor_field_id),
  INDEX idx_field (investor_field_id)
);
```

**Value Storage Examples**:
- Text/Select: `"potential"`
- Number: `"250000"`
- Date: `"2025-03-15"`
- Multiselect: `["stocks", "bonds", "real_estate"]` (JSON)

---

### investor_form_sections Table

```sql
CREATE TABLE investor_form_sections (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_key     VARCHAR(255) UNIQUE NOT NULL,        -- Identifier
  name            VARCHAR(255) NOT NULL,               -- Display name
  is_visible      BOOLEAN DEFAULT true,                -- Show/hide
  is_default_open BOOLEAN DEFAULT true,                -- Expand by default
  sort_order      INT DEFAULT 0,                       -- Display order
  icon            VARCHAR(255),                        -- Icon name
  gradient        VARCHAR(255),                        -- CSS gradient class
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP,

  INDEX idx_sort (sort_order)
);
```

**Example Sections**:
```json
[
  {
    "section_key": "investor_information",
    "name": "Investor Information",
    "icon": "user",
    "gradient": "bg-gradient-to-br from-emerald-600 to-teal-500",
    "sort_order": 1
  },
  {
    "section_key": "investment_details",
    "name": "Investor Details",
    "icon": "briefcase",
    "gradient": "bg-gradient-to-r from-emerald-50 to-teal-50",
    "sort_order": 2
  }
]
```

---

## Section-Based Organization

Fields are organized into logical sections for better UX and visual hierarchy.

### Default Sections

1. **Investor Information** (`investor_information`)
   - Source (system field)
   - Contact preferences
   - Primary contact details

2. **Investment Details** (`investment_details`)
   - Status (system field)
   - Priority (system field)
   - Investment amount
   - Timeline

### Section Features

- **Collapsible**: Each section can collapse/expand
- **Visual Identity**: Custom icon + gradient
- **Ordering**: Drag-and-drop reordering
- **Visibility Control**: Show/hide sections
- **Field Grouping**: Automatic field organization

### Section Assignment

Fields are assigned to sections via `section_key`:

```typescript
{
  name: "investment_type",
  label: "Investment Type",
  section_key: "investment_details",  // Assigns to section
  type: "multiselect_dropdown"
}
```

**Rendering Logic**:
```typescript
const formSections = await prisma.investor_form_sections.findMany({
  where: { is_visible: true },
  orderBy: { sort_order: "asc" },
})

formSections.forEach(section => {
  const sectionFields = allFields.filter(
    field => field.section_key === section.section_key
  )
  // Render section with its fields
})
```

---

## Field Value Storage

### Storage Strategy

Different field types use different storage mechanisms:

#### 1. Simple Types (Text, Email, Number, Date, URL, Textarea, Select)
**Storage**: Plain string in `value` column

```typescript
// Saving
await prisma.investor_field_values.create({
  data: {
    investor_id: investorId,
    investor_field_id: fieldId,
    value: String(inputValue)  // Convert to string
  }
})

// Reading
const fieldValue = await prisma.investor_field_values.findUnique({
  where: {
    investor_id_investor_field_id: {
      investor_id: investorId,
      investor_field_id: fieldId
    }
  }
})
const displayValue = fieldValue?.value || ""
```

---

#### 2. Array Types (Multiselect, Multiselect Dropdown)
**Storage**: JSON-encoded array string

```typescript
// Saving multiselect values
const selectedValues = ["stocks", "bonds", "real_estate"]
await prisma.investor_field_values.upsert({
  where: {
    investor_id_investor_field_id: {
      investor_id: investorId,
      investor_field_id: fieldId
    }
  },
  create: {
    investor_id: investorId,
    investor_field_id: fieldId,
    value: JSON.stringify(selectedValues)  // ["stocks","bonds","real_estate"]
  },
  update: {
    value: JSON.stringify(selectedValues)
  }
})

// Reading multiselect values
const fieldValue = await prisma.investor_field_values.findUnique({
  where: {
    investor_id_investor_field_id: {
      investor_id: investorId,
      investor_field_id: fieldId
    }
  }
})

let parsedValue = []
if (fieldValue?.value) {
  try {
    parsedValue = JSON.parse(fieldValue.value)  // Parse JSON array
  } catch {
    parsedValue = []
  }
}
```

---

### Value Processing in Forms

**Complete Save Flow**:
```typescript
// 1. Collect form data
const formData = {
  // Static investor fields
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",

  // Dynamic custom fields (object with fieldId keys)
  customFields: {
    "5": "potential",                          // Select field
    "6": ["stocks", "bonds"],                  // Multiselect
    "7": "250000",                             // Number
    "8": "2025-03-15"                          // Date
  }
}

// 2. Save investor
const investor = await prisma.investors.create({
  data: {
    full_name: formData.full_name,
    email: formData.email,
    phone: formData.phone,
  }
})

// 3. Save custom field values
for (const [fieldId, fieldValue] of Object.entries(formData.customFields)) {
  await prisma.investor_field_values.create({
    data: {
      investor_id: investor.id,
      investor_field_id: parseInt(fieldId),
      value: typeof fieldValue === "object"
        ? JSON.stringify(fieldValue)  // Arrays → JSON
        : String(fieldValue)           // Primitives → String
    }
  })
}
```

---

## Form Configurator

The Form View Configurator provides a visual interface for managing field layout and sections.

### Features

1. **Drag-and-Drop Field Ordering**
   - Reorder fields within sections
   - Visual drag handles
   - Real-time preview

2. **Section Assignment**
   - Dropdown selector for each field
   - Assign/unassign fields to sections
   - Instant preview updates

3. **Section Settings**
   - Toggle visibility
   - Set default open/closed state
   - Visual indicators

4. **Live Preview**
   - Real-time form preview
   - Shows actual rendering
   - Field count per section

### Usage

**Location**: `/settings/investor-fields` → "Form Layout" tab

**Configuration Flow**:
```typescript
// 1. Load sections and fields
const sections = await prisma.investor_form_sections.findMany()
const fields = await prisma.investor_fields.findMany()

// 2. User drags field to new position
handleDragEnd(event) {
  const newOrder = arrayMove(fields, oldIndex, newIndex)
  // Update backend with new order
}

// 3. User assigns field to section
handleSectionChange(fieldId, sectionKey) {
  await fetch(`/api/settings/investor-fields/${fieldId}`, {
    method: "PATCH",
    body: JSON.stringify({ section_key: sectionKey })
  })
}

// 4. Save configuration
await fetch("/api/settings/investor-form-sections", {
  method: "POST",
  body: JSON.stringify(sections)
})
```

---

## Adding New Fields

### Via UI (Recommended)

1. Navigate to **Settings → Investor Fields**
2. Click **"Create Property"** button
3. Fill in field details:
   - **Name**: Unique identifier (e.g., `investment_stage`)
   - **Label**: Display name (e.g., "Investment Stage")
   - **Type**: Select from 9 types
   - **Section**: Assign to section
   - **Required**: Toggle validation
   - **Placeholder**: Input hint
   - **Help Text**: Description

4. For select/multiselect types:
   - Add options with value/label pairs
   - Set option order
   - Mark options active/inactive

5. Click **"Create"**

---

### Via API

**POST** `/api/settings/investor-fields`

```typescript
const response = await fetch("/api/settings/investor-fields", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "investment_focus",
    label: "Investment Focus Areas",
    type: "multiselect_dropdown",
    is_required: false,
    is_active: true,
    section_key: "investment_details",
    placeholder: "Select focus areas...",
    help_text: "Choose one or more investment focus areas",
    options: [
      { value: "tech", label: "Technology" },
      { value: "healthcare", label: "Healthcare" },
      { value: "finance", label: "Financial Services" },
      { value: "real_estate", label: "Real Estate" },
      { value: "energy", label: "Energy" }
    ]
  })
})
```

**Response**:
```json
{
  "id": 15,
  "name": "investment_focus",
  "label": "Investment Focus Areas",
  "type": "multiselect_dropdown",
  "is_required": false,
  "is_active": true,
  "is_system_field": false,
  "sort_order": 10,
  "section_key": "investment_details",
  "placeholder": "Select focus areas...",
  "help_text": "Choose one or more investment focus areas",
  "investor_field_options": [
    { "id": 45, "value": "tech", "label": "Technology", "sort_order": 0 },
    { "id": 46, "value": "healthcare", "label": "Healthcare", "sort_order": 1 },
    // ...
  ]
}
```

---

### Via Seed Script

```typescript
// scripts/seed-custom-investor-fields.ts
import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create field
  const field = await prisma.investor_fields.create({
    data: {
      name: 'risk_appetite',
      label: 'Risk Appetite',
      type: 'select',
      is_required: false,
      is_active: true,
      is_system_field: false,
      sort_order: 50,
      section_key: 'investment_details',
      help_text: 'Investor\'s risk tolerance level',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Create options
  const options = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' },
  ]

  for (let i = 0; i < options.length; i++) {
    await prisma.investor_field_options.create({
      data: {
        investor_field_id: field.id,
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

Run: `npx tsx scripts/seed-custom-investor-fields.ts`

---

## Field Validation

### Built-in Validation

1. **Required Fields**
   ```typescript
   {
     is_required: true  // HTML5 required attribute
   }
   ```

2. **Type Validation**
   - Email: Built-in email format validation
   - URL: Built-in URL format validation
   - Number: Numeric input enforcement
   - Date: Date format validation

3. **Custom Validation Rules** (JSON)
   ```typescript
   {
     validation_rules: {
       minLength: 5,
       maxLength: 100,
       min: 0,
       max: 1000000,
       pattern: "^[A-Z].*",  // Regex
       custom: "validateInvestmentAmount"  // Custom function
     }
   }
   ```

### Client-Side Validation

```typescript
// In InvestorDynamicField component
const validateField = (field, value) => {
  if (field.is_required && !value) {
    return "This field is required"
  }

  const rules = field.validation_rules
  if (rules) {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`
    }
    if (rules.min && Number(value) < rules.min) {
      return `Minimum value is ${rules.min}`
    }
    if (rules.max && Number(value) > rules.max) {
      return `Maximum value is ${rules.max}`
    }
  }

  return null
}
```

### Server-Side Validation

```typescript
// In API route
export async function POST(request: Request) {
  const body = await request.json()

  // Fetch field definitions
  const fields = await prisma.investor_fields.findMany({
    where: { is_active: true }
  })

  // Validate each field
  for (const field of fields) {
    const value = body.customFields[field.id]

    if (field.is_required && !value) {
      return NextResponse.json(
        { error: `${field.label} is required` },
        { status: 400 }
      )
    }

    // Additional validation...
  }

  // Save data...
}
```

---

## System Fields vs Custom Fields

### System Fields

**Definition**: Protected fields essential to the application's core functionality.

**Characteristics**:
- `is_system_field: true`
- Cannot be deleted via UI
- Limited editing (name/type locked)
- Always visible in field list

**Default System Fields**:
```typescript
[
  {
    name: "source",
    label: "Source",
    type: "select",
    is_system_field: true,
    section_key: "investor_information",
    options: ["website", "social_media", "referral", "event", ...]
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    is_system_field: true,
    section_key: "investment_details",
    options: ["potential", "contacted", "interested", "active", ...]
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    is_system_field: true,
    section_key: "investment_details",
    options: ["low", "normal", "high", "urgent"]
  }
]
```

### Custom Fields

**Definition**: User-created fields for specific business needs.

**Characteristics**:
- `is_system_field: false`
- Fully editable
- Can be deleted
- Drag-and-drop reordering

**Examples**:
```typescript
[
  {
    name: "investment_focus",
    label: "Investment Focus Areas",
    type: "multiselect_dropdown",
    is_system_field: false
  },
  {
    name: "portfolio_size",
    label: "Portfolio Size",
    type: "number",
    is_system_field: false
  },
  {
    name: "last_portfolio_review",
    label: "Last Portfolio Review",
    type: "date",
    is_system_field: false
  }
]
```

### UI Distinction

**Field List Display**:
```tsx
<SortableFieldCard field={field}>
  {field.is_system_field && (
    <Badge variant="outline" className="border-orange-300 text-orange-700">
      <AlertCircle className="w-3 h-3 mr-1" />
      System
    </Badge>
  )}

  {/* Delete button hidden for system fields */}
  {!field.is_system_field && (
    <Button onClick={() => deleteField(field)}>
      <Trash2 />
    </Button>
  )}
</SortableFieldCard>
```

---

## API Reference

### Endpoints

#### List Fields
```
GET /api/settings/investor-fields
```
Returns all investor fields with their options, ordered by sort_order.

**Response**:
```json
[
  {
    "id": 1,
    "name": "source",
    "label": "Source",
    "type": "select",
    "is_system_field": true,
    "investor_field_options": [...]
  },
  // ...
]
```

---

#### Create Field
```
POST /api/settings/investor-fields
```

**Body**:
```json
{
  "name": "field_name",
  "label": "Field Label",
  "type": "select",
  "is_required": false,
  "section_key": "investment_details",
  "options": [
    { "value": "opt1", "label": "Option 1" },
    { "value": "opt2", "label": "Option 2" }
  ]
}
```

---

#### Update Field
```
PUT /api/settings/investor-fields/[id]
```

**Body**:
```json
{
  "label": "Updated Label",
  "is_required": true,
  "help_text": "New help text"
}
```

---

#### Delete Field
```
DELETE /api/settings/investor-fields/[id]
```

Only works for custom fields (is_system_field = false).

---

#### Reorder Fields
```
POST /api/settings/investor-fields/reorder
```

**Body**:
```json
{
  "fieldIds": [5, 3, 1, 7, 2, 4, 6]
}
```

Updates sort_order based on array position.

---

#### Toggle Field Active State
```
POST /api/settings/investor-fields/[id]/toggle
```

Toggles is_active between true/false.

---

#### Assign Sections
```
POST /api/settings/investor-fields/assign-sections
```

**Body**:
```json
{
  "fields": [
    { "id": 1, "section_key": "investor_information" },
    { "id": 2, "section_key": "investment_details" },
    { "id": 3, "section_key": null }
  ]
}
```

---

## Component Examples

### InvestorDynamicField Component

**Location**: `/components/fields/investor-dynamic-field.tsx`

**Usage**:
```tsx
import { InvestorDynamicField } from "@/components/fields/investor-dynamic-field"

<InvestorDynamicField
  field={{
    id: 5,
    name: "investment_type",
    label: "Investment Type",
    type: "multiselect_dropdown",
    is_required: false,
    placeholder: "Select investment types...",
    help_text: "Choose one or more types",
    investor_field_options: [
      { id: 1, value: "stocks", label: "Stocks" },
      { id: 2, value: "bonds", label: "Bonds" },
      { id: 3, value: "real_estate", label: "Real Estate" }
    ]
  }}
  value={["stocks", "bonds"]}
  onChange={(newValue) => setFieldValue(5, newValue)}
/>
```

**Output**: Multiselect dropdown with badges for selected items.

---

### Field Rendering Logic

**Complete Switch Statement**:
```typescript
const renderField = () => {
  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return <Input type={field.type} {...props} />

    case "textarea":
      return <Textarea rows={3} {...props} />

    case "number":
      return <Input type="number" {...props} />

    case "date":
      return <Input type="date" {...props} />

    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.investor_field_options?.map(opt => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "multiselect":
      return (
        <div className="space-y-2">
          {field.investor_field_options?.map(opt => {
            const isChecked = Array.isArray(value) && value.includes(opt.value)
            return (
              <div key={opt.id} className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : []
                    onChange(
                      checked
                        ? [...current, opt.value]
                        : current.filter(v => v !== opt.value)
                    )
                  }}
                />
                <label>{opt.label}</label>
              </div>
            )
          })}
        </div>
      )

    case "multiselect_dropdown":
      const selected = Array.isArray(value) ? value : []
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex flex-wrap gap-1">
                {selected.map(val => {
                  const opt = field.investor_field_options?.find(o => o.value === val)
                  return (
                    <Badge key={val} onClick={(e) => {
                      e.stopPropagation()
                      onChange(selected.filter(v => v !== val))
                    }}>
                      {opt?.label}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )
                })}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {field.investor_field_options?.map(opt => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(
                    selected.includes(opt.value)
                      ? selected.filter(v => v !== opt.value)
                      : [...selected, opt.value]
                  )
                }}
                className="cursor-pointer p-2 hover:bg-accent"
              >
                <Check className={selected.includes(opt.value) ? "" : "invisible"} />
                {opt.label}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )
  }
}
```

---

### Form Integration

**In Investor Form**:
```tsx
// 1. Load fields
const customFields = await prisma.investor_fields.findMany({
  where: { is_active: true },
  include: { investor_field_options: true },
  orderBy: { sort_order: "asc" }
})

// 2. Group by section
const sections = await prisma.investor_form_sections.findMany({
  where: { is_visible: true },
  orderBy: { sort_order: "asc" }
})

// 3. Render
{sections.map(section => (
  <Card key={section.id}>
    <CardHeader className={section.gradient}>
      {section.name}
    </CardHeader>
    <CardContent>
      {customFields
        .filter(f => f.section_key === section.section_key)
        .map(field => (
          <InvestorDynamicField
            key={field.id}
            field={field}
            value={fieldValues[field.id]}
            onChange={(val) => setFieldValues(prev => ({
              ...prev,
              [field.id]: val
            }))}
          />
        ))
      }
    </CardContent>
  </Card>
))}
```

---

## Best Practices

### 1. Field Naming
- Use snake_case for `name` (e.g., `investment_focus`)
- Use Title Case for `label` (e.g., "Investment Focus Areas")
- Keep names descriptive and unique

### 2. Section Organization
- Group related fields logically
- Limit sections to 5-7 for optimal UX
- Use meaningful section names

### 3. Option Management
- Keep select options under 10 items
- Use multiselect_dropdown for 5+ options
- Provide clear, concise labels

### 4. Performance
- Use `is_active: false` instead of deleting fields
- Index section_key for faster queries
- Limit custom fields to 20-30 per entity

### 5. Validation
- Always validate required fields server-side
- Use help_text to guide users
- Provide clear error messages

---

## Troubleshooting

### Common Issues

**1. BigInt Serialization Error**
```
Error: Do not know how to serialize a BigInt
```
**Solution**: Convert BigInt to Number before JSON response
```typescript
const serialized = fields.map(f => ({
  ...f,
  id: Number(f.id)
}))
```

---

**2. Multiselect Not Saving**
```
Value stored as string instead of array
```
**Solution**: Ensure JSON.stringify for arrays
```typescript
value: Array.isArray(value) ? JSON.stringify(value) : String(value)
```

---

**3. Field Not Appearing in Form**
```
Field created but not visible
```
**Checklist**:
- [ ] `is_active: true`?
- [ ] `section_key` assigned?
- [ ] Section `is_visible: true`?
- [ ] Cleared browser cache?

---

**4. System Field Can't Be Deleted**
```
Delete button disabled
```
**Explanation**: This is by design. System fields are protected. Set `is_active: false` to hide instead.

---

## Conclusion

The dynamic fields system provides:
- **Flexibility**: Add unlimited custom fields
- **Type Safety**: 9 validated field types
- **Organization**: Section-based grouping
- **User Control**: Visual configuration interface
- **Extensibility**: Easy to add new field types

For questions or feature requests, refer to the main project documentation or contact the development team.

---

**Version**: 1.0.0
**Last Updated**: 2025-10-04
**Maintained By**: Marketing CRM Team
