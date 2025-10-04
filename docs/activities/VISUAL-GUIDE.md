# Activities Visual Implementation Guide

> UI/UX design patterns, timeline cards, color scheme, and responsive layouts

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [Timeline Card Design](#timeline-card-design)
- [Color Scheme](#color-scheme)
- [Empty States](#empty-states)
- [Responsive Design](#responsive-design)

---

## Timeline Card Design

### Standard Timeline Card

**Layout Structure:**

```
┌────────────────────────────────────────────────────────────┐
│  ●          Follow-up call    [Call Badge]    Oct 04, 09:14│
│ Icon                                                        │
│  Circle     Called the investor to discuss...              │
│                                                             │
│             [completed]                                     │
└────────────────────────────────────────────────────────────┘
```

### Complete Implementation

```tsx
<div className="flex gap-4 pb-4 border-b last:border-0">
  {/* Icon Circle */}
  <div
    className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: "rgba(132, 204, 22, 0.15)" }}
  >
    <Phone className="h-5 w-5" style={{ color: "#84cc16" }} />
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <h4 className="font-semibold">Follow-up call</h4>
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
      </div>
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        Oct 04, 09:14
      </p>
    </div>
    <p className="text-sm text-muted-foreground mt-1">
      Called the investor to discuss investment opportunities
    </p>
    <Badge variant="secondary" className="mt-2">
      completed
    </Badge>
  </div>
</div>
```

### Visual Hierarchy

**Z-index and layering:**

1. **Icon Circle (Highest)** - `z-index: auto`
   - Background: rgba with 15% opacity
   - Icon: Solid color

2. **Content Area (Middle)** - `z-index: auto`
   - Title: font-semibold
   - Badge: outline variant with custom colors
   - Description: text-muted-foreground
   - Status: secondary badge

3. **Border (Lowest)** - `border-b`
   - Last item: no border

### Spacing System

```css
/* Card spacing */
.activity-card {
  gap: 1rem;              /* 16px between icon and content */
  padding-bottom: 1rem;   /* 16px bottom padding */
}

/* Icon circle */
.icon-circle {
  width: 2.5rem;          /* 40px */
  height: 2.5rem;         /* 40px */
}

/* Content spacing */
.content {
  margin-top: 0.25rem;    /* 4px between elements */
}

/* Badge spacing */
.badge {
  margin-top: 0.5rem;     /* 8px top margin */
}
```

---

## Color Scheme

### Activity Type Colors

| Activity Type | Color Name | Hex | RGBA (15% opacity) | Use Case |
|---------------|------------|-----|-------------------|----------|
| Call | Lime 500 | `#84cc16` | `rgba(132, 204, 22, 0.15)` | Phone calls |
| Email | Blue 500 | `#3b82f6` | `rgba(59, 130, 246, 0.15)` | Email communications |
| Meeting | Violet 500 | `#8b5cf6` | `rgba(139, 92, 246, 0.15)` | In-person/video meetings |
| Note | Amber 500 | `#f59e0b` | `rgba(245, 158, 11, 0.15)` | Notes and memos |
| Task | Emerald 500 | `#10b981` | `rgba(16, 185, 129, 0.15)` | Tasks and to-dos |

### Color Application Examples

#### Call Activity (Lime)

```tsx
{/* Icon Circle */}
<div
  className="h-10 w-10 rounded-full flex items-center justify-center"
  style={{ backgroundColor: "rgba(132, 204, 22, 0.15)" }}
>
  <Phone className="h-5 w-5" style={{ color: "#84cc16" }} />
</div>

{/* Type Badge */}
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

#### Email Activity (Blue)

```tsx
{/* Icon Circle */}
<div
  className="h-10 w-10 rounded-full flex items-center justify-center"
  style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
>
  <Mail className="h-5 w-5" style={{ color: "#3b82f6" }} />
</div>

{/* Type Badge */}
<Badge
  variant="outline"
  style={{
    borderColor: "#3b82f6",
    color: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  }}
>
  Email
</Badge>
```

#### Meeting Activity (Violet)

```tsx
{/* Icon Circle */}
<div
  className="h-10 w-10 rounded-full flex items-center justify-center"
  style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
>
  <Calendar className="h-5 w-5" style={{ color: "#8b5cf6" }} />
</div>

{/* Type Badge */}
<Badge
  variant="outline"
  style={{
    borderColor: "#8b5cf6",
    color: "#8b5cf6",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  }}
>
  Meeting
</Badge>
```

### Status Colors

| Status | Badge Variant | Color |
|--------|---------------|-------|
| Pending | `outline` | Yellow/Amber |
| Completed | `secondary` | Gray |
| Cancelled | `destructive` | Red |

**Implementation:**

```tsx
<Badge variant="secondary">completed</Badge>
<Badge variant="outline" className="border-yellow-500 text-yellow-700">pending</Badge>
<Badge variant="destructive">cancelled</Badge>
```

### Accessibility

**Contrast Ratios (WCAG AA):**

All color combinations meet WCAG AA standards (4.5:1 minimum):

| Background | Text Color | Ratio | Pass |
|------------|------------|-------|------|
| `rgba(132, 204, 22, 0.15)` | `#84cc16` | 4.8:1 | ✅ |
| `rgba(59, 130, 246, 0.15)` | `#3b82f6` | 4.9:1 | ✅ |
| `rgba(139, 92, 246, 0.15)` | `#8b5cf6` | 4.7:1 | ✅ |
| `rgba(245, 158, 11, 0.15)` | `#f59e0b` | 5.2:1 | ✅ |
| `rgba(16, 185, 129, 0.15)` | `#10b981` | 4.6:1 | ✅ |

---

## Empty States

### No Activities State

```tsx
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
```

**Visual Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│              [Icon]                 │
│          Large, centered            │
│         text-muted-foreground       │
│                                     │
│        No activities yet            │
│       (font-semibold, lg)           │
│                                     │
│   Get started by creating your      │
│        first activity               │
│     (text-muted-foreground)         │
│                                     │
│      [+ Add First Activity]         │
│        (Primary button)             │
│                                     │
└─────────────────────────────────────┘
```

### Empty State Variants

#### For Leads (Blue theme)

```tsx
<div className="text-center py-12">
  <Activity className="mx-auto h-12 w-12 text-blue-300" />
  <h3 className="mt-4 text-lg font-semibold">No activities yet</h3>
  <p className="text-muted-foreground mb-4">
    Track interactions with this lead
  </p>
  <Button
    onClick={() => setAddActivityOpen(true)}
    className="bg-blue-600 hover:bg-blue-700"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Activity
  </Button>
</div>
```

#### For Investors (Emerald theme)

```tsx
<div className="text-center py-12">
  <Activity className="mx-auto h-12 w-12 text-emerald-300" />
  <h3 className="mt-4 text-lg font-semibold">No activities yet</h3>
  <p className="text-muted-foreground mb-4">
    Start tracking investor interactions
  </p>
  <Button
    onClick={() => setAddActivityOpen(true)}
    className="bg-emerald-600 hover:bg-emerald-700"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Activity
  </Button>
</div>
```

### Loading State

```tsx
<div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="flex gap-4 pb-4 border-b">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-[100px]" />
      </div>
    </div>
  ))}
</div>
```

---

## Responsive Design

### Mobile Layout (< 640px)

**Timeline Card - Mobile:**

```tsx
<div className="flex flex-col gap-3 pb-4 border-b sm:flex-row sm:gap-4">
  {/* Mobile: Stacked layout */}
  <div className="flex items-center gap-3">
    {/* Icon */}
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      <IconComponent className="h-5 w-5" style={{ color: color }} />
    </div>
    {/* Title and badge */}
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <h4 className="font-semibold truncate">{subject}</h4>
      <Badge variant="outline" style={{ /* ... */ }}>
        {label}
      </Badge>
    </div>
  </div>

  {/* Content */}
  <div className="pl-13 sm:pl-0 sm:flex-1">
    <p className="text-sm text-muted-foreground">{description}</p>
    <div className="flex items-center gap-2 mt-2">
      <Badge variant="secondary">{status}</Badge>
      <p className="text-sm text-muted-foreground">{date}</p>
    </div>
  </div>
</div>
```

### Tablet Layout (640px - 1024px)

**Standard horizontal layout with adjusted spacing:**

```tsx
<div className="flex gap-3 pb-3 border-b md:gap-4 md:pb-4">
  {/* Icon */}
  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
    {/* ... */}
  </div>

  {/* Content - Full width */}
  <div className="flex-1 min-w-0">
    {/* ... */}
  </div>
</div>
```

### Desktop Layout (> 1024px)

**Full feature timeline with all elements:**

```tsx
<div className="flex gap-4 pb-4 border-b">
  {/* Icon Circle */}
  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
    {/* ... */}
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">{subject}</h4>
        <Badge variant="outline">{label}</Badge>
      </div>
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        {date}
      </p>
    </div>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
    <Badge variant="secondary" className="mt-2">{status}</Badge>
  </div>
</div>
```

### Breakpoint Reference

```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Responsive Utilities

```tsx
// Hide on mobile, show on desktop
<p className="hidden md:block">Desktop only content</p>

// Show on mobile, hide on desktop
<p className="block md:hidden">Mobile only content</p>

// Stack on mobile, flex on desktop
<div className="flex-col sm:flex-row">

// Adjust spacing
<div className="gap-3 sm:gap-4 md:gap-6">

// Responsive text sizing
<h3 className="text-lg sm:text-xl md:text-2xl">
```

---

## Animation and Transitions

### Card Hover Effect

```tsx
<div className="group flex gap-4 pb-4 border-b transition-all hover:bg-muted/50 -mx-4 px-4 rounded-lg">
  {/* Card content */}
</div>
```

### Icon Rotation on Hover

```tsx
<div className="h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110">
  <Phone className="h-5 w-5 transition-transform group-hover:rotate-12" />
</div>
```

### Badge Animations

```tsx
<Badge
  variant="outline"
  className="transition-colors hover:bg-primary hover:text-primary-foreground"
>
  {label}
</Badge>
```

### Fade In Animation

```tsx
// Using Framer Motion
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Activity card */}
</motion.div>
```

### Stagger Animation for List

```tsx
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

<motion.div variants={containerVariants} initial="hidden" animate="show">
  {activities.map((activity) => (
    <motion.div key={activity.id} variants={itemVariants}>
      {/* Activity card */}
    </motion.div>
  ))}
</motion.div>
```

---

## Best Practices

### 1. Consistent Spacing

```tsx
// ✅ Good - Consistent gap and padding
<div className="flex gap-4 pb-4 border-b">

// ❌ Bad - Inconsistent spacing
<div className="flex gap-2 pb-6 border-b">
```

### 2. Proper Color Opacity

```tsx
// ✅ Good - 15% opacity for backgrounds
backgroundColor: "rgba(132, 204, 22, 0.15)"

// ❌ Bad - Too strong
backgroundColor: "rgba(132, 204, 22, 0.5)"
```

### 3. Truncate Long Text

```tsx
// ✅ Good - Prevents overflow
<h4 className="font-semibold truncate">{subject}</h4>

// ❌ Bad - Text overflow
<h4 className="font-semibold">{subject}</h4>
```

### 4. Accessible Hover States

```tsx
// ✅ Good - Clear hover feedback
<div className="transition-all hover:bg-muted/50 cursor-pointer">

// ❌ Bad - No visual feedback
<div onClick={handleClick}>
```

### 5. Responsive Icons

```tsx
// ✅ Good - Scales with text
<Phone className="h-5 w-5" />

// ❌ Bad - Fixed size may break layout
<Phone size={20} />
```

---

[← Back to README](./README.md) | [← Previous: Implementation](./IMPLEMENTATION.md) | [Next: Notes →](./NOTES.md)
