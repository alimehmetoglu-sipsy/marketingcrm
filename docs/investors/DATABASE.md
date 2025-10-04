# Investors Module - Database Documentation

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

#### 1. `investors` - Core investor data

```sql
CREATE TABLE `investors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `lead_id` BIGINT UNSIGNED NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NULL UNIQUE,
  `company` VARCHAR(255) NULL,
  `position` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `industry` VARCHAR(255) NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'potential',
  `priority` VARCHAR(50) NULL,
  `budget` VARCHAR(255) NULL,
  `timeline` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `important_notes` TEXT NULL,
  `investment_preferences` TEXT NULL,
  `risk_tolerance` ENUM('low', 'medium', 'high', 'very_high') NULL,
  `communication_preferences` ENUM('email', 'phone', 'meeting', 'video_call') NULL,
  `assigned_to` BIGINT UNSIGNED NULL,
  `source` VARCHAR(255) NOT NULL DEFAULT 'other',
  `last_activity_at` TIMESTAMP NULL,
  `activity_status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `investors_phone_unique` (`phone`),
  INDEX `idx_investors_status` (`status`),
  INDEX `idx_investors_created_at` (`created_at`),
  INDEX `idx_investors_assigned_to` (`assigned_to`),
  INDEX `investors_email_index` (`email`),
  FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. `investor_fields` - Field definitions

```sql
CREATE TABLE `investor_fields` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `label` VARCHAR(255) NOT NULL,
  `type` ENUM('text', 'select', 'multiselect', 'multiselect_dropdown', 'date', 'number', 'textarea', 'email', 'url') NOT NULL DEFAULT 'text',
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_system_field` BOOLEAN NOT NULL DEFAULT FALSE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `section_key` VARCHAR(255) NULL,
  `placeholder` TEXT NULL,
  `help_text` TEXT NULL,
  `default_value` TEXT NULL,
  `validation_rules` JSON NULL,
  `options` JSON NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `investor_fields_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. `investor_field_values` - Field value storage

```sql
CREATE TABLE `investor_field_values` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `investor_id` BIGINT UNSIGNED NOT NULL,
  `investor_field_id` BIGINT UNSIGNED NOT NULL,
  `value` TEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `investor_field_values_investor_id_investor_field_id_unique` (`investor_id`, `investor_field_id`),
  INDEX `investor_field_values_investor_field_id_foreign` (`investor_field_id`),
  FOREIGN KEY (`investor_field_id`) REFERENCES `investor_fields` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`investor_id`) REFERENCES `investors` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. `investor_field_options` - Select/multiselect options

```sql
CREATE TABLE `investor_field_options` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `investor_field_id` BIGINT UNSIGNED NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `investor_field_options_investor_field_id_value_unique` (`investor_field_id`, `value`),
  FOREIGN KEY (`investor_field_id`) REFERENCES `investor_fields` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. `investor_form_sections` - Form organization

