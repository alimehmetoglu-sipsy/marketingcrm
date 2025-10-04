# Activities Implementation Guide

> Usage examples, best practices, data flow, and implementation details

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [Usage Examples](#usage-examples)
- [Data Flow](#data-flow)
- [Best Practices](#best-practices)
- [Implementation Details](#implementation-details)

---

## Usage Examples

### 1. Lead Activity Creation

**Complete implementation for creating a lead activity:**

```typescript
// components/leads/lead-detail-view.tsx
import { useState } from "react"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const LeadDetailView = ({ lead }) => {
  const [addActivityOpen, setAddActivityOpen] = useState(false)

  return (
    <div>
      {/* Add Activity Button */}
      <Button
        onClick={() => setAddActivityOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Activity
      </Button>

      {/* Activity Dialog */}
      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        leadId={lead.id}
        onSuccess={() => {
          router.refresh()
          toast.success("Activity added successfully")
        }}
      />
    </div>
  )
}
```

### 2. Investor Activity Creation

**Complete implementation for creating an investor activity:**

```typescript
// components/investors/investor-detail-view.tsx
import { useState } from "react"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"
import { Button } from "@/components/ui/button"
import { Activity, Plus } from "lucide-react"

const InvestorDetailView = ({ investor }) => {
  const [addActivityOpen, setAddActivityOpen] = useState(false)

  return (
    <div>
      {/* Activity Timeline Tab */}
      <TabsContent value="activities">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <CardTitle>Activity Timeline</CardTitle>
            </div>
            <Button
              onClick={() => setAddActivityOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </CardHeader>
        </Card>
      </TabsContent>

      {/* Activity Dialog */}
      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        investorId={investor.id}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
```

### 3. Activity List with Types

**Fetching and displaying activities with type information:**

```typescript
const getActivitiesWithTypes = async (investorId: number) => {
  const response = await fetch(`/api/activities?investor_id=${investorId}`)
  const { activities } = await response.json()

  return activities.map((activity) => ({
    id: activity.id,
    description: activity.description,
    type: {
      name: activity.activity_types?.name || activity.type,
      label: activity.activity_types?.label || activity.type,
      icon: activity.activity_types?.icon,
      color: activity.activity_types?.color,
    },
    createdAt: activity.created_at,
    status: activity.status,
  }))
}
```

### 4. Timeline Rendering

**Complete timeline card implementation:**

```typescript
import { getActivityIconComponent, getActivityBgColor } from "@/lib/activity-icons"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

const ActivityTimeline = ({ activities, activityTypes }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const activityType = activityTypes.find(
          (at) => at.id === activity.activity_type_id
        )
        const IconComponent = getActivityIconComponent(activityType?.icon)
        const bgColor = getActivityBgColor(activityType?.color)

        return (
          <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
            {/* Icon Circle */}
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bgColor }}
            >
              <IconComponent
                className="h-5 w-5"
                style={{ color: activityType?.color || '#6b7280' }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">
                    {activity.subject || activityType?.label}
                  </h4>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: activityType?.color || '#e5e7eb',
                      color: activityType?.color || '#6b7280',
                      backgroundColor: bgColor,
                    }}
                  >
                    {activityType?.label || activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                {activity.status}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### 5. Lead Status Update with Activity

**Creating activity that updates lead status:**

```typescript
const createActivityAndUpdateStatus = async (leadId: number) => {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lead_id: leadId,
      type: "call",
      activity_type_id: 1,
      subject: "Follow-up call",
      description: "Discussed proposal and next steps",
      lead_status: "qualified", // Updates lead.status to "qualified"
      status: "completed",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create activity")
  }

  const result = await response.json()
  console.log("Activity created:", result.activity)
  // Lead status is now "qualified"
  // Lead last_activity_at is updated
}
```

---

## Data Flow

### Creating an Activity

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (Click "Add Activity")                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              AddActivityDialog Opens                    │
│         - Fetch active activity types                   │
│         - Initialize form with defaults                 │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│          User Selects Activity Type                     │
│     (with icon/color preview in dropdown)               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            User Fills Form Fields                       │
│    - Activity Type (required)                           │
│    - Description (required)                             │
│    - Lead Status (optional, only for leads)             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Form Submit                              │
│         POST /api/activities                            │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Processing                         │
│  1. Fetch activity_type details (icon, color)           │
│  2. Create activity record                              │
│  3. Update lead.status (if lead_status provided)        │
│  4. Update investor/lead.last_activity_at               │
│  5. Return activity with activity_types relation        │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Response Handling                          │
│  - Show success toast                                   │
│  - Close dialog                                         │
│  - Call onSuccess callback                              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Page Refresh                               │
│         router.refresh()                                │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         Updated Activity Timeline Displayed             │
│    - New activity appears in timeline                   │
│    - With icon and color from activity type             │
│    - Last activity date updated                         │
└─────────────────────────────────────────────────────────┘
```

### Displaying Activities

```
┌─────────────────────────────────────────────────────────┐
│            Page Load (Investor/Lead Detail)             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│           Fetch Data (Server Component)                 │
│  1. Fetch investor/lead with activities                 │
│  2. Include activity_types relation                     │
│  3. Fetch active activity_types (for dialog)            │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            Serialize BigInt Values                      │
│  - Convert all BigInt to Number                         │
│  - Prepare for client component                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│      Pass to Client Component (DetailView)              │
│  - activities array                                     │
│  - activityTypes array                                  │
│  - entity data (investor/lead)                          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│           Render Activity Timeline Tab                  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         For Each Activity:                              │
│  1. Find matching activity_type                         │
│  2. Get icon component                                  │
│  3. Calculate background color (15% opacity)            │
│  4. Render timeline card with icon/color                │
└─────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Always Include activity_type_id

**Why:** Provides visual context (icon/color) for activities

```typescript
// ✅ Good - Rich visual information
const activityData = {
  type: "call",
  activity_type_id: 1, // Provides icon and color
  description: "Follow-up call",
}

// ❌ Bad - Missing visual context
const activityData = {
  type: "call",
  description: "Follow-up call",
}
```

### 2. Use Conditional Rendering for Lead Status

**Why:** Lead status field only applicable to leads, not investors

```typescript
// ✅ Good - Conditional rendering
{leadId && (
  <FormField name="lead_status">
    {/* Lead status dropdown */}
  </FormField>
)}

// ❌ Bad - Shows for investors too
<FormField name="lead_status">
  {/* Always visible */}
</FormField>
```

### 3. Always Serialize BigInt

**Why:** Prisma BigInt cannot be JSON serialized

```typescript
// ✅ Good - Serialize before sending to client
const serialized = activities.map(activity => ({
  ...activity,
  id: Number(activity.id),
  lead_id: activity.lead_id ? Number(activity.lead_id) : null,
  investor_id: activity.investor_id ? Number(activity.investor_id) : null,
  activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
}))

// ❌ Bad - JSON serialization error
return NextResponse.json({ activities })
```

### 4. Provide Icon Fallback

**Why:** Prevents crashes if icon is missing or invalid

```typescript
// ✅ Good - Fallback to default icon
const IconComponent = getActivityIconComponent(activityType?.icon || null)
// Returns ActivityIcon if icon not found

// ❌ Bad - Crashes if icon missing
const IconComponent = iconMap[activityType.icon]
// Throws error if icon undefined
```

### 5. Use Color with Opacity for Backgrounds

**Why:** Better visual hierarchy and readability

```typescript
// ✅ Good - Subtle background (15% opacity)
const bgColor = getActivityBgColor(color) // rgba(132, 204, 22, 0.15)
<div style={{ backgroundColor: bgColor }}>

// ❌ Bad - Too strong, poor contrast
const bgColor = color // #84cc16
<div style={{ backgroundColor: bgColor }}>
```

### 6. Handle Empty States

**Why:** Provides clear guidance when no activities exist

```typescript
// ✅ Good - Helpful empty state
{activities.length === 0 ? (
  <div className="text-center py-12">
    <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No activities yet</h3>
    <p className="text-muted-foreground mb-4">
      Get started by creating your first activity
    </p>
    <Button onClick={() => setAddActivityOpen(true)}>
      Add First Activity
    </Button>
  </div>
) : (
  <ActivityTimeline activities={activities} />
)}

// ❌ Bad - Confusing empty state
{activities.length === 0 && <p>No data</p>}
```

### 7. Refresh After Creation

**Why:** Ensures UI shows latest data

```typescript
// ✅ Good - Refresh to show new activity
<AddActivityDialog
  onSuccess={() => {
    router.refresh()
    toast.success("Activity added")
  }}
/>

// ❌ Bad - Stale data shown
<AddActivityDialog />
```

### 8. Use Transactions for Complex Operations

**Why:** Ensures atomicity and data consistency

```typescript
// ✅ Good - Atomic operation
await prisma.$transaction([
  prisma.activities.create({
    data: { /* ... */ }
  }),
  prisma.leads.update({
    where: { id: leadId },
    data: { last_activity_at: new Date(), status: "contacted" }
  })
])

// ❌ Bad - Potential inconsistency
await prisma.activities.create({ /* ... */ })
await prisma.leads.update({ /* ... */ })
```

---

## Implementation Details

### Status Enum

Activities use an enum for status:

```typescript
enum activities_status {
  pending    // Default for new activities
  completed  // Completed activities
  cancelled  // Cancelled activities
}
```

**Usage:**

```typescript
// Default status
const activity = await prisma.activities.create({
  data: {
    // ...
    status: "pending", // Default if not specified
  }
})

// Completed status
const completedActivity = await prisma.activities.create({
  data: {
    // ...
    status: "completed",
    completed_at: new Date(),
  }
})
```

### Lead Status Update

When creating an activity for a lead, you can optionally update the lead's status:

```typescript
// POST /api/activities
{
  lead_id: 123,
  type: "call",
  description: "Follow-up call",
  lead_status: "contacted"  // Updates lead.status to "contacted"
}
```

**Backend implementation:**

```typescript
if (lead_id) {
  await prisma.leads.update({
    where: { id: BigInt(lead_id) },
    data: {
      last_activity_at: new Date(),
      ...(lead_status && { status: lead_status }), // Conditional update
    }
  })
}
```

### User Assignment

Activities can be assigned to users (both creator and assignee):

```typescript
const activity = await prisma.activities.create({
  data: {
    // ...
    assigned_to: BigInt(5),  // Assigned user
    user_id: BigInt(10),     // Activity creator
  },
  include: {
    assignedUser: true,  // Get assigned user details
    users: true,         // Get creator details
  }
})
```

**UI implementation:**

```typescript
<FormField name="assigned_to">
  <Select>
    {users.map((user) => (
      <SelectItem key={user.id} value={user.id}>
        {user.name}
      </SelectItem>
    ))}
  </Select>
</FormField>
```

### Activity Date Fields

Activities have multiple date fields:

| Field | Purpose | Example |
|-------|---------|---------|
| `scheduled_at` | When activity is scheduled | Future meeting |
| `activity_date` | When activity occurred/scheduled | Call date |
| `completed_at` | When activity was completed | Task completion |
| `created_at` | Record creation timestamp | Auto-generated |
| `updated_at` | Last update timestamp | Auto-updated |

**Usage:**

```typescript
// Scheduled future meeting
const meeting = await prisma.activities.create({
  data: {
    type: "meeting",
    scheduled_at: new Date("2025-10-15T14:00:00"),
    activity_date: new Date("2025-10-15T14:00:00"),
    status: "pending",
  }
})

// Completed call
const call = await prisma.activities.create({
  data: {
    type: "call",
    activity_date: new Date(),
    completed_at: new Date(),
    status: "completed",
  }
})
```

### Cascade Behavior

**When deleting related entities:**

| Entity Deleted | Effect on Activities | Constraint |
|---------------|---------------------|------------|
| Lead | Activities deleted | CASCADE |
| Investor | Activities deleted | CASCADE |
| Activity Type | activity_type_id set to NULL | SET NULL |
| User (assigned_to) | Delete prevented if activities exist | RESTRICT |
| User (user_id) | Delete prevented if activities exist | RESTRICT |

**Example:**

```typescript
// Deleting investor deletes all activities
await prisma.investors.delete({
  where: { id: BigInt(investorId) }
})
// All investor activities automatically deleted

// Deleting activity type sets activity_type_id to NULL
await prisma.activity_types.delete({
  where: { id: BigInt(typeId) }
})
// Existing activities keep their data but lose icon/color
```

---

## Advanced Examples

### 1. Bulk Activity Creation

```typescript
const createBulkActivities = async (leadIds: number[]) => {
  const activities = leadIds.map(leadId => ({
    lead_id: BigInt(leadId),
    type: "email",
    activity_type_id: BigInt(2),
    description: "Sent campaign email",
    status: "completed",
    activity_date: new Date(),
  }))

  await prisma.activities.createMany({
    data: activities,
  })

  // Update all leads' last_activity_at
  await prisma.leads.updateMany({
    where: { id: { in: leadIds.map(id => BigInt(id)) } },
    data: { last_activity_at: new Date() }
  })
}
```

### 2. Activity Statistics

```typescript
const getActivityStats = async (investorId: number) => {
  const stats = await prisma.activities.groupBy({
    by: ["type"],
    where: { investor_id: BigInt(investorId) },
    _count: { id: true },
  })

  return stats.map(stat => ({
    type: stat.type,
    count: stat._count.id,
  }))
}
```

### 3. Recent Activities with Pagination

```typescript
const getRecentActivities = async (page: number = 1, perPage: number = 10) => {
  const skip = (page - 1) * perPage

  const [activities, total] = await Promise.all([
    prisma.activities.findMany({
      include: { activity_types: true },
      orderBy: { created_at: "desc" },
      skip,
      take: perPage,
    }),
    prisma.activities.count(),
  ])

  return {
    activities,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    }
  }
}
```

---

[← Back to README](./README.md) | [← Previous: Activity Types](./ACTIVITY-TYPES.md) | [Next: Visual Guide →](./VISUAL-GUIDE.md)
