# Leads Module - API Documentation

[← Back to README](./README.md)

---

## 📋 Table of Contents

- [API Endpoints Overview](#api-endpoints-overview)
- [Lead CRUD Operations](#lead-crud-operations)
- [Lead Field Management](#lead-field-management)
- [Form Section Management](#form-section-management)
- [Request/Response Examples](#requestresponse-examples)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)

---

## API Endpoints Overview

### Lead Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/leads` | List all leads | ✅ |
| `POST` | `/api/leads` | Create new lead | ✅ |
| `GET` | `/api/leads/[id]` | Get single lead | ✅ |
| `PUT` | `/api/leads/[id]` | Update lead | ✅ |
| `PATCH` | `/api/leads/[id]` | Assign/unassign user to lead | ✅ |
| `DELETE` | `/api/leads/[id]` | Delete lead | ✅ |

### Field Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/settings/lead-fields` | List all fields | ✅ |
| `POST` | `/api/settings/lead-fields` | Create new field | ✅ |
| `GET` | `/api/settings/lead-fields/[id]` | Get single field | ✅ |
| `PUT` | `/api/settings/lead-fields/[id]` | Update field | ✅ |
| `DELETE` | `/api/settings/lead-fields/[id]` | Delete field | ✅ |
| `POST` | `/api/settings/lead-fields/reorder` | Reorder fields | ✅ |
| `POST` | `/api/settings/lead-fields/[id]/toggle` | Toggle field active state | ✅ |
| `POST` | `/api/settings/lead-fields/assign-sections` | Assign fields to sections | ✅ |

### Form Section Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/settings/lead-form-sections` | List all sections | ✅ |
| `POST` | `/api/settings/lead-form-sections` | Update sections | ✅ |

---

## Lead CRUD Operations

### 1. List All Leads

**Endpoint:** `GET /api/leads`

**Description:** Retrieves a list of all leads with basic information. **Note:** Custom field values are NOT included in this endpoint. Use the page-level data fetching or GET single lead for custom fields.

**Query Parameters:**
- None (pagination could be added in future)

**Response:**

```typescript
// Status: 200 OK
[
  {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+90 555 123 4567",
    "source": "website",
    "status": "new",
    "priority": "high",
    "notes_text": "Interested in real estate",
    "created_at": "2025-01-04T10:30:00.000Z",
    "updated_at": "2025-01-04T10:30:00.000Z",
    "representative_id": null,
    "activity_id": null
  },
  // ... more leads
]
```

**Note:** For leads with custom field values and user assignments, use the page component which fetches data server-side with Prisma includes.

**Error Responses:**

```typescript
// Status: 401 Unauthorized
{
  "error": "Unauthorized"
}

// Status: 500 Internal Server Error
{
  "error": "Failed to fetch leads"
}
```

---

### 2. Create New Lead

**Endpoint:** `POST /api/leads`

**Description:** Creates a new lead with contact information and custom fields.

**Request Body:**

```typescript
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "customFields": {
    "1": "website",          // source field (field ID 1)
    "2": "new",              // status field (field ID 2)
    "3": "high",             // priority field (field ID 3)
    "4": "Real Estate",      // custom text field
    "5": ["Investment", "Consultation"]  // multiselect field
  }
}
```

**Required Fields:**
- `full_name` (string, min 1 char)
- `email` (valid email format, unique)
- `phone` (string, min 1 char, unique)

**Validation:**
- Email must be unique across all leads
- Phone must be unique across all leads
- All fields marked as `is_required: true` must be provided

**Response:**

```typescript
// Status: 201 Created
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "source": "website",
  "status": "new",
  "priority": "high",
  "notes_text": null,
  "created_at": "2025-01-04T10:30:00.000Z",
  "updated_at": "2025-01-04T10:30:00.000Z",
  "representative_id": null,
  "activity_id": null
}
```

**Error Responses:**

```typescript
// Status: 400 Bad Request - Duplicate Email
{
  "error": "A lead with this email already exists"
}

// Status: 400 Bad Request - Duplicate Phone
{
  "error": "A lead with this phone number already exists"
}

// Status: 400 Bad Request - Missing Required Fields
{
  "error": "Required fields are missing",
  "details": "Please fill in the following required fields: Interest Area, Budget",
  "missingFields": ["Interest Area", "Budget"]
}

// Status: 401 Unauthorized
{
  "error": "Unauthorized"
}

// Status: 500 Internal Server Error
{
  "error": "Failed to create lead"
}
```

---

### 3. Get Single Lead

**Endpoint:** `GET /api/leads/[id]`

**Description:** Retrieves a single lead by ID.

**Path Parameters:**
- `id` - Lead ID (number)

**Response:**

```typescript
// Status: 200 OK
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "source": "website",
  "status": "new",
  "priority": "high",
  "notes_text": "Interested in real estate",
  "created_at": "2025-01-04T10:30:00.000Z",
  "updated_at": "2025-01-04T10:30:00.000Z"
}
```

**Error Responses:**

```typescript
// Status: 404 Not Found
{
  "error": "Lead not found"
}

// Status: 401 Unauthorized
{
  "error": "Unauthorized"
}

// Status: 500 Internal Server Error
{
  "error": "Failed to fetch lead"
}
```

---

### 4. Update Lead

**Endpoint:** `PUT /api/leads/[id]`

**Description:** Updates an existing lead's information and custom fields.

**Path Parameters:**
- `id` - Lead ID (number)

**Request Body:**

```typescript
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "customFields": {
    "1": "referral",         // changed source
    "2": "contacted",        // changed status
    "3": "high",             // priority
    "4": "Commercial Real Estate",  // updated custom field
    "5": ["Investment"]      // updated multiselect
  }
}
```

**System Field Handling:**
- Source, Status, Priority are stored in `leads` table directly
- Other custom fields are stored in `lead_field_values` table
- Existing custom field values are deleted and recreated

**Response:**

```typescript
// Status: 200 OK
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "source": "referral",
  "status": "contacted",
  "priority": "high",
  "notes_text": "Interested in real estate",
  "created_at": "2025-01-04T10:30:00.000Z",
  "updated_at": "2025-01-04T14:45:00.000Z"
}
```

**Error Responses:**

```typescript
// Status: 404 Not Found
{
  "error": "Lead not found"
}

// Status: 401 Unauthorized
{
  "error": "Unauthorized"
}

// Status: 500 Internal Server Error
{
  "error": "Failed to update lead",
  "details": "Detailed error message"
}
```

---

### 5. Assign/Unassign User to Lead

**Endpoint:** `PATCH /api/leads/[id]`

**Description:** Assigns or unassigns a user to a lead for ownership tracking.

**Path Parameters:**
- `id` - Lead ID (number)

**Request Body:**

```typescript
{
  "user_id": 5  // User ID to assign, or null to unassign
}
```

**Response:**

```typescript
// Status: 200 OK
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "source": "website",
  "status": "new",
  "priority": "high",
  "created_at": "2025-01-04T10:30:00.000Z",
  "updated_at": "2025-01-04T14:45:00.000Z",
  "user_assignments": [
    {
      "id": 1,
      "user_id": 5,
      "entity_type": "lead",
      "entity_id": 1,
      "assigned_by": 1,
      "created_at": "2025-01-04T14:45:00.000Z",
      "user_assigned": {
        "id": 5,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "user_assigner": {
        "id": 1,
        "name": "Admin User"
      }
    }
  ]
}
```

**Error Responses:**

```typescript
// Status: 404 Not Found - Lead
{
  "error": "Lead not found"
}

// Status: 404 Not Found - User
{
  "error": "User not found"
}

// Status: 401 Unauthorized
{
  "error": "Unauthorized"
}

// Status: 500 Internal Server Error
{
  "error": "Failed to assign user",
  "details": "Detailed error message"
}
```

---

### 6. Delete Lead

**Endpoint:** `DELETE /api/leads/[id]`

**Description:** Deletes a lead and all associated data (custom field values, activities, notes, user assignments).

**Path Parameters:**
- `id` - Lead ID (number)

**Cascade Behavior:**
- All `lead_field_values` for this lead are deleted
- All `activities` for this lead are deleted
- All `notes` for this lead are deleted
- All `user_assignments` for this lead are deleted

**Response:**

```typescript
// Status: 200 OK
{
  "success": true
}
```

**Error Responses:**

```typescript
// Status: 404 Not Found
{
  "error": "Lead not found"
}

// Status: 401 Unauthorized
{
  "error": "Unauthorized"
}

// Status: 500 Internal Server Error
{
  "error": "Failed to delete lead"
}
```

---

## Lead Field Management

### 1. List All Fields

**Endpoint:** `GET /api/settings/lead-fields`

**Description:** Retrieves all lead field definitions with their options.

**Response:**

```typescript
// Status: 200 OK
[
  {
    "id": 1,
    "name": "source",
    "label": "Source",
    "type": "select",
    "is_required": true,
    "is_active": true,
    "is_system_field": true,
    "sort_order": 0,
    "section_key": "lead_information",
    "placeholder": "Select source...",
    "help_text": "How did this lead find us?",
    "lead_field_options": [
      { "id": 1, "value": "website", "label": "Website", "sort_order": 0 },
      { "id": 2, "value": "social_media", "label": "Social Media", "sort_order": 1 },
      { "id": 3, "value": "referral", "label": "Referral", "sort_order": 2 }
    ]
  },
  // ... more fields
]
```

---

### 2. Create New Field

**Endpoint:** `POST /api/settings/lead-fields`

**Description:** Creates a new custom field definition.

**Request Body:**

```typescript
{
  "name": "interest_area",
  "label": "Interest Area",
  "type": "multiselect_dropdown",
  "is_required": false,
  "is_active": true,
  "section_key": "lead_details",
  "placeholder": "Select areas of interest...",
  "help_text": "What is the lead interested in?",
  "options": [
    { "value": "real_estate", "label": "Real Estate" },
    { "value": "investment", "label": "Investment" },
    { "value": "consultation", "label": "Consultation" }
  ]
}
```

**Field Types:**
- `text` - Single-line text
- `textarea` - Multi-line text
- `email` - Email address
- `phone` - Phone number
- `url` - Website URL
- `number` - Numeric value
- `date` - Date picker
- `select` - Single choice dropdown
- `multiselect` - Multiple checkboxes
- `multiselect_dropdown` - Multiple choice dropdown

**Response:**

```typescript
// Status: 201 Created
{
  "id": 10,
  "name": "interest_area",
  "label": "Interest Area",
  "type": "multiselect_dropdown",
  "is_required": false,
  "is_active": true,
  "is_system_field": false,
  "sort_order": 10,
  "section_key": "lead_details",
  "lead_field_options": [
    { "id": 15, "value": "real_estate", "label": "Real Estate", "sort_order": 0 },
    { "id": 16, "value": "investment", "label": "Investment", "sort_order": 1 },
    { "id": 17, "value": "consultation", "label": "Consultation", "sort_order": 2 }
  ]
}
```

---

### 3. Update Field

**Endpoint:** `PUT /api/settings/lead-fields/[id]`

**Description:** Updates an existing field definition.

**Request Body:**

```typescript
{
  "label": "Primary Interest",
  "is_required": true,
  "help_text": "Select the lead's primary area of interest"
}
```

**Note:** System fields (is_system_field = true) cannot have their `name` or `type` changed.

---

### 4. Delete Field

**Endpoint:** `DELETE /api/settings/lead-fields/[id]`

**Description:** Deletes a custom field (system fields cannot be deleted).

**Cascade Behavior:**
- All `lead_field_values` for this field are deleted
- All `lead_field_options` for this field are deleted

**Response:**

```typescript
// Status: 200 OK
{
  "success": true
}
```

**Error Responses:**

```typescript
// Status: 403 Forbidden - System Field
{
  "error": "Cannot delete system field"
}
```

---

### 5. Reorder Fields

**Endpoint:** `POST /api/settings/lead-fields/reorder`

**Description:** Updates the sort order of fields.

**Request Body:**

```typescript
{
  "fieldIds": [5, 3, 1, 7, 2, 4, 6]  // Array of field IDs in desired order
}
```

**Response:**

```typescript
// Status: 200 OK
{
  "success": true,
  "updated": 7
}
```

---

## Form Section Management

### 1. List All Sections

**Endpoint:** `GET /api/settings/lead-form-sections`

**Description:** Retrieves all form sections.

**Response:**

```typescript
// Status: 200 OK
[
  {
    "id": 1,
    "section_key": "contact_information",
    "name": "Contact Information",
    "is_visible": true,
    "is_default_open": true,
    "sort_order": 0,
    "icon": "user",
    "gradient": "bg-gradient-to-br from-blue-600 to-indigo-500"
  },
  {
    "id": 2,
    "section_key": "lead_details",
    "name": "Lead Details",
    "is_visible": true,
    "is_default_open": true,
    "sort_order": 1,
    "icon": "briefcase",
    "gradient": "bg-gradient-to-r from-blue-50 to-indigo-50"
  }
]
```

---

### 2. Update Sections

**Endpoint:** `POST /api/settings/lead-form-sections`

**Description:** Updates section configuration (visibility, order, etc.).

**Request Body:**

```typescript
[
  {
    "id": 1,
    "section_key": "contact_information",
    "name": "Contact Information",
    "is_visible": true,
    "is_default_open": true,
    "sort_order": 0,
    "icon": "user",
    "gradient": "bg-gradient-to-br from-blue-600 to-indigo-500"
  },
  {
    "id": 2,
    "section_key": "lead_details",
    "name": "Lead Details",
    "is_visible": false,  // Hidden
    "is_default_open": false,
    "sort_order": 1,
    "icon": "briefcase",
    "gradient": "bg-gradient-to-r from-blue-50 to-indigo-50"
  }
]
```

**Response:**

```typescript
// Status: 200 OK
{
  "success": true,
  "sections": [/* updated sections */]
}
```

---

## Request/Response Examples

### Complete Lead Creation Flow

**1. Fetch Available Fields**

```typescript
const fieldsResponse = await fetch('/api/settings/lead-fields')
const fields = await fieldsResponse.json()
```

**2. Build Form Data**

```typescript
const formData = {
  full_name: "Jane Smith",
  email: "jane@example.com",
  phone: "+90 555 987 6543",
  customFields: {}
}

// Add custom field values
fields.forEach(field => {
  if (field.name === 'source') {
    formData.customFields[field.id] = 'social_media'
  }
  if (field.name === 'status') {
    formData.customFields[field.id] = 'new'
  }
  if (field.name === 'priority') {
    formData.customFields[field.id] = 'medium'
  }
  if (field.name === 'interest_area') {
    formData.customFields[field.id] = ['real_estate', 'investment']
  }
})
```

**3. Submit to API**

```typescript
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})

if (!response.ok) {
  const error = await response.json()
  console.error('Error:', error)
} else {
  const lead = await response.json()
  console.log('Created lead:', lead)
}
```

---

## Validation Rules

### Contact Information

| Field | Validation |
|-------|------------|
| `full_name` | Required, min 1 character |
| `email` | Required, valid email format, unique |
| `phone` | Required, min 1 character, unique |

### Custom Fields

| Field Type | Validation |
|------------|------------|
| `text` | Optional unless `is_required: true` |
| `email` | Valid email format |
| `url` | Valid URL format |
| `number` | Numeric value |
| `date` | Valid date format |
| `select` | Value must match an option |
| `multiselect` | Values must be array of valid options |

### System Fields

| Field | Validation |
|-------|------------|
| `source` | Required, must be valid option value |
| `status` | Required, must be valid option value |
| `priority` | Optional, must be valid option value |

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| `400` | Bad Request | Invalid input, duplicate email/phone |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Attempting to delete system field |
| `404` | Not Found | Lead or field not found |
| `500` | Internal Server Error | Database error, unexpected failure |

### Error Response Format

```typescript
{
  "error": "User-friendly error message",
  "details": "Technical details (optional)",
  "missingFields": ["Field 1", "Field 2"]  // For validation errors
}
```

---

## Rate Limiting

Currently, there are **no rate limits** implemented. Future versions may add:
- Per-user request limits
- IP-based throttling
- API key requirements

---

## Authentication

All API endpoints require authentication via **NextAuth session**.

**Headers Required:**
- None (session cookie is automatically sent)

**Session Validation:**
- Every request checks for valid session
- Returns `401 Unauthorized` if no session

---

[← Back to README](./README.md) | [Next: Components Documentation →](./COMPONENTS.md)