```sql
CREATE TABLE `investor_form_sections` (
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
  UNIQUE INDEX `investor_form_sections_section_key_unique` (`section_key`),
  INDEX `investor_form_sections_sort_order_index` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. `user_assignments` - User assignment tracking

```sql
CREATE TABLE `user_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` BIGINT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `user_assignments_unique` (`user_id`, `entity_type`, `entity_id`),
  INDEX `user_assignments_user_entity_index` (`user_id`, `entity_type`),
  INDEX `user_assignments_entity_index` (`entity_type`, `entity_id`),
  INDEX `user_assignments_assigned_by_index` (`assigned_by`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔗 Table Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| `investors` ↔ `leads` | Many-to-One (Optional) | Investor can be converted from a lead |
| `investors` ↔ `investor_field_values` | One-to-Many | Investor has many custom field values |
| `investor_fields` ↔ `investor_field_values` | One-to-Many | Field definition has many values |
| `investor_fields` ↔ `investor_field_options` | One-to-Many | Field can have many options |
| `investors` ↔ `activities` | One-to-Many | Investor has many activities |
| `investors` ↔ `user_assignments` | One-to-One (via entity) | Investor can be assigned to one user |

### Foreign Key Constraints

| Table | Column | References | On Delete | On Update |
|-------|--------|------------|-----------|-----------|
| `investors` | `lead_id` | `leads(id)` | NO ACTION | NO ACTION |
| `investor_field_values` | `investor_id` | `investors(id)` | CASCADE | NO ACTION |
| `investor_field_values` | `investor_field_id` | `investor_fields(id)` | CASCADE | NO ACTION |
| `investor_field_options` | `investor_field_id` | `investor_fields(id)` | CASCADE | NO ACTION |
| `activities` | `investor_id` | `investors(id)` | CASCADE | NO ACTION |
| `user_assignments` | `user_id` | `users(id)` | CASCADE | NO ACTION |
| `user_assignments` | `assigned_by` | `users(id)` | NO ACTION | NO ACTION |

---

## 🔑 Key Fields

### investors Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT UNSIGNED | PRIMARY KEY | Auto-incrementing identifier |
| `full_name` | VARCHAR(255) | NOT NULL | Investor's full name |
| `email` | VARCHAR(255) | NOT NULL | Email address |
| `phone` | VARCHAR(255) | UNIQUE, NULL | Phone number (must be unique) |
| `status` | VARCHAR(255) | NOT NULL, DEFAULT 'potential' | Current investor status |
| `priority` | VARCHAR(50) | NULL | Priority level |
| `source` | VARCHAR(255) | NOT NULL, DEFAULT 'other' | How investor was acquired |
| `created_at` | TIMESTAMP | NULL | Record creation time |

### investor_fields Table

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
model investors {
  id                        BigInt                               @id @default(autoincrement()) @db.UnsignedBigInt
  lead_id                   BigInt?                              @db.UnsignedBigInt
  full_name                 String                               @db.VarChar(255)
  email                     String                               @db.VarChar(255)
  phone                     String?                              @unique(map: "investors_phone_unique") @db.VarChar(255)
  company                   String?                              @db.VarChar(255)
  position                  String?                              @db.VarChar(255)
  status                    String                               @default("potential") @db.VarChar(255)
  priority                  String?                              @db.VarChar(50)
  source                    String                               @default("other") @db.VarChar(255)
  created_at                DateTime?                            @db.Timestamp(0)
  updated_at                DateTime?                            @db.Timestamp(0)

  activities                activities[]
  investor_field_values     investor_field_values[]
  leads                     leads?                               @relation(fields: [lead_id], references: [id])

  @@index([status])
  @@index([created_at])
  @@index([email])
}

model investor_fields {
  id                     BigInt                   @id @default(autoincrement()) @db.UnsignedBigInt
  name                   String                   @unique @db.VarChar(255)
  label                  String                   @db.VarChar(255)
  type                   investor_fields_type     @default(text)
  is_required            Boolean                  @default(false)
  is_active              Boolean                  @default(true)
  is_system_field        Boolean                  @default(false)
  sort_order             Int                      @default(0)
  section_key            String?                  @db.VarChar(255)

  investor_field_options investor_field_options[]
  investor_field_values  investor_field_values[]
}

model investor_field_values {
  id                BigInt          @id @default(autoincrement()) @db.UnsignedBigInt
  investor_id       BigInt          @db.UnsignedBigInt
  investor_field_id BigInt          @db.UnsignedBigInt
  value             String?         @db.Text

  investor_fields   investor_fields @relation(fields: [investor_field_id], references: [id], onDelete: Cascade)
  investors         investors       @relation(fields: [investor_id], references: [id], onDelete: Cascade)

  @@unique([investor_id, investor_field_id])
}

enum investor_fields_type {
  text
  select
  multiselect
  multiselect_dropdown
  date
  number
  textarea
  email
  url
}
```

---

## 🔍 Query Examples

### 1. Get All Investors with Custom Fields

```typescript
const investors = await prisma.investors.findMany({
  include: {
    investor_field_values: {
      include: {
        investor_fields: {
          include: {
            investor_field_options: true
          }
        }
      }
    }
  },
  orderBy: { created_at: 'desc' },
  take: 100
})
```

### 2. Create Investor with Custom Fields

```typescript
// Create investor
const investor = await prisma.investors.create({
  data: {
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+90 555 123 4567",
    source: "referral",
    status: "potential",
    created_at: new Date(),
    updated_at: new Date(),
  }
})

// Create custom field values
await prisma.investor_field_values.createMany({
  data: [
    {
      investor_id: investor.id,
      investor_field_id: BigInt(1),
      value: "Technology",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      investor_id: investor.id,
      investor_field_id: BigInt(2),
      value: JSON.stringify(["Software", "Hardware"]), // multiselect
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]
})
```

### 3. Update Investor and Custom Fields

```typescript
// Update investor
await prisma.investors.update({
  where: { id: BigInt(investorId) },
  data: {
    status: "active",
    priority: "high",
    updated_at: new Date(),
  }
})

// Delete and recreate custom field values
await prisma.investor_field_values.deleteMany({
  where: { investor_id: BigInt(investorId) }
})

await prisma.investor_field_values.createMany({
  data: customFieldValues
})
```

### 4. Filter by Custom Field

```typescript
const investors = await prisma.investors.findMany({
  where: {
    investor_field_values: {
      some: {
        investor_fields: { name: "industry" },
        value: "Technology"
      }
    }
  }
})
```

### 5. Get Investor with User Assignment

```typescript
const investor = await prisma.investors.findUnique({
  where: { id: BigInt(id) }
})

const assignment = await prisma.user_assignments.findFirst({
  where: {
    entity_type: "investor",
    entity_id: BigInt(id),
  },
  include: {
    user_assigned: true,
    user_assigner: true
  }
})
```

### 6. Group Investors by Status

```typescript
const statusGroups = await prisma.investors.groupBy({
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

---

## 📊 Indexes

### Performance Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| `investors` | `idx_investors_status` | `status` | Fast status filtering |
| `investors` | `idx_investors_created_at` | `created_at` | Chronological ordering |
| `investors` | `investors_email_index` | `email` | Email lookups |
| `investors` | `investors_phone_index` | `phone` | Phone lookups |
| `investor_form_sections` | `investor_form_sections_sort_order_index` | `sort_order` | Section ordering |
| `user_assignments` | `user_assignments_entity_index` | `entity_type, entity_id` | Assignment lookups |

---

## 🔐 BigInt Serialization

**Important:** MySQL `BIGINT` values must be converted to `Number` for JSON serialization.

```typescript
// ✅ Good
const serialized = {
  ...investor,
  id: Number(investor.id),
  lead_id: investor.lead_id ? Number(investor.lead_id) : null,
}

// ❌ Bad - Will cause serialization error
return NextResponse.json(investor)
```

---

## 🔄 Cascade Behavior

| Parent Table | Child Table | On Delete | Effect |
|--------------|-------------|-----------|--------|
| `investors` | `investor_field_values` | CASCADE | Deleting investor deletes all field values |
| `investors` | `activities` | CASCADE | Deleting investor deletes all activities |
| `investor_fields` | `investor_field_values` | CASCADE | Deleting field deletes all values |
| `investor_fields` | `investor_field_options` | CASCADE | Deleting field deletes all options |
| `users` | `user_assignments` (assigned) | CASCADE | Deleting user removes assignments |

---

[← Back to README](./README.md) | [Next: API Documentation →](./API.md)
