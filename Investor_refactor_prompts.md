# Investor Detail Page Refactor Guide

> Bu doküman, Leads tarafında yapılan modernizasyon çalışmalarını detaylıca açıklar ve Investors tarafına aynı yapıyı uygulamak için eksiksiz bir rehber sunar.

**Tarih:** 2025-10-03
**Versiyon:** 1.0
**Referans:** Lead Detail Page (`/leads/[id]`)

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Lead Detail Modernizasyonu - Detaylı Analiz](#lead-detail-modernizasyonu---detaylı-analiz)
3. [Investor Detail Refactor Roadmap](#investor-detail-refactor-roadmap)
4. [Adım Adım Implementation](#adım-adım-implementation)
5. [Key Differences: Leads vs Investors](#key-differences-leads-vs-investors)
6. [Code Snippets & Examples](#code-snippets--examples)

---

## 🎯 Genel Bakış

### Yapılan İyileştirmeler (Leads)

Lead detail sayfası (`/leads/[id]`) tamamen modernize edildi ve aşağıdaki özellikler eklendi:

1. ✅ Modern Hero Header (gradient background, avatar, badges)
2. ✅ Quick Stats Cards (4 metric card)
3. ✅ Tabbed Interface (Lead Information + Activity Timeline)
4. ✅ Section-based Dynamic Fields (`lead_form_sections` entegrasyonu)
5. ✅ Multiselect Badge Display (kutu kutu gösterim)
6. ✅ Enhanced Sidebar (Quick Actions, Lead Info, Lead Score)
7. ✅ Modern Activity Timeline
8. ✅ Responsive & Mobile-friendly

### Hedef (Investors)

Aynı modern yapıyı Investor detail sayfasına uygulamak:
- `investor_form_sections` entegrasyonu
- `investor_fields` ile dinamik section'lar
- Emerald/green renk teması
- Company & position bilgileri
- Investment-specific stats

---

## 🔍 Lead Detail Modernizasyonu - Detaylı Analiz

### 1. Database & Backend Değişiklikleri

**Dosya:** `app/(dashboard)/leads/[id]/page.tsx`

#### A. Form Sections Query Ekleme

```typescript
// Get form sections
const formSections = await prisma.lead_form_sections.findMany({
  where: { is_visible: true },
  orderBy: { sort_order: "asc" },
})
```

**Amaç:** Section bilgilerini çekerek dinamik section-based rendering yapabilmek.

**Database Tablo Yapısı:**
```sql
lead_form_sections:
- id (bigint)
- section_key (varchar) - 'contact_information', 'lead_details', etc.
- name (varchar) - Display name
- is_visible (boolean)
- is_default_open (boolean)
- sort_order (int)
- icon (varchar) - 'user', 'briefcase', 'document', 'layout'
- gradient (text) - 'bg-gradient-to-br from-blue-600 to-indigo-500'
```

#### B. BigInt Serialization

```typescript
formSections: formSections.map((section) => ({
  ...section,
  id: Number(section.id),
})),
```

**Neden Gerekli:** Prisma BigInt değerlerini JSON'a serialize edemez, Number'a çevirmek gerekir.

#### C. Tam getLead Fonksiyonu

```typescript
async function getLead(id: string) {
  const lead = await prisma.leads.findUnique({
    where: { id: parseInt(id) },
  })

  if (!lead) {
    return null
  }

  // Get activities
  const activitiesRaw = await prisma.activities.findMany({
    where: { lead_id: lead.id },
    orderBy: { created_at: "desc" },
    take: 10,
  })

  // Get custom field values
  const customFieldValuesRaw = await prisma.lead_field_values.findMany({
    where: { lead_id: lead.id },
    include: {
      lead_fields: {
        include: {
          lead_field_options: {
            orderBy: { sort_order: "asc" },
          },
        },
      },
    },
  })

  // Get all lead fields
  const allFields = await prisma.lead_fields.findMany({
    where: { is_active: true },
    include: {
      lead_field_options: {
        orderBy: { sort_order: "asc" },
      },
    },
    orderBy: { sort_order: "asc" },
  })

  // Get activity types
  const activityTypes = await prisma.activity_types.findMany({
    orderBy: { sort_order: "asc" },
  })

  // Get form sections
  const formSections = await prisma.lead_form_sections.findMany({
    where: { is_visible: true },
    orderBy: { sort_order: "asc" },
  })

  // Parse multiselect values
  const customFieldValues = customFieldValuesRaw.map((cfv) => {
    let parsedValue = cfv.value

    if (parsedValue && typeof parsedValue === 'string') {
      const fieldType = cfv.lead_fields?.type
      if (fieldType === 'multiselect' || fieldType === 'multiselect_dropdown') {
        try {
          parsedValue = JSON.parse(parsedValue)
          if (!Array.isArray(parsedValue)) {
            parsedValue = String(parsedValue)
          }
        } catch (e) {
          // Keep as string
        }
      }
    }

    return {
      ...cfv,
      id: Number(cfv.id),
      lead_id: Number(cfv.lead_id),
      lead_field_id: Number(cfv.lead_field_id),
      value: parsedValue,
      lead_fields: {
        ...cfv.lead_fields,
        id: Number(cfv.lead_fields.id),
        lead_field_options: cfv.lead_fields.lead_field_options.map((opt) => ({
          ...opt,
          id: Number(opt.id),
          lead_field_id: Number(opt.lead_field_id),
        })),
      },
    }
  })

  // Serialize activities
  const activities = activitiesRaw.map((activity) => ({
    ...activity,
    id: Number(activity.id),
    lead_id: activity.lead_id ? Number(activity.lead_id) : null,
    investor_id: activity.investor_id ? Number(activity.investor_id) : null,
    representative_id: activity.representative_id ? Number(activity.representative_id) : null,
    user_id: activity.user_id ? Number(activity.user_id) : null,
  }))

  // Return serialized data
  return {
    ...lead,
    id: Number(lead.id),
    customFieldValues,
    activities,
    allFields: allFields.map((field) => ({
      ...field,
      id: Number(field.id),
      lead_field_options: field.lead_field_options.map((opt) => ({
        ...opt,
        id: Number(opt.id),
        lead_field_id: Number(opt.lead_field_id),
      })),
    })),
    activityTypes: activityTypes.map((type) => ({
      ...type,
      id: Number(type.id),
    })),
    formSections: formSections.map((section) => ({
      ...section,
      id: Number(section.id),
    })),
  }
}
```

---

### 2. Component Yapısı

**Dosya:** `components/leads/lead-detail-view.tsx`

#### A. TypeScript Interfaces

```typescript
interface LeadDetailProps {
  lead: {
    id: number
    full_name: string
    email: string
    phone: string
    phone_country: string
    source: string
    status: string
    priority: string
    created_at: Date | null
    updated_at: Date | null
    activities?: Array<{
      id: number
      type: string
      subject: string | null
      description: string | null
      status: string
      created_at: Date | null
    }>
    customFieldValues: Array<{
      id: number
      lead_id: number
      lead_field_id: number
      value: string | null
      lead_fields: {
        id: number
        name: string
        label: string
        type: string
        section_key: string | null  // ÖNEMLİ!
        lead_field_options: Array<{
          id: number
          lead_field_id: number
          value: string
          label: string
        }>
      }
    }>
    allFields: Array<{
      id: number
      name: string
      label: string
      type: string
      is_required: boolean
      is_system_field: boolean
      section_key: string | null  // ÖNEMLİ!
      lead_field_options: Array<{
        id: number
        value: string
        label: string
      }>
    }>
    activityTypes: Array<{
      id: number
      name: string
      label: string
      icon: string | null
      color: string | null
      is_active: boolean
      sort_order: number
    }>
    formSections: Array<{  // YENİ!
      id: number
      section_key: string
      name: string
      is_visible: boolean
      is_default_open: boolean
      sort_order: number
      icon: string | null
      gradient: string | null
    }>
  }
}
```

#### B. Helper Functions

```typescript
// Icon mapping for sections
const iconMapping: Record<string, any> = {
  user: User,
  briefcase: Building2,
  document: Building2,
  layout: Tag,
}

// Get initials for avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get field display value
const getFieldDisplayValue = (fieldName: string) => {
  const fieldValue = lead.customFieldValues.find(
    (cfv) => cfv.lead_fields.name === fieldName
  )

  if (!fieldValue?.value) return "-"

  const field = fieldValue.lead_fields
  const value = fieldValue.value

  // Handle multiselect - return comma-separated for non-badge display
  if (field.type === "multiselect" || field.type === "multiselect_dropdown") {
    if (Array.isArray(value)) {
      return value
        .map((val) => {
          const option = field.lead_field_options.find((opt) => opt.value === val)
          return option?.label || val
        })
        .join(", ")
    }
  }

  // Handle select
  if (field.type === "select") {
    const option = field.lead_field_options.find(
      (opt) => opt.value === value
    )
    return option?.label || value
  }

  return String(value)
}
```

#### C. Modern Hero Header

```typescript
{/* Modern Hero Header with Gradient */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl">
  {/* Background Pattern */}
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

  <div className="relative">
    {/* Back Button & Actions */}
    <div className="flex items-center justify-between mb-6">
      <Link href="/leads">
        <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white border border-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div className="flex items-center gap-3">
        <Link href={`/leads/${lead.id}/edit`}>
          <Button variant="secondary" className="bg-white/95 hover:bg-white text-gray-900 shadow-lg">
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
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

    {/* Lead Info */}
    <div className="flex items-start gap-6">
      <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
        <AvatarFallback className="text-2xl font-bold bg-white/90 text-indigo-600">
          {getInitials(lead.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          {lead.full_name}
        </h1>
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
            {status.label}
          </Badge>
          {lead.priority && priority && (
            <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
              <span className="mr-1">{priority.icon}</span>
              {priority.label}
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            <Globe className="h-3 w-3 mr-1" />
            {lead.source.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-white/90">
          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{lead.email}</span>
          </a>
          <Separator orientation="vertical" className="h-4 bg-white/20" />
          <a href={`tel:${lead.phone_country}${lead.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="h-4 w-4" />
            <span className="text-sm">{lead.phone_country} {lead.phone}</span>
          </a>
          <Separator orientation="vertical" className="h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Created {lead.created_at ? format(new Date(lead.created_at), "MMM dd, yyyy") : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### D. Quick Stats Cards

```typescript
{/* Quick Stats Cards */}
<div className="grid gap-6 md:grid-cols-4">
  <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Activities</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {lead.activities?.length || 0}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Activity className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Custom Fields</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {lead.allFields.filter(f => !f.is_system_field && f.name !== "source" && f.name !== "status" && f.name !== "priority").length}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
          <Tag className="h-6 w-6 text-purple-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Days Active</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {lead.created_at
              ? Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <Clock className="h-6 w-6 text-emerald-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Conversion</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {status.label === "Won" ? "100%" : "0%"}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-orange-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

#### E. Tabbed Interface & Section-Based Rendering

```typescript
<Tabs defaultValue="details" className="w-full">
  <TabsList className="grid w-full grid-cols-2 h-12">
    <TabsTrigger value="details" className="text-base">
      <Building2 className="h-4 w-4 mr-2" />
      Lead Information
    </TabsTrigger>
    <TabsTrigger value="activity" className="text-base">
      <Activity className="h-4 w-4 mr-2" />
      Activity Timeline
    </TabsTrigger>
  </TabsList>

  {/* Details Tab - Merged Overview + Details with Dynamic Sections */}
  <TabsContent value="details" className="mt-6 space-y-6">
    {/* Contact Information Section - Static Fields */}
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Full Name, Email, Phone, Source fields */}
        </div>
      </CardContent>
    </Card>

    {/* Dynamic Sections from lead_form_sections */}
    {lead.formSections.map((section) => {
      // Get fields for this section
      const sectionFields = lead.allFields.filter(
        (field) => field.section_key === section.section_key &&
        !field.is_system_field &&
        field.name !== "source" &&
        field.name !== "status" &&
        field.name !== "priority"
      )

      // Skip if no fields in this section
      if (sectionFields.length === 0) return null

      const SectionIcon = iconMapping[section.icon || 'layout'] || Tag

      // Generate gradient class - either from DB or default
      const gradientClass = section.gradient || 'bg-gradient-to-r from-gray-50 to-gray-100'

      return (
        <Card key={section.id} className="border-gray-200 shadow-sm">
          <CardHeader className={`${gradientClass} border-b border-gray-200`}>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <SectionIcon className="h-5 w-5 text-emerald-600" />
              {section.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {sectionFields.map((field) => {
                // Get field value and check if multiselect
                const fieldValueObj = lead.customFieldValues.find(
                  (cfv) => cfv.lead_fields.name === field.name
                )
                const fieldData = fieldValueObj?.lead_fields
                const value = fieldValueObj?.value

                const isMultiselect = fieldData?.type === "multiselect" || fieldData?.type === "multiselect_dropdown"

                // Parse multiselect values
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

                    {/* Multiselect Badge Display */}
                    {isMultiselect && multiselectValues.length > 0 ? (
                      <div className="flex flex-wrap gap-2 ml-6">
                        {multiselectValues.map((val, idx) => {
                          const option = fieldData?.lead_field_options.find((opt) => opt.value === val)
                          const label = option?.label || val
                          return (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                            >
                              {label}
                            </Badge>
                          )
                        })}
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

    {/* Lead Status Summary Card */}
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Lead Status Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Status, Priority, Dates */}
      </CardContent>
    </Card>
  </TabsContent>

  {/* Activity Tab */}
  <TabsContent value="activity" className="mt-6 space-y-6">
    {/* Activity Timeline */}
  </TabsContent>
</Tabs>
```

---

## 🚀 Investor Detail Refactor Roadmap

### Gerekli Dosyalar

1. **`app/(dashboard)/investors/[id]/page.tsx`**
   - getInvestor function
   - investor_form_sections query
   - BigInt serialization

2. **`components/investors/investor-detail-view.tsx`**
   - InvestorDetailView component
   - Modern UI implementation

### Database Tables (Investor)

```sql
investors:
- id, first_name, last_name, email
- phone, company, position
- source, status, priority
- budget, timeline, notes

investor_fields:
- id, name, label, type
- section_key (YENİ!)
- is_system_field, is_required, is_active
- sort_order

investor_field_values:
- id, investor_id, investor_field_id, value

investor_field_options:
- id, investor_field_id, value, label

investor_form_sections:
- id, section_key, name
- is_visible, is_default_open
- sort_order, icon, gradient
```

---

## 📝 Adım Adım Implementation

### Step 1: Database Layer (`app/(dashboard)/investors/[id]/page.tsx`)

```typescript
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { InvestorDetailView } from "@/components/investors/investor-detail-view"

async function getInvestor(id: string) {
  const investor = await prisma.investors.findUnique({
    where: { id: parseInt(id) },
  })

  if (!investor) {
    return null
  }

  // Get activities
  const activitiesRaw = await prisma.activities.findMany({
    where: { investor_id: investor.id },
    orderBy: { created_at: "desc" },
    take: 10,
  })

  // Get custom field values
  const customFieldValuesRaw = await prisma.investor_field_values.findMany({
    where: { investor_id: investor.id },
    include: {
      investor_fields: {
        include: {
          investor_field_options: {
            orderBy: { sort_order: "asc" },
          },
        },
      },
    },
  })

  // Get all investor fields
  const allFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: {
      investor_field_options: {
        orderBy: { sort_order: "asc" },
      },
    },
    orderBy: { sort_order: "asc" },
  })

  // Get activity types
  const activityTypes = await prisma.activity_types.findMany({
    orderBy: { sort_order: "asc" },
  })

  // Get form sections (YENİ!)
  const formSections = await prisma.investor_form_sections.findMany({
    where: { is_visible: true },
    orderBy: { sort_order: "asc" },
  })

  // Parse multiselect values
  const customFieldValues = customFieldValuesRaw.map((cfv) => {
    let parsedValue = cfv.value

    if (parsedValue && typeof parsedValue === 'string') {
      const fieldType = cfv.investor_fields?.type
      if (fieldType === 'multiselect' || fieldType === 'multiselect_dropdown') {
        try {
          parsedValue = JSON.parse(parsedValue)
          if (!Array.isArray(parsedValue)) {
            parsedValue = String(parsedValue)
          }
        } catch (e) {
          // Keep as string
        }
      }
    }

    return {
      ...cfv,
      id: Number(cfv.id),
      investor_id: Number(cfv.investor_id),
      investor_field_id: Number(cfv.investor_field_id),
      value: parsedValue,
      investor_fields: {
        ...cfv.investor_fields,
        id: Number(cfv.investor_fields.id),
        investor_field_options: cfv.investor_fields.investor_field_options.map((opt) => ({
          ...opt,
          id: Number(opt.id),
          investor_field_id: Number(opt.investor_field_id),
        })),
      },
    }
  })

  // Serialize activities
  const activities = activitiesRaw.map((activity) => ({
    ...activity,
    id: Number(activity.id),
    lead_id: activity.lead_id ? Number(activity.lead_id) : null,
    investor_id: activity.investor_id ? Number(activity.investor_id) : null,
    representative_id: activity.representative_id ? Number(activity.representative_id) : null,
    user_id: activity.user_id ? Number(activity.user_id) : null,
  }))

  // Return serialized data
  return {
    ...investor,
    id: Number(investor.id),
    lead_id: investor.lead_id ? Number(investor.lead_id) : null,
    customFieldValues,
    activities,
    allFields: allFields.map((field) => ({
      ...field,
      id: Number(field.id),
      investor_field_options: field.investor_field_options.map((opt) => ({
        ...opt,
        id: Number(opt.id),
        investor_field_id: Number(opt.investor_field_id),
      })),
    })),
    activityTypes: activityTypes.map((type) => ({
      ...type,
      id: Number(type.id),
    })),
    formSections: formSections.map((section) => ({
      ...section,
      id: Number(section.id),
    })),
  }
}

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const investor = await getInvestor(id)

  if (!investor) {
    notFound()
  }

  return <InvestorDetailView investor={investor} />
}
```

### Step 2: Component Creation (`components/investors/investor-detail-view.tsx`)

```typescript
"use client"

import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash,
  User,
  Building2,
  Globe,
  Tag,
  Activity,
  Clock,
  AlertCircle,
  Plus,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Target,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { DeleteInvestorDialog } from "./delete-investor-dialog"
import { AddActivityDialog } from "@/components/activities/add-activity-dialog"

interface InvestorDetailProps {
  investor: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
    company: string | null
    position: string | null
    source: string
    status: string
    priority: string | null
    budget: string | null
    timeline: string | null
    notes: string | null
    created_at: Date | null
    updated_at: Date | null
    lead_id: number | null
    activities?: Array<{
      id: number
      type: string
      subject: string | null
      description: string | null
      status: string
      created_at: Date | null
    }>
    customFieldValues: Array<{
      id: number
      investor_id: number
      investor_field_id: number
      value: string | null
      investor_fields: {
        id: number
        name: string
        label: string
        type: string
        section_key: string | null
        investor_field_options: Array<{
          id: number
          investor_field_id: number
          value: string
          label: string
        }>
      }
    }>
    allFields: Array<{
      id: number
      name: string
      label: string
      type: string
      is_required: boolean
      is_system_field: boolean
      section_key: string | null
      investor_field_options: Array<{
        id: number
        value: string
        label: string
      }>
    }>
    activityTypes: Array<{
      id: number
      name: string
      label: string
      icon: string | null
      color: string | null
      is_active: boolean
      sort_order: number
    }>
    formSections: Array<{
      id: number
      section_key: string
      name: string
      is_visible: boolean
      is_default_open: boolean
      sort_order: number
      icon: string | null
      gradient: string | null
    }>
  }
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Active" },
  prospect: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Prospect" },
  interested: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Interested" },
  negotiating: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Negotiating" },
  invested: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Invested" },
  inactive: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Inactive" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  medium: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Medium", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}

export function InvestorDetailView({ investor }: InvestorDetailProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addActivityOpen, setAddActivityOpen] = useState(false)

  const status = statusConfig[investor.status]
  const priority = investor.priority ? priorityConfig[investor.priority] : null

  // Get field display value helper
  const getFieldDisplayValue = (fieldName: string) => {
    const fieldValue = investor.customFieldValues.find(
      (cfv) => cfv.investor_fields.name === fieldName
    )

    if (!fieldValue?.value) return "-"

    const field = fieldValue.investor_fields
    const value = fieldValue.value

    // Handle multiselect
    if (field.type === "multiselect" || field.type === "multiselect_dropdown") {
      if (Array.isArray(value)) {
        return value
          .map((val) => {
            const option = field.investor_field_options.find((opt) => opt.value === val)
            return option?.label || val
          })
          .join(", ")
      }
    }

    // Handle select
    if (field.type === "select") {
      const option = field.investor_field_options.find(
        (opt) => opt.value === value
      )
      return option?.label || value
    }

    return String(value)
  }

  // Icon mapping
  const iconMapping: Record<string, any> = {
    user: User,
    briefcase: Building2,
    document: Building2,
    layout: Tag,
  }

  // Get initials
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName[0] + (lastName ? lastName[0] : '')).toUpperCase()
  }

  const fullName = `${investor.first_name} ${investor.last_name || ''}`.trim()

  return (
    <>
      <div className="space-y-6">
        {/* Modern Hero Header - EMERALD THEME */}
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
                  {getInitials(investor.first_name, investor.last_name || '')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                  {fullName}
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

        {/* Quick Stats Cards - EMERALD THEME */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {investor.activities?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custom Fields</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {investor.allFields.filter(f => !f.is_system_field && f.name !== "source" && f.name !== "status" && f.name !== "priority").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Active</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {investor.created_at
                      ? Math.floor((new Date().getTime() - new Date(investor.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investment</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {status.label === "Invested" ? "✓" : "-"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="details" className="text-base">
                  <Building2 className="h-4 w-4 mr-2" />
                  Investor Information
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-base">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Timeline
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-6 space-y-6">
                {/* Contact Information - Static */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Full Name</span>
                        </div>
                        <p className="text-gray-900 font-medium ml-6">{fullName}</p>
                      </div>

                      <div className="space-y-2">
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

                      {investor.phone && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Phone</span>
                          </div>
                          <a
                            href={`tel:${investor.phone}`}
                            className="text-emerald-600 hover:text-emerald-700 font-medium ml-6 block"
                          >
                            {investor.phone}
                          </a>
                        </div>
                      )}

                      {investor.company && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Company</span>
                          </div>
                          <p className="text-gray-900 font-medium ml-6">{investor.company}</p>
                        </div>
                      )}

                      {investor.position && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Position</span>
                          </div>
                          <p className="text-gray-900 font-medium ml-6">{investor.position}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Source</span>
                        </div>
                        <div className="ml-6">
                          <Badge variant="outline" className="capitalize border-gray-200 bg-gray-50">
                            {investor.source.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Sections from investor_form_sections */}
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

                {/* Investor Status Summary */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Investor Status Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <dl className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <dt className="text-sm font-medium text-gray-600">Status</dt>
                        <dd>
                          <Badge className={`${status.bg} ${status.color} border-none`}>
                            {status.label}
                          </Badge>
                        </dd>
                      </div>
                      {priority && (
                        <div className="flex justify-between items-center">
                          <dt className="text-sm font-medium text-gray-600">Priority</dt>
                          <dd>
                            <Badge className={`${priority.bg} ${priority.color} border-none`}>
                              <span className="mr-1">{priority.icon}</span>
                              {priority.label}
                            </Badge>
                          </dd>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <dt className="text-sm font-medium text-gray-600">Created Date</dt>
                        <dd className="text-sm text-gray-900">
                          {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy 'at' HH:mm") : "-"}
                        </dd>
                      </div>
                      {investor.updated_at && (
                        <div className="flex justify-between items-center">
                          <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
                          <dd className="text-sm text-gray-900">
                            {format(new Date(investor.updated_at), "MMM dd, yyyy 'at' HH:mm")}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab - Same as Leads */}
              <TabsContent value="activity" className="mt-6 space-y-6">
                {/* Activity Timeline Implementation */}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Same structure as Leads with EMERALD theme */}
          <div className="space-y-6">
            {/* Quick Actions, Investor Info, Investment Score cards */}
          </div>
        </div>
      </div>

      <DeleteInvestorDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        investorId={String(investor.id)}
        investorName={fullName}
      />

      <AddActivityDialog
        open={addActivityOpen}
        onOpenChange={setAddActivityOpen}
        investorId={investor.id}
      />
    </>
  )
}
```

---

## 🔄 Key Differences: Leads vs Investors

| Aspect | Leads | Investors |
|--------|-------|-----------|
| **Name Field** | `full_name` (single field) | `first_name` + `last_name` (separate) |
| **Hero Gradient** | Blue-Indigo-Purple | Emerald-Teal-Green |
| **Badge Color** | Blue theme (`bg-blue-100 text-blue-700`) | Emerald theme (`bg-emerald-100 text-emerald-700`) |
| **Icon Colors** | Blue/Purple variants | Emerald/Teal/Green variants |
| **Form Sections Table** | `lead_form_sections` | `investor_form_sections` |
| **Fields Table** | `lead_fields` | `investor_fields` |
| **Field Values Table** | `lead_field_values` | `investor_field_values` |
| **Field Options Table** | `lead_field_options` | `investor_field_options` |
| **Specific Static Fields** | `notes_text` | `company`, `position`, `budget`, `timeline`, `notes` |
| **Stats Card 4** | Conversion Rate | Investment Status |
| **Avatar Colors** | `text-indigo-600` | `text-emerald-600` |
| **Link Colors** | `text-blue-600 hover:text-blue-700` | `text-emerald-600 hover:text-emerald-700` |

---

## 💡 Implementation Checklist

### Phase 1: Backend
- [ ] Update `app/(dashboard)/investors/[id]/page.tsx`
- [ ] Add `investor_form_sections` query
- [ ] Add BigInt serialization for formSections
- [ ] Test API response structure

### Phase 2: Component Structure
- [ ] Create/Update `components/investors/investor-detail-view.tsx`
- [ ] Add TypeScript interfaces with formSections
- [ ] Implement helper functions (getInitials, getFieldDisplayValue, etc.)

### Phase 3: UI Implementation
- [ ] Hero Header (Emerald gradient theme)
- [ ] Avatar with initials (first_name + last_name)
- [ ] Stats Cards (4 cards with emerald/teal/green icons)
- [ ] Tabs structure (2 tabs)

### Phase 4: Dynamic Sections
- [ ] Section-based field rendering
- [ ] Icon mapping
- [ ] Gradient mapping
- [ ] Multiselect badge display (emerald theme)

### Phase 5: Sidebar
- [ ] Quick Actions card
- [ ] Investor Information card
- [ ] Investment Score card

### Phase 6: Activity Timeline
- [ ] Modern vertical timeline
- [ ] Activity cards
- [ ] Empty state

### Phase 7: Testing
- [ ] Test with real investor data
- [ ] Test multiselect display
- [ ] Test section grouping
- [ ] Test responsive layout
- [ ] Playwright tests

---

## 📚 Reference Files

### Lead Implementation Files:
1. `app/(dashboard)/leads/[id]/page.tsx` - Backend/Database layer
2. `components/leads/lead-detail-view.tsx` - Component implementation
3. `CLAUDE.md` - Updated documentation

### Investor Files to Create/Update:
1. `app/(dashboard)/investors/[id]/page.tsx`
2. `components/investors/investor-detail-view.tsx`

---

## 🎨 Color Palette Reference

### Leads Theme:
```css
/* Hero Header */
bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700

/* Multiselect Badges */
bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200

/* Avatar */
bg-white/90 text-indigo-600

/* Links */
text-blue-600 hover:text-blue-700
```

### Investors Theme:
```css
/* Hero Header */
bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700

/* Multiselect Badges */
bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200

/* Avatar */
bg-white/90 text-emerald-600

/* Links */
text-emerald-600 hover:text-emerald-700

/* Icon Colors */
- Emerald: emerald-600
- Teal: teal-600
- Green: green-600
- Amber: amber-600 (for investment-related)
```

---

## 🚦 Next Steps

1. **Backup:** Git commit mevcut durumu
2. **Database:** `investor_form_sections` tablosunun dolu olduğunu kontrol et
3. **Implementation:** Step by step yukarıdaki kodu uygula
4. **Testing:** Her adımda test et
5. **Polish:** Responsive ve edge case'leri kontrol et
6. **Documentation:** CLAUDE.md'yi güncelle

---

## 📞 Support & Questions

Bu dokümanda açıklanan tüm implementasyon Leads tarafında başarıyla test edilmiş ve çalışıyor. Investors tarafına uygulanırken herhangi bir soru veya sorun olursa:

1. Lead implementation dosyalarına bakın
2. Database yapısını kontrol edin
3. Interface type'larını karşılaştırın
4. Renk temasını tutarlı tutun (emerald/green)

---

**Son Güncelleme:** 2025-10-03
**Yazar:** Claude
**Versiyon:** 1.0 - Initial Implementation Guide
