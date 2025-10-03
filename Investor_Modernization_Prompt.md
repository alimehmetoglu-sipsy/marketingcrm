# Investor Pages Modernization - Implementation Guide

> Lead sayfalarında yapılan modern UI/UX değişikliklerini Investor sayfalarına uyarlama rehberi

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Değişiklik Özeti](#-değişiklik-özeti)
- [1. Investor Detail Page Modernization](#1-investor-detail-page-modernization)
- [2. Investor Edit Hero Component](#2-investor-edit-hero-component-yeni)
- [3. Investor Edit Route](#3-investor-edit-route-yeni)
- [4. Investor Form Client Updates](#4-investor-form-client-updates)
- [Renk Teması](#-renk-teması)
- [Test Planı](#-test-planı)

---

## 🎯 Genel Bakış

Lead sayfalarında (`/leads/[id]` ve `/leads/[id]/edit`) uygulanan modern tasarım değişikliklerini Investor sayfalarına (`/investors/[id]` ve `/investors/[id]/edit`) uyarlayacağız.

### Ana Hedefler:
- ✅ Investor Detail page'de Status/Priority'yi doğru section'a taşıma
- ✅ Investor Edit page için modern hero header oluşturma
- ✅ Emerald-Teal-Green renk teması kullanma (Investor branding)
- ✅ Sidebar organizasyonunu modernize etme
- ✅ Icon'ları ekleyip görünür hale getirme

---

## 📊 Değişiklik Özeti

### Değiştirilecek Dosyalar:
1. `components/investors/investor-detail-view.tsx` - Detail page modernization
2. `components/investors/investor-form-client.tsx` - Form component updates
3. `components/investors/investor-edit-hero.tsx` - **YENİ DOSYA**
4. `app/(dashboard)/investors/[id]/edit/page.tsx` - **YENİ DOSYA**

### Ana Değişiklikler:

| Değişiklik | Detail Page | Edit Page |
|------------|-------------|-----------|
| Status/Priority Location | "Investor Details" section'ına taşı | Hero header'da göster |
| Sidebar | "Dates" kartı ekle | "Custom Fields" kartını kaldır |
| Hero Header | Mevcut (emerald gradient) | YENİ hero component ekle |
| Icons | Mevcut | Icon renkleri düzelt |
| Gradients | Mevcut (emerald) | Blue → Emerald'a değiştir |

---

## 1. Investor Detail Page Modernization

### 📄 Dosya: `components/investors/investor-detail-view.tsx`

### Değişiklik 1: Status ve Priority'yi "Investor Details" Section'ına Taşı

**Mevcut Durum:**
- Contact Information section: first_name, last_name, email, phone, company, position, source
- Dynamic sections: Custom fields
- Sidebar: "Investor Information" card (Status, Priority, Created Date, Last Updated)

**Hedef Durum:**
- Contact Information section: AYNI (first_name, last_name, email, phone, company, position, source)
- Investor Details section: **Status, Priority +** custom fields
- Sidebar: "Dates" card (Created Date, Last Updated)

### Kod Değişiklikleri:

#### 1.1. Contact Information Section (DEĞİŞMEYECEK)

Şu anki Contact Information section'ı koruyacağız:

```tsx
{/* Contact Information Section - Static Fields */}
<Card className="border-gray-200 shadow-sm">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <User className="h-5 w-5 text-emerald-600" />
      Contact Information
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <div className="grid gap-6 md:grid-cols-2">
      {/* Full Name */}
      <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Full Name</span>
        </div>
        <p className="text-gray-900 font-medium ml-6">{fullName}</p>
      </div>

      {/* Email, Phone, Company, Position, Source - MEVCUT KODDA VAR */}
      {/* ... */}
    </div>
  </CardContent>
</Card>
```

#### 1.2. Dynamic Sections - Status/Priority Ekleme

**KRİTİK:** Lead detail page'deki yaklaşımın aynısını uygulayacağız.

**Eklenecek Kod Bloğu (Satır ~481-565 civarı):**

```tsx
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

  // ✅ KIRITIK: Investor Details section'ını kontrol et
  const isInvestorDetailsSection = section.section_key === 'investor_details'

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
          {/* ✅ YENI: Eğer Investor Details section ise, Status ve Priority'yi en başa ekle */}
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
              {investor.priority && priority && (
                <div className="space-y-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Priority</span>
                  </div>
                  <div className="ml-6">
                    <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </Badge>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Custom Fields */}
          {sectionFields.map((field) => {
            // ... MEVCUT FIELD RENDERING KODU ...
          })}
        </div>
      </CardContent>
    </Card>
  )
})}
```

#### 1.3. Sidebar - "Investor Information" → "Dates"

**Kaldırılacak Kod (Satır ~655-691):**

```tsx
{/* Investor Information */}
<Card className="border-gray-200 shadow-sm">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-base font-semibold text-gray-900">Investor Information</CardTitle>
  </CardHeader>
  <CardContent className="p-4 space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">Status</span>
      <Badge className={`${status.bg} ${status.color} border-none text-xs`}>
        {status.label}
      </Badge>
    </div>
    {/* ... Priority, Created, Last Updated ... */}
  </CardContent>
</Card>
```

**Eklenecek Kod:**

```tsx
{/* Dates Info */}
<Card className="border-gray-200 shadow-lg">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <Clock className="h-5 w-5 text-emerald-600" />
      Dates
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6 space-y-4">
    <div className="space-y-3">
      {/* Created Date */}
      <div className="space-y-2 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Calendar className="h-4 w-4 text-emerald-600" />
          Created Date
        </div>
        <p className="text-sm text-gray-900 font-medium ml-6">
          {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy") : "-"}
        </p>
        <p className="text-xs text-gray-500 ml-6">
          {investor.created_at ? formatDistanceToNow(new Date(investor.created_at), { addSuffix: true }) : "-"}
        </p>
      </div>

      {/* Last Updated */}
      {investor.updated_at && (
        <div className="space-y-2 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Clock className="h-4 w-4 text-emerald-600" />
            Last Updated
          </div>
          <p className="text-sm text-gray-900 font-medium ml-6">
            {format(new Date(investor.updated_at), "MMM dd, yyyy")}
          </p>
          <p className="text-xs text-gray-500 ml-6">
            {formatDistanceToNow(new Date(investor.updated_at), { addSuffix: true })}
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

**Gerekli Import Eklentisi:**

```tsx
import { formatDistanceToNow } from "date-fns"  // Eğer yoksa ekle
```

---

## 2. Investor Edit Hero Component (YENİ)

### 📄 Yeni Dosya: `components/investors/investor-edit-hero.tsx`

Lead Edit Hero'yu temel alarak Investor için uyarlayacağız.

### Tam Kod:

```tsx
"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Save, X } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface InvestorEditHeroProps {
  investor: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
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

export function InvestorEditHero({ investor, isSubmitting, onSave, onCancel }: InvestorEditHeroProps) {
  const status = statusConfig[investor.status] || statusConfig.active
  const priority = investor.priority ? (priorityConfig[investor.priority] || priorityConfig.medium) : null

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName[0] + (lastName ? lastName[0] : '')).toUpperCase()
  }

  const fullName = `${investor.first_name} ${investor.last_name || ''}`.trim()

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-8 shadow-xl mb-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

      <div className="relative">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/investors">
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

        {/* Investor Info */}
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
            <AvatarFallback className="text-2xl font-bold bg-white/90 text-emerald-600">
              {getInitials(investor.first_name, investor.last_name || '')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                {fullName}
              </h1>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-sm">
                Editing
              </Badge>
            </div>

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
                  <span className="text-white/40">•</span>
                  <a href={`tel:${investor.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{investor.phone}</span>
                  </a>
                </>
              )}
              <span className="text-white/40">•</span>
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
  )
}
```

### Özellikler:
- ✅ **Emerald-Teal-Green gradient** (Investor renk paleti)
- ✅ **first_name + last_name** kullanımı
- ✅ Status config: active, prospect, interested, negotiating, invested, inactive
- ✅ Priority config: low, medium, high, urgent
- ✅ Save/Cancel action buttons
- ✅ Avatar with initials
- ✅ Contact info display (email, phone)

---

## 3. Investor Edit Route (YENİ)

### 📄 Yeni Dosya: `app/(dashboard)/investors/[id]/edit/page.tsx`

Lead edit route'u temel alarak oluşturacağız.

### Tam Kod:

```tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { InvestorFormClient } from "@/components/investors/investor-form-client"

export const dynamic = "force-dynamic"

async function getInvestor(id: string) {
  const investor = await prisma.investors.findUnique({
    where: { id: parseInt(id) },
    include: {
      investor_field_values: {
        select: {
          investor_field_id: true,
          value: true,
        },
      },
    },
  })

  if (!investor) {
    return null
  }

  // Get custom fields
  const customFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: {
      investor_field_options: {
        where: { is_active: true },
        orderBy: { sort_order: "asc" },
      },
    },
    orderBy: { sort_order: "asc" },
  })

  // Convert BigInt to number and create full_name
  const serializedInvestor = {
    ...investor,
    id: Number(investor.id),
    lead_id: investor.lead_id ? Number(investor.lead_id) : null,
    full_name: `${investor.first_name} ${investor.last_name || ''}`.trim(),
    investor_field_values: investor.investor_field_values.map((fv) => ({
      investor_field_id: Number(fv.investor_field_id),
      value: fv.value,
    })),
  }

  const serializedFields = customFields.map((field) => ({
    ...field,
    id: Number(field.id),
    investor_field_options: field.investor_field_options.map((opt) => ({
      ...opt,
      id: Number(opt.id),
      investor_field_id: Number(opt.investor_field_id),
    })),
  }))

  return {
    investor: serializedInvestor,
    customFields: serializedFields,
  }
}

export default async function InvestorEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getInvestor(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="h-full bg-gray-50">
      <InvestorFormClient {...data} />
    </div>
  )
}
```

### Özellikler:
- ✅ Investor verisi + field values fetch
- ✅ Custom fields fetch
- ✅ BigInt → Number conversion
- ✅ **full_name** oluşturma (first_name + last_name)
- ✅ InvestorFormClient'a geçiş

---

## 4. Investor Form Client Updates

### 📄 Dosya: `components/investors/investor-form-client.tsx`

### Değişiklik 1: Imports Ekleme

**Eklenecek:**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, CheckCircle2, Calendar, Clock } from "lucide-react"
import { InvestorEditHero } from "./investor-edit-hero"
import { format, formatDistanceToNow } from "date-fns"
```

### Değişiklik 2: Investor Type Güncellemesi

**Eklenecek field:**

```tsx
type Investor = {
  id: number
  full_name: string
  email: string
  phone: string
  phone_country: string
  source: string
  status: string
  priority: string
  notes: string | null
  created_at: Date | null  // ✅ EKLE
  investor_field_values?: Array<{
    investor_field_id: number
    value: string
  }>
}
```

### Değişiklik 3: Status/Priority Config Ekleme

**Component içinde (satır ~93-140 arası):**

```tsx
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
```

### Değişiklik 4: CollapsibleSection Modernization

**Değiştirilecek Kod (satır ~103-151):**

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
```

### Değişiklik 5: Hero Header Replacement

**InvestorFormHeader yerine InvestorEditHero kullan (satır ~280-287):**

**KALDIRILAN:**

```tsx
{/* Header */}
<InvestorFormHeader
  isEditing={!!investor}
  investorName={investor?.full_name}
  isSubmitting={isSubmitting}
  onSave={form.handleSubmit(onSubmit)}
  onCancel={handleCancel}
/>
```

**EKLENDİ:**

```tsx
{/* Modern Hero Header (only for edit mode) */}
{investor && (
  <InvestorEditHero
    investor={investor}
    isSubmitting={isSubmitting}
    onSave={form.handleSubmit(onSubmit)}
    onCancel={handleCancel}
  />
)}
```

### Değişiklik 6: Icon Renkleri Düzeltme

**Contact Information Section (satır ~298-302):**

**DEĞİŞTİRİLECEK:**

```tsx
<CollapsibleSection
  title="Contact Information"
  subtitle="Required contact details"
  icon={<UserIcon className="w-5 h-5 text-white" />}  // ❌ YANLŞ
  gradient="bg-gradient-to-br from-[#FF7A59] to-[#FF9B82]"  // ❌ YANLIŞ
>
```

**YENİ:**

```tsx
<CollapsibleSection
  title="Contact Information"
  subtitle="Required contact details"
  icon={<UserIcon className="w-5 h-5 text-emerald-600" />}  // ✅ DOĞRU
  gradient="bg-gradient-to-r from-emerald-50 to-teal-50"  // ✅ DOĞRU
>
```

**Investor Details Section (satır ~370-378):**

**DEĞİŞTİRİLECEK:**

```tsx
<CollapsibleSection
  title="Investor Details"
  subtitle="Status, priority and additional information"
  icon={
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">  // ❌ YANLIŞ
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  }
  gradient="bg-gradient-to-br from-[#00BDA5] to-[#00D4B8]"  // ❌ YANLIŞ
>
```

**YENİ:**

```tsx
<CollapsibleSection
  title="Investor Details"
  subtitle="Status, priority and additional information"
  icon={
    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">  // ✅ DOĞRU
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  }
  gradient="bg-gradient-to-r from-emerald-50 to-teal-50"  // ✅ DOĞRU
>
```

### Değişiklik 7: Sidebar - Custom Fields Kartını Kaldır

**KALDIRILAN (satır ~441-467):**

```tsx
{/* Custom Fields Info */}
{customFields.length > 0 && (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-teal-50">
    <CardContent className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Custom Fields</h3>
      </div>
      <p className="text-sm text-gray-600">
        You have <span className="font-semibold text-green-600">{customFields.length}</span> custom {customFields.length === 1 ? "field" : "fields"} in Investor Details
      </p>
      <a
        href="/settings/investor-fields"
        className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
      >
        Manage fields
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </CardContent>
  </Card>
)}
```

### Değişiklik 8: Sidebar - Gradient Güncellemeleri

**Progress Card & Tips Card gradient'leri (satır ~404, ~414):**

**DEĞİŞTİRİLECEK:**

```tsx
{/* Progress Card */}
<Card className="border-0 shadow-sm">  // ❌ gradient yok
```

**YENİ:**

```tsx
{/* Progress Card */}
<Card className="border-gray-200 shadow-lg overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-emerald-600" />
      Form Progress
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <InvestorFormProgress
      completedFields={completedFields.completed}
      totalFields={completedFields.total}
    />
  </CardContent>
</Card>

{/* Tips Card */}
<Card className="border-gray-200 shadow-lg overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      Tips
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6 space-y-4">
    <ul className="space-y-2 text-sm text-gray-600">
      {/* ... Tips content ... */}
    </ul>
  </CardContent>
</Card>
```

---

## 🎨 Renk Teması

### Investor Color Palette (Emerald-Teal-Green)

| Component | Color |
|-----------|-------|
| **Hero Header Gradient** | `bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700` |
| **Section Headers** | `bg-gradient-to-r from-emerald-50 to-teal-50` |
| **Icons (Primary)** | `text-emerald-600` |
| **Icons (Secondary)** | `text-teal-600` |
| **Hover Effects** | `hover:bg-emerald-50`, `hover:border-emerald-300` |
| **Badge (Emerald)** | `bg-emerald-100 text-emerald-700 border-emerald-200` |
| **Stat Cards** | emerald-100, teal-100, green-100, amber-100 |

### Lead vs Investor Color Comparison

| Element | Lead (Blue-Sky) | Investor (Emerald-Teal) |
|---------|-----------------|-------------------------|
| Hero Gradient | `from-blue-600 via-indigo-600 to-purple-700` | `from-emerald-600 via-teal-600 to-green-700` |
| Section Header | `from-blue-50 to-sky-50` | `from-emerald-50 to-teal-50` |
| Primary Icon | `text-blue-600` | `text-emerald-600` |
| Multiselect Badge | `bg-blue-100 text-blue-700` | `bg-emerald-100 text-emerald-700` |

---

## 🧪 Test Planı

### Test Edilecek Sayfalar:

1. **Investor Detail Page** - `http://localhost:3000/investors/[id]`
   - ✅ Contact Information section görünümü
   - ✅ Investor Details section'da Status ve Priority
   - ✅ Sidebar'da "Dates" kartı
   - ✅ Multiselect field'ların badge display
   - ✅ Emerald-Teal renk teması

2. **Investor Edit Page** - `http://localhost:3000/investors/[id]/edit`
   - ✅ Modern hero header (emerald gradient)
   - ✅ Avatar ve initials
   - ✅ Contact Information section iconları
   - ✅ Investor Details section iconları
   - ✅ Sidebar: Progress + Tips kartları
   - ✅ Custom Fields kartı kaldırıldı mı?
   - ✅ Save/Cancel button'ları çalışıyor mu?

### Test Komutları:

```bash
# Development server'ı başlat
npm run dev

# Test URL'leri
http://localhost:3000/investors/1
http://localhost:3000/investors/1/edit
```

### Test Checklist:

- [ ] Investor Detail page'de Status/Priority "Investor Details" section'ında
- [ ] Investor Detail sidebar'da "Dates" kartı var
- [ ] Investor Edit page'de modern hero header görünüyor
- [ ] Investor Edit page'de icon'lar emerald renkli ve görünür
- [ ] Investor Edit sidebar'da "Custom Fields" kartı yok
- [ ] Tüm gradient'ler emerald-teal temalı
- [ ] Save/Cancel butonları çalışıyor
- [ ] Form submit sonrası `/investors` listesine yönlendiriyor

---

## 📝 Notlar

### Önemli Farklılıklar (Lead vs Investor):

1. **Name Structure:**
   - Lead: `full_name` (tek field)
   - Investor: `first_name` + `last_name` → `full_name` oluşturulur

2. **Phone Field:**
   - Lead: `phone` + `phone_country` (required)
   - Investor: `phone` (optional, nullable)

3. **Status Options:**
   - Lead: new, contacted, qualified, proposal, negotiation, won, lost
   - Investor: active, prospect, interested, negotiating, invested, inactive

4. **Additional Fields:**
   - Investor has: `company`, `position`, `budget`, `timeline`
   - Lead doesn't have these static fields

### Database Schema Referansları:

```prisma
// investors table
model investors {
  id          BigInt   @id @default(autoincrement())
  first_name  String
  last_name   String?
  email       String
  phone       String?  @unique
  company     String?
  position    String?
  source      String
  status      String
  priority    String
  budget      String?
  timeline    String?
  notes       String?  @db.Text
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  lead_id     BigInt?
}

// investor_form_sections table (section organization)
model investor_form_sections {
  id               BigInt  @id @default(autoincrement())
  section_key      String  @unique
  name             String
  is_visible       Boolean @default(true)
  is_default_open  Boolean @default(true)
  sort_order       Int
  icon             String?
  gradient         String?
}
```

### Seed Script Referansları:

```bash
# Investor form sections seed
npx tsx scripts/seed-investor-form-sections.ts

# Investor system fields seed
npx tsx scripts/seed-investor-system-fields.ts
```

---

## 🚀 Implementation Sırası

### Adım 1: Investor Edit Hero Component
1. `components/investors/investor-edit-hero.tsx` oluştur
2. Status/Priority config'leri ekle
3. first_name/last_name logic'i implement et

### Adım 2: Investor Edit Route
1. `app/(dashboard)/investors/[id]/edit/page.tsx` oluştur
2. Data fetching logic'i ekle
3. full_name oluşturma logic'i ekle

### Adım 3: Investor Form Client Updates
1. Import'ları ekle
2. Investor type'ı güncelle
3. CollapsibleSection'ı modernize et
4. Hero header replacement
5. Icon renkleri düzelt
6. Sidebar'dan Custom Fields kartını kaldır
7. Gradient'leri güncelle

### Adım 4: Investor Detail View Updates
1. formatDistanceToNow import ekle
2. Dynamic sections logic'inde isInvestorDetailsSection ekle
3. Status/Priority'yi Investor Details section'ına taşı
4. Sidebar'da "Investor Information" → "Dates" değiştir

### Adım 5: Test & Validation
1. Development server'ı başlat
2. Detail page test et
3. Edit page test et
4. Save/Cancel functionality test et
5. Screenshot'lar al

---

## ✅ Başarı Kriterleri

Bu implementation başarılı sayılır eğer:

1. ✅ Investor Detail page'de Status/Priority "Investor Details" section'ında görünüyor
2. ✅ Investor Detail sidebar'da "Dates" kartı var, "Investor Information" yok
3. ✅ Investor Edit page modern hero header'a sahip (emerald gradient)
4. ✅ Investor Edit page'de tüm icon'lar emerald renkli ve görünür
5. ✅ Investor Edit sidebar'da "Custom Fields" kartı yok
6. ✅ Tüm renk teması Emerald-Teal-Green
7. ✅ Save/Cancel butonları çalışıyor
8. ✅ Form submit sonrası doğru yönlendirme yapılıyor

---

**Version:** 1.0.0
**Created:** 2025-10-03
**Lead Reference:** Lead_Edit_Modernization_Prompt.md

---

## 🔗 İlgili Dosyalar

- `components/leads/lead-detail-view.tsx` - Referans detail view
- `components/leads/lead-form-client.tsx` - Referans form client
- `components/leads/lead-edit-hero.tsx` - Referans hero component
- `app/(dashboard)/leads/[id]/edit/page.tsx` - Referans edit route
