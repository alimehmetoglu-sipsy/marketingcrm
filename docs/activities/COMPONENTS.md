# Activities Components Documentation

> Component structure, props, and usage for Activities system

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [Activity Icon Helper](#activity-icon-helper)
- [AddActivityDialog](#addactivitydialog)
- [Investor Detail View - Timeline](#investor-detail-view---timeline)
- [Lead Detail View - Timeline](#lead-detail-view---timeline)

---

## Activity Icon Helper

**File:** `lib/activity-icons.tsx`

Utility functions for handling activity type icons and colors.

### Imports

```typescript
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  Zap,
  Activity as ActivityIcon,
  type LucideIcon
} from "lucide-react"
```

### Icon Mapping

```typescript
const iconMap: Record<string, LucideIcon> = {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  Zap,
}
```

### getActivityIconComponent

Get icon component by name.

**Signature:**
```typescript
getActivityIconComponent(iconName: string | null): LucideIcon
```

**Usage:**
```typescript
const IconComponent = getActivityIconComponent("Phone")
<IconComponent className="h-5 w-5" style={{ color: "#84cc16" }} />
```

**Returns:** Lucide icon component (defaults to `ActivityIcon` if not found)

### getActivityIcon

Get rendered icon element with color.

**Signature:**
```typescript
getActivityIcon({
  iconName: string | null,
  color: string | null,
  className?: string
}): JSX.Element
```

**Usage:**
```typescript
const icon = getActivityIcon({
  iconName: "Phone",
  color: "#84cc16",
  className: "h-5 w-5"
})
```

**Returns:** Rendered icon element

### getActivityBgColor

Convert hex color to rgba with 15% opacity for backgrounds.

**Signature:**
```typescript
getActivityBgColor(color: string | null): string
```

**Usage:**
```typescript
const bgColor = getActivityBgColor("#84cc16")
// Returns: "rgba(132, 204, 22, 0.15)"
```

**Returns:** RGBA color string with 15% opacity

### Complete Implementation

```typescript
// lib/activity-icons.tsx
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  Zap,
  Activity as ActivityIcon,
  type LucideIcon
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  Zap,
}

export const getActivityIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return ActivityIcon
  return iconMap[iconName] || ActivityIcon
}

export const getActivityIcon = ({
  iconName,
  color,
  className = "h-5 w-5"
}: {
  iconName: string | null
  color: string | null
  className?: string
}) => {
  const Icon = getActivityIconComponent(iconName)
  return <Icon className={className} style={{ color: color || undefined }} />
}

export const getActivityBgColor = (color: string | null): string => {
  if (!color) return "rgb(243 244 246)" // gray-100

  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, 0.15)`
}
```

---

## AddActivityDialog

**File:** `components/activities/add-activity-dialog.tsx`

Dialog component for creating new activities for Leads or Investors.

### Props

```typescript
interface AddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId?: number
  investorId?: number
  onSuccess?: () => void
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | boolean | Yes | Dialog open state |
| `onOpenChange` | function | Yes | Open state change handler |
| `leadId` | number | No | Lead ID (mutually exclusive with investorId) |
| `investorId` | number | No | Investor ID (mutually exclusive with leadId) |
| `onSuccess` | function | No | Callback after successful creation |

### Features

- ✅ Activity type selection with icon/color preview
- ✅ Conditional Lead Status field (only for leads)
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Auto-close on success

### Form Schema

```typescript
const formSchema = z.object({
  activity_type_id: z.string().min(1, "Activity type is required"),
  description: z.string().min(1, "Description is required"),
  lead_status: z.string().optional(),
})
```

### Usage

#### For Lead

```typescript
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"

const LeadDetailPage = () => {
  const [addActivityOpen, setAddActivityOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setAddActivityOpen(true)}>
        Add Activity
      </Button>

      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        leadId={lead.id}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
```

#### For Investor

```typescript
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"

const InvestorDetailPage = () => {
  const [addActivityOpen, setAddActivityOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setAddActivityOpen(true)}>
        Add Activity
      </Button>

      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        investorId={investor.id}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
```

### Activity Type Selection with Visual Preview

```typescript
<FormField
  control={form.control}
  name="activity_type_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Activity Type</FormLabel>
      <Select value={field.value} onValueChange={field.onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {activityTypes.map((type) => {
            const IconComponent = getActivityIconComponent(type.icon)
            return (
              <SelectItem key={type.id} value={type.name}>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded"
                    style={{
                      backgroundColor: type.color ? `${type.color}20` : '#f3f4f6'
                    }}
                  >
                    <IconComponent
                      className="h-4 w-4"
                      style={{ color: type.color || '#6b7280' }}
                    />
                  </div>
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Conditional Lead Status Field

```typescript
{leadId && (
  <FormField
    control={form.control}
    name="lead_status"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Lead Status (Optional)</FormLabel>
        <Select onValueChange={field.onChange} value={field.value || ""}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select lead status" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <FormDescription>
          Optionally update the lead status when creating this activity
        </FormDescription>
      </FormItem>
    )}
  />
)}
```

### Submit Handler

```typescript
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setIsLoading(true)

  try {
    const selectedType = activityTypes.find(
      (t) => t.name === values.activity_type_id
    )

    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: leadId,
        investor_id: investorId,
        type: selectedType?.name || values.activity_type_id,
        activity_type_id: selectedType?.id,
        description: values.description,
        lead_status: values.lead_status,
        status: "completed",
      }),
    })

    if (!response.ok) throw new Error("Failed to create activity")

    toast.success("Activity created successfully")
    form.reset()
    onOpenChange(false)
    onSuccess?.()
  } catch (error) {
    toast.error("Failed to create activity")
  } finally {
    setIsLoading(false)
  }
}
```

---

## Investor Detail View - Timeline

**File:** `components/investors/investor-detail-view.tsx`

Activity timeline display in investor detail page.

### State Management

```typescript
const [addActivityOpen, setAddActivityOpen] = useState(false)
```

### Timeline Tab Structure

```typescript
<TabsContent value="activities" className="space-y-6">
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
    <CardContent>
      {/* Activity cards */}
    </CardContent>
  </Card>
