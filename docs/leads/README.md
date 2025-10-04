# Leads Module - Comprehensive Documentation

> Dynamic, scalable lead management system with custom field architecture and sales pipeline tracking

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

The Leads module is a comprehensive system for managing lead relationships in the Marketing CRM. It provides dynamic custom field management, sales pipeline tracking, activity timeline, and flexible filtering capabilities.

### Purpose
- Track lead information and relationships
- Manage sales pipeline stages
- Monitor lead activities and engagement
- Convert leads to investors
- Customize data collection through dynamic fields

---

## ✅ Key Features

### Core Functionality
- ✅ **Dynamic Custom Fields** - Unlimited custom field creation with 9+ field types
- ✅ **Activity Timeline** - Complete history of lead interactions
- ✅ **Form Section Configurator** - Organize fields into customizable sections
- ✅ **Advanced Filtering** - Multi-dimensional filtering with custom field support
- ✅ **Status & Priority Management** - Dynamic status and priority tracking
- ✅ **User Assignment System** - Assign leads to team members for ownership tracking
- ✅ **BigInt Safe Serialization** - Proper handling of MySQL BigInt types
- ✅ **Unique Email/Phone Validation** - Prevent duplicate lead records
- ✅ **Required Field Validation** - Server-side validation for required fields
- ✅ **Lead to Investor Conversion** - Convert qualified leads to investors

### UI/UX Features
- ✅ **Modern Hero Header** - Gradient-based detail view with blue/indigo theme
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

### Create a New Lead

```typescript
// 1. Navigate to leads page
router.push('/leads/new')

// 2. Fill required contact fields
const leadData = {
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+90 555 123 4567"
}

// 3. Set custom fields (status, priority, etc.)
const customFields = {
  "1": "website",        // source field
  "2": "new",            // status field
  "3": "high",           // priority field
  "4": "Real Estate"     // interest_area field
}

// 4. Submit to API
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...leadData, customFields })
})
```

### View Lead Details

```typescript
// Fetch lead with all related data
const lead = await prisma.leads.findUnique({
  where: { id: BigInt(leadId) },
  include: {
    lead_field_values: {
      include: {
        lead_fields: {
          include: {
            lead_field_options: true
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

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Leads Module                         │
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
   │/leads       │◄────►│GET /api/     │◄───►│leads       │
   │/[id]        │      │  leads       │     │            │
   │/[id]/edit   │      │POST /api/    │     │lead_       │
   │/new         │      │  leads       │     │ fields     │
   └──────┬──────┘      │PUT /api/     │     │            │
          │             │  leads/[id]  │     │lead_       │
   ┌──────▼──────┐      │DELETE /api/  │     │ field_     │
   │Components   │      │  leads/[id]  │     │ values     │
   ├─────────────┤      └──────────────┘     │            │
   │LeadForm     │                           │lead_       │
   │  Client     │                           │ field_     │
   │             │                           │ options    │
   │LeadTable    │                           │            │
   │             │                           │lead_       │
   │LeadDetail   │                           │ form_      │
   │  View       │                           │ sections   │
   │             │                           │            │
   │Dynamic      │                           │activities  │
   │  Field      │                           └────────────┘
   └─────────────┘
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
- [/app/(dashboard)/leads/page.tsx](../../app/(dashboard)/leads/page.tsx) - Lead list page (with user assignments)
- [/app/(dashboard)/leads/[id]/page.tsx](../../app/(dashboard)/leads/[id]/page.tsx) - Lead detail page
- [/app/(dashboard)/leads/new/page.tsx](../../app/(dashboard)/leads/new/page.tsx) - Create lead page

**Note:** There is no separate edit page route. Editing is done through the lead detail view or via API.

**Components:**
- [lead-form-client.tsx](../../components/leads/lead-form-client.tsx) - Main form component
- [leads-table-with-filters.tsx](../../components/leads/leads-table-with-filters.tsx) - List with filtering
- [lead-detail-view.tsx](../../components/leads/lead-detail-view.tsx) - Detail view component
- [lead-edit-hero.tsx](../../components/leads/lead-edit-hero.tsx) - Edit page hero header
- [add-lead-button.tsx](../../components/leads/add-lead-button.tsx) - Quick add button

**Field Components:**
- [lead-dynamic-field.tsx](../../components/fields/lead-dynamic-field.tsx) - Dynamic field renderer

### Backend Files

**API Routes:**
- [/api/leads/route.ts](../../app/api/leads/route.ts) - GET (list), POST (create)
- [/api/leads/[id]/route.ts](../../app/api/leads/[id]/route.ts) - GET (single), PUT (update), PATCH (assign user), DELETE

**Settings API:**
- [/api/settings/lead-fields/**](../../app/api/settings/lead-fields/) - Field management
- [/api/settings/lead-form-sections/**](../../app/api/settings/lead-form-sections/) - Section configuration

### Database

**Prisma Schema:**
- [schema.prisma](../../prisma/schema.prisma) - Lines 43-74 (leads table)
- [schema.prisma](../../prisma/schema.prisma) - Lines 76-94 (lead_fields)
- [schema.prisma](../../prisma/schema.prisma) - Lines 96-110 (lead_field_values)
- [schema.prisma](../../prisma/schema.prisma) - Lines 112-126 (lead_field_options)
- [schema.prisma](../../prisma/schema.prisma) - Lines 128-142 (lead_form_sections)

---

## 📊 Version Info

| Info | Value |
|------|-------|
| **Module Version** | 1.0.0 |
| **Last Updated** | 2025-01-04 |
| **Database Tables** | 5 core tables |
| **API Endpoints** | 4 main endpoints |
| **React Components** | 8 components |
| **Field Types Supported** | 9 types |
| **Status** | ✅ Production Ready |

---

## 🔗 Related Modules

- **[Investors Module](../investors/)** - Lead conversion target
- **[Activities Module](../activities/)** - Activity tracking integration
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
