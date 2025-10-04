# Activities API Documentation

> API endpoints, request/response formats, and backend logic for Activities system

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [POST /api/activities](#post-apiactivities)
- [GET /api/activities](#get-apiactivities)
- [Error Handling](#error-handling)
- [Validation](#validation)

---

## POST /api/activities

**Create new activity**

### Endpoint

```
POST /api/activities
```

### Request Headers

```
Content-Type: application/json
```

### Request Body

```typescript
{
  lead_id?: number | string          // Optional: Lead ID
  investor_id?: number | string      // Optional: Investor ID
  type: string                       // Activity type name (call, email, meeting)
  activity_type_id?: number | string // Optional: Activity type ID for icon/color
  subject?: string                   // Optional: Activity subject
  description: string                // Required: Activity description
  lead_status?: string               // Optional: Updates lead.status if lead_id provided
  status?: string                    // Optional: Activity status (default: "completed")
}
```

### Response Success (200)

```typescript
{
  success: true,
  message: "Activity created successfully",
  activity: {
    id: number
    lead_id: number | null
    investor_id: number | null
    assigned_to: number | null
    user_id: number | null
    type: string
    activity_type_id: number | null
    subject: string | null
    description: string
    status: "pending" | "completed" | "cancelled"
    scheduled_at: string | null
    completed_at: string | null
    activity_date: string | null
    created_at: string
    updated_at: string
  }
}
```

### Response Error (400/500)

```typescript
{
  error: string
  details?: any
}
```

### Backend Logic

**File:** `app/api/activities/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_id, investor_id, type, activity_type_id, subject, description, lead_status } = body

    // 1. Fetch activity type details if provided
    let activityType = null
    if (activity_type_id) {
      activityType = await prisma.activity_types.findUnique({
        where: { id: BigInt(activity_type_id) }
      })
    }

    // 2. Create activity
    const activity = await prisma.activities.create({
      data: {
        lead_id: lead_id ? BigInt(lead_id) : null,
        investor_id: investor_id ? BigInt(investor_id) : null,
        activity_type_id: activity_type_id ? BigInt(activity_type_id) : null,
        type: activityType?.name || type,
        subject: subject || activityType?.label || "Activity",
        description: description,
        status: "completed",
        activity_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // 3. Update lead's status and last_activity_at if lead_id is provided
    if (lead_id) {
      await prisma.leads.update({
        where: { id: BigInt(lead_id) },
        data: {
          last_activity_at: new Date(),
          ...(lead_status && { status: lead_status }),
        },
      })
    }

    // 4. Update investor's last_activity_at if investor_id is provided
    if (investor_id) {
      await prisma.investors.update({
        where: { id: BigInt(investor_id) },
        data: {
          last_activity_at: new Date(),
        },
      })
    }

    // 5. Serialize BigInt values
    const serializedActivity = {
      ...activity,
      id: Number(activity.id),
      lead_id: activity.lead_id ? Number(activity.lead_id) : null,
      investor_id: activity.investor_id ? Number(activity.investor_id) : null,
      activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
    }

    return NextResponse.json({
      success: true,
      message: "Activity created successfully",
      activity: serializedActivity,
    })
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    )
  }
}
```

### Usage Examples

#### Create Lead Activity

```typescript
const createLeadActivity = async (leadId: number) => {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lead_id: leadId,
      type: "call",
      activity_type_id: 1, // Call activity type
      subject: "Follow-up call",
      description: "Discussed product demo and pricing",
      lead_status: "contacted", // Updates lead.status
      status: "completed",
    }),
  })

  const result = await response.json()
  console.log("Activity created:", result.activity)
}
```

#### Create Investor Activity

```typescript
const createInvestorActivity = async (investorId: number) => {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      investor_id: investorId,
      type: "meeting",
      activity_type_id: 3, // Meeting activity type
      subject: "Investment discussion",
      description: "Discussed investment timeline and budget allocation",
      status: "completed",
    }),
  })

  const result = await response.json()
  console.log("Activity created:", result.activity)
  // investor.last_activity_at automatically updated
}
```

---

## GET /api/activities

**List activities**

### Endpoint

```
GET /api/activities?lead_id={leadId}&investor_id={investorId}
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lead_id` | string | No | Filter by lead ID |
| `investor_id` | string | No | Filter by investor ID |

### Response Success (200)

```typescript
{
  success: true,
  activities: [
    {
      id: number
      lead_id: number | null
      investor_id: number | null
      assigned_to: number | null
      user_id: number | null
      type: string
      activity_type_id: number | null
      subject: string | null
      description: string
      status: string
      created_at: string
      updated_at: string
      activity_types?: {
        id: number
        name: string
        label: string
        icon: string | null
        color: string | null
      }
      leads?: {
        full_name: string
        email: string
      }
      investors?: {
        full_name: string
        email: string
      }
      assignedUser?: {
        id: number
        name: string
        email: string
      }
    }
  ]
}
```

### Response Error (500)

```typescript
{
  error: string
  details?: any
}
```

### Backend Logic

**File:** `app/api/activities/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lead_id = searchParams.get("lead_id")
    const investor_id = searchParams.get("investor_id")

    // Build where clause
    const where: any = {}
    if (lead_id) where.lead_id = BigInt(lead_id)
    if (investor_id) where.investor_id = BigInt(investor_id)

    // Fetch activities with relations
    const activities = await prisma.activities.findMany({
      where,
      include: {
        activity_types: {
          select: {
            id: true,
            name: true,
            label: true,
            icon: true,
            color: true
          }
        },
        leads: {
          select: {
            full_name: true,
            email: true
          }
        },
        investors: {
          select: {
            full_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: "desc" }
    })

    // Serialize BigInt values
    const serializedActivities = activities.map(activity => ({
      ...activity,
      id: Number(activity.id),
      lead_id: activity.lead_id ? Number(activity.lead_id) : null,
      investor_id: activity.investor_id ? Number(activity.investor_id) : null,
      activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
      activity_types: activity.activity_types ? {
        ...activity.activity_types,
        id: Number(activity.activity_types.id)
      } : null
    }))

    return NextResponse.json({
      success: true,
      activities: serializedActivities
    })
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
```

### Usage Examples

#### Get Investor Activities

```typescript
const getInvestorActivities = async (investorId: number) => {
  const response = await fetch(`/api/activities?investor_id=${investorId}`)
  const { activities } = await response.json()

  activities.forEach((activity) => {
    console.log({
      type: activity.type,
      label: activity.activity_types?.label,
      icon: activity.activity_types?.icon,
      color: activity.activity_types?.color,
      description: activity.description,
    })
  })
}
```

#### Get Lead Activities

```typescript
const getLeadActivities = async (leadId: number) => {
  const response = await fetch(`/api/activities?lead_id=${leadId}`)
  const { activities } = await response.json()

  return activities
}
```

---

## Error Handling

### Common Errors

#### 400 Bad Request

```typescript
{
  error: "Invalid request parameters"
}
```

**Causes:**
- Missing required fields
- Invalid data types
- Invalid enum values

#### 404 Not Found

```typescript
{
  error: "Activity type not found"
}
```

**Causes:**
- Invalid activity_type_id
- Deleted activity type

#### 500 Internal Server Error

```typescript
{
  error: "Failed to create activity",
  details: "Database connection error"
}
```

**Causes:**
- Database connection issues
- Prisma query errors
- Serialization errors

### Error Handling Example

```typescript
try {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activityData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create activity")
  }

  const result = await response.json()
  return result.activity
} catch (error) {
  console.error("Activity creation failed:", error)
  toast.error(error.message)
  return null
}
```

---

## Validation

### Request Validation

#### POST /api/activities

**Required Fields:**
- `description` (string, min 1 char)
- Either `lead_id` or `investor_id` (at least one required)
- `type` (string) - if `activity_type_id` not provided

**Optional Fields:**
- `subject` (string)
- `activity_type_id` (number) - recommended for icon/color support
- `lead_status` (enum) - only if `lead_id` provided
- `status` (enum: pending, completed, cancelled)

#### Lead Status Values

```typescript
type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"
```

#### Activity Status Values

```typescript
type ActivityStatus =
  | "pending"
  | "completed"
  | "cancelled"
```

### Zod Schema Example

```typescript
import { z } from "zod"

const createActivitySchema = z.object({
  lead_id: z.string().or(z.number()).optional(),
  investor_id: z.string().or(z.number()).optional(),
  type: z.string().min(1),
  activity_type_id: z.string().or(z.number()).optional(),
  subject: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  lead_status: z.enum([
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost"
  ]).optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
}).refine(
  (data) => data.lead_id || data.investor_id,
  { message: "Either lead_id or investor_id is required" }
)
```

---

## Best Practices

### 1. Always Include activity_type_id

```typescript
// ✅ Good - Provides icon and color
const activity = {
  type: "call",
  activity_type_id: 1,
  description: "Follow-up call"
}

// ❌ Bad - Missing visual information
const activity = {
  type: "call",
  description: "Follow-up call"
}
```

### 2. Update Lead Status When Relevant

```typescript
// ✅ Good - Updates lead status to reflect progress
await fetch("/api/activities", {
  method: "POST",
  body: JSON.stringify({
    lead_id: leadId,
    type: "call",
    description: "Successful call",
    lead_status: "contacted"
  })
})

// ❌ Bad - Missed opportunity to update lead status
await fetch("/api/activities", {
  method: "POST",
  body: JSON.stringify({
    lead_id: leadId,
    type: "call",
    description: "Successful call"
  })
})
```

### 3. Handle BigInt Serialization

```typescript
// ✅ Good - Serialize before sending to client
const serialized = {
  ...activity,
  id: Number(activity.id),
  investor_id: activity.investor_id ? Number(activity.investor_id) : null
}

// ❌ Bad - JSON serialization error
return NextResponse.json(activity)
```

### 4. Use Transactions for Complex Operations

```typescript
// ✅ Good - Atomic operation
await prisma.$transaction([
  prisma.activities.create({ data: activityData }),
  prisma.leads.update({
    where: { id: leadId },
    data: { last_activity_at: new Date(), status: "contacted" }
  })
])
```

---

[← Back to README](./README.md) | [← Previous: Database](./DATABASE.md) | [Next: Components →](./COMPONENTS.md)
