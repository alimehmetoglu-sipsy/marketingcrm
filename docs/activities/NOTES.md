# Activities System Notes

> Important details, known issues, and future improvements

[← Back to README](./README.md)

---

## 📋 İçindekiler

- [Important Details](#important-details)
- [Known Issues](#known-issues)
- [Future Improvements](#future-improvements)
- [Migration Notes](#migration-notes)

---

## Important Details

### 1. BigInt Serialization

**Problem:** Prisma BigInt değerleri JSON'a serialize edilemez.

**Solution:** Number'a dönüştürülmesi gerekir:

```typescript
const serialized = activities.map(activity => ({
  ...activity,
  id: Number(activity.id),
  lead_id: activity.lead_id ? Number(activity.lead_id) : null,
  investor_id: activity.investor_id ? Number(activity.investor_id) : null,
  activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
  assigned_to: activity.assigned_to ? Number(activity.assigned_to) : null,
  user_id: activity.user_id ? Number(activity.user_id) : null,
}))
```

**Why:** JavaScript'in JSON.stringify() BigInt'i desteklemiyor.

**Best Practice:** API response'larda her zaman serialize et.

---

### 2. Activity Type Cascade

**Behavior:** activity_type silinirse `activities.activity_type_id` SET NULL olur.

```sql
CONSTRAINT `activities_activity_type_id_foreign`
  FOREIGN KEY (`activity_type_id`)
  REFERENCES `activity_types` (`id`)
  ON DELETE SET NULL
```

**Implications:**
- ✅ Existing activities keep their data
- ✅ No cascade deletion
- ❌ Icon/color information is lost
- ❌ Type label defaults to activities.type field

**Recommendation:**
- Soft delete activity types instead of hard delete
- Add `is_active` field (already implemented)

```typescript
// ✅ Good - Soft delete
await prisma.activity_types.update({
  where: { id: BigInt(typeId) },
  data: { is_active: false }
})

// ❌ Bad - Hard delete (loses icon/color)
await prisma.activity_types.delete({
  where: { id: BigInt(typeId) }
})
```

---

### 3. Last Activity Update

**Automatic Update:** Activity oluşturulunca entity'nin `last_activity_at` otomatik güncellenir.

**For Leads:**
```typescript
if (lead_id) {
  await prisma.leads.update({
    where: { id: BigInt(lead_id) },
    data: {
      last_activity_at: new Date(),
      ...(lead_status && { status: lead_status }), // Optional
    }
  })
}
```

**For Investors:**
```typescript
if (investor_id) {
  await prisma.investors.update({
    where: { id: BigInt(investor_id) },
    data: {
      last_activity_at: new Date(),
    }
  })
}
```

**Important:** Bu güncelleme client tarafından trigger edilmez, backend API'de yapılır.

---

### 4. Lead Status Update

**Optional Field:** Lead status güncellemesi opsiyonel, sadece `lead_status` parametresi gönderilirse yapılır.

```typescript
// POST /api/activities
{
  lead_id: 123,
  type: "call",
  description: "Follow-up call",
  lead_status: "contacted" // Optional - only updates if provided
}
```

**Conditional Logic:**
```typescript
data: {
  last_activity_at: new Date(),
  ...(lead_status && { status: lead_status }), // Spread only if exists
}
```

**Valid Lead Statuses:**
- `new`
- `contacted`
- `qualified`
- `proposal`
- `negotiation`
- `won`
- `lost`

---

### 5. Activity Status Default

**Default Value:** Yeni aktiviteler default olarak `"pending"` status ile oluşur.

```typescript
// Prisma schema
status activities_status @default(pending)

// Enum values
enum activities_status {
  pending
  completed
  cancelled
}
```

**Override:** Completed aktivite oluşturmak için explicit olarak belirt:

```typescript
await prisma.activities.create({
  data: {
    // ...
    status: "completed",
    completed_at: new Date(),
  }
})
```

---

### 6. Activity Type Name Uniqueness

**Constraint:** Activity type `name` field UNIQUE constraint'e sahiptir.

```sql
UNIQUE KEY `activity_types_name_unique` (`name`)
```

**Best Practice:**
- Lowercase kullan
- Underscore ile ayır
- Descriptive olsun

```typescript
// ✅ Good
{ name: "follow_up_call" }
{ name: "client_meeting" }
{ name: "video_demo" }

// ❌ Bad
{ name: "Call" }      // Uppercase
{ name: "call 2" }    // Space
{ name: "c" }         // Not descriptive
```

---

### 7. User Assignment (Creator & Assignee)

**Current Status:** Database schema'da mevcut, UI'da kısmi implement edildi.

**Schema:**
```typescript
assigned_to BigInt?  // Assigned user
user_id     BigInt?  // Creator user
```

**Implementation:**
```typescript
// Dialog form'da assigned_to field
<FormField name="assigned_to">
  <Select>
    {users.map((user) => (
      <SelectItem value={user.id}>{user.name}</SelectItem>
    ))}
  </Select>
</FormField>
```

**Use Cases:**
- `assigned_to`: Aktiviteye atanan kullanıcı (assignee)
- `user_id`: Aktiviteyi oluşturan kullanıcı (creator)

---

## Known Issues

### 1. ~~First Name/Last Name Display~~ ✅ FIXED

**Previous Issue:** Investor detail'da first_name + last_name görünümü bazı durumlarda eksik olabilir (cache sorunu).

**Status:** ✅ Fixed - Now using `full_name` computed field

**Solution:**
```typescript
// investors table now has full_name virtual field
const investor = await prisma.investors.findUnique({
  where: { id: BigInt(id) },
  select: {
    id: true,
    full_name: true, // Computed from first_name + last_name
    // ...
  }
})
```

---

### 2. Form Completion Percentage

**Issue:** Form completion percentage bazı custom field'ları saymayabilir.

**Current Behavior:**
- Sadece required field'lar sayılıyor
- Optional field'lar contribution yapmıyor

**Workaround:**
```typescript
const totalFields = fields.filter(f => f.is_required).length
const filledFields = fields.filter(f =>
  f.is_required && fieldValues[f.id]
).length
const percentage = (filledFields / totalFields) * 100
```

**Future Fix:** All fields (required + optional) dahil edilmeli.

---

### 3. Activity Type Icon Fallback

**Issue:** Eğer `activity_types` tablosunda olmayan bir icon name varsa fallback gerekiyor.

**Current Solution:**
```typescript
export const getActivityIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return ActivityIcon
  return iconMap[iconName] || ActivityIcon // Fallback
}
```

**Improvement:** Console warning ekle:
```typescript
if (iconName && !iconMap[iconName]) {
  console.warn(`Icon not found: ${iconName}. Using default ActivityIcon.`)
}
```

---

### 4. Timezone Handling

**Issue:** Activity dates stored in UTC, display may not account for timezone.

**Current Behavior:**
```typescript
activity_date: new Date() // Stores in UTC
```

**Display:**
```typescript
{new Date(activity.created_at).toLocaleDateString()}
// Uses browser timezone
```

**Recommendation:** Use `date-fns` with timezone support:
```typescript
import { formatInTimeZone } from 'date-fns-tz'

formatInTimeZone(
  new Date(activity.created_at),
  'America/New_York',
  'PPpp'
)
```

---

## Future Improvements

### High Priority

#### 1. Activity Edit/Delete Functionality

**Current:** Activities can only be created, not edited or deleted.

**Implementation:**
```typescript
// DELETE /api/activities/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.activities.delete({
    where: { id: BigInt(params.id) }
  })

  return NextResponse.json({ success: true })
}

// PUT /api/activities/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const activity = await prisma.activities.update({
    where: { id: BigInt(params.id) },
    data: {
      description: body.description,
      status: body.status,
      // ...
    }
  })

  return NextResponse.json({ activity })
}
```

**UI Components:**
- Edit activity dialog
- Delete confirmation dialog
- Activity dropdown menu (edit/delete)

---

#### 2. Activity Filters

**Filters to Add:**
- By type (call, email, meeting, etc.)
- By date range (last 7 days, last 30 days, custom)
- By status (pending, completed, cancelled)
- By assigned user

**UI:**
```typescript
<div className="flex gap-2">
  <Select value={typeFilter} onValueChange={setTypeFilter}>
    <SelectTrigger>
      <SelectValue placeholder="Filter by type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Types</SelectItem>
      {activityTypes.map((type) => (
        <SelectItem key={type.id} value={type.name}>
          {type.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">
        <Calendar className="mr-2 h-4 w-4" />
        {dateRange ? formatDate(dateRange) : "Pick a date range"}
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </PopoverContent>
  </Popover>
</div>
```

---

#### 3. Scheduled Activities

**Feature:** Support for future scheduled activities with reminders.

**Database Changes:**
```typescript
// Already exists in schema
scheduled_at DateTime?

// Add reminder fields
reminder_at  DateTime?
reminder_sent Boolean @default(false)
```

**UI:**
```typescript
<FormField name="scheduled_at">
  <DateTimePicker
    value={scheduledAt}
    onChange={setScheduledAt}
    minDate={new Date()}
  />
</FormField>

<FormField name="reminder">
  <Checkbox
    checked={reminderEnabled}
    onCheckedChange={setReminderEnabled}
  />
  <Label>Send reminder 1 hour before</Label>
</FormField>
```

**Backend Job:**
```typescript
// cron job or queue
async function sendActivityReminders() {
  const upcomingActivities = await prisma.activities.findMany({
    where: {
      scheduled_at: {
        gte: new Date(),
        lte: addHours(new Date(), 1),
      },
      reminder_sent: false,
    }
  })

  for (const activity of upcomingActivities) {
    await sendReminderEmail(activity)
    await prisma.activities.update({
      where: { id: activity.id },
      data: { reminder_sent: true }
    })
  }
}
```

---

### Medium Priority

#### 4. Activity Templates

**Feature:** Pre-defined activity templates for common scenarios.

**Schema:**
```typescript
model activity_templates {
  id                BigInt   @id @default(autoincrement())
  name             String
  activity_type_id BigInt
  subject_template String
  description_template String
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
}
```

**Usage:**
```typescript
<Select value={templateId} onValueChange={handleTemplateSelect}>
  <SelectTrigger>
    <SelectValue placeholder="Use a template" />
  </SelectTrigger>
  <SelectContent>
    {templates.map((template) => (
      <SelectItem key={template.id} value={template.id}>
        {template.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

#### 5. Bulk Operations

**Feature:** Create multiple activities at once.

**Use Case:** Send email campaign to multiple leads.

**UI:**
```typescript
// Lead list page
<Button onClick={() => setBulkActivityOpen(true)}>
  Add Activity to Selected ({selectedLeads.length})
</Button>

<BulkActivityDialog
  open={bulkActivityOpen}
  onOpenChange={setBulkActivityOpen}
  leadIds={selectedLeads}
  onSuccess={() => router.refresh()}
/>
```

**API:**
```typescript
// POST /api/activities/bulk
const activities = leadIds.map(leadId => ({
  lead_id: BigInt(leadId),
  type: activityType,
  description: description,
  status: "completed",
}))

await prisma.activities.createMany({
  data: activities
})
```

---

#### 6. Activity Attachments

**Feature:** Attach files to activities.

**Schema:**
```typescript
model activity_attachments {
  id          BigInt    @id @default(autoincrement())
  activity_id BigInt
  file_name   String
  file_path   String
  file_size   Int
  mime_type   String
  created_at  DateTime  @default(now())

  activities  activities @relation(fields: [activity_id], references: [id], onDelete: Cascade)
}
```

**UI:**
```typescript
<FormField name="attachments">
  <FileUpload
    accept="image/*,.pdf,.doc,.docx"
    maxSize={5 * 1024 * 1024} // 5MB
    onUpload={handleFileUpload}
  />
</FormField>
```

---

### Low Priority

#### 7. Export/Import Functionality

**Feature:** Export activities to CSV/Excel.

**Implementation:**
```typescript
import { exportToCSV } from "@/lib/export-utils"

const handleExport = async () => {
  const activities = await fetch("/api/activities?investor_id=123")
  const data = await activities.json()

  exportToCSV(data.activities, "investor-activities.csv")
}
```

---

#### 8. Advanced Reporting

**Feature:** Activity analytics and insights.

**Metrics:**
- Activities per day/week/month
- Activity type distribution
- Response time analysis
- Completion rate

**UI:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Activity Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    <Tabs>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="types">By Type</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ActivityOverviewChart data={analytics} />
      </TabsContent>

      <TabsContent value="types">
        <ActivityTypeChart data={typeDistribution} />
      </TabsContent>

      <TabsContent value="timeline">
        <ActivityTimelineChart data={timelineData} />
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>
```

---

#### 9. Email Integration

**Feature:** Create activities from incoming emails.

**Implementation:**
- Webhook from email service (SendGrid, Mailgun)
- Parse email content
- Auto-create email activity

```typescript
// POST /api/webhooks/email
export async function POST(request: NextRequest) {
  const emailData = await request.json()

  // Find lead by email
  const lead = await prisma.leads.findFirst({
    where: { email: emailData.from }
  })

  if (lead) {
    await prisma.activities.create({
      data: {
        lead_id: lead.id,
        type: "email",
        activity_type_id: BigInt(2), // Email type
        subject: emailData.subject,
        description: emailData.body,
        status: "completed",
        activity_date: new Date(emailData.timestamp),
      }
    })
  }
}
```

---

#### 10. Calendar Integration

**Feature:** Sync activities with Google Calendar / Outlook.

**Implementation:**
- OAuth integration
- Sync scheduled activities
- Two-way sync (create/update)

```typescript
import { google } from "googleapis"

async function syncToGoogleCalendar(activity: Activity) {
  const calendar = google.calendar({ version: "v3", auth })

  await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: activity.subject,
      description: activity.description,
      start: { dateTime: activity.scheduled_at },
      end: { dateTime: addHours(activity.scheduled_at, 1) },
    }
  })
}
```

---

## Migration Notes

### Database Migrations

**Current Schema Version:** v2.0.0

**Migration History:**

1. **v1.0.0** - Initial activities table
2. **v1.1.0** - Added activity_types table
3. **v1.2.0** - Added activity_type_id foreign key
4. **v1.3.0** - Added assigned_to and user_id
5. **v2.0.0** - Updated cascade behaviors

**Future Migrations:**

```typescript
// Add reminder fields
ALTER TABLE activities
  ADD COLUMN reminder_at TIMESTAMP NULL,
  ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;

// Add activity templates
CREATE TABLE activity_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  activity_type_id BIGINT UNSIGNED,
  subject_template VARCHAR(255),
  description_template TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE CASCADE
);

// Add attachments
CREATE TABLE activity_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
```

---

### Seed Data

**Activity Types Seed:**

```bash
# Run seed script
npx tsx scripts/seed-activity-types.ts
```

**Expected Output:**
```
✅ Created: call (Phone, #84cc16)
✅ Created: email (Mail, #3b82f6)
✅ Created: meeting (Calendar, #8b5cf6)
✅ Created: note (FileText, #f59e0b)
✅ Created: task (CheckCircle, #10b981)
```

---

## Support & Troubleshooting

### Common Errors

#### 1. BigInt Serialization Error

**Error:**
```
TypeError: Do not know how to serialize a BigInt
```

**Solution:**
```typescript
const serialized = {
  ...activity,
  id: Number(activity.id),
}
```

---

#### 2. Activity Type Not Found

**Error:**
```
Foreign key constraint fails: activity_type_id
```

**Solution:**
```typescript
// Check activity type exists
const activityType = await prisma.activity_types.findUnique({
  where: { id: BigInt(activity_type_id) }
})

if (!activityType) {
  throw new Error("Activity type not found")
}
```

---

#### 3. Icon Not Rendering

**Error:** Icon shows as default ActivityIcon

**Solution:**
```typescript
// Check icon name in iconMap
const iconMap = {
  Phone,
  Mail,
  Calendar,
  // ... add missing icon
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-10-04 | Activity types integration, icon/color support |
| 1.3.0 | 2025-10-03 | Added user assignment (assigned_to and user_id) |
| 1.2.0 | 2025-10-02 | Added activity_type_id foreign key |
| 1.1.0 | 2025-10-01 | Added activity_types table |
| 1.0.0 | 2025-09-30 | Initial activities system |

---

[← Back to README](./README.md)

**Last Updated:** 2025-10-04
