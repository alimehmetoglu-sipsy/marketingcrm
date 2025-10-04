# Investor Module - UI/UX Visual Guide

> **Emerald Theme System:** The investor module uses a consistent emerald/teal/green color palette to differentiate from the lead module's blue/indigo theme.

## Table of Contents
- [Layout Structures](#layout-structures)
- [Color Scheme & Theme](#color-scheme--theme)
- [Spacing System](#spacing-system)
- [Component Patterns](#component-patterns)
- [Empty States](#empty-states)
- [Responsive Design](#responsive-design)
- [Animations & Transitions](#animations--transitions)
- [TSX Implementations](#tsx-implementations)

---

## Layout Structures

### 1. Detail View Layout (3-Column Responsive Grid)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HERO HEADER (Gradient)                          │
│  ┌──────┐  Full Name                                    [Edit] [Delete] │
│  │Avatar│  Position at Company                                          │
│  └──────┘  [Status] [Priority] [Source]                                 │
│            Email • Phone • Created Date                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬─────────────────────────────────────────┐
│                              │                SIDEBAR                   │
│        MAIN CONTENT          │  ┌───────────────────────────────────┐  │
│  ┌────────────────────────┐  │  │     Quick Actions Card           │  │
│  │ [Details] [Activity]   │  │  │  • Edit Investor                 │  │
│  └────────────────────────┘  │  │  • Add Activity                  │  │
│                              │  │  • Send Message                   │  │
│  ┌────────────────────────┐  │  └───────────────────────────────────┘  │
│  │ Contact Information    │  │                                          │
│  │  • Full Name           │  │  ┌───────────────────────────────────┐  │
│  │  • Email               │  │  │     Assigned To Card             │  │
│  │  • Phone               │  │  │  ┌─────┐                         │  │
│  │  • Company             │  │  │  │ XX  │ User Name               │  │
│  │  • Position            │  │  │  └─────┘ user@email.com          │  │
│  │  • Source              │  │  │          Assigned 2 days ago     │  │
│  └────────────────────────┘  │  │          by Admin Name           │  │
│                              │  │  [Change Assignment]              │  │
│  ┌────────────────────────┐  │  └───────────────────────────────────┘  │
│  │ Dynamic Section 1      │  │                                          │
│  │  (from form_sections)  │  │  ┌───────────────────────────────────┐  │
│  │  • Status              │  │  │     Dates Card                   │  │
│  │  • Priority            │  │  │  • Created: Jan 15, 2025         │  │
│  │  • Custom Fields       │  │  │    (2 days ago)                  │  │
│  └────────────────────────┘  │  │  • Updated: Jan 16, 2025         │  │
│                              │  │    (1 day ago)                    │  │
│  ┌────────────────────────┐  │  └───────────────────────────────────┘  │
│  │ Dynamic Section 2      │  │                                          │
│  └────────────────────────┘  │                                          │
└──────────────────────────────┴─────────────────────────────────────────┘

Responsive Breakpoint (lg: 1024px):
- Above 1024px: Main content (col-span-8) + Sidebar (col-span-4)
- Below 1024px: Stack vertically (full width)
```

### 2. Form Layout (2-Column Grid)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [← Back]                           Edit Investor          [Save] [Cancel]│
│  ┌──────┐  Full Name                                                     │
│  │Avatar│  Position at Company                                           │
│  └──────┘  [Status] [Priority] [Source]                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────┬─────────────────────────────┐
│         MAIN FORM (col-span-8)            │   SIDEBAR (col-span-4)      │
│                                           │                             │
│  ┌─────────────────────────────────────┐  │  ┌───────────────────────┐  │
│  │ 📋 Contact Information     [▼]      │  │  │ 📊 Form Progress      │  │
│  │ ─────────────────────────────────── │  │  │                       │  │
│  │  Full Name *                        │  │  │  ████████░░ 80%       │  │
│  │  ┌──────────────────────────────┐   │  │  │  12 of 15 completed   │  │
│  │  │ John Doe                     │   │  │  │                       │  │
│  │  └──────────────────────────────┘   │  │  └───────────────────────┘  │
│  │                                     │  │                             │
│  │  Email *                            │  │  ┌───────────────────────┐  │
│  │  ┌──────────────────────────────┐   │  │  │ ✅ Tips               │  │
│  │  │ john@example.com             │   │  │  │                       │  │
│  │  └──────────────────────────────┘   │  │  │ ✓ All fields unique   │  │
│  │                                     │  │  │ ✓ Select country code │  │
│  │  Phone *                            │  │  │ ✓ Use notes field     │  │
│  │  ┌──────────────────────────────┐   │  │  └───────────────────────┘  │
│  │  │ +90 555 123 4567             │   │  │                             │
│  │  └──────────────────────────────┘   │  │                             │
│  └─────────────────────────────────────┘  │                             │
│                                           │                             │
│  ┌─────────────────────────────────────┐  │                             │
│  │ 📄 Investor Details        [▼]      │  │                             │
│  │ ─────────────────────────────────── │  │                             │
│  │  Status * (Select)                  │  │                             │
│  │  Priority (Select)                  │  │                             │
│  │  Custom Field 1                     │  │                             │
│  │  Custom Field 2                     │  │                             │
│  │  ...                                │  │                             │
│  └─────────────────────────────────────┘  │                             │
└───────────────────────────────────────────┴─────────────────────────────┘

Collapsible Sections:
- Click header to expand/collapse
- Animated max-height transition
- ChevronDown/ChevronUp icon indicates state
```

### 3. List View with Filters

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Investors Management                            [+ Add Investor]        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 Search    [Status ▼]  [Priority ▼]  [Source ▼]  [Assigned To ▼]     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Name               Email           Phone          Status    Priority     │
│─────────────────────────────────────────────────────────────────────────│
│ ● JD  John Doe     john@test.com   +90 555...    [Active]   [● High]    │
│ ● AS  Alice Smith  alice@test.com  +90 555...    [Prospect] [◐ Medium]  │
│ ...                                                                       │
└─────────────────────────────────────────────────────────────────────────┘

Row Structure:
- Avatar (Gradient circle with initials)
- Name (Bold) + Email/Phone (Muted)
- Badge components for Status/Priority
- Hover: bg-blue-50 (subtle highlight)
- Click: Navigate to detail view
```

---

## Color Scheme & Theme

### Primary Emerald Theme

```css
/* Main Gradient (Hero Headers) */
bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700

/* Section Headers */
bg-gradient-to-r from-emerald-50 to-teal-50

/* Accent Colors */
text-emerald-600  /* Icons, links */
text-emerald-700  /* Hover states */
bg-emerald-50     /* Light backgrounds */
border-emerald-200 /* Borders */

/* Badge Multiselect */
bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200

/* Button Primary */
bg-emerald-600 hover:bg-emerald-700

/* Button Outline Hover */
hover:border-emerald-300 hover:bg-emerald-50
```

### Status Badge Colors

```typescript
const statusConfig = {
  potential: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "Potential"
  },
  contacted: {
    color: "text-cyan-700",
    bg: "bg-cyan-50 border-cyan-200",
    label: "Contacted"
  },
  interested: {
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    label: "Interested"
  },
  committed: {
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    label: "Committed"
  },
  active: {
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    label: "Active"
  },
  inactive: {
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
    label: "Inactive"
  },
}
```

### Priority Badge Colors

```typescript
const priorityConfig = {
  low: {
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
    label: "Low",
    icon: "○"
  },
  normal: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "Normal",
    icon: "◐"
  },
  high: {
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    label: "High",
    icon: "●"
  },
  urgent: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    label: "Urgent",
    icon: "⚠"
  },
}
```

### Avatar Gradient

```css
/* Investor Avatar */
bg-gradient-to-br from-green-500 to-emerald-500 text-white

/* Lead Avatar (for comparison) */
bg-gradient-to-br from-blue-500 to-indigo-500 text-white
```

---

## Spacing System

### Global Spacing Scale

```css
/* Card Padding */
p-6          /* Card content (24px) */
px-6 pb-6    /* Card content with header */

/* Section Gaps */
gap-6        /* Grid/Flex gaps (24px) */
space-y-6    /* Vertical spacing between cards (24px) */

/* Inner Card Elements */
gap-3        /* Smaller gaps (12px) */
gap-4        /* Medium gaps (16px) */
space-y-4    /* Vertical spacing inside cards (16px) */

/* Micro Spacing */
gap-2        /* Icon + text (8px) */
mb-2, mt-2   /* Small margins (8px) */

/* Hero Header */
p-8          /* Hero padding (32px) */
mb-6         /* Bottom margin (24px) */
```

### Field Item Spacing

```css
/* Static Field Card */
.space-y-2   /* Label to value (8px) */
.p-4         /* Field container padding (16px) */
.ml-6        /* Value indent (24px) */

/* Grid Layout */
.gap-6       /* Between field cards (24px) */
md:grid-cols-2 /* 2 columns on medium+ screens */
```

---

## Component Patterns

### 1. Hero Header Pattern

```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-8 shadow-xl">
  {/* Background Grid Pattern */}
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

  <div className="relative">
    {/* Back & Actions */}
    <div className="flex items-center justify-between mb-6">
      <Link href="/investors">
        <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white border border-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="bg-white/95 hover:bg-white text-gray-900 shadow-lg">
          <Edit className="h-4 w-4 mr-2" />
          Edit Investor
        </Button>
        <Button variant="secondary" className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg">
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    {/* Investor Info */}
    <div className="flex items-start gap-6">
      <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
        <AvatarFallback className="text-2xl font-bold bg-white/90 text-emerald-600">
          {getInitials(investor.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          {investor.full_name}
        </h1>
        {investor.company && (
          <p className="text-lg text-white/80 mb-4">
            {investor.position ? `${investor.position} at ` : ''}{investor.company}
          </p>
        )}

        {/* Badges */}
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
            {status.label}
          </Badge>
          {priority && (
            <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
              <span className="mr-1">{priority.icon}</span>
              {priority.label}
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            <Globe className="h-3 w-3 mr-1" />
            {investor.source.replace(/_/g, " ")}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center gap-4 text-white/90">
          <a href={`mailto:${investor.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{investor.email}</span>
          </a>
          {investor.phone && (
            <>
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              <a href={`tel:${investor.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{investor.phone}</span>
              </a>
            </>
          )}
          <Separator orientation="vertical" className="h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Created {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy") : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. Collapsible Section Pattern

```tsx
function CollapsibleSection({
  title,
  subtitle,
  icon,
  gradient,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className={cn("p-6 border-b border-gray-200 transition-colors", gradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>
      </button>

      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <CardContent className="px-6 pb-6 pt-4 space-y-4">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}

// Usage
<CollapsibleSection
  title="Contact Information"
  subtitle="Required contact details"
  icon={<UserIcon className="w-5 h-5 text-emerald-600" />}
  gradient="bg-gradient-to-r from-emerald-50 to-teal-50"
>
  {/* Form fields */}
</CollapsibleSection>
```

### 3. Field Display Pattern (Detail View)

```tsx
{/* Static Field with Icon */}
<div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Mail className="h-4 w-4 text-gray-400" />
    <span className="font-medium">Email</span>
  </div>
  <a
    href={`mailto:${investor.email}`}
    className="text-emerald-600 hover:text-emerald-700 font-medium ml-6 block"
  >
    {investor.email}
  </a>
</div>

{/* Multiselect Field with Badges */}
<div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Tag className="h-4 w-4 text-gray-400" />
    <span className="font-medium">{field.label}</span>
  </div>
  <div className="flex flex-wrap gap-2 ml-6">
    {multiselectValues.map((val, idx) => {
      const option = fieldData?.investor_field_options.find((opt) => opt.value === val)
      const label = option?.label || val
      return (
        <Badge
          key={idx}
          variant="secondary"
          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
        >
          {label}
        </Badge>
      )
    })}
  </div>
</div>

{/* Select Field with Single Badge */}
<div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Tag className="h-4 w-4 text-gray-400" />
    <span className="font-medium">{field.label}</span>
  </div>
  <div className="ml-6">
    <Badge
      variant="secondary"
      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
    >
      {getFieldDisplayValue(field.name)}
    </Badge>
  </div>
</div>
```

### 4. Activity Timeline Pattern

```tsx
<div className="space-y-4">
  {investor.activities.map((activity, index) => {
    const activityType = investor.activityTypes.find(
      (at) => at.name === activity.type
    )
    const IconComponent = getActivityIconComponent(activityType?.icon || null)
    const bgColor = getActivityBgColor(activityType?.color || null)
    const iconColor = activityType?.color || '#6b7280'

    return (
      <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
        {/* Icon Timeline */}
        <div className="flex flex-col items-center">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <IconComponent
              className="h-5 w-5"
              style={{ color: iconColor }}
            />
          </div>
          {index !== investor.activities!.length - 1 && (
            <div className="w-px h-full bg-gray-200 mt-2" />
          )}
        </div>

        {/* Activity Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">
                {activity.subject || activityType?.label || activity.type}
              </h4>
              {activityType && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: activityType.color || '#e5e7eb',
                    color: activityType.color || '#6b7280',
                  }}
                >
                  {activityType.label}
                </Badge>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {activity.created_at ? format(new Date(activity.created_at), "MMM dd, HH:mm") : "-"}
            </span>
          </div>
          {activity.description && (
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
          )}
          <Badge variant="outline" className="mt-2 text-xs capitalize">
            {activity.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    )
  })}
</div>
```

### 5. Assigned User Card Pattern

```tsx
<Card className="border-gray-200 shadow-sm">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
      <UserCircle className="h-5 w-5 text-emerald-600" />
      Assigned To
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    {investor.assignedUser ? (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-emerald-100">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
              {getInitials(investor.assignedUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {investor.assignedUser.name}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {investor.assignedUser.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Assigned {formatDistanceToNow(new Date(investor.assignedUser.assigned_at), { addSuffix: true })}
            </p>
            <p className="text-xs text-gray-500">
              by {investor.assignedUser.assigned_by.name}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
          onClick={openAssignDialog}
        >
          <Users className="h-4 w-4 mr-2" />
          Change Assignment
        </Button>
      </div>
    ) : (
      <div className="text-center py-4">
        <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">No user assigned</p>
        <Button
          variant="outline"
          className="w-full border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
          onClick={openAssignDialog}
        >
          <Users className="h-4 w-4 mr-2" />
          Assign User
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

### 6. Progress Card Pattern

```tsx
<Card className="border-gray-200 shadow-lg overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-emerald-600" />
      Form Progress
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className="text-sm font-bold text-emerald-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
        <span>{completedFields} of {totalFields} fields completed</span>
        {percentage === 100 && (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Empty States

### 1. No Activities Empty State

```tsx
<div className="text-center py-12">
  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
  <p className="text-gray-600 mb-4">Get started by adding the first activity for this investor.</p>
  <Button onClick={() => setAddActivityOpen(true)} size="sm">
    <Plus className="h-4 w-4 mr-2" />
    Add First Activity
  </Button>
</div>
```

### 2. No Investors in List

```tsx
<TableRow>
  <TableCell colSpan={8} className="text-center py-12">
    <div className="flex flex-col items-center justify-center">
      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No investors found</h3>
      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
    </div>
  </TableCell>
</TableRow>
```

### 3. No Assigned User

```tsx
<div className="text-center py-4">
  <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
  <p className="text-sm text-gray-600 mb-4">No user assigned</p>
  <Button
    variant="outline"
    className="w-full border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
    onClick={openAssignDialog}
  >
    <Users className="h-4 w-4 mr-2" />
    Assign User
  </Button>
</div>
```

---

## Responsive Design

### Breakpoints (Tailwind)

```css
/* Mobile First Approach */
base:    /* < 640px   - Mobile */
sm:      /* ≥ 640px   - Small tablet */
md:      /* ≥ 768px   - Tablet */
lg:      /* ≥ 1024px  - Desktop */
xl:      /* ≥ 1280px  - Large desktop */
2xl:     /* ≥ 1536px  - Extra large */
```

### Grid Responsiveness

```tsx
{/* Detail View - 3 Column Grid */}
<div className="grid gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>

{/* Form View - 12 Column Grid */}
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-8 space-y-6">{/* Main form */}</div>
  <div className="col-span-4 space-y-6">{/* Sidebar */}</div>
</div>

{/* Field Grid - 2 Column on Medium+ */}
<div className="grid gap-6 md:grid-cols-2">
  {/* Field cards */}
</div>
```

### Mobile Adaptations

```tsx
{/* Hero Header - Stack on mobile */}
<div className="flex items-start gap-6 flex-col sm:flex-row">
  <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
    {/* Avatar */}
  </Avatar>
  <div className="flex-1">
    <h1 className="text-2xl sm:text-4xl font-bold">
      {investor.full_name}
    </h1>
  </div>
</div>

{/* Tabs - Full width on mobile */}
<TabsList className="grid w-full grid-cols-2 h-12">
  <TabsTrigger value="details">
    <Building2 className="h-4 w-4 mr-2" />
    <span className="hidden sm:inline">Investor </span>Information
  </TabsTrigger>
  <TabsTrigger value="activity">
    <Activity className="h-4 w-4 mr-2" />
    <span className="hidden sm:inline">Activity </span>Timeline
  </TabsTrigger>
</TabsList>
```

---

## Animations & Transitions

### 1. Collapsible Animation

```css
/* Max-height transition with opacity */
.transition-all.duration-200.ease-in-out {
  transition-property: max-height, opacity;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}

/* Open state */
.max-h-[2000px].opacity-100

/* Closed state */
.max-h-0.opacity-0.overflow-hidden
```

### 2. Hover Transitions

```css
/* Card hover effect */
.hover:bg-gray-100.transition-colors

/* Row hover in table */
.hover:bg-blue-50.transition-colors

/* Button hover */
.hover:bg-emerald-700.transition-colors

/* Border hover */
.hover:border-emerald-300
```

### 3. Progress Bar Animation

```tsx
<div
  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
  style={{ width: `${percentage}%` }}
/>
```

### 4. Loading States

```tsx
{/* Button loading */}
<button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Saving...
    </>
  ) : (
    <>
      <CheckCircle2 className="h-4 w-4" />
      Save Investor
    </>
  )}
</button>
```

---

## TSX Implementations

### Complete Hero Header Implementation

```tsx
{/* From: InvestorDetailView (lines 326-414) */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-8 shadow-xl">
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

  <div className="relative">
    {/* Back & Actions */}
    <div className="flex items-center justify-between mb-6">
      <Link href="/investors">
        <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white border border-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex items-center gap-3">
        <Link href={`/investors/${investor.id}/edit`}>
          <Button variant="secondary" className="bg-white/95 hover:bg-white text-gray-900 shadow-lg">
            <Edit className="h-4 w-4 mr-2" />
            Edit Investor
          </Button>
        </Link>
        <Button
          variant="secondary"
          className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    {/* Investor Info */}
    <div className="flex items-start gap-6">
      <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
        <AvatarFallback className="text-2xl font-bold bg-white/90 text-emerald-600">
          {getInitials(investor.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          {investor.full_name}
        </h1>
        {investor.company && (
          <p className="text-lg text-white/80 mb-4">
            {investor.position ? `${investor.position} at ` : ''}{investor.company}
          </p>
        )}
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
            {status.label}
          </Badge>
          {priority && (
            <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
              <span className="mr-1">{priority.icon}</span>
              {priority.label}
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            <Globe className="h-3 w-3 mr-1" />
            {investor.source.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-white/90">
          <a href={`mailto:${investor.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{investor.email}</span>
          </a>
          {investor.phone && (
            <>
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              <a href={`tel:${investor.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{investor.phone}</span>
              </a>
            </>
          )}
          <Separator orientation="vertical" className="h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Created {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy") : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Dynamic Section with System Fields

```tsx
{/* From: InvestorDetailView (lines 515-648) */}
{investor.formSections.map((section) => {
  const sectionFields = investor.allFields.filter(
    (field) => field.section_key === section.section_key &&
    !field.is_system_field &&
    field.name !== "source" &&
    field.name !== "status" &&
    field.name !== "priority"
  )

  if (sectionFields.length === 0) return null

  const SectionIcon = iconMapping[section.icon || 'layout'] || Tag
  const gradientClass = section.gradient || 'bg-gradient-to-r from-gray-50 to-gray-100'
  const isInvestorDetailsSection = section.section_key === 'investment_details'

  return (
    <Card key={section.id} className="border-gray-200 shadow-sm">
      <CardHeader className={`${gradientClass} border-b border-gray-200`}>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SectionIcon className="h-5 w-5 text-teal-600" />
          {section.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Add Status and Priority at the top of Investor Details section */}
          {isInvestorDetailsSection && (
            <>
              {/* Status */}
              <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Status</span>
                </div>
                <div className="ml-6">
                  <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
                    {status.label}
                  </Badge>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Priority</span>
                </div>
                <div className="ml-6">
                  {priority ? (
                    <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Custom Fields */}
          {sectionFields.map((field) => {
            const fieldValueObj = investor.customFieldValues.find(
              (cfv) => cfv.investor_fields.name === field.name
            )
            const fieldData = fieldValueObj?.investor_fields
            const value = fieldValueObj?.value

            const isMultiselect = fieldData?.type === "multiselect" || fieldData?.type === "multiselect_dropdown"

            let multiselectValues: string[] = []
            if (isMultiselect && value) {
              if (Array.isArray(value)) {
                multiselectValues = value
              } else if (typeof value === 'string') {
                try {
                  const parsed = JSON.parse(value)
                  if (Array.isArray(parsed)) {
                    multiselectValues = parsed
                  }
                } catch (e) {
                  // Keep empty
                }
              }
            }

            return (
              <div key={field.id} className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{field.label}</span>
                </div>

                {isMultiselect && multiselectValues.length > 0 ? (
                  <div className="flex flex-wrap gap-2 ml-6">
                    {multiselectValues.map((val, idx) => {
                      const option = fieldData?.investor_field_options.find((opt) => opt.value === val)
                      const label = option?.label || val
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                        >
                          {label}
                        </Badge>
                      )
                    })}
                  </div>
                ) : fieldData?.type === "select" ? (
                  <div className="ml-6">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                    >
                      {getFieldDisplayValue(field.name)}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-gray-900 font-medium ml-6">
                    {getFieldDisplayValue(field.name)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})}
```

### Collapsible Form Section (Complete)

```tsx
{/* From: InvestorFormClient (lines 98-156) */}
interface CollapsibleSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  gradient: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  gradient,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className={cn("p-6 border-b border-gray-200 transition-colors", gradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>
      </button>

      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <CardContent className="px-6 pb-6 pt-4 space-y-4">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}

// Usage Example
<CollapsibleSection
  title="Contact Information"
  subtitle="Required contact details"
  icon={<UserIcon className="w-5 h-5 text-emerald-600" />}
  gradient="bg-gradient-to-r from-emerald-50 to-teal-50"
>
  <FormField
    control={form.control}
    name="full_name"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-gray-700 font-medium">
          Full Name <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input
            placeholder="John Doe"
            {...field}
            className="border-gray-300 focus:border-[#FF7A59] focus:ring-[#FF7A59]"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  {/* More fields... */}
</CollapsibleSection>
```

### Badge Component Usage Patterns

```tsx
{/* Status Badge */}
<Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
  {status.label}
</Badge>

{/* Priority Badge with Icon */}
<Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
  <span className="mr-1">{priority.icon}</span>
  {priority.label}
</Badge>

{/* Source Badge (Outline) */}
<Badge variant="outline" className="bg-white/10 text-white border-white/20">
  <Globe className="h-3 w-3 mr-1" />
  {investor.source.replace(/_/g, " ")}
</Badge>

{/* Multiselect Badges (Emerald Theme) */}
<Badge
  variant="secondary"
  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
>
  {label}
</Badge>

{/* Activity Type Badge (Custom Color) */}
<Badge
  variant="outline"
  className="text-xs"
  style={{
    borderColor: activityType.color || '#e5e7eb',
    color: activityType.color || '#6b7280',
  }}
>
  {activityType.label}
</Badge>
```

---

## Key Design Principles

1. **Consistent Emerald Theme**: All investor-related UI uses emerald/teal/green gradients and accents
2. **Section-Based Organization**: Dynamic fields are grouped by `section_key` from `investor_form_sections`
3. **Hover Feedback**: All interactive elements have hover states (cards, buttons, links)
4. **Responsive Grid**: 3-column layout on desktop, stacks on mobile
5. **Badge-Based Display**: Use badges for status, priority, source, and multiselect values
6. **Icon Consistency**: Each section has a designated icon (user, briefcase, document, layout)
7. **Spacing Harmony**: Consistent use of gap-6, p-6, space-y-6 for visual rhythm
8. **Empty State Guidance**: Clear messaging with CTAs for empty states
9. **Collapsible Sections**: Reduce cognitive load with expandable/collapsible form sections
10. **Visual Hierarchy**: Hero header → Tabs → Sections → Fields with clear nesting

---

## File References

### Core Components
- **Detail View**: `/components/investors/investor-detail-view.tsx`
- **Form Client**: `/components/investors/investor-form-client.tsx`
- **Table**: `/components/investors/investors-table.tsx`
- **Dynamic Field**: `/components/fields/investor-dynamic-field.tsx`

### Supporting Components
- **Form Header**: `/components/investors/investor-form-header.tsx`
- **Form Progress**: `/components/investors/investor-form-progress.tsx`
- **Edit Hero**: `/components/investors/investor-edit-hero.tsx`
- **Add Activity Dialog**: `/components/activities/add-activity-dialog.tsx`

---

## Developer Notes

### When Adding New Features

1. **Follow Emerald Theme**: Use `from-emerald-600 via-teal-600 to-green-700` for gradients
2. **Use Section Headers**: Apply `bg-gradient-to-r from-emerald-50 to-teal-50` for card headers
3. **Badge Colors**: Emerald theme for custom fields, use `bg-emerald-100 text-emerald-700`
4. **Icon Library**: Import from `lucide-react`, use 4px or 5px sizes
5. **Spacing**: Maintain gap-6 and p-6 for main layouts, gap-3/gap-4 for inner elements
6. **Responsive**: Always test with `lg:grid-cols-X` and mobile-first approach
7. **Empty States**: Include icon, heading, description, and CTA button
8. **Transitions**: Use `transition-colors` for hover states, `transition-all duration-200` for animations

### Common Pitfalls to Avoid

- ❌ Don't use blue gradients (reserved for leads)
- ❌ Don't forget hover states on interactive elements
- ❌ Don't hardcode field values, always use dynamic mapping
- ❌ Don't skip empty state handling
- ❌ Don't use inconsistent spacing (stick to 6/4/3/2 scale)
- ❌ Don't forget mobile responsive classes

---

**Last Updated**: 2025-01-17
**Component Version**: v1.0
**Theme**: Emerald/Teal/Green
