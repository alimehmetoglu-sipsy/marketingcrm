# Activities Database Documentation

> Database schema, relations, and queries for the Activities system

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [Activities Table](#activities-table)
- [Activity Types Table](#activity-types-table)
- [Prisma Schema](#prisma-schema)
- [Key Fields](#key-fields)
- [Database Queries](#database-queries)

---

## Activities Table

### SQL Schema

```sql
CREATE TABLE `activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lead_id` bigint unsigned DEFAULT NULL,
  `investor_id` bigint unsigned DEFAULT NULL,
  `representative_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `type` varchar(255) NOT NULL,                    -- Activity type name (call, email, meeting)
  `activity_type_id` bigint unsigned DEFAULT NULL, -- FK to activity_types
  `subject` varchar(255) DEFAULT NULL,
  `description` text,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `activity_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activities_lead_id_foreign` (`lead_id`),
  KEY `activities_investor_id_foreign` (`investor_id`),
  KEY `activities_representative_id_foreign` (`representative_id`),
  KEY `activities_user_id_foreign` (`user_id`),
  KEY `activities_activity_type_id_foreign` (`activity_type_id`),
  CONSTRAINT `activities_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activities_investor_id_foreign` FOREIGN KEY (`investor_id`) REFERENCES `investors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activities_representative_id_foreign` FOREIGN KEY (`representative_id`) REFERENCES `representatives` (`id`),
  CONSTRAINT `activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `activities_activity_type_id_foreign` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_types` (`id`) ON DELETE SET NULL
);
```

### Foreign Key Constraints

| Constraint | Column | References | On Delete |
|------------|--------|------------|-----------|
| `activities_lead_id_foreign` | `lead_id` | `leads.id` | CASCADE |
| `activities_investor_id_foreign` | `investor_id` | `investors.id` | CASCADE |
| `activities_representative_id_foreign` | `representative_id` | `representatives.id` | RESTRICT |
| `activities_user_id_foreign` | `user_id` | `users.id` | RESTRICT |
| `activities_activity_type_id_foreign` | `activity_type_id` | `activity_types.id` | SET NULL |

---

## Activity Types Table

### SQL Schema

```sql
CREATE TABLE `activity_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,           -- Unique identifier (call, email, meeting)
  `label` varchar(255) NOT NULL,          -- Display name (Call, Email, Meeting)
  `icon` varchar(255) DEFAULT NULL,       -- Lucide icon name (Phone, Mail, Calendar)
  `color` varchar(50) DEFAULT NULL,       -- Hex color (#84cc16, #3b82f6)
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_types_name_unique` (`name`)
);
```

### Unique Constraints

| Constraint | Column | Description |
|------------|--------|-------------|
| `activity_types_name_unique` | `name` | Activity type identifier must be unique |

---

## Prisma Schema

### activities Model

```prisma
model activities {
  id               BigInt            @id @default(autoincrement()) @db.UnsignedBigInt
  lead_id          BigInt?           @db.UnsignedBigInt
  investor_id      BigInt?           @db.UnsignedBigInt
  representative_id BigInt?          @db.UnsignedBigInt
  user_id          BigInt?           @db.UnsignedBigInt
  type             String            @db.VarChar(255)
  activity_type_id BigInt?           @db.UnsignedBigInt
  subject          String?           @db.VarChar(255)
  description      String?           @db.Text
  status           activities_status @default(pending)
  scheduled_at     DateTime?         @db.Timestamp(0)
  completed_at     DateTime?         @db.Timestamp(0)
  activity_date    DateTime?         @db.Timestamp(0)
  created_at       DateTime?         @default(now()) @db.Timestamp(0)
  updated_at       DateTime?         @default(now()) @updatedAt @db.Timestamp(0)

  // Relations
  leads            leads?            @relation(fields: [lead_id], references: [id], onDelete: Cascade)
  investors        investors?        @relation(fields: [investor_id], references: [id], onDelete: Cascade)
  representatives  representatives?  @relation(fields: [representative_id], references: [id])
  users            users?            @relation(fields: [user_id], references: [id])
  activity_types   activity_types?   @relation(fields: [activity_type_id], references: [id], onDelete: SetNull)

  // Indexes
  @@index([lead_id])
  @@index([investor_id])
  @@index([representative_id])
  @@index([user_id])
  @@index([activity_type_id])
}
```

### activity_types Model

```prisma
model activity_types {
  id         BigInt      @id @default(autoincrement()) @db.UnsignedBigInt
  name       String      @unique @db.VarChar(255)
  label      String      @db.VarChar(255)
  icon       String?     @db.VarChar(255)
  color      String?     @db.VarChar(50)
  is_active  Boolean     @default(true)
  sort_order Int         @default(0)
  created_at DateTime?   @db.Timestamp(0)
  updated_at DateTime?   @db.Timestamp(0)

  // Relations
  activities activities[]
}
```

### Status Enum

```prisma
enum activities_status {
  pending     // Default for new activities
  completed   // Completed activities
  cancelled   // Cancelled activities
}
```

---

## Key Fields

### activities Table

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | BigInt | No | Primary key |
| `lead_id` | BigInt | Yes | Lead reference (cascade on delete) |
| `investor_id` | BigInt | Yes | Investor reference (cascade on delete) |
| `representative_id` | BigInt | Yes | Representative assigned to activity |
| `user_id` | BigInt | Yes | User who created/owns the activity |
| `type` | String | No | Activity type name (from activity_types.name) |
| `activity_type_id` | BigInt | Yes | FK to activity_types for icon/color (SET NULL on delete) |
| `subject` | String | Yes | Activity subject/title |
| `description` | Text | Yes | Detailed activity description |
| `status` | Enum | No | pending \| completed \| cancelled (default: pending) |
| `scheduled_at` | DateTime | Yes | When the activity is scheduled |
| `completed_at` | DateTime | Yes | When the activity was completed |
| `activity_date` | DateTime | Yes | Activity date/time |
| `created_at` | DateTime | Yes | Auto-generated creation timestamp |
| `updated_at` | DateTime | Yes | Auto-updated timestamp |

### activity_types Table

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | BigInt | No | Primary key |
| `name` | String | No | Unique identifier (call, email, meeting) |
| `label` | String | No | Display name (Call, Email, Meeting) |
| `icon` | String | Yes | Lucide icon name (Phone, Mail, Calendar) |
| `color` | String | Yes | Hex color code (#84cc16, #3b82f6) |
| `is_active` | Boolean | No | Active status (default: true) |
| `sort_order` | Int | No | Display order (default: 0) |
| `created_at` | DateTime | Yes | Creation timestamp |
| `updated_at` | DateTime | Yes | Last update timestamp |

---

## Database Queries

### Get Investor Activities with Types

```typescript
const activities = await prisma.activities.findMany({
  where: { investor_id: BigInt(investorId) },
  include: {
    activity_types: {
      select: {
        id: true,
        name: true,
        label: true,
        icon: true,
        color: true,
      },
    },
  },
  orderBy: { created_at: "desc" },
})
```

### Get Lead Activities with Types

```typescript
const activities = await prisma.activities.findMany({
  where: { lead_id: BigInt(leadId) },
  include: {
    activity_types: {
      select: {
        id: true,
        name: true,
        label: true,
        icon: true,
        color: true,
      },
    },
    leads: {
      select: {
        full_name: true,
        email: true,
      },
    },
  },
  orderBy: { created_at: "desc" },
})
```

### Get Active Activity Types

```typescript
const activityTypes = await prisma.activity_types.findMany({
  where: { is_active: true },
  orderBy: { sort_order: "asc" },
})
```

### Create Activity with Type

```typescript
const activity = await prisma.activities.create({
  data: {
    investor_id: BigInt(investorId),
    type: "call",
    activity_type_id: BigInt(1),
    subject: "Follow-up call",
    description: "Discussed investment opportunities",
    status: "completed",
    activity_date: new Date(),
  },
  include: {
    activity_types: true,
  },
})
```

### Update Lead/Investor Last Activity

```typescript
// Update lead
await prisma.leads.update({
  where: { id: BigInt(leadId) },
  data: {
    last_activity_at: new Date(),
    status: leadStatus, // Optional status update
  },
})

// Update investor
await prisma.investors.update({
  where: { id: BigInt(investorId) },
  data: {
    last_activity_at: new Date(),
  },
})
```

### Get Activities by Status

```typescript
const completedActivities = await prisma.activities.findMany({
  where: {
    status: "completed",
    investor_id: BigInt(investorId),
  },
  include: {
    activity_types: true,
  },
  orderBy: { activity_date: "desc" },
})
```

### Get Activities by Type

```typescript
const callActivities = await prisma.activities.findMany({
  where: {
    type: "call",
    investor_id: BigInt(investorId),
  },
  include: {
    activity_types: true,
  },
})
```

### Get Activities by Date Range

```typescript
const activitiesInRange = await prisma.activities.findMany({
  where: {
    investor_id: BigInt(investorId),
    activity_date: {
      gte: new Date("2025-01-01"),
      lte: new Date("2025-12-31"),
    },
  },
  include: {
    activity_types: true,
  },
})
```

### Count Activities by Type

```typescript
const activityCounts = await prisma.activities.groupBy({
  by: ["type"],
  where: { investor_id: BigInt(investorId) },
  _count: {
    id: true,
  },
})
```

---

## Important Notes

### BigInt Serialization

Prisma BigInt değerleri JSON'a serialize edilemez, Number'a dönüştürülmesi gerekir:

```typescript
const serialized = activities.map(activity => ({
  ...activity,
  id: Number(activity.id),
  lead_id: activity.lead_id ? Number(activity.lead_id) : null,
  investor_id: activity.investor_id ? Number(activity.investor_id) : null,
  activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
}))
```

### Cascade Behavior

- **Lead/Investor Delete:** Activities are deleted automatically (CASCADE)
- **Activity Type Delete:** activity_type_id is set to NULL (SET NULL)
- **Representative/User Delete:** Delete is prevented if activities exist (RESTRICT)

### Status Enum Values

```typescript
type ActivityStatus = "pending" | "completed" | "cancelled"

// Default value
const defaultStatus = "pending"
```

---

[← Back to README](./README.md) | [Next: API Documentation →](./API.md)
