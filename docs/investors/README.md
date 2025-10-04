# Investors Module - Comprehensive Documentation

> Dynamic, scalable investor management system with custom field architecture and user assignment

---

## 📋 Table of Contents

- [Module Overview](#-module-overview)
- [Key Features](#-key-features)
- [Documentation Index](#-documentation-index)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [File References](#-file-references)
- [Version Info](#-version-info)

---

## 🎯 Module Overview

The Investors module is a comprehensive system for managing investor relationships in the Marketing CRM. It provides dynamic custom field management, user assignment tracking, activity timeline, and flexible filtering capabilities.

### Purpose
- Track investor information and relationships
- Manage investment preferences and requirements
- Monitor investor activities and engagement
- Assign investors to team members
- Customize data collection through dynamic fields

---

## ✅ Key Features

### Core Functionality
- ✅ **Dynamic Custom Fields** - Unlimited custom field creation with 9+ field types
- ✅ **User Assignment System** - Track which team member manages each investor
- ✅ **Activity Timeline** - Complete history of investor interactions
- ✅ **Form Section Configurator** - Organize fields into customizable sections
- ✅ **Advanced Filtering** - Multi-dimensional filtering with custom field support
- ✅ **Status & Priority Management** - Dynamic status and priority tracking
- ✅ **BigInt Safe Serialization** - Proper handling of MySQL BigInt types
- ✅ **Unique Phone Validation** - Prevent duplicate investor records
- ✅ **Required Field Validation** - Server-side validation for required fields

### UI/UX Features
- ✅ **Modern Hero Header** - Gradient-based detail view with emerald theme
- ✅ **Tabbed Interface** - Organized information display
- ✅ **Collapsible Sections** - Improved form organization
- ✅ **Badge Components** - Visual status and priority indicators
- ✅ **Empty States** - Helpful prompts for first-time actions
- ✅ **Responsive Design** - Mobile-friendly layouts

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| **[DATABASE.md](./DATABASE.md)** | Complete database schema, relationships, and queries |
| **[API.md](./API.md)** | All API endpoints with examples and validation rules |
| **[COMPONENTS.md](./COMPONENTS.md)** | React component documentation with props and usage |
| **[DYNAMIC-FIELDS.md](./DYNAMIC-FIELDS.md)** | Dynamic field system architecture and implementation |
| **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** | Step-by-step usage guide with code examples |
| **[VISUAL-GUIDE.md](./VISUAL-GUIDE.md)** | UI/UX patterns, layouts, and styling guide |
| **[NOTES.md](./NOTES.md)** | Important details, known issues, and future improvements |

---

## 🚀 Quick Start

### Create a New Investor

```typescript
// 1. Navigate to investors page
router.push('/investors/new')

// 2. Fill required contact fields
const investorData = {
  full_name: "Jane Smith",
  email: "jane@example.com",
  phone: "+90 555 123 4567"
}

// 3. Set custom fields (status, priority, etc.)
const customFields = {
  "1": "referral",        // source field
  "2": "potential",       // status field
  "3": "high",            // priority field
  "4": "500000-1000000"   // investment_amount field
}

// 4. Submit to API
const response = await fetch('/api/investors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...investorData, customFields })
})
```

### View Investor Details

```typescript
// Fetch investor with all related data
const investor = await prisma.investors.findUnique({
  where: { id: BigInt(investorId) },
  include: {
    investor_field_values: {
      include: {
        investor_fields: {
          include: {
            investor_field_options: true
          }
        }
      }
    },
    activities: {
      orderBy: { created_at: 'desc' },
      take: 10
    }
  }
})
```

### Assign User to Investor

```typescript
// Create user assignment
await fetch(`/api/investors/${investorId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: userId })
})
```

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Investors Module                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼──────┐      ┌──────▼──────┐
   │Frontend │          │  API Layer │      │  Database   │
   └────┬────┘          └─────┬──────┘      └──────┬──────┘
        │                     │                     │
   ┌────▼────────┐      ┌────▼─────────┐     ┌─────▼──────┐
   │Pages        │      │Routes        │     │Tables      │
   ├─────────────┤      ├──────────────┤     ├────────────┤
   │/investors   │◄────►│GET /api/     │◄───►│investors   │
   │/[id]        │      │  investors   │     │            │
   │/[id]/edit   │      │POST /api/    │     │investor_   │
   │/new         │      │  investors   │     │ fields     │
   └──────┬──────┘      │PUT /api/     │     │            │
          │             │  investors/  │     │investor_   │
   ┌──────▼──────┐      │  [id]        │     │ field_     │
   │Components   │      │PATCH /api/   │     │ values     │
   ├─────────────┤      │  investors/  │     │            │
   │InvestorForm │      │  [id]        │     │investor_   │
   │  Client     │      │DELETE /api/  │     │ field_     │
   │             │      │  investors/  │     │ options    │
   │InvestorTable│      │  [id]        │     │            │
   │             │      └──────────────┘     │investor_   │
   │InvestorDetail│                          │ form_      │
   │  View       │                           │ sections   │
   │             │                           │            │
   │Dynamic      │                           │user_       │
   │  Field      │                           │ assignments│
   └─────────────┘                           │            │
                                             │activities  │
                                             └────────────┘
```

### Data Flow

```
User Action → Component → API Route → Validation → Database
                ▲                                      │
                │                                      │
                └──────── Response (Serialized) ◄──────┘
```

---

## 📁 File References

### Frontend Files

**Pages:**
- [/app/(dashboard)/investors/page.tsx](../../app/(dashboard)/investors/page.tsx) - Investor list page
- [/app/(dashboard)/investors/[id]/page.tsx](../../app/(dashboard)/investors/[id]/page.tsx) - Investor detail page
- [/app/(dashboard)/investors/[id]/edit/page.tsx](../../app/(dashboard)/investors/[id]/edit/page.tsx) - Edit investor page
- [/app/(dashboard)/investors/new/page.tsx](../../app/(dashboard)/investors/new/page.tsx) - Create investor page

**Components:**
- [investor-form-client.tsx](../../components/investors/investor-form-client.tsx) - Main form component
- [investors-table-with-filters.tsx](../../components/investors/investors-table-with-filters.tsx) - List with filtering
- [investor-detail-view.tsx](../../components/investors/investor-detail-view.tsx) - Detail view component
- [investor-edit-hero.tsx](../../components/investors/investor-edit-hero.tsx) - Edit page hero header
- [add-investor-button.tsx](../../components/investors/add-investor-button.tsx) - Quick add button

**Field Components:**
- [investor-dynamic-field.tsx](../../components/fields/investor-dynamic-field.tsx) - Dynamic field renderer

### Backend Files

**API Routes:**
- [/api/investors/route.ts](../../app/api/investors/route.ts) - GET (list), POST (create)
- [/api/investors/[id]/route.ts](../../app/api/investors/[id]/route.ts) - GET (single), PUT (update), PATCH (assign), DELETE

**Settings API:**
- [/api/settings/investor-fields/**](../../app/api/settings/investor-fields/) - Field management
- [/api/settings/investor-form-sections/**](../../app/api/settings/investor-form-sections/) - Section configuration

### Database

**Prisma Schema:**
- [schema.prisma](../../prisma/schema.prisma) - Lines 387-431 (investors table)
- [schema.prisma](../../prisma/schema.prisma) - Lines 336-355 (investor_fields)
- [schema.prisma](../../prisma/schema.prisma) - Lines 322-334 (investor_field_values)
- [schema.prisma](../../prisma/schema.prisma) - Lines 308-320 (investor_field_options)
- [schema.prisma](../../prisma/schema.prisma) - Lines 357-370 (investor_form_sections)
- [schema.prisma](../../prisma/schema.prisma) - Lines 1351-1368 (user_assignments)

---

## 📊 Version Info

| Info | Value |
|------|-------|
| **Module Version** | 1.0.0 |
| **Last Updated** | 2025-01-04 |
| **Database Tables** | 6 core + 1 assignment |
| **API Endpoints** | 5 main endpoints |
| **React Components** | 9 components |
| **Field Types Supported** | 9 types |
| **Status** | ✅ Production Ready |

---

## 🔗 Related Modules

- **[Leads Module](../leads/)** - Similar architecture, investor conversion source
- **[Activities Module](../activities/)** - Activity tracking integration
- **[Users Module](../users/)** - User assignment system
- **[Settings Module](../settings/)** - Field and section configuration

---

## 💡 Next Steps

1. **Setup** - Review [DATABASE.md](./DATABASE.md) for database structure
2. **API Integration** - Check [API.md](./API.md) for endpoint usage
3. **UI Development** - See [COMPONENTS.md](./COMPONENTS.md) for component structure
4. **Custom Fields** - Read [DYNAMIC-FIELDS.md](./DYNAMIC-FIELDS.md) for field system
5. **Implementation** - Follow [IMPLEMENTATION.md](./IMPLEMENTATION.md) for examples

---

**Happy Coding! 🚀**
