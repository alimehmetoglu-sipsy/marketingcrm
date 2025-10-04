# Leads Module - Visual & UX Guide

[← Back to README](./README.md)

---

## 📋 Table of Contents

- [Color Theme](#color-theme)
- [Hero Headers](#hero-headers)
- [Badge System](#badge-system)
- [Form Sections](#form-sections)
- [Table Design](#table-design)
- [Empty States](#empty-states)
- [Loading States](#loading-states)
- [Responsive Design](#responsive-design)

---

## Color Theme

### Lead Module Theme: Blue/Indigo/Purple

**Primary Colors:**
```css
/* Hero gradients */
bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700

/* Section gradients */
bg-gradient-to-br from-blue-600 to-indigo-500
bg-gradient-to-r from-blue-50 to-indigo-50

/* Button gradients */
bg-gradient-to-r from-blue-600 to-indigo-600
hover:from-blue-700 hover:to-indigo-700

/* Badge colors */
bg-blue-100 text-blue-700 border-blue-200
```

**vs Investor Module (Emerald/Green/Teal):**
```css
/* For comparison */
bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700
```

---

## Hero Headers

### Lead Detail Hero

**Location:** `components/leads/lead-detail-view.tsx`

**Design:**
```tsx
<div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
  {/* Grid pattern overlay */}
  <div className="absolute inset-0 bg-grid-white/10" />

  {/* Content */}
  <div className="relative px-8 py-12">
    {/* Avatar with initials */}
    <Avatar className="h-24 w-24 border-4 border-white/20">
      <AvatarFallback className="text-3xl font-bold bg-white/10 text-white">
        {initials}
      </AvatarFallback>
    </Avatar>

    {/* Lead name */}
    <h1 className="text-4xl font-bold text-white mt-4">
      {lead.full_name}
    </h1>

    {/* Badges row */}
    <div className="flex gap-3 mt-4">
      <Badge className="bg-white/20 text-white border-white/30">
        {statusLabel}
      </Badge>
      <Badge className="bg-white/20 text-white border-white/30">
        {priorityLabel}
      </Badge>
      <Badge className="bg-white/20 text-white border-white/30">
        <Globe className="w-3 h-3 mr-1" />
        {sourceLabel}
      </Badge>
    </div>

    {/* Contact info */}
    <div className="flex gap-6 mt-6 text-white/90">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4" />
        {lead.email}
      </div>
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4" />
        {lead.phone}
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex gap-3 mt-6">
      <Button className="bg-white text-blue-700 hover:bg-white/90">
        <Edit className="w-4 h-4 mr-2" />
        Edit Lead
      </Button>
      <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
        <Trash className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  </div>
</div>
```

---

### Lead Edit Hero

**Location:** `components/leads/lead-edit-hero.tsx`

**Design:**
```tsx
<div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-6">
  {/* Editing badge */}
  <div className="absolute top-4 right-4">
    <Badge className="bg-white/20 text-white border-white/30">
      <Edit className="w-3 h-3 mr-1" />
      Editing
    </Badge>
  </div>

  {/* Avatar + info */}
  <div className="flex items-center gap-6">
    <Avatar className="h-20 w-20 border-4 border-white/20">
      <AvatarFallback className="text-2xl font-bold bg-white/10 text-white">
        {initials}
      </AvatarFallback>
    </Avatar>

    <div>
      <h1 className="text-3xl font-bold text-white">
        {lead.full_name}
      </h1>
      <p className="text-white/80 mt-1">
        Editing lead information
      </p>
    </div>
  </div>

  {/* Action buttons */}
  <div className="flex gap-3 mt-6">
    <Button
      onClick={onSave}
      disabled={isSubmitting}
      className="bg-white text-blue-700 hover:bg-white/90"
    >
      {isSubmitting ? 'Saving...' : 'Save Changes'}
    </Button>
    <Button
      onClick={onCancel}
      variant="outline"
      className="border-white/30 text-white hover:bg-white/10"
    >
      Cancel
    </Button>
  </div>
</div>
```

---

## Badge System

### Status Badges

```typescript
const statusConfig: Record<string, {
  color: string
  bg: string
  label: string
}> = {
  new: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "New"
  },
  contacted: {
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    label: "Contacted"
  },
  qualified: {
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    label: "Qualified"
  },
  converted: {
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Converted"
  },
  lost: {
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
    label: "Lost"
  }
}
```

**Usage:**
```tsx
<Badge className={`${statusConfig[status].bg} ${statusConfig[status].color} border`}>
  {statusConfig[status].label}
</Badge>
```

---

### Priority Badges

```typescript
const priorityConfig: Record<string, {
  color: string
  bg: string
  label: string
  icon: string
}> = {
  low: {
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
    label: "Low",
    icon: "○"
  },
  medium: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "Medium",
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
  }
}
```

---

### Source Badges

```tsx
const sourceIcons = {
  website: <Globe className="w-3 h-3" />,
  social_media: <Users className="w-3 h-3" />,
  referral: <UserPlus className="w-3 h-3" />,
  event: <Calendar className="w-3 h-3" />,
  other: <Tag className="w-3 h-3" />
}

<Badge className="bg-gray-100 text-gray-700 border-gray-200">
  {sourceIcons[source]}
  <span className="ml-1">{sourceLabel}</span>
</Badge>
```

---

## Form Sections

### Collapsible Section Component

```tsx
<Card className="border-gray-200 shadow-sm">
  {/* Section Header */}
  <CardHeader
    className={`${gradient} cursor-pointer`}
    onClick={() => setIsOpen(!isOpen)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <CardTitle className="text-lg font-semibold text-white">
            {title}
          </CardTitle>
          <p className="text-sm text-white/80 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Expand/collapse icon */}
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-white" />
      ) : (
        <ChevronDown className="h-5 w-5 text-white" />
      )}
    </div>
  </CardHeader>

  {/* Section Content */}
  {isOpen && (
    <CardContent className="p-6">
      {children}
    </CardContent>
  )}
</Card>
```

**Section Gradients:**
```css
/* Contact Information */
bg-gradient-to-br from-blue-600 to-indigo-500

/* Lead Details */
bg-gradient-to-r from-blue-50 to-indigo-50

/* Additional Info */
bg-gradient-to-r from-purple-50 to-pink-50
```

---

## Table Design

### Leads Table

**Features:**
- Hover effect on rows
- Clickable rows (navigate to detail)
- Action dropdown (prevent propagation)
- Status/Priority badges
- Avatar with initials

```tsx
<TableRow
  className="cursor-pointer hover:bg-blue-50 transition-colors"
  onClick={() => router.push(`/leads/${lead.id}`)}
>
  {/* Avatar cell */}
  <TableCell>
    <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-500">
      <AvatarFallback className="font-semibold text-white">
        {getInitials(lead.full_name)}
      </AvatarFallback>
    </Avatar>
  </TableCell>

  {/* Name cell */}
  <TableCell className="font-medium">
    {lead.full_name}
  </TableCell>

  {/* Status cell */}
  <TableCell>
    <Badge className={statusConfig[lead.status].bg}>
      {statusConfig[lead.status].label}
    </Badge>
  </TableCell>

  {/* Actions cell */}
  <TableCell onClick={(e) => e.stopPropagation()}>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(lead)}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</TableRow>
```

---

### Stats Cards (Above Table)

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
  {/* Total Leads */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        Total Leads
      </CardTitle>
      <Users className="h-5 w-5 text-blue-600" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900">{totalLeads}</div>
      <p className="text-sm text-gray-500 mt-1">All time</p>
    </CardContent>
  </Card>

  {/* Similar cards for New, Qualified, Converted */}
</div>
```

---

## Empty States

### No Leads

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="bg-blue-50 p-6 rounded-full mb-4">
    <Users className="h-12 w-12 text-blue-600" />
  </div>

  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No leads yet
  </h3>

  <p className="text-gray-600 mb-6 max-w-md">
    Start building your sales pipeline by adding your first lead.
    You can import leads or add them manually.
  </p>

  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
    <Plus className="mr-2 h-4 w-4" />
    Add Your First Lead
  </Button>
</div>
```

---

### No Activities

```tsx
<div className="text-center py-12">
  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />

  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    No activities yet
  </h3>

  <p className="text-gray-600 mb-4">
    Track calls, meetings, and emails with this lead
  </p>

  <Button variant="outline" onClick={() => setAddActivityOpen(true)}>
    <Plus className="mr-2 h-4 w-4" />
    Add First Activity
  </Button>
</div>
```

---

## Loading States

### Skeleton Loader (Table)

```tsx
<TableRow>
  <TableCell>
    <Skeleton className="h-10 w-10 rounded-full" />
  </TableCell>
  <TableCell>
    <Skeleton className="h-4 w-32" />
  </TableCell>
  <TableCell>
    <Skeleton className="h-6 w-20 rounded-full" />
  </TableCell>
  <TableCell>
    <Skeleton className="h-4 w-24" />
  </TableCell>
</TableRow>
```

---

### Loading Button

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isSubmitting ? 'Creating...' : 'Create Lead'}
</Button>
```

---

## Responsive Design

### Mobile Breakpoints

```tsx
/* Tailwind responsive classes */
<div className="
  grid
  grid-cols-1           /* Mobile: 1 column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  xl:grid-cols-4        /* Large: 4 columns */
  gap-4
">
  {/* Cards */}
</div>
```

---

### Mobile Table

```tsx
{/* Mobile: Card view */}
<div className="block md:hidden space-y-4">
  {leads.map(lead => (
    <Card key={lead.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(lead.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{lead.full_name}</CardTitle>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Badge>{lead.status}</Badge>
          <Badge>{lead.priority}</Badge>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

{/* Desktop: Table view */}
<div className="hidden md:block">
  <Table>
    {/* Table content */}
  </Table>
</div>
```

---

### Mobile Hero

```tsx
<div className="px-4 md:px-8 py-8 md:py-12">
  {/* Avatar smaller on mobile */}
  <Avatar className="h-16 w-16 md:h-24 md:w-24">
    {/* ... */}
  </Avatar>

  {/* Title smaller on mobile */}
  <h1 className="text-2xl md:text-4xl font-bold">
    {lead.full_name}
  </h1>

  {/* Badges stack on mobile */}
  <div className="flex flex-wrap gap-2 md:gap-3">
    {/* Badges */}
  </div>
</div>
```

---

## Animation & Transitions

### Page Transitions

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  {/* Page content */}
</motion.div>
```

---

### Hover Effects

```css
/* Button hover */
.button-gradient {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600
         hover:from-blue-700 hover:to-indigo-700
         transition-all duration-200;
}

/* Card hover */
.card-hover {
  @apply transition-shadow duration-200
         hover:shadow-lg;
}

/* Table row hover */
.table-row-hover {
  @apply transition-colors duration-150
         hover:bg-blue-50;
}
```

---

## Iconography

### Icon Library: Lucide React

**Common Icons:**
```tsx
import {
  Users,        // Leads list
  User,         // Single lead
  Mail,         // Email
  Phone,        // Phone
  Calendar,     // Date/Schedule
  Edit,         // Edit action
  Trash,        // Delete action
  Plus,         // Add new
  Filter,       // Filters
  Search,       // Search
  MoreVertical, // Actions menu
  ChevronDown,  // Expand
  ChevronUp,    // Collapse
  Globe,        // Source/Website
  TrendingUp,   // Growth/Stats
  Target,       // Goals
  Activity,     // Activity timeline
  CheckCircle2, // Success/Completed
  AlertCircle,  // Warning/Info
} from "lucide-react"
```

---

[← Back to README](./README.md)

**Last Updated:** 2025-01-04
**Version:** 1.0.0
