# Activities System Documentation

> Dynamic activity management system integrated with activity types for Leads and Investors

## 🎯 Genel Bakış

Activities sistemi, Lead ve Investor'lar için aktivite yönetimi sağlar. Activity Types ile entegre çalışarak her aktiviteye özel icon ve renk desteği sunar.

### Ana Özellikler

- ✅ **Activity Types Integration:** activity_types tablosundan dinamik aktivite tipleri
- ✅ **Icon & Color Support:** Her aktivite tipi için özel icon ve renk
- ✅ **Lead & Investor Support:** Hem lead hem investor aktiviteleri
- ✅ **Representative & User Assignment:** Aktivitelere temsilci ve kullanıcı atama
- ✅ **Timeline View:** Modern activity timeline görünümü
- ✅ **Auto-Update:** Investor/Lead last_activity_at otomatik güncelleme

---

## 📚 Dokümantasyon

Bu sistemin detaylı dokümantasyonu aşağıdaki bölümlere ayrılmıştır:

### Teknik Dokümantasyon

- **[DATABASE.md](./DATABASE.md)** - Database yapısı, tablolar, Prisma schema ve queries
- **[API.md](./API.md)** - API endpoints, request/response formatları, backend logic
- **[COMPONENTS.md](./COMPONENTS.md)** - Component yapısı, props, usage örnekleri

### Özellikler ve Kullanım

- **[ACTIVITY-TYPES.md](./ACTIVITY-TYPES.md)** - Activity type yönetimi, default types, icons ve renkler
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Kullanım örnekleri, best practices, data flow
- **[VISUAL-GUIDE.md](./VISUAL-GUIDE.md)** - UI/UX design, timeline cards, color scheme

### Referans

- **[NOTES.md](./NOTES.md)** - Önemli notlar, bilinen sorunlar, gelecek iyileştirmeler

---

## 🚀 Quick Start

### 1. Activity Oluşturma

```typescript
// Lead için
<AddActivityDialog
  open={addActivityOpen}
  onOpenChange={setAddActivityOpen}
  leadId={lead.id}
  onSuccess={() => router.refresh()}
/>

// Investor için
<AddActivityDialog
  open={addActivityOpen}
  onOpenChange={setAddActivityOpen}
  investorId={investor.id}
  onSuccess={() => router.refresh()}
/>
```

### 2. Activity Timeline Görüntüleme

```typescript
// Investor detail view'da
<TabsContent value="activities">
  <Card>
    <CardHeader>
      <CardTitle>Activity Timeline</CardTitle>
    </CardHeader>
    <CardContent>
      {activities.map((activity) => (
        // Activity timeline card
      ))}
    </CardContent>
  </Card>
</TabsContent>
```

### 3. Activity Type Icons

```typescript
import { getActivityIcon, getActivityBgColor } from "@/lib/activity-icons"

const icon = getActivityIcon({
  iconName: "Phone",
  color: "#84cc16"
})
const bgColor = getActivityBgColor("#84cc16")
```

---

## 📊 System Architecture

```
activities
├── activity_type_id → activity_types (icon, color, label)
├── lead_id → leads
├── investor_id → investors
├── representative_id → representatives
└── user_id → users
```

---

## 🔗 İlgili Dosyalar

### Backend
- [app/api/activities/route.ts](../../app/api/activities/route.ts)
- [lib/activity-icons.tsx](../../lib/activity-icons.tsx)
- [prisma/schema.prisma](../../prisma/schema.prisma)

### Frontend
- [components/activities/add-activity-dialog.tsx](../../components/activities/add-activity-dialog.tsx)
- [components/investors/investor-detail-view.tsx](../../components/investors/investor-detail-view.tsx)
- [app/(dashboard)/investors/[id]/page.tsx](../../app/(dashboard)/investors/[id]/page.tsx)

### Settings
- [app/(dashboard)/settings/activity-types/page.tsx](../../app/(dashboard)/settings/activity-types/page.tsx)

---

**Version:** 2.0.0
**Last Updated:** 2025-10-04
**Status:** ✅ Production Ready
