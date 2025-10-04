# Activity Types Documentation

> Activity type management, default types, icons, and colors

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [Overview](#overview)
- [Activity Type Management](#activity-type-management)
- [Default Activity Types](#default-activity-types)
- [Available Icons](#available-icons)
- [Color Scheme](#color-scheme)

---

## Overview

Activity Types sistemi, aktivitelere özel icon ve renk desteği sağlar. Her aktivite tipi benzersiz bir identifier (name), görünen isim (label), icon ve renge sahiptir.

### Key Features

- ✅ Custom icon selection (Lucide icons)
- ✅ Custom color (hex color)
- ✅ Active/inactive toggle
- ✅ Sort order management
- ✅ Unique name constraint

---

## Activity Type Management

### Location

```
/settings/activity-types
```

**File:** `app/(dashboard)/settings/activity-types/page.tsx`

### CRUD Operations

#### Create Activity Type

```typescript
const createActivityType = async () => {
  const response = await fetch("/api/settings/activity-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "demo",           // Unique identifier
      label: "Demo",          // Display name
      icon: "Users",          // Lucide icon name
      color: "#8b5cf6",       // Hex color
      is_active: true,
      sort_order: 6,
    }),
  })

  const result = await response.json()
}
```

#### Update Activity Type

```typescript
const updateActivityType = async (id: number) => {
  const response = await fetch(`/api/settings/activity-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label: "Product Demo",
      icon: "Presentation",
      color: "#10b981",
      is_active: true,
    }),
  })
}
```

#### Delete Activity Type

```typescript
const deleteActivityType = async (id: number) => {
  const response = await fetch(`/api/settings/activity-types/${id}`, {
    method: "DELETE",
  })
}
```

**Note:** When an activity type is deleted:
- Existing activities keep their data
- `activity_type_id` is set to NULL (SET NULL constraint)
- Icon/color information is lost for those activities

#### Toggle Active Status

```typescript
const toggleActivityType = async (id: number, isActive: boolean) => {
  const response = await fetch(`/api/settings/activity-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      is_active: isActive,
    }),
  })
}
```

---

## Default Activity Types

### Seed Data

**File:** `scripts/seed-activity-types.ts`

```typescript
const defaultActivityTypes = [
  {
    name: "call",
    label: "Call",
    icon: "Phone",
    color: "#84cc16", // lime-500
    sort_order: 1,
  },
  {
    name: "email",
    label: "Email",
    icon: "Mail",
    color: "#3b82f6", // blue-500
    sort_order: 2,
  },
  {
    name: "meeting",
    label: "Meeting",
    icon: "Calendar",
    color: "#8b5cf6", // violet-500
    sort_order: 3,
  },
  {
    name: "note",
    label: "Note",
    icon: "FileText",
    color: "#f59e0b", // amber-500
    sort_order: 4,
  },
  {
    name: "task",
    label: "Task",
    icon: "CheckCircle",
    color: "#10b981", // emerald-500
    sort_order: 5,
  },
]
```

### Running Seed

```bash
npx tsx scripts/seed-activity-types.ts
```

---

## Available Icons

### Lucide React Icons

Activity Types kullanabileceği icon'lar:

| Icon Name | Component | Use Case |
|-----------|-----------|----------|
| `Phone` | Phone | Telefon aramaları |
| `Mail` | Mail | Email iletişimi |
| `Calendar` | Calendar | Toplantılar, randevular |
| `MessageSquare` | MessageSquare | Mesajlar, sohbetler |
| `Users` | Users | Grup aktiviteleri |
| `FileText` | FileText | Notlar, dökümanlar |
| `CheckCircle` | CheckCircle | Tamamlanan görevler |
| `Clock` | Clock | Zamanlanmış aktiviteler |
| `Bell` | Bell | Hatırlatmalar |
| `Zap` | Zap | Hızlı aksiyonlar |
| `Video` | Video | Video görüşmeleri |
| `Coffee` | Coffee | İnformal toplantılar |
| `Briefcase` | Briefcase | İş görüşmeleri |
| `Gift` | Gift | Hediye, bonus |
| `TrendingUp` | TrendingUp | İlerleme, büyüme |

### Icon Component Mapping

**File:** `lib/activity-icons.tsx`

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
```

### Adding New Icons

To add new icons to the system:

1. Import from lucide-react:
   ```typescript
   import { Video } from "lucide-react"
   ```

2. Add to iconMap:
   ```typescript
   const iconMap: Record<string, LucideIcon> = {
     // ... existing icons
     Video,
   }
   ```

3. Use in activity type:
   ```typescript
   {
     name: "video_call",
     label: "Video Call",
     icon: "Video",
     color: "#06b6d4", // cyan-500
   }
   ```

---

## Color Scheme

### Default Colors

| Activity Type | Color Name | Hex Code | RGB | Use Case |
|---------------|------------|----------|-----|----------|
| Call | Lime 500 | `#84cc16` | rgb(132, 204, 22) | Fresh, active |
| Email | Blue 500 | `#3b82f6` | rgb(59, 130, 246) | Professional |
| Meeting | Violet 500 | `#8b5cf6` | rgb(139, 92, 246) | Important |
| Note | Amber 500 | `#f59e0b` | rgb(245, 158, 11) | Attention |
| Task | Emerald 500 | `#10b981` | rgb(16, 185, 129) | Success |

### Tailwind CSS Color Reference

```typescript
// Primary Colors
const colors = {
  slate: "#64748b",    // Neutral
  gray: "#6b7280",     // Default
  red: "#ef4444",      // Danger
  orange: "#f97316",   // Warning
  amber: "#f59e0b",    // Attention
  yellow: "#eab308",   // Highlight
  lime: "#84cc16",     // Fresh
  green: "#22c55e",    // Success
  emerald: "#10b981",  // Growth
  teal: "#14b8a6",     // Cool
  cyan: "#06b6d4",     // Tech
  sky: "#0ea5e9",      // Calm
  blue: "#3b82f6",     // Primary
  indigo: "#6366f1",   // Deep
  violet: "#8b5cf6",   // Important
  purple: "#a855f7",   // Special
  fuchsia: "#d946ef",  // Accent
  pink: "#ec4899",     // Warm
  rose: "#f43f5e",     // Alert
}
```

### Color Usage

#### Background with Opacity

```typescript
// Convert hex to rgba with 15% opacity
const getActivityBgColor = (color: string | null): string => {
  if (!color) return "rgb(243 244 246)" // gray-100

  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, 0.15)`
}

// Usage
<div style={{ backgroundColor: getActivityBgColor("#84cc16") }}>
  {/* rgba(132, 204, 22, 0.15) */}
</div>
```

#### Icon with Color

```typescript
<Phone
  className="h-5 w-5"
  style={{ color: "#84cc16" }}
/>
```

#### Badge with Color

```typescript
<Badge
  variant="outline"
  style={{
    borderColor: "#84cc16",
    color: "#84cc16",
    backgroundColor: "rgba(132, 204, 22, 0.15)",
  }}
>
  Call
</Badge>
```

### Color Accessibility

**Contrast Ratios (WCAG AA):**

| Background | Text Color | Ratio | Pass |
|------------|------------|-------|------|
| `rgba(132, 204, 22, 0.15)` | `#84cc16` | 4.5:1 | ✅ |
| `rgba(59, 130, 246, 0.15)` | `#3b82f6` | 4.5:1 | ✅ |
| `rgba(139, 92, 246, 0.15)` | `#8b5cf6` | 4.5:1 | ✅ |
| `rgba(245, 158, 11, 0.15)` | `#f59e0b` | 4.5:1 | ✅ |

**Best Practices:**

1. ✅ Use 15% opacity for backgrounds
2. ✅ Use full color for icons and text
3. ✅ Ensure 4.5:1 contrast ratio minimum
4. ✅ Test with different backgrounds

---

## Management UI

### Activity Type Form

```typescript
interface ActivityTypeFormData {
  name: string          // Unique identifier (lowercase, no spaces)
  label: string         // Display name
  icon: string          // Lucide icon name
  color: string         // Hex color with #
  is_active: boolean    // Active status
  sort_order: number    // Display order
}
```

### Form Validation

```typescript
import { z } from "zod"

const activityTypeSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(/^[a-z_]+$/, "Name must be lowercase with underscores only"),
  label: z.string()
    .min(1, "Label is required"),
  icon: z.string()
    .min(1, "Icon is required"),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color"),
  is_active: z.boolean(),
  sort_order: z.number()
    .int()
    .min(0),
})
```

### Icon Picker Component

```typescript
const iconOptions = [
  { value: "Phone", label: "Phone", icon: Phone },
  { value: "Mail", label: "Mail", icon: Mail },
  { value: "Calendar", label: "Calendar", icon: Calendar },
  // ...
]

<Select value={selectedIcon} onValueChange={setSelectedIcon}>
  <SelectTrigger>
    <SelectValue placeholder="Select icon" />
  </SelectTrigger>
  <SelectContent>
    {iconOptions.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        <div className="flex items-center gap-2">
          <option.icon className="h-4 w-4" />
          <span>{option.label}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Color Picker Component

```typescript
import { Input } from "@/components/ui/input"

<div className="flex items-center gap-2">
  <div
    className="w-10 h-10 rounded border"
    style={{ backgroundColor: selectedColor }}
  />
  <Input
    type="color"
    value={selectedColor}
    onChange={(e) => setSelectedColor(e.target.value)}
  />
  <Input
    type="text"
    value={selectedColor}
    onChange={(e) => setSelectedColor(e.target.value)}
    placeholder="#84cc16"
    pattern="^#[0-9A-Fa-f]{6}$"
  />
</div>
```

---

## Best Practices

### 1. Unique Names

```typescript
// ✅ Good - Clear, unique identifiers
{ name: "video_call", label: "Video Call" }
{ name: "follow_up", label: "Follow Up" }

// ❌ Bad - Generic, may conflict
{ name: "call", label: "Video Call" }
{ name: "call2", label: "Follow Up Call" }
```

### 2. Descriptive Labels

```typescript
// ✅ Good - Clear purpose
{ name: "client_meeting", label: "Client Meeting" }

// ❌ Bad - Too generic
{ name: "mtg", label: "MTG" }
```

### 3. Appropriate Icons

```typescript
// ✅ Good - Icon matches activity
{ name: "video_call", icon: "Video", label: "Video Call" }

// ❌ Bad - Misleading icon
{ name: "video_call", icon: "Phone", label: "Video Call" }
```

### 4. Accessible Colors

```typescript
// ✅ Good - High contrast, distinct
{ name: "urgent", color: "#ef4444" }  // red-500

// ❌ Bad - Low contrast
{ name: "urgent", color: "#fca5a5" }  // red-300 (too light)
```

### 5. Sort Order Management

```typescript
// ✅ Good - Logical ordering
[
  { name: "call", sort_order: 1 },
  { name: "email", sort_order: 2 },
  { name: "meeting", sort_order: 3 },
]

// ❌ Bad - Random ordering
[
  { name: "task", sort_order: 15 },
  { name: "call", sort_order: 3 },
  { name: "email", sort_order: 42 },
]
```

---

[← Back to README](./README.md) | [← Previous: Components](./COMPONENTS.md) | [Next: Implementation →](./IMPLEMENTATION.md)