</TabsContent>
```

### Activity Card Rendering

```typescript
{investor.activities.map((activity) => {
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
          <div className="flex items-center gap-2">
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
            {formatDate(activity.created_at)}
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
```

### Empty State

```typescript
{investor.activities.length === 0 ? (
  <div className="text-center py-12">
    <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No activities yet</h3>
    <p className="text-muted-foreground mb-4">
      Get started by creating your first activity
    </p>
    <Button
      onClick={() => setAddActivityOpen(true)}
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add First Activity
    </Button>
  </div>
) : (
  // Activity timeline cards
)}
```

### Dialog Integration

```typescript
<AddActivityDialog
  open={addActivityOpen}
  onOpenChange={setAddActivityOpen}
  investorId={investor.id}
  onSuccess={() => router.refresh()}
/>
```

---

## Lead Detail View - Timeline

**File:** `components/leads/lead-detail-view.tsx`

Similar implementation to Investor Detail View with lead-specific styling.

### Key Differences

1. **Color Scheme:** Blue theme instead of emerald
   ```typescript
   className="bg-blue-600 hover:bg-blue-700"
   ```

2. **Lead Status Update:** AddActivityDialog includes lead status field
   ```typescript
   <AddActivityDialog
     open={addActivityOpen}
     onOpenChange={setAddActivityOpen}
     leadId={lead.id}
     onSuccess={() => router.refresh()}
   />
   ```

3. **Activity Context:** Activities shown in lead context
   ```typescript
   {lead.activities.map((activity) => (
     // Same rendering logic as investor
   ))}
   ```

---

## Best Practices

### 1. Always Fetch Activity Types

```typescript
// ✅ Good - Fetch active activity types for dialog
const activityTypes = await prisma.activity_types.findMany({
  where: { is_active: true },
  orderBy: { sort_order: "asc" },
})
```

### 2. Provide Icon Fallback

```typescript
// ✅ Good - Fallback to ActivityIcon
const IconComponent = getActivityIconComponent(activityType?.icon || null)

// ❌ Bad - Crashes if icon missing
const IconComponent = iconMap[activityType.icon]
```

### 3. Use Color with Opacity for Backgrounds

```typescript
// ✅ Good - 15% opacity for subtle background
const bgColor = getActivityBgColor(color)

// ❌ Bad - Too strong, poor contrast
const bgColor = color
```

### 4. Handle Empty States

```typescript
// ✅ Good - Helpful empty state with CTA
{activities.length === 0 ? (
  <EmptyState onAddClick={() => setAddActivityOpen(true)} />
) : (
  <ActivityTimeline activities={activities} />
)}
```

### 5. Refresh After Creation

```typescript
// ✅ Good - Updates UI with new activity
<AddActivityDialog
  onSuccess={() => router.refresh()}
/>

// ❌ Bad - Stale data
<AddActivityDialog />
```

---

[← Back to README](./README.md) | [← Previous: API](./API.md) | [Next: Activity Types →](./ACTIVITY-TYPES.md)
