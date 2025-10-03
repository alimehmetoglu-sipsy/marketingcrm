# Lead Edit Page Modernization Guide

> Bu doküman, `/leads/[id]` (Detail) sayfasındaki modern UI/UX elementlerini `/leads/[id]/edit` (Edit) sayfasına taşımak için hazırlanmış eksiksiz bir implementation guide'dır. Mevcut dinamik field yapısı ve database ilişkileri korunarak, modern ve tutarlı bir görünüm sağlanacaktır.

**Tarih:** 2025-10-03
**Versiyon:** 1.0
**Referans:** Lead Detail Page (`/leads/[id]`)

---

## 📋 İçindekiler

1. [Genel Bakış](#-genel-bakış)
2. [Mevcut Durum Analizi](#-mevcut-durum-analizi)
3. [Yapılacak Değişiklikler](#-yapılacak-değişiklikler)
4. [Implementation Adımları](#-implementation-adımları)
5. [Code Snippets](#-code-snippets)
6. [Checklist](#-checklist)

---

## 🎯 Genel Bakış

### Amaç
Lead Edit sayfasını (`/leads/[id]/edit`) Detail sayfası ile aynı modern görünüme kavuşturmak:
- ✅ Modern hero header ile avatar, status, priority badges
- ✅ Tutarlı açık mavi (blue-sky) renk teması
- ✅ Section-based dynamic field organization
- ✅ Modern card-based layout
- ✅ Responsive sidebar

### Hedef Görünüm
**Edit Page (Hedef):**
- Modern gradient hero header with avatar
- Blue-sky themed section cards
- Section-based field grouping (`lead_form_sections` entegrasyonu)
- Modern sidebar with form progress
- Improved UX with collapsible sections

---

## 🔍 Mevcut Durum Analizi

### 1. Lead Detail Page (`/leads/[id]`) - Referans

**Dosya:** `components/leads/lead-detail-view.tsx` (745 satır)

**Modern UI Elements:**

#### A. Hero Header (Line 215-295)
```typescript
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl">
  {/* Background Pattern */}
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

  {/* Avatar + Name + Badges */}
  <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
    <AvatarFallback className="text-2xl font-bold bg-white/90 text-indigo-600">
      {getInitials(lead.full_name)}
    </AvatarFallback>
  </Avatar>

  <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
    {lead.full_name}
  </h1>

  {/* Status, Priority, Source Badges */}
  <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
    {status.label}
  </Badge>
</div>
```

**Özellikler:**
- Gradient background (blue-indigo-purple)
- Large avatar with initials
- Status, Priority, Source badges
- Contact info (email, phone, created date)
- Edit/Delete action buttons

#### B. Quick Stats Cards (Line 297-364)
```typescript
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
  {/* 3 more stat cards */}
</div>
```

#### C. Section Cards with Gradients (Line 384-534)
```typescript
{/* Contact Information - Blue/Sky Gradient */}
<Card className="border-gray-200 shadow-sm">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <User className="h-5 w-5 text-blue-600" />
      Contact Information
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    {/* Static fields */}
  </CardContent>
</Card>

{/* Dynamic Sections from lead_form_sections */}
{lead.formSections.map((section) => {
  const sectionFields = lead.allFields.filter(
    (field) => field.section_key === section.section_key
  )

  return (
    <Card key={section.id}>
      <CardHeader className={`${section.gradient} border-b border-gray-200`}>
        <CardTitle>
          <SectionIcon className="h-5 w-5 text-blue-600" />
          {section.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Dynamic fields */}
      </CardContent>
    </Card>
  )
})}
```

**Database Integration:**
```sql
SELECT * FROM lead_form_sections ORDER BY sort_order;

id | section_key         | name                   | gradient
---|---------------------|------------------------|----------------------------------
1  | contact_information | Contact Information    | bg-gradient-to-r from-blue-50 to-sky-50
2  | company_information | Company Information    | bg-gradient-to-r from-blue-50 to-sky-50
3  | lead_details        | Lead Details           | bg-gradient-to-r from-blue-50 to-sky-50
4  | custom_fields       | Additional Information | bg-gradient-to-r from-blue-50 to-sky-50
```

#### D. Sidebar Components (Line 641-743)
```typescript
{/* Quick Actions Card */}
<Card className="border-gray-200 shadow-lg">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-blue-600" />
      Quick Actions
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4 space-y-2">
    <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-sky-600">
      <Plus className="h-4 w-4 mr-2" />
      Add Activity
    </Button>
  </CardContent>
</Card>

{/* Lead Information Card */}
<Card className="border-gray-200 shadow-lg">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
    <CardTitle>
      <Target className="h-5 w-5 text-blue-600" />
      Lead Information
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Status, Priority, Dates */}
  </CardContent>
</Card>
```

---

### 2. Lead Edit Page (`/leads/[id]/edit`) - Mevcut Durum

**Dosyalar:**
- **Page:** `app/(dashboard)/leads/[id]/edit/page.tsx` (145 satır)
- **Component:** `components/leads/lead-form-client.tsx` (676 satır)

**Mevcut Yapı:**

#### A. Header (LeadFormHeader Component)
```typescript
<LeadFormHeader
  isEditing={!!lead}
  leadName={lead?.full_name}
  isSubmitting={isSubmitting}
  onSave={form.handleSubmit(onSubmit)}
  onCancel={handleCancel}
/>
```

**Sorunlar:**
- ❌ Modern hero header yok
- ❌ Avatar gösterilmiyor
- ❌ Status/Priority badges görünmüyor
- ❌ Gradient background yok

#### B. Form Sections (CollapsibleSection Component)
```typescript
<CollapsibleSection
  title="Contact Information"
  subtitle="Required contact details"
  icon={<UserIcon className="w-5 h-5 text-white" />}
  gradient="bg-gradient-to-br from-[#FF7A59] to-[#FF9B82]"
>
  {/* Form fields */}
</CollapsibleSection>

<CollapsibleSection
  title="Lead Details"
  subtitle="Status, priority and additional information"
  gradient="bg-gradient-to-br from-[#00BDA5] to-[#00D4B8]"
>
  {/* All custom fields in one section */}
</CollapsibleSection>
```

**Sorunlar:**
- ❌ Hardcoded gradients (turuncu, teal)
- ❌ Section-based grouping yok
- ❌ Tüm custom fields tek section'da
- ❌ Database'deki `lead_form_sections` kullanılmıyor
- ❌ Blue-sky teması yok

#### C. Sidebar
```typescript
{/* Progress Card */}
<Card className="border-0 shadow-sm">
  <CardContent className="p-6">
    <LeadFormProgress
      completedFields={completedFields.completed}
      totalFields={completedFields.total}
    />
  </CardContent>
</Card>

{/* Tips Card */}
<Card className="border-0 shadow-sm">
  <CardContent className="p-6">
    {/* Tips content */}
  </CardContent>
</Card>
```

**Sorunlar:**
- ❌ Gradient headers yok
- ❌ Modern card styling eksik
- ❌ Detail page sidebar ile tutarsız

---

## 🎨 Yapılacak Değişiklikler

### 1. Modern Hero Header Eklenmesi

**Yeni Component:** `components/leads/lead-edit-hero.tsx`

**Özellikler:**
- Gradient background (blue-indigo-purple) - Detail page ile aynı
- Large avatar with initials
- Lead name (editable değil, sadece gösterim)
- Status, Priority, Source badges (mevcut değerler)
- Save/Cancel action buttons (mevcut header yerine)
- Contact info display (email, phone)

**Props:**
```typescript
interface LeadEditHeroProps {
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
  }
  isSubmitting: boolean
  onSave: () => void
  onCancel: () => void
}
```

### 2. Section-Based Dynamic Fields

**Database Entegrasyonu:**
- `lead_form_sections` tablosunu fetch et
- Fields'ları `section_key`'e göre grupla
- Her section için ayrı collapsible card

**Değişiklikler:**

#### A. Contact Information Section
```typescript
// Gradient değişimi
gradient="bg-gradient-to-br from-[#FF7A59] to-[#FF9B82]"  // ❌ ESKİ
↓
gradient="bg-gradient-to-r from-blue-50 to-sky-50"        // ✅ YENİ
```

#### B. Dynamic Sections
```typescript
// Mevcut: Tek "Lead Details" section
<CollapsibleSection title="Lead Details">
  {customFields.map(...)}  // Tüm fields
</CollapsibleSection>

// Yeni: Section-based grouping
{formSections.map((section) => {
  const sectionFields = customFields.filter(
    f => f.section_key === section.section_key
  )

  return (
    <CollapsibleSection
      key={section.id}
      title={section.name}
      subtitle={`${sectionFields.length} fields`}
      icon={getIconComponent(section.icon)}
      gradient={section.gradient}  // DB'den
      defaultOpen={section.is_default_open}
    >
      {sectionFields.map((field) => (
        <LeadDynamicField
          key={field.id}
          field={field}
          value={customFieldValues[field.id]}
          onChange={...}
        />
      ))}
    </CollapsibleSection>
  )
})}
```

### 3. Sidebar Modernizasyonu

**Değişiklikler:**

#### A. Card Headers - Blue/Sky Gradient
```typescript
// Progress Card
<CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
    <TrendingUp className="h-5 w-5 text-blue-600" />
    Form Progress
  </CardTitle>
</CardHeader>

// Tips Card
<CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
  <CardTitle>
    <CheckCircle2 className="h-5 w-5 text-blue-600" />
    Tips
  </CardTitle>
</CardHeader>
```

#### B. Lead Information Card (Yeni)
```typescript
<Card className="border-gray-200 shadow-lg">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
    <CardTitle>
      <User className="h-5 w-5 text-blue-600" />
      Lead Information
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6 space-y-4">
    {/* Status */}
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <span className="text-sm font-medium text-gray-600">Status</span>
      <Badge className={statusConfig[formValues.status]?.bg}>
        {statusConfig[formValues.status]?.label}
      </Badge>
    </div>

    {/* Priority */}
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <span className="text-sm font-medium text-gray-600">Priority</span>
      <Badge className={priorityConfig[formValues.priority]?.bg}>
        {priorityConfig[formValues.priority]?.label}
      </Badge>
    </div>

    {/* Created Date */}
    <div className="space-y-2 p-3 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <Calendar className="h-4 w-4 text-blue-600" />
        Created Date
      </div>
      <p className="text-sm text-gray-900 font-medium ml-6">
        {format(new Date(lead.created_at), "MMM dd, yyyy")}
      </p>
    </div>
  </CardContent>
</Card>
```

### 4. Color Consistency

**Tüm gradient değişiklikleri:**
```typescript
// Contact Information
"bg-gradient-to-br from-[#FF7A59] to-[#FF9B82]"  → "bg-gradient-to-r from-blue-50 to-sky-50"

// All Dynamic Sections
section.gradient  // DB'den gelir: "bg-gradient-to-r from-blue-50 to-sky-50"

// Icon colors
"text-white" (gradient içinde)  → Olduğu gibi kalacak (gradient arka planı için)
Icon renkleri section dışında → "text-blue-600"

// Button gradients
"from-blue-600 to-indigo-600" → "from-blue-600 to-sky-600"
```

---

## 🔧 Implementation Adımları

### Step 1: Hero Component Oluşturma

**Dosya:** `components/leads/lead-edit-hero.tsx` (YENİ)

```typescript
"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Save, X } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface LeadEditHeroProps {
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
  }
  isSubmitting: boolean
  onSave: () => void
  onCancel: () => void
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  new: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "New" },
  contacted: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Contacted" },
  qualified: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Qualified" },
  proposal: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Proposal" },
  negotiation: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Negotiation" },
  won: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Won" },
  lost: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Lost" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  medium: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Medium", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}

export function LeadEditHero({ lead, isSubmitting, onSave, onCancel }: LeadEditHeroProps) {
  const status = statusConfig[lead.status]
  const priority = priorityConfig[lead.priority]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-xl mb-6">
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
            <Button
              variant="secondary"
              className="bg-white/95 hover:bg-white text-gray-900 shadow-lg"
              onClick={onSave}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="secondary"
              className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                {lead.full_name}
              </h1>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-sm">
                Editing
              </Badge>
            </div>

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
                {lead.source.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{lead.email}</span>
              </a>
              <span className="text-white/40">•</span>
              <a href={`tel:${lead.phone_country}${lead.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{lead.phone_country} {lead.phone}</span>
              </a>
              <span className="text-white/40">•</span>
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
  )
}
```

### Step 2: LeadFormClient Component Güncelleme

**Dosya:** `components/leads/lead-form-client.tsx`

#### A. Import LeadEditHero
```typescript
// Line 29'dan sonra ekle
import { LeadEditHero } from "./lead-edit-hero"
```

#### B. Fetch Form Sections (useEffect)
```typescript
// Line 247-253 civarı - Mevcut kodu değiştir
useEffect(() => {
  fetch("/api/settings/lead-form-sections")
    .then((res) => res.json())
    .then((data) => {
      // Sort by sort_order
      const sortedSections = data.sort((a: FormSection, b: FormSection) =>
        a.sort_order - b.sort_order
      )
      setFormSections(sortedSections)
    })
    .catch((err) => console.error("Error fetching form sections:", err))
}, [])
```

#### C. Icon Mapping Güncellemesi
```typescript
// Line 343-356 - getIconComponent fonksiyonunu güncelle
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "user":
      return <UserIcon className="w-5 h-5 text-white" />
    case "briefcase":
      return (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case "document":
      return (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case "layout":
      return (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      )
    default:
      return <UserIcon className="w-5 w-5 text-white" />
  }
}
```

#### D. Contact Information Section Gradient
```typescript
// Line 383-388 - Contact Information section gradient değişimi
<CollapsibleSection
  title="Contact Information"
  subtitle="Required contact details"
  icon={<UserIcon className="w-5 h-5 text-white" />}
  gradient="bg-gradient-to-r from-blue-50 to-sky-50"  // ✅ YENİ
>
```

#### E. Dynamic Sections Rendering
```typescript
// Line 454-598 arasını değiştir
// ESKİ: Tek "Lead Details" section
<CollapsibleSection
  title="Lead Details"
  subtitle="Status, priority and additional information"
  icon={...}
  gradient="bg-gradient-to-br from-[#00BDA5] to-[#00D4B8]"
>
  {/* Source, Status, Priority */}
  {/* Tüm custom fields */}
</CollapsibleSection>

// YENİ: Section-based rendering
{/* System Fields Section (Source, Status, Priority) */}
<CollapsibleSection
  title="Lead Details"
  subtitle="Source, status and priority"
  icon={
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  }
  gradient="bg-gradient-to-r from-blue-50 to-sky-50"
>
  <div className="space-y-4">
    {/* Source Field */}
    <FormField
      control={form.control}
      name="customFields.source"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
            Source
            {sourceRequired && <span className="text-red-500">*</span>}
          </FormLabel>
          <Select
            value={field.value || customFieldValues.source || lead?.source || ""}
            onValueChange={(value) => {
              field.onChange(value)
              setCustomFieldValues({
                ...customFieldValues,
                source: value,
              })
            }}
          >
            <FormControl>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {sources.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Status Field */}
    <FormField
      control={form.control}
      name="customFields.status"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
            Status
            {statusRequired && <span className="text-red-500">*</span>}
          </FormLabel>
          <Select
            value={field.value || customFieldValues.status || lead?.status || ""}
            onValueChange={(value) => {
              field.onChange(value)
              setCustomFieldValues({
                ...customFieldValues,
                status: value,
              })
            }}
          >
            <FormControl>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {statuses.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Priority Field */}
    <FormField
      control={form.control}
      name="customFields.priority"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
            Priority
            {priorityRequired && <span className="text-red-500">*</span>}
          </FormLabel>
          <Select
            value={field.value || customFieldValues.priority || lead?.priority || ""}
            onValueChange={(value) => {
              field.onChange(value)
              setCustomFieldValues({
                ...customFieldValues,
                priority: value,
              })
            }}
          >
            <FormControl>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {priorities.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</CollapsibleSection>

{/* Dynamic Sections from Database */}
{formSections
  .filter(section => section.section_key !== 'contact_information') // Skip contact (already rendered)
  .map((section) => {
    const sectionFields = customFields.filter(
      (field) =>
        field.section_key === section.section_key &&
        !["source", "status", "priority"].includes(field.name)
    )

    // Skip if no fields in this section
    if (sectionFields.length === 0) return null

    return (
      <CollapsibleSection
        key={section.id}
        title={section.name}
        subtitle={`${sectionFields.length} ${sectionFields.length === 1 ? 'field' : 'fields'}`}
        icon={getIconComponent(section.icon)}
        gradient={section.gradient || 'bg-gradient-to-r from-blue-50 to-sky-50'}
        defaultOpen={section.is_default_open}
      >
        <div className="space-y-4">
          {sectionFields.map((field) => (
            <LeadDynamicField
              key={field.id}
              field={field}
              value={customFieldValues[field.id]}
              onChange={(value) =>
                setCustomFieldValues({
                  ...customFieldValues,
                  [field.id]: value,
                })
              }
            />
          ))}
        </div>
      </CollapsibleSection>
    )
  })}
```

#### F. Main Return - Header Değişimi
```typescript
// Line 364-372 - LeadFormHeader yerine LeadEditHero
return (
  <div className="h-full flex flex-col bg-gray-50">
    {/* ESKİ Header - KALDIR */}
    {/* <LeadFormHeader
      isEditing={!!lead}
      leadName={lead?.full_name}
      isSubmitting={isSubmitting}
      onSave={form.handleSubmit(onSave)}
      onCancel={handleCancel}
    /> */}

    {/* Content */}
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* YENİ Hero - EKLE (only for edit mode) */}
        {lead && (
          <LeadEditHero
            lead={lead}
            isSubmitting={isSubmitting}
            onSave={form.handleSubmit(onSubmit)}
            onCancel={handleCancel}
          />
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Form continues... */}
        </div>
      </div>
    </div>
  </div>
)
```

#### G. Sidebar Cards - Gradient Updates
```typescript
// Line 605-613 - Progress Card
<Card className="border-gray-200 shadow-lg overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-blue-600" />
      Form Progress
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <LeadFormProgress
      completedFields={completedFields.completed}
      totalFields={completedFields.total}
    />
  </CardContent>
</Card>

// Line 615-642 - Tips Card
<Card className="border-gray-200 shadow-lg overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-blue-600" />
      Tips
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6 space-y-4">
    {/* Tips content */}
  </CardContent>
</Card>

// Line 643-669 - Custom Fields Info Card - Gradient değişimi
<Card className="border-gray-200 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50">
  <CardContent className="p-6 space-y-3">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900">Custom Fields</h3>
    </div>
    <p className="text-sm text-gray-600">
      You have <span className="font-semibold text-blue-600">{customFields.length}</span> custom {customFields.length === 1 ? "field" : "fields"}
    </p>
    <a
      href="/settings/lead-fields"
      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
    >
      Manage fields
      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  </CardContent>
</Card>
```

#### H. Yeni Sidebar Card - Lead Information (Ekle)
```typescript
// Line 670'den önce ekle (Custom Fields Info Card'dan önce)
{/* Lead Information Card - YENİ */}
{lead && (
  <Card className="border-gray-200 shadow-lg overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-600" />
        Lead Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 space-y-4">
      <div className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Status
          </div>
          {customFieldValues.status && statusConfig[customFieldValues.status] && (
            <Badge className={`${statusConfig[customFieldValues.status].bg} ${statusConfig[customFieldValues.status].color} border-none shadow-sm`}>
              {statusConfig[customFieldValues.status].label}
            </Badge>
          )}
        </div>

        {/* Priority */}
        {customFieldValues.priority && priorityConfig[customFieldValues.priority] && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <AlertCircle className="h-4 w-4" />
              Priority
            </div>
            <Badge className={`${priorityConfig[customFieldValues.priority].bg} ${priorityConfig[customFieldValues.priority].color} border-none shadow-sm`}>
              <span className="mr-1">{priorityConfig[customFieldValues.priority].icon}</span>
              {priorityConfig[customFieldValues.priority].label}
            </Badge>
          </div>
        )}

        <Separator className="bg-gray-200" />

        {/* Created Date */}
        <div className="space-y-2 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Calendar className="h-4 w-4 text-blue-600" />
            Created Date
          </div>
          <p className="text-sm text-gray-900 font-medium ml-6">
            {lead.created_at
              ? format(new Date(lead.created_at), "MMM dd, yyyy")
              : "-"}
          </p>
          <p className="text-xs text-gray-500 ml-6">
            {lead.created_at
              ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
              : "-"}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

#### I. Imports Güncellemesi
```typescript
// Line 26 civarı - Missing imports ekle
import {
  Mail,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  TrendingUp,        // YENİ
  CheckCircle2,      // YENİ
  AlertCircle,       // YENİ
  Calendar,          // YENİ
  Clock,             // YENİ
} from "lucide-react"

// Line 4 civarı - date-fns imports ekle
import { format, formatDistanceToNow } from "date-fns"

// Line 8 civarı - Separator ekle
import { Separator } from "@/components/ui/separator"
```

### Step 3: Edit Page Props Güncelleme

**Dosya:** `app/(dashboard)/leads/[id]/edit/page.tsx`

**Değişiklik:** Lead objesine `created_at` eklenmesi gerekiyor (zaten var, kontrol et)

```typescript
// Line 67-92 - serializedLead içinde created_at var mı kontrol et
const serializedLead = {
  ...lead,
  id: Number(lead.id),
  notes: lead.notes_text || "",
  created_at: lead.created_at,        // ✅ Var mı kontrol et
  updated_at: lead.updated_at || undefined,
  // ...
}
```

### Step 4: CollapsibleSection Component Güncellemesi

**Dosya:** `components/leads/lead-form-client.tsx`

**Değişiklik:** CardHeader'a gradient ve border ekle

```typescript
// Line 168-205 - CollapsibleSection component
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
    <Card className="border-gray-200 shadow-sm overflow-hidden">  {/* overflow-hidden ekle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <div className={cn(
          "p-6 border-b border-gray-200 transition-colors",  // border-b ekle
          gradient  // gradient class
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">{subtitle}</p>  {/* text-gray-500 → text-gray-600 */}
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />  {/* text-gray-400 → text-gray-600 */}
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
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}
```

---

## 📦 Code Snippets

### Database Query - Form Sections

**API Route:** `/api/settings/lead-form-sections` (zaten var)

```typescript
// GET /api/settings/lead-form-sections
const sections = await prisma.lead_form_sections.findMany({
  where: { is_visible: true },
  orderBy: { sort_order: "asc" },
})

// Response
[
  {
    id: 1,
    section_key: "contact_information",
    name: "Contact Information",
    is_visible: true,
    is_default_open: true,
    sort_order: 1,
    icon: "user",
    gradient: "bg-gradient-to-r from-blue-50 to-sky-50"
  },
  {
    id: 2,
    section_key: "company_information",
    name: "Company Information",
    is_visible: true,
    is_default_open: true,
    sort_order: 2,
    icon: "briefcase",
    gradient: "bg-gradient-to-r from-blue-50 to-sky-50"
  },
  // ...
]
```

### Status & Priority Config

**Dosya:** `components/leads/lead-edit-hero.tsx` (ve lead-form-client.tsx'e de ekle)

```typescript
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  new: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "New" },
  contacted: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Contacted" },
  qualified: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Qualified" },
  proposal: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Proposal" },
  negotiation: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Negotiation" },
  won: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Won" },
  lost: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Lost" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  medium: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Medium", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}
```

### Field Filtering by Section

```typescript
// Get fields for a specific section
const getFieldsForSection = (sectionKey: string) => {
  return customFields.filter(
    (field) =>
      field.section_key === sectionKey &&
      !["source", "status", "priority"].includes(field.name)
  )
}

// Usage in render
{formSections.map((section) => {
  const sectionFields = getFieldsForSection(section.section_key)

  if (sectionFields.length === 0) return null

  return (
    <CollapsibleSection key={section.id} {...props}>
      {sectionFields.map(field => <DynamicField key={field.id} {...} />)}
    </CollapsibleSection>
  )
})}
```

---

## ✅ Checklist

### Component Creation
- [ ] `components/leads/lead-edit-hero.tsx` oluşturuldu
- [ ] Hero component test edildi (edit mode'da görünüyor mu?)
- [ ] Avatar initials doğru çalışıyor
- [ ] Status/Priority badges doğru renklerde

### LeadFormClient Updates
- [ ] LeadEditHero import edildi
- [ ] Form sections fetch ediliyor
- [ ] Icon mapping fonksiyonu güncellendi (4 icon tipi)
- [ ] Contact Information gradient güncellendi (blue-sky)
- [ ] Lead Details section güncellendi (system fields)
- [ ] Dynamic sections rendering eklendi
- [ ] Section-based field filtering çalışıyor
- [ ] Sidebar Progress card gradient güncellendi
- [ ] Sidebar Tips card gradient güncellendi
- [ ] Sidebar Custom Fields Info card gradient güncellendi
- [ ] Yeni Lead Information card eklendi
- [ ] Status/Priority config eklendi
- [ ] Missing imports eklendi (icons, date-fns, Separator)

### CollapsibleSection Component
- [ ] CardHeader'a gradient uygulandı
- [ ] Border ve overflow-hidden eklendi
- [ ] Icon container styling güncellendi
- [ ] Text colors güncellendi (gray-600)

### Page Props
- [ ] Edit page `created_at` prop'u sağlıyor

### Testing
- [ ] Development server başlatıldı
- [ ] Edit page açıldı (`/leads/[id]/edit`)
- [ ] Hero header görünüyor
- [ ] Tüm section'lar blue-sky gradient gösteriyor
- [ ] Dynamic sections section_key'e göre gruplu
- [ ] Sidebar cards modern gradient'e sahip
- [ ] Lead Information sidebar card çalışıyor
- [ ] Form submission çalışıyor
- [ ] Responsive tasarım çalışıyor

### Database
- [ ] `lead_form_sections` tablosu var ve dolu
- [ ] Tüm gradientler blue-sky: `bg-gradient-to-r from-blue-50 to-sky-50`
- [ ] Icons doğru: `user`, `briefcase`, `document`, `layout`

---

## 🎨 Visual Comparison

### Önce (Edit Page - Mevcut)
```
Header: LeadFormHeader (basic, no gradient)
├── Contact Information: Orange gradient 🔴
└── Lead Details: Teal gradient 🔴
    ├── Source, Status, Priority
    └── ALL custom fields (tek section)

Sidebar:
├── Progress (gradient yok) 🔴
├── Tips (gradient yok) 🔴
└── Custom Fields Info (green gradient) 🔴
```

### Sonra (Edit Page - Hedef)
```
Hero: Modern gradient header with avatar, badges, actions ✅
├── Contact Information: Blue-Sky gradient ✅
├── Lead Details: Blue-Sky gradient ✅
│   └── Source, Status, Priority
├── Company Information: Blue-Sky gradient ✅ (from DB)
├── Additional Information: Blue-Sky gradient ✅ (from DB)
└── [Other dynamic sections...] ✅

Sidebar:
├── Progress: Blue-Sky gradient ✅
├── Tips: Blue-Sky gradient ✅
├── Lead Information: Blue-Sky gradient ✅ (YENİ)
└── Custom Fields Info: Blue-Sky gradient ✅
```

---

## 📸 Expected Result

**Final Lead Edit Page Structure:**

### Main Content
1. **Hero Header** ✅
   - Gradient: blue-indigo-purple
   - Avatar with initials
   - Lead name + "Editing" badge
   - Status, Priority, Source badges
   - Contact info (email, phone, created date)
   - Save/Cancel buttons

2. **Contact Information Section** ✅
   - Gradient: blue-sky
   - Full Name, Email, Phone fields

3. **Lead Details Section** ✅
   - Gradient: blue-sky
   - Source, Status, Priority fields

4. **Dynamic Sections** ✅ (from `lead_form_sections`)
   - Each section: blue-sky gradient
   - Section-based field grouping
   - Collapsible
   - Icon from database

### Sidebar
1. **Form Progress** ✅
   - Gradient header: blue-sky
   - Progress bar

2. **Tips** ✅
   - Gradient header: blue-sky
   - Tips list

3. **Lead Information** ✅ (YENİ)
   - Gradient header: blue-sky
   - Current Status badge
   - Current Priority badge
   - Created date

4. **Custom Fields Info** ✅
   - Background: blue-sky gradient
   - Field count
   - Manage link

---

## 🎯 Success Criteria

1. ✅ Modern hero header edit page'de görünüyor
2. ✅ Tüm section'lar blue-sky gradient kullanıyor
3. ✅ Dynamic sections database'den section_key ile gruplanmış
4. ✅ Sidebar tüm cards modern gradient'e sahip
5. ✅ Lead Information card sidebar'da çalışıyor
6. ✅ Form submission bozulmamış
7. ✅ Responsive tasarım çalışıyor
8. ✅ Detail page ile görsel tutarlılık sağlanmış

---

## 📝 Notes

### Component Line Numbers (Referans)
- **LeadFormClient**: `components/leads/lead-form-client.tsx` (676 satır)
  - Contact Information Section: Line 383-452
  - Lead Details Section: Line 454-598
  - Sidebar: Line 604-670

### Gradient Format
```css
/* Blue/Sky Gradient (Unified theme) */
bg-gradient-to-r from-blue-50 to-sky-50

/* Icon Color (when outside gradient) */
text-blue-600

/* Icon Color (when inside gradient background) */
text-white
```

### Database Tables
```sql
-- Form Sections
Table: lead_form_sections
Columns: id, section_key, name, is_visible, is_default_open, sort_order, icon, gradient

-- Custom Fields
Table: lead_fields
Columns: id, name, label, type, section_key, is_required, is_system_field, ...
```

---

## 🚀 Quick Implementation Commands

```bash
# 1. Create new hero component
# touch components/leads/lead-edit-hero.tsx
# (Copy code from Step 1)

# 2. Update lead-form-client.tsx
# (Apply changes from Step 2)

# 3. Test
npm run dev
# Open: http://localhost:3000/leads/8/edit

# 4. Verify
# - Hero appears with avatar, badges
# - All sections use blue-sky gradient
# - Dynamic sections grouped by section_key
# - Sidebar cards have gradient headers
# - Form saves correctly
```

---

## 🔄 Rollback (If Needed)

```bash
# Restore original files
git checkout components/leads/lead-form-client.tsx

# Remove new hero component
rm components/leads/lead-edit-hero.tsx

# Restart server
npm run dev
```

---

**Son Güncelleme:** 2025-10-03
**Yazar:** Claude
**Versiyon:** 1.0 - Complete Implementation Guide

Bu dokümanı takip ederek Lead Edit sayfasını Detail sayfası ile aynı modern, tutarlı görünüme kavuşturabilirsiniz! 🎉
