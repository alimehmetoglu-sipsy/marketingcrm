# Investors Module - API Documentation

[← Back to README](./README.md) | [← Database Documentation](./DATABASE.md)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Endpoints](#-endpoints)
- [Request/Response Schemas](#-requestresponse-schemas)
- [Validation Rules](#-validation-rules)
- [Error Handling](#-error-handling)
- [BigInt Serialization](#-bigint-serialization)
- [Field Types](#-field-types)
- [Code Examples](#-code-examples)

---

## 🌐 Overview

The Investors API provides RESTful endpoints for managing investor records with dynamic custom fields. All endpoints require authentication and return JSON responses.

### Base URL
```
http://localhost:3000/api/investors
```

### Content Type
```
Content-Type: application/json
```

---

## 🔐 Authentication

All API endpoints require a valid NextAuth session.

### Headers Required
```http
Cookie: next-auth.session-token=<session-token>
```

### Unauthenticated Response
```json
{
  "error": "Unauthorized"
}
```
**Status Code:** `401 Unauthorized`

---

## 📡 Endpoints

### 1. List All Investors

Get a list of all investors with basic information (excluding custom fields).

#### Request
```http
GET /api/investors
```

#### Response
```json
[
  {
    "id": 1,
    "lead_id": null,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+90 555 123 4567",
    "company": "Tech Corp",
    "position": "CEO",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "status": "active",
    "priority": "high",
    "budget": "1000000",
    "timeline": "Q1 2025",
    "notes": "High potential investor",
    "important_notes": "Decision maker",
    "investment_preferences": "Tech startups",
    "risk_tolerance": "medium",
    "communication_preferences": "email",
    "representative_id": null,
    "source": "referral",
    "last_activity_at": "2025-10-03T10:00:00.000Z",
    "activity_status": "active",
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2025-10-01T10:00:00.000Z",
    "updated_at": "2025-10-03T10:00:00.000Z"
  }
]
```

#### Response Details

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Investor ID (BigInt serialized to number) |
| `lead_id` | number \| null | Associated lead ID if converted from lead |
| `full_name` | string | Investor's full name |
| `email` | string | Email address |
| `phone` | string \| null | Phone number (unique constraint) |
| `status` | string | Current status (default: "potential") |
| `priority` | string \| null | Priority level |
| `source` | string | Source of investor (default: "other") |
| `representative_id` | number \| null | Assigned representative ID |
| `created_by` | number \| null | User ID who created the record |
| `updated_by` | number \| null | User ID who last updated the record |

#### Status Codes
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

#### Query Constraints
- **Limit:** 100 records
- **Order:** Descending by `created_at`

---

### 2. Get Single Investor

Get detailed information about a specific investor including user assignment.

#### Request
```http
GET /api/investors/{id}
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Investor ID |

#### Response
```json
{
  "id": 1,
  "lead_id": null,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "company": "Tech Corp",
  "position": "CEO",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "status": "active",
  "priority": "high",
  "budget": "1000000",
  "timeline": "Q1 2025",
  "notes": "High potential investor",
  "source": "referral",
  "representative_id": null,
  "created_by": 1,
  "updated_by": 1,
  "created_at": "2025-10-01T10:00:00.000Z",
  "updated_at": "2025-10-03T10:00:00.000Z",
  "assigned_user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "assigned_at": "2025-10-02T14:30:00.000Z",
    "assigned_by": {
      "id": 1,
      "name": "Admin User"
    }
  }
}
```

#### Response with No Assignment
```json
{
  "id": 1,
  "full_name": "John Doe",
  // ... other fields
  "assigned_user": null
}
```

#### Status Codes
- `200 OK` - Success
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Investor not found
- `500 Internal Server Error` - Server error

---

### 3. Create Investor

Create a new investor with static fields and custom field values.

#### Request
```http
POST /api/investors
Content-Type: application/json
```

#### Request Body
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "customFields": {
    "1": "Technology",          // field_id: value (text)
    "2": "San Francisco",        // field_id: value (text)
    "3": ["Software", "AI"],     // field_id: array (multiselect)
    "4": "2025-01-15",          // field_id: value (date)
    "5": "1000000"              // field_id: value (number)
  }
}
```

#### Request Schema

**Static Fields (Direct Properties)**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `full_name` | string | No | max 255 chars | Investor's full name |
| `email` | string | No | valid email | Email address |
| `phone` | string | No | unique | Phone number |

**Custom Fields (customFields Object)**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `{field_id}` | string \| array | Depends on field | Value for the custom field |

#### System Fields (via customFields)

These system fields can be provided via `customFields` using their field IDs:

```json
{
  "customFields": {
    "{source_field_id}": "referral",    // Default: "referral"
    "{status_field_id}": "potential",   // Default: "potential"
    "{priority_field_id}": "high"       // Default: null
  }
}
```

#### Response - Success
```json
{
  "id": 1,
  "lead_id": null,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "source": "referral",
  "status": "potential",
  "priority": null,
  "notes": null,
  "representative_id": null,
  "created_by": null,
  "updated_by": null,
  "created_at": "2025-10-04T10:00:00.000Z",
  "updated_at": "2025-10-04T10:00:00.000Z"
}
```
**Status Code:** `201 Created`

#### Response - Validation Error
```json
{
  "error": "Required fields missing",
  "details": "Please fill in the following required fields: Industry, Investment Amount",
  "missingFields": ["Industry", "Investment Amount"]
}
```
**Status Code:** `400 Bad Request`

#### Response - Duplicate Phone
```json
{
  "error": "An investor with this phone number already exists"
}
```
**Status Code:** `400 Bad Request`

#### Status Codes
- `201 Created` - Successfully created
- `400 Bad Request` - Validation error or duplicate phone
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### 4. Update Investor

Update an existing investor's information and custom fields.

#### Request
```http
PUT /api/investors/{id}
Content-Type: application/json
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Investor ID |

#### Request Body
```json
{
  "full_name": "John Doe Jr.",
  "email": "john.jr@example.com",
  "phone": "+90 555 123 4567",
  "notes": "Updated notes",
  "customFields": {
    "1": "Finance",             // Updated field value
    "2": "New York",            // Updated field value
    "3": ["Software", "AI", "ML"], // Updated multiselect
    "4": "2025-03-15",          // Updated date
    "5": "2000000",             // Updated number
    "6": null                   // Clear field value
  }
}
```

#### Request Schema

**Static Fields (Direct Properties)**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | No | Updated full name |
| `email` | string | No | Updated email |
| `phone` | string | No | Updated phone |
| `notes` | string | No | Updated notes |

**System Fields Handling**

System fields (source, status, priority) can be updated in two ways:

1. **By Field ID (Recommended):**
```json
{
  "customFields": {
    "{source_field_id}": "website",
    "{status_field_id}": "active",
    "{priority_field_id}": "high"
  }
}
```

2. **By Field Name (Alternative):**
```json
{
  "customFields": {
    "source": "website",
    "status": "active",
    "priority": "high"
  }
}
```

3. **Direct Property (Fallback):**
```json
{
  "source": "website",
  "status": "active",
  "priority": "high"
}
```

#### Update Behavior

1. **Required Field Validation:** All required fields must have values
2. **Custom Fields:**
   - All existing custom field values are deleted
   - New values are inserted (excluding system fields)
   - Empty values are skipped
3. **System Fields:**
   - Updated directly in the investors table
   - NOT stored in investor_field_values
4. **Multiselect Fields:**
   - Arrays are stored as JSON strings
   - Use `JSON.stringify()` for storage

#### Response - Success
```json
{
  "id": 1,
  "lead_id": null,
  "full_name": "John Doe Jr.",
  "email": "john.jr@example.com",
  "phone": "+90 555 123 4567",
  "source": "website",
  "status": "active",
  "priority": "high",
  "notes": "Updated notes",
  "representative_id": null,
  "created_by": null,
  "updated_by": null,
  "created_at": "2025-10-01T10:00:00.000Z",
  "updated_at": "2025-10-04T10:00:00.000Z"
}
```
**Status Code:** `200 OK`

#### Response - Validation Error
```json
{
  "error": "Required fields missing",
  "details": "Please fill in the following required fields: Industry",
  "missingFields": ["Industry"]
}
```
**Status Code:** `400 Bad Request`

#### Status Codes
- `200 OK` - Successfully updated
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### 5. Assign User to Investor

Assign or unassign a user to/from an investor.

#### Request
```http
PATCH /api/investors/{id}
Content-Type: application/json
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Investor ID |

#### Request Body - Assign User
```json
{
  "user_id": 2
}
```

#### Request Body - Unassign User
```json
{
  "user_id": null
}
```

#### Response - Assigned
```json
{
  "success": true,
  "assigned_user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "assigned_at": "2025-10-04T10:00:00.000Z",
    "assigned_by": {
      "id": 1,
      "name": "Admin User"
    }
  }
}
```
**Status Code:** `200 OK`

#### Response - Unassigned
```json
{
  "success": true,
  "assigned_user": null
}
```
**Status Code:** `200 OK`

#### Response - Invalid User
```json
{
  "error": "User not found or inactive"
}
```
**Status Code:** `400 Bad Request`

#### Response - Investor Not Found
```json
{
  "error": "Investor not found"
}
```
**Status Code:** `404 Not Found`

#### Assignment Logic

1. **New Assignment:**
   - Delete any existing assignment for this investor
   - Create new assignment record
   - Record assigner (current session user)

2. **Unassignment:**
   - Delete all assignment records for this investor
   - Return null for `assigned_user`

3. **User Validation:**
   - User must exist in database
   - User status must be "active"

#### Status Codes
- `200 OK` - Successfully assigned/unassigned
- `400 Bad Request` - Invalid user
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Investor not found
- `500 Internal Server Error` - Server error

---

### 6. Delete Investor

Delete an investor and all associated data (cascades to field values and activities).

#### Request
```http
DELETE /api/investors/{id}
```

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Investor ID |

#### Response - Success
```json
{
  "success": true
}
```
**Status Code:** `200 OK`

#### Cascade Behavior

Deleting an investor will automatically delete:
- All `investor_field_values` records
- All `activities` records
- All `user_assignments` records (where entity_type='investor')

#### Status Codes
- `200 OK` - Successfully deleted
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error (e.g., investor not found)

---

## 📋 Request/Response Schemas

### Investor Schema (Core Table)

```typescript
interface Investor {
  id: number                      // BigInt converted to number
  lead_id: number | null          // BigInt converted to number
  full_name: string               // VARCHAR(255)
  email: string                   // VARCHAR(255)
  phone: string | null            // VARCHAR(255), UNIQUE
  company: string | null          // VARCHAR(255)
  position: string | null         // VARCHAR(255)
  website: string | null          // VARCHAR(255)
  industry: string | null         // VARCHAR(255)
  status: string                  // VARCHAR(255), DEFAULT 'potential'
  priority: string | null         // VARCHAR(50)
  budget: string | null           // VARCHAR(255)
  timeline: string | null         // VARCHAR(255)
  notes: string | null            // TEXT
  important_notes: string | null  // TEXT
  investment_preferences: string | null // TEXT
  risk_tolerance: 'low' | 'medium' | 'high' | 'very_high' | null
  communication_preferences: 'email' | 'phone' | 'meeting' | 'video_call' | null
  representative_id: number | null // BigInt converted to number
  source: string                  // VARCHAR(255), DEFAULT 'other'
  last_activity_at: string | null // ISO 8601 timestamp
  activity_status: 'active' | 'inactive' // ENUM, DEFAULT 'active'
  created_by: number | null       // BigInt converted to number
  updated_by: number | null       // BigInt converted to number
  created_at: string | null       // ISO 8601 timestamp
  updated_at: string | null       // ISO 8601 timestamp
}
```

### User Assignment Schema

```typescript
interface AssignedUser {
  id: number                      // User ID
  name: string                    // User name
  email: string                   // User email
  assigned_at: string             // ISO 8601 timestamp
  assigned_by: {
    id: number                    // Assigner user ID
    name: string                  // Assigner name
  }
}
```

### Custom Fields Schema

```typescript
interface CustomFieldValue {
  [fieldId: string]: string | string[] | null
}

// Example:
const customFields: CustomFieldValue = {
  "1": "Technology",              // text field
  "2": "San Francisco",           // text field
  "3": ["Software", "AI"],        // multiselect field (array)
  "4": "2025-01-15",              // date field (ISO string)
  "5": "1000000"                  // number field (string)
}
```

---

## ✅ Validation Rules

### Required Field Validation

The API validates required fields dynamically based on `investor_fields` table configuration.

#### Validation Query
```typescript
const requiredFields = await prisma.investor_fields.findMany({
  where: {
    is_required: true,
    is_active: true
  },
  select: {
    id: true,
    name: true,
    label: true
  }
})
```

#### Validation Logic
```typescript
for (const field of requiredFields) {
  const fieldValue = customFields?.[field.name] || customFields?.[field.id.toString()]

  if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
    missingFields.push(field.label)
  }
}
```

### Phone Number Validation

- **Constraint:** UNIQUE in database
- **Check:** Before creating investor
- **Error:** "An investor with this phone number already exists"

```typescript
if (investorData.phone) {
  const existingPhone = await prisma.investors.findUnique({
    where: { phone: investorData.phone }
  })

  if (existingPhone) {
    return NextResponse.json(
      { error: "An investor with this phone number already exists" },
      { status: 400 }
    )
  }
}
```

### User Assignment Validation

```typescript
const user = await prisma.users.findUnique({
  where: { id: BigInt(user_id) }
})

if (!user || user.status !== "active") {
  return NextResponse.json(
    { error: "User not found or inactive" },
    { status: 400 }
  )
}
```

---

## ❌ Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: string              // Error message
  details?: string           // Optional detailed message
  missingFields?: string[]   // Optional list of missing field labels
}
```

### Common Error Responses

#### 400 Bad Request - Required Fields Missing
```json
{
  "error": "Required fields missing",
  "details": "Please fill in the following required fields: Industry, Investment Amount",
  "missingFields": ["Industry", "Investment Amount"]
}
```

#### 400 Bad Request - Duplicate Phone
```json
{
  "error": "An investor with this phone number already exists"
}
```

#### 400 Bad Request - Invalid User
```json
{
  "error": "User not found or inactive"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "error": "Investor not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to create investor"
}
```

```json
{
  "error": "Failed to update investor",
  "details": "Specific error message from exception"
}
```

### Error Logging

All errors are logged to console with context:

```typescript
console.error("Error creating investor:", error)
console.error("Error message:", error?.message)
console.error("Error stack:", error?.stack)
```

---

## 🔢 BigInt Serialization

### The Problem

MySQL `BIGINT` values are represented as `BigInt` in JavaScript, which **cannot be serialized to JSON** directly.

```typescript
// ❌ This will fail with serialization error
const investor = await prisma.investors.findUnique({ where: { id: 1n } })
return NextResponse.json(investor)
// Error: Do not know how to serialize a BigInt
```

### The Solution

Convert all `BigInt` values to `number` before JSON serialization.

```typescript
// ✅ Correct approach
const investor = await prisma.investors.findUnique({ where: { id: 1n } })

const serialized = {
  ...investor,
  id: Number(investor.id),
  lead_id: investor.lead_id ? Number(investor.lead_id) : null,
  representative_id: investor.representative_id ? Number(investor.representative_id) : null,
  created_by: investor.created_by ? Number(investor.created_by) : null,
  updated_by: investor.updated_by ? Number(investor.updated_by) : null,
}

return NextResponse.json(serialized)
```

### List Serialization

```typescript
const investors = await prisma.investors.findMany()

const serialized = investors.map(investor => ({
  ...investor,
  id: Number(investor.id),
  lead_id: investor.lead_id ? Number(investor.lead_id) : null,
  representative_id: investor.representative_id ? Number(investor.representative_id) : null,
  created_by: investor.created_by ? Number(investor.created_by) : null,
  updated_by: investor.updated_by ? Number(investor.updated_by) : null,
}))

return NextResponse.json(serialized)
```

### Fields Requiring Serialization

| Field | Type in DB | Type in Response |
|-------|------------|------------------|
| `id` | BIGINT | number |
| `lead_id` | BIGINT | number \| null |
| `representative_id` | BIGINT | number \| null |
| `created_by` | BIGINT | number \| null |
| `updated_by` | BIGINT | number \| null |
| `investor_field_id` | BIGINT | number |

---

## 📝 Field Types

### Supported Field Types

| Type | Description | Storage Format | Example Value |
|------|-------------|----------------|---------------|
| `text` | Single-line text | String | `"John Doe"` |
| `textarea` | Multi-line text | String | `"Long description..."` |
| `email` | Email address | String | `"john@example.com"` |
| `url` | Website URL | String | `"https://example.com"` |
| `number` | Numeric value | String | `"1000000"` |
| `date` | Date value | ISO String | `"2025-01-15"` |
| `select` | Single choice dropdown | String | `"technology"` |
| `multiselect` | Multiple checkboxes | JSON Array String | `"[\"Software\",\"AI\"]"` |
| `multiselect_dropdown` | Multiple choice dropdown | JSON Array String | `"[\"Software\",\"AI\"]"` |

### Field Type Definitions

```typescript
enum InvestorFieldType {
  text = 'text',
  select = 'select',
  multiselect = 'multiselect',
  multiselect_dropdown = 'multiselect_dropdown',
  date = 'date',
  number = 'number',
  textarea = 'textarea',
  email = 'email',
  url = 'url'
}
```

### Multiselect Field Storage

Multiselect values are stored as JSON-stringified arrays:

```typescript
// Storing multiselect value
const value = ["Software", "AI", "Machine Learning"]
const storedValue = JSON.stringify(value) // "[\"Software\",\"AI\",\"Machine Learning\"]"

await prisma.investor_field_values.create({
  data: {
    investor_id: 1n,
    investor_field_id: 3n,
    value: storedValue
  }
})

// Reading multiselect value
const fieldValue = await prisma.investor_field_values.findFirst({
  where: { investor_id: 1n, investor_field_id: 3n }
})

const parsedValue = JSON.parse(fieldValue.value) // ["Software", "AI", "Machine Learning"]
```

---

## 💻 Code Examples

### Complete Create Investor Example

```typescript
// Client-side request
const createInvestor = async () => {
  const response = await fetch('/api/investors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 555 987 6543",
      customFields: {
        "1": "Finance",                    // Industry (text)
        "2": "New York",                   // Location (text)
        "3": ["Stocks", "Bonds", "Crypto"], // Interests (multiselect)
        "4": "2025-06-01",                 // Expected Start Date (date)
        "5": "5000000",                    // Investment Amount (number)
        "6": "email",                      // Preferred Contact (select)
      }
    })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Error:', data)
    return
  }

  console.log('Created investor:', data)
}
```

### Complete Update Investor Example

```typescript
// Client-side request
const updateInvestor = async (investorId: number) => {
  const response = await fetch(`/api/investors/${investorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: "Jane Smith Jr.",
      email: "jane.jr@example.com",
      phone: "+1 555 987 6543",
      notes: "Updated investment preferences",
      customFields: {
        "1": "Technology",                 // Changed industry
        "2": "San Francisco",              // Changed location
        "3": ["AI", "ML", "Robotics"],     // Updated interests
        "4": "2025-09-01",                 // Changed date
        "5": "10000000",                   // Increased amount
        "source": "website",               // Update system field
        "status": "active",                // Update system field
        "priority": "high"                 // Update system field
      }
    })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Error:', data)
    if (data.missingFields) {
      console.error('Missing required fields:', data.missingFields)
    }
    return
  }

  console.log('Updated investor:', data)
}
```

### Assign User Example

```typescript
// Assign user to investor
const assignUser = async (investorId: number, userId: number) => {
  const response = await fetch(`/api/investors/${investorId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId
    })
  })

  const data = await response.json()
  console.log('Assignment result:', data)
}

// Unassign user from investor
const unassignUser = async (investorId: number) => {
  const response = await fetch(`/api/investors/${investorId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: null
    })
  })

  const data = await response.json()
  console.log('Unassignment result:', data)
}
```

### Error Handling Example

```typescript
const handleApiRequest = async () => {
  try {
    const response = await fetch('/api/investors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investorData)
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle different error types
      switch (response.status) {
        case 400:
          if (data.missingFields) {
            console.error('Required fields missing:', data.missingFields)
            // Show validation errors to user
            showValidationErrors(data.missingFields)
          } else {
            console.error('Bad request:', data.error)
          }
          break

        case 401:
          console.error('Not authenticated')
          // Redirect to login
          redirectToLogin()
          break

        case 404:
          console.error('Resource not found')
          break

        case 500:
          console.error('Server error:', data.details || data.error)
          break

        default:
          console.error('Unknown error:', data)
      }
      return
    }

    // Success
    console.log('Success:', data)

  } catch (error) {
    console.error('Network error:', error)
  }
}
```

### Server-Side Implementation Reference

```typescript
// Complete POST endpoint implementation
export async function POST(request: Request) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { customFields, ...investorData } = body

    // 3. Validate required fields
    const requiredFields = await prisma.investor_fields.findMany({
      where: { is_required: true, is_active: true },
      select: { id: true, name: true, label: true }
    })

    const missingFields: string[] = []
    for (const field of requiredFields) {
      const fieldValue = customFields?.[field.name] || customFields?.[field.id.toString()]
      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        missingFields.push(field.label)
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: "Required fields missing",
        details: `Please fill in the following required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 })
    }

    // 4. Check phone uniqueness
    if (investorData.phone) {
      const existingPhone = await prisma.investors.findUnique({
        where: { phone: investorData.phone }
      })
      if (existingPhone) {
        return NextResponse.json(
          { error: "An investor with this phone number already exists" },
          { status: 400 }
        )
      }
    }

    // 5. Extract system field values
    const sourceField = await prisma.investor_fields.findFirst({
      where: { name: "source" },
      select: { id: true }
    })
    const statusField = await prisma.investor_fields.findFirst({
      where: { name: "status" },
      select: { id: true }
    })
    const priorityField = await prisma.investor_fields.findFirst({
      where: { name: "priority" },
      select: { id: true }
    })

    const sourceValue = sourceField && customFields?.[sourceField.id.toString()]
      ? customFields[sourceField.id.toString()]
      : "referral"
    const statusValue = statusField && customFields?.[statusField.id.toString()]
      ? customFields[statusField.id.toString()]
      : "potential"
    const priorityValue = priorityField && customFields?.[priorityField.id.toString()]
      ? customFields[priorityField.id.toString()]
      : null

    // 6. Create investor
    const investor = await prisma.investors.create({
      data: {
        full_name: investorData.full_name,
        email: investorData.email,
        phone: investorData.phone || null,
        source: sourceValue,
        status: statusValue,
        priority: priorityValue,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    // 7. Save custom field values
    if (customFields && typeof customFields === "object") {
      const fieldValues = Object.entries(customFields)
        .filter(([_, value]) => value !== null && value !== undefined && value !== "")
        .map(([fieldId, value]) => ({
          investor_id: investor.id,
          investor_field_id: BigInt(fieldId),
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
          created_at: new Date(),
          updated_at: new Date(),
        }))

      if (fieldValues.length > 0) {
        await prisma.investor_field_values.createMany({
          data: fieldValues
        })
      }
    }

    // 8. Serialize and return
    return NextResponse.json({
      ...investor,
      id: Number(investor.id),
      lead_id: investor.lead_id ? Number(investor.lead_id) : null,
      representative_id: investor.representative_id ? Number(investor.representative_id) : null,
      created_by: investor.created_by ? Number(investor.created_by) : null,
      updated_by: investor.updated_by ? Number(investor.updated_by) : null,
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating investor:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create investor" },
      { status: 500 }
    )
  }
}
```

---

## 🔍 Testing the API

### Using cURL

#### Create Investor
```bash
curl -X POST http://localhost:3000/api/investors \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "full_name": "Test Investor",
    "email": "test@example.com",
    "phone": "+1 555 000 0000",
    "customFields": {
      "1": "Technology",
      "2": "Boston"
    }
  }'
```

#### Get Investor
```bash
curl http://localhost:3000/api/investors/1 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Update Investor
```bash
curl -X PUT http://localhost:3000/api/investors/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "full_name": "Updated Investor",
    "customFields": {
      "1": "Finance"
    }
  }'
```

#### Assign User
```bash
curl -X PATCH http://localhost:3000/api/investors/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "user_id": 2
  }'
```

#### Delete Investor
```bash
curl -X DELETE http://localhost:3000/api/investors/1 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## 📊 HTTP Status Codes Reference

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| `200 OK` | Success | GET, PUT, PATCH, DELETE successful |
| `201 Created` | Resource created | POST successful |
| `400 Bad Request` | Client error | Validation error, duplicate phone, invalid user |
| `401 Unauthorized` | Authentication required | No valid session |
| `404 Not Found` | Resource not found | Investor ID doesn't exist |
| `500 Internal Server Error` | Server error | Database error, unexpected exception |

---

[← Back to README](./README.md) | [← Database Documentation](./DATABASE.md)
