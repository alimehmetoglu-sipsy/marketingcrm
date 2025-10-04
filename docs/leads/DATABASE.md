# Leads Module - Database Documentation

[← Back to README](./README.md)

---

## 📋 Table of Contents

- [Database Schema](#-database-schema)
- [Table Relationships](#-table-relationships)
- [Key Fields](#-key-fields)
- [Prisma Models](#-prisma-models)
- [Query Examples](#-query-examples)
- [Indexes](#-indexes)

---

## 🗄 Database Schema

### Main Tables

#### 1. `leads` - Core lead data

```sql
CREATE TABLE `leads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(255) NOT NULL UNIQUE,
  `source` VARCHAR(50) NOT NULL DEFAULT 'website',
  `status` VARCHAR(50) NOT NULL DEFAULT 'new',
  `representative_id` BIGINT UNSIGNED NULL,
  `priority` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `activity_id` BIGINT UNSIGNED NULL,
  `last_activity_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `leads_email_unique` (`email`),
  UNIQUE INDEX `leads_phone_unique` (`phone`),
  INDEX `idx_leads_status` (`status`),
  INDEX `idx_leads_created_at` (`created_at`),
  INDEX `idx_leads_representative` (`representative_id`),
  INDEX `leads_created_at_status_index` (`created_at`, `status`),
  INDEX `leads_priority_status_index` (`priority`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. `lead_fields` - Field definitions

```sql
CREATE TABLE `lead_fields` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `label` VARCHAR(255) NOT NULL,
  `type` ENUM('text', 'select', 'multiselect', 'multiselect_dropdown', 'date', 'number', 'textarea', 'email', 'url', 'phone') NOT NULL DEFAULT 'text',
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_system_field` BOOLEAN NOT NULL DEFAULT FALSE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `section_key` VARCHAR(255) NULL,
  `placeholder` VARCHAR(255) NULL,
  `help_text` TEXT NULL,
  `default_value` VARCHAR(255) NULL,
  `validation_rules` JSON NULL,
  `options` JSON NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `lead_fields_name_unique` (`name`),
  INDEX `lead_fields_is_active_sort_order_index` (`is_active`, `sort_order`),
  INDEX `lead_fields_section_key_index` (`section_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. `lead_field_values` - Field value storage

```sql
CREATE TABLE `lead_field_values` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `lead_id` BIGINT UNSIGNED NOT NULL,
  `lead_field_id` BIGINT UNSIGNED NOT NULL,
  `value` TEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `lead_field_values_lead_id_lead_field_id_unique` (`lead_id`, `lead_field_id`),
  INDEX `lead_field_values_lead_field_id_index` (`lead_field_id`),
  FOREIGN KEY (`lead_field_id`) REFERENCES `lead_fields` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. `lead_field_options` - Select/multiselect options

```sql
CREATE TABLE `lead_field_options` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `lead_field_id` BIGINT UNSIGNED NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `lead_field_options_lead_field_id_is_active_sort_order_index` (`lead_field_id`, `is_active`, `sort_order`),
  FOREIGN KEY (`lead_field_id`) REFERENCES `lead_fields` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. `lead_form_sections` - Form organization

```sql
CREATE TABLE `lead_form_sections` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `is_visible` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_default_open` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `icon` VARCHAR(255) NOT NULL,
  `gradient` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `lead_form_sections_section_key_unique` (`section_key`),
  INDEX `lead_form_sections_sort_order_index` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. `user_assignments` - User ownership tracking

```sql
CREATE TABLE `user_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `entity_type` ENUM('lead', 'investor') NOT NULL,
  `entity_id` BIGINT UNSIGNED NOT NULL,
  `assigned_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `user_assignments_entity_unique` (`entity_type`, `entity_id`),
  INDEX `user_assignments_user_id_index` (`user_id`),
  INDEX `user_assignments_entity_index` (`entity_type`, `entity_id`),
  INDEX `user_assignments_assigned_by_index` (`assigned_by`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔗 Table Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| `leads` ↔ `lead_field_values` | One-to-Many | Lead has many custom field values |
| `lead_fields` ↔ `lead_field_values` | One-to-Many | Field definition has many values |
| `lead_fields` ↔ `lead_field_options` | One-to-Many | Field can have many options |
| `leads` ↔ `activities` | One-to-Many | Lead has many activities |
| `leads` ↔ `investors` | One-to-Many | Lead can be converted to investor(s) |
| `leads` ↔ `notes` | One-to-Many | Lead has many notes |
| `leads` ↔ `user_assignments` | One-to-One | Lead can be assigned to one user |
| `users` ↔ `user_assignments` (assigned) | One-to-Many | User can be assigned to many leads/investors |
| `users` ↔ `user_assignments` (assigner) | One-to-Many | User can assign many leads/investors |

### Foreign Key Constraints

| Table | Column | References | On Delete | On Update |
|-------|--------|------------|-----------|-----------|
| `lead_field_values` | `lead_id` | `leads(id)` | CASCADE | NO ACTION |
| `lead_field_values` | `lead_field_id` | `lead_fields(id)` | CASCADE | NO ACTION |
| `lead_field_options` | `lead_field_id` | `lead_fields(id)` | CASCADE | NO ACTION |
| `activities` | `lead_id` | `leads(id)` | CASCADE | NO ACTION |
| `notes` | `lead_id` | `leads(id)` | CASCADE | NO ACTION |
| `user_assignments` | `user_id` | `users(id)` | CASCADE | NO ACTION |
| `user_assignments` | `assigned_by` | `users(id)` | CASCADE | NO ACTION |

---

## 🔑 Key Fields

### leads Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT UNSIGNED | PRIMARY KEY | Auto-incrementing identifier |
| `full_name` | VARCHAR(255) | NOT NULL | Lead's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address (must be unique) |
| `phone` | VARCHAR(255) | UNIQUE, NOT NULL | Phone number (must be unique) |
| `source` | VARCHAR(50) | NOT NULL, DEFAULT 'website' | How lead was acquired |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'new' | Current lead status |
| `priority` | VARCHAR(50) | NULL | Priority level |
| `notes` | TEXT | NULL | Lead notes |
| `created_at` | TIMESTAMP | NULL | Record creation time |

### lead_fields Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT UNSIGNED | PRIMARY KEY | Field identifier |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Internal field name |
| `type` | ENUM | NOT NULL | Field type (text, select, etc.) |
| `is_system_field` | BOOLEAN | DEFAULT FALSE | Whether field is built-in |
| `section_key` | VARCHAR(255) | NULL | Group fields into sections |

---

## 📦 Prisma Models

```prisma
model leads {
  id                BigInt              @id @default(autoincrement()) @db.UnsignedBigInt
  full_name         String              @db.VarChar(255)
  email             String              @unique(map: "leads_email_unique") @db.VarChar(255)
  phone             String              @unique(map: "leads_phone_unique") @db.VarChar(255)
  source            String              @default("website") @db.VarChar(50)
  status            String              @default("new") @db.VarChar(50)
  representative_id BigInt?             @db.UnsignedBigInt
  priority          String?             @db.VarChar(50)
  notes_text        String?             @db.Text @map("notes")
  activity_id       BigInt?             @db.UnsignedBigInt
  last_activity_at  DateTime?           @db.Timestamp(0)
  created_at        DateTime?           @db.Timestamp(0)
  updated_at        DateTime?           @db.Timestamp(0)

  activities        activities[]
  investors         investors[]
  lead_field_values lead_field_values[]
  notes             notes[]

  @@index([created_at], map: "idx_leads_created_at")
  @@index([representative_id, status], map: "idx_leads_rep_status")
  @@index([representative_id], map: "idx_leads_representative")
  @@index([status], map: "idx_leads_status")
  @@index([status, created_at], map: "idx_leads_status_created")
  @@index([created_at, status], map: "leads_created_at_status_index")
  @@index([priority, status], map: "leads_priority_status_index")
}

model lead_fields {
  id                 BigInt               @id @default(autoincrement()) @db.UnsignedBigInt
  name               String               @unique @db.VarChar(255)
  label              String               @db.VarChar(255)
  type               lead_fields_type     @default(text)
  is_required        Boolean              @default(false)
  is_active          Boolean              @default(true)
  is_system_field    Boolean              @default(false)
  sort_order         Int                  @default(0)
  section_key        String?              @db.VarChar(255)
  placeholder        String?              @db.VarChar(255)
  help_text          String?              @db.Text
  default_value      String?              @db.VarChar(255)
  validation_rules   Json?
  options            Json?
  created_at         DateTime?            @db.Timestamp(0)
  updated_at         DateTime?            @db.Timestamp(0)

  lead_field_options lead_field_options[]
  lead_field_values  lead_field_values[]

  @@index([is_active, sort_order])
  @@index([section_key])
}

model lead_field_values {
  id            BigInt      @id @default(autoincrement()) @db.UnsignedBigInt
  lead_id       BigInt      @db.UnsignedBigInt
  lead_field_id BigInt      @db.UnsignedBigInt
  value         String?     @db.Text
  created_at    DateTime?   @db.Timestamp(0)
  updated_at    DateTime?   @db.Timestamp(0)

  lead_fields   lead_fields @relation(fields: [lead_field_id], references: [id], onDelete: Cascade)
  leads         leads       @relation(fields: [lead_id], references: [id], onDelete: Cascade)

  @@unique([lead_id, lead_field_id])
  @@index([lead_field_id])
}

model lead_field_options {
  id            BigInt      @id @default(autoincrement()) @db.UnsignedBigInt
  lead_field_id BigInt      @db.UnsignedBigInt
  value         String      @db.VarChar(255)
  label         String      @db.VarChar(255)
  sort_order    Int         @default(0)
  is_active     Boolean     @default(true)
  created_at    DateTime?   @db.Timestamp(0)
  updated_at    DateTime?   @db.Timestamp(0)

  lead_fields   lead_fields @relation(fields: [lead_field_id], references: [id], onDelete: Cascade)

  @@index([lead_field_id, is_active, sort_order])
}

model lead_form_sections {
  id               BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  section_key      String    @unique @db.VarChar(255)
  name             String    @db.VarChar(255)
  is_visible       Boolean   @default(true)
  is_default_open  Boolean   @default(true)
  sort_order       Int       @default(0)
  icon             String    @db.VarChar(255)
  gradient         String    @db.VarChar(255)
  created_at       DateTime? @db.Timestamp(0)
  updated_at       DateTime? @db.Timestamp(0)

  @@index([sort_order])
}

model user_assignments {
  id          BigInt                     @id @default(autoincrement()) @db.UnsignedBigInt
  user_id     BigInt                     @db.UnsignedBigInt
  entity_type user_assignments_entity_type
  entity_id   BigInt                     @db.UnsignedBigInt
  assigned_by BigInt                     @db.UnsignedBigInt
  created_at  DateTime?                  @db.Timestamp(0)
  updated_at  DateTime?                  @db.Timestamp(0)

  user_assigned users @relation("UserAssignments", fields: [user_id], references: [id], onDelete: Cascade)
  user_assigner users @relation("UserAssigner", fields: [assigned_by], references: [id], onDelete: Cascade)

  @@unique([entity_type, entity_id], map: "user_assignments_entity_unique")
  @@index([user_id], map: "user_assignments_user_id_index")
  @@index([entity_type, entity_id], map: "user_assignments_entity_index")
  @@index([assigned_by], map: "user_assignments_assigned_by_index")
}

enum lead_fields_type {
  text
  select
  multiselect
  multiselect_dropdown
  date
  number
  textarea
  email
  url
  phone
}

enum user_assignments_entity_type {
  lead
  investor
}
```

---

## 🔍 Query Examples

### 1. Get All Leads with Custom Fields

```typescript
const leads = await prisma.leads.findMany({
  include: {
    lead_field_values: {
      include: {
        lead_fields: {
          include: {
            lead_field_options: true
          }
        }
      }
    }
  },
  orderBy: { created_at: 'desc' },
  take: 100
})
```

### 2. Create Lead with Custom Fields

```typescript
// Create lead
const lead = await prisma.leads.create({
  data: {
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+90 555 123 4567",
    source: "website",
    status: "new",
    created_at: new Date(),
    updated_at: new Date(),
  }
})

// Create custom field values
await prisma.lead_field_values.createMany({
  data: [
    {
      lead_id: lead.id,
      lead_field_id: BigInt(1),
      value: "Real Estate",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      lead_id: lead.id,
      lead_field_id: BigInt(2),
      value: JSON.stringify(["Investment", "Consultation"]), // multiselect
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]
})
```

### 3. Update Lead and Custom Fields

```typescript
// Update lead
await prisma.leads.update({
  where: { id: BigInt(leadId) },
  data: {
    status: "contacted",
    priority: "high",
    updated_at: new Date(),
  }
})

// Delete and recreate custom field values
await prisma.lead_field_values.deleteMany({
  where: { lead_id: BigInt(leadId) }
})

await prisma.lead_field_values.createMany({
  data: customFieldValues
})
```

### 4. Filter by Custom Field

```typescript
const leads = await prisma.leads.findMany({
  where: {
    lead_field_values: {
      some: {
        lead_fields: { name: "interest_area" },
        value: "Real Estate"
      }
    }
  }
})
```

### 5. Group Leads by Status

```typescript
const statusGroups = await prisma.leads.groupBy({
  by: ['status'],
  _count: {
    id: true
  },
  orderBy: {
    _count: {
      id: 'desc'
    }
  }
})
```

### 6. Get Lead with Activities

```typescript
const lead = await prisma.leads.findUnique({
  where: { id: BigInt(leadId) },
  include: {
    activities: {
      orderBy: { created_at: 'desc' },
      take: 10
    },
    lead_field_values: {
      include: {
        lead_fields: {
          include: { lead_field_options: true }
        }
      }
    }
  }
})
```

---

## 📊 Indexes

### Performance Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| `leads` | `idx_leads_status` | `status` | Fast status filtering |
| `leads` | `idx_leads_created_at` | `created_at` | Chronological ordering |
| `leads` | `leads_email_unique` | `email` | Email uniqueness & lookups |
| `leads` | `leads_phone_unique` | `phone` | Phone uniqueness & lookups |
| `leads` | `leads_priority_status_index` | `priority, status` | Combined filtering |
| `lead_fields` | `lead_fields_is_active_sort_order_index` | `is_active, sort_order` | Active field ordering |
| `lead_form_sections` | `lead_form_sections_sort_order_index` | `sort_order` | Section ordering |
| `lead_field_values` | `lead_field_values_lead_id_lead_field_id_unique` | `lead_id, lead_field_id` | Unique field per lead |

---

## 🔐 BigInt Serialization

**Important:** MySQL `BIGINT` values must be converted to `Number` for JSON serialization.

```typescript
// ✅ Good
const serialized = {
  ...lead,
  id: Number(lead.id),
  representative_id: lead.representative_id ? Number(lead.representative_id) : null,
}

// ❌ Bad - Will cause serialization error
return NextResponse.json(lead)
```

---

## 🔄 Cascade Behavior

| Parent Table | Child Table | On Delete | Effect |
|--------------|-------------|-----------|--------|
| `leads` | `lead_field_values` | CASCADE | Deleting lead deletes all field values |
| `leads` | `activities` | CASCADE | Deleting lead deletes all activities |
| `leads` | `notes` | CASCADE | Deleting lead deletes all notes |
| `lead_fields` | `lead_field_values` | CASCADE | Deleting field deletes all values |
| `lead_fields` | `lead_field_options` | CASCADE | Deleting field deletes all options |

---

## 📌 Unique Constraints

### Email Uniqueness
- **Constraint:** `leads_email_unique`
- **Purpose:** Prevent duplicate leads with same email
- **Validation:** Server-side before creation

### Phone Uniqueness
- **Constraint:** `leads_phone_unique`
- **Purpose:** Prevent duplicate leads with same phone
- **Validation:** Server-side before creation

### Field Value Uniqueness
- **Constraint:** `lead_field_values_lead_id_lead_field_id_unique`
- **Purpose:** One value per field per lead
- **Effect:** Automatic upsert behavior

---

[← Back to README](./README.md) | [Next: API Documentation →](./API.md)
