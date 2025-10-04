# Investors Module - Notes & Troubleshooting Guide

> Comprehensive documentation for the Investors management system including important details, known issues, and troubleshooting steps.

**Last Updated:** 2025-10-04
**Module Version:** 1.2.0

---

## 📋 Table of Contents

- [Important Details](#-important-details)
- [Known Issues](#-known-issues)
- [Future Improvements](#-future-improvements)
- [Migration Notes](#-migration-notes)
- [Support & Troubleshooting](#-support--troubleshooting)
- [Version History](#-version-history)

---

## 🔍 Important Details

### 1. Phone Number Uniqueness Constraint

**Critical:** The `phone` field in the `investors` table has a UNIQUE constraint.

```prisma
model investors {
  phone String? @unique(map: "investors_phone_unique")
}
```

**Implications:**
- Two investors **cannot** have the same phone number
- Creating/updating investor with duplicate phone will throw error: `Unique constraint failed on the fields: (phone)`
- Phone field is **optional** but if provided, must be unique
- Empty/null phones are allowed (multiple investors can have null phone)

**Code Example:**
```typescript
// ✅ GOOD - Handle duplicate phone error
try {
  await prisma.investors.create({
    data: { phone: '+1234567890', ... }
  })
} catch (error) {
  if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
    throw new Error('Phone number already exists')
  }
}
```

**Best Practices:**
- Always validate phone uniqueness before create/update
- Show clear error message to users
- Consider adding client-side phone format validation
- Log duplicate phone attempts for analysis

---

### 2. BigInt Serialization Requirements

**Critical:** Prisma uses BigInt for auto-increment IDs, which cannot be directly serialized to JSON.

**Problem:**
```typescript
// ❌ ERROR - BigInt cannot be serialized
const investors = await prisma.investors.findMany()
return NextResponse.json(investors) // TypeError: Do not know how to serialize a BigInt
```

**Solution:**
```typescript
// ✅ GOOD - Convert BigInt to Number
const investors = await prisma.investors.findMany()
const serialized = investors.map(investor => ({
  ...investor,
  id: Number(investor.id),
  lead_id: investor.lead_id ? Number(investor.lead_id) : null,
  created_at: investor.created_at.toISOString(),
  updated_at: investor.updated_at.toISOString(),
}))
return NextResponse.json(serialized)
```

**Affected Fields:**
- `investors.id` (BigInt)
- `investors.lead_id` (BigInt, nullable)
- `investor_field_values.id` (BigInt)
- `investor_field_values.investor_id` (BigInt)

**Implementation Locations:**
- `/api/investors/route.ts` (GET, POST)
- `/api/investors/[id]/route.ts` (GET, PUT)
- `/api/settings/investor-fields/**`
- All components fetching investor data

---

### 3. Multiselect JSON Storage

**Format:** Multiselect field values are stored as JSON strings in `investor_field_values.value`

**Storage Format:**
```sql
-- In investor_field_values table
value: '["option1","option2","option3"]'  -- JSON string array
```

**Saving Logic:**
```typescript
// When saving multiselect values
const valueToStore = field.type === 'multiselect' || field.type === 'multiselect_dropdown'
  ? JSON.stringify(selectedOptions)  // Convert array to JSON string
  : String(value)                    // Store as string

await prisma.investor_field_values.upsert({
  where: { investor_id_investor_field_id: { investor_id, investor_field_id } },
  update: { value: valueToStore },
  create: { investor_id, investor_field_id, value: valueToStore }
})
```

**Reading Logic:**
```typescript
// When reading multiselect values
const fieldValue = await prisma.investor_field_values.findUnique({...})

if (field.type === 'multiselect' || field.type === 'multiselect_dropdown') {
  const parsedValue = JSON.parse(fieldValue.value)  // Parse JSON to array
  return parsedValue  // ['option1', 'option2']
} else {
  return fieldValue.value  // Return as string
}
```

**Display Logic:**
```tsx
{/* Display multiselect badges */}
{Array.isArray(value) && value.length > 0 ? (
  <div className="flex flex-wrap gap-1">
    {value.map((val, idx) => (
      <Badge key={idx} variant="secondary">
        {val}
      </Badge>
    ))}
  </div>
) : (
  <p className="text-sm text-muted-foreground">Not specified</p>
)}
```

**Supported Multiselect Types:**
- `multiselect` - Checkbox-based multiple selection
- `multiselect_dropdown` - Dropdown-based multiple selection

---

### 4. System Field Handling

**System Fields** are core fields that cannot be deleted and have special handling.

**System Fields List:**
```typescript
const SYSTEM_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'company',
  'position',
  'source',
  'status',
  'priority',
  'budget',
  'timeline',
  'notes'
]
```

**Characteristics:**
- `is_system_field: true` flag in database
- Cannot be deleted (UI hides delete button)
- Can be edited (label, placeholder, help text)
- Cannot change field type
- Pre-seeded during initial setup

**Create Page Behavior:**
```typescript
// Static fields shown at top (NOT from system fields)
- first_name + last_name (combined as Full Name)
- email
- phone

// Dynamic section shows ALL fields from investor_fields
// Including system fields like source, status, priority
```

**Edit/Detail Page Behavior:**
```typescript
// Shows ALL investor_fields in sections
// System fields displayed same as custom fields
// No special UI treatment (except delete protection)
```

**Seeding Script:**
```bash
# Initial system fields setup
npx tsx scripts/seed-investor-system-fields.ts
```

---

## 🐛 Known Issues

### Resolved Issues

| Issue | Status | Resolution | Date |
|-------|--------|-----------|------|
| First name/Last name not displaying in list | ~~ISSUE~~ ✅ **FIXED** | Added `first_name` and `last_name` columns to investors table. Updated all API endpoints and components to use new columns. | 2025-10-04 |
| Phone uniqueness causing create failures | ~~ISSUE~~ ✅ **FIXED** | Added proper error handling and user feedback for duplicate phone numbers | 2025-10-03 |
| BigInt serialization errors in API | ~~ISSUE~~ ✅ **FIXED** | Implemented Number conversion for all BigInt fields before JSON response | 2025-10-03 |
| Multiselect values not saving | ~~ISSUE~~ ✅ **FIXED** | Fixed JSON.stringify/parse logic for multiselect field types | 2025-10-02 |

### Active Issues

None currently tracked.

### Monitoring

| Issue Type | Priority | Tracking |
|------------|----------|----------|
| Phone validation edge cases | Low | Monitor user reports |
| Form completion percentage accuracy | Low | Known limitation with custom fields |
| Cache inconsistency on first_name/last_name | Low | Clear cache if issues persist |

---

## 🚀 Future Improvements

### High Priority

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **File Upload Field Type** | Support document/image uploads for investors | Medium | High |
| **Bulk Operations UI** | Select multiple investors for bulk update/delete/export | Medium | High |
| **Email Integration** | Send emails directly from investor detail page | High | High |
| **Advanced Filtering** | Range filters for budget, date range filters for timeline | Low | High |

**File Upload Field Type:**
```typescript
// Proposed structure
{
  type: 'file',
  accept: 'image/*,application/pdf',
  maxSize: 5242880, // 5MB
  storage: 's3' | 'local'
}
```

**Bulk Operations:**
- Checkbox selection in table
- Bulk actions toolbar (Delete, Export, Update Status)
- Confirmation dialogs
- Progress indicators

---

### Medium Priority

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Export Functionality** | CSV/Excel export with custom field mapping | Low | Medium |
| **Import Functionality** | Bulk import from CSV with validation | Medium | Medium |
| **Activity Timeline** | Track all investor interactions | High | Medium |
| **Email Templates** | Pre-built email templates for investor communication | Medium | Medium |
| **Calendar Integration** | Meeting scheduling with calendar sync | High | Medium |

**Export Format:**
```csv
ID,First Name,Last Name,Email,Phone,Source,Status,Priority,...CustomFields
1,John,Doe,john@example.com,+1234567890,Website,New,High,Value1,Value2
```

---

### Low Priority

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Kanban Board View** | Drag-and-drop investor status management | High | Low |
| **Advanced Reporting** | Custom reports with charts and analytics | High | Low |
| **Field Dependencies** | Show/hide fields based on other field values | Medium | Low |
| **Rich Text Editor** | HTML editor for notes and descriptions | Low | Low |
| **Automated Workflows** | Auto-assign, auto-email based on triggers | High | Low |

**Field Dependencies Example:**
```typescript
{
  field: 'investment_type',
  showIf: {
    field: 'status',
    operator: 'equals',
    value: 'Qualified'
  }
}
```

---

## 📦 Migration Notes

### Database Migrations

#### Migration: Add First Name & Last Name Columns (2025-10-04)

**Problem:** Investors only had `email` and `phone` fields, no proper name storage.

**Solution:**
```sql
-- Add columns
ALTER TABLE investors
  ADD COLUMN first_name VARCHAR(191),
  ADD COLUMN last_name VARCHAR(191);

-- Update schema
model investors {
  first_name String?
  last_name  String?
}
```

**Data Migration:**
```bash
# No data migration needed (new installation)
# For existing data, would need to split any existing name field
```

**Impact:**
- ✅ Proper name storage
- ✅ Better display in UI
- ✅ Search capability on names
- ⚠️ Requires Prisma schema update
- ⚠️ Requires API endpoint updates

---

#### Migration: Phone Unique Constraint

**Schema:**
```prisma
phone String? @unique(map: "investors_phone_unique")
```

**Rollback Plan:**
```sql
-- Remove unique constraint if needed
ALTER TABLE investors DROP INDEX investors_phone_unique;
```

**Validation:**
```bash
# Check for duplicate phones before migration
SELECT phone, COUNT(*) as count
FROM investors
WHERE phone IS NOT NULL
GROUP BY phone
HAVING count > 1;
```

---

### Seeding Scripts

#### 1. Investor System Fields Seed
```bash
npx tsx scripts/seed-investor-system-fields.ts
```

**Creates:**
- 12 system fields (first_name, last_name, email, phone, etc.)
- Proper field types and validations
- Section assignments
- Field options for select fields

**Run When:**
- Initial setup
- After database reset
- When system fields are missing

---

#### 2. Investor Form Sections Seed
```bash
npx tsx scripts/seed-investor-form-sections.ts
```

**Creates:**
- 4 default sections:
  - Contact Information
  - Investment Details
  - Professional Background
  - Additional Information

**Run When:**
- Initial setup
- After database reset
- When sections are missing

---

### Version Compatibility

| Component | Minimum Version | Current | Notes |
|-----------|----------------|---------|-------|
| Prisma | 6.16.0 | 6.16.3 | BigInt handling |
| Next.js | 15.0.0 | 15.5.4 | App Router required |
| React | 19.0.0 | 19.1.0 | Server Components |
| MySQL | 8.0 | 8.0 | JSON support needed |

---

## 🆘 Support & Troubleshooting

### Common Issues

#### Issue 1: "Phone number already exists" Error

**Symptoms:**
```
Error creating investor: Unique constraint failed on the fields: (phone)
```

**Solution:**
1. Check if phone number already exists:
```sql
SELECT id, first_name, last_name, phone
FROM investors
WHERE phone = '+1234567890';
```

2. Either:
   - Use a different phone number
   - Update the existing investor instead
   - Remove phone from the existing investor if it's wrong

**Prevention:**
- Implement client-side phone validation
- Show real-time availability check
- Add "Phone already in use" warning

---

#### Issue 2: BigInt Serialization Error

**Symptoms:**
```
TypeError: Do not know how to serialize a BigInt
```

**Solution:**
1. Find the API endpoint throwing the error
2. Add BigInt to Number conversion:
```typescript
const data = investors.map(inv => ({
  ...inv,
  id: Number(inv.id),
  lead_id: inv.lead_id ? Number(inv.lead_id) : null
}))
```

**Prevention:**
- Use helper function for all API responses:
```typescript
function serializeInvestor(investor: any) {
  return {
    ...investor,
    id: Number(investor.id),
    lead_id: investor.lead_id ? Number(investor.lead_id) : null,
    created_at: investor.created_at.toISOString(),
    updated_at: investor.updated_at.toISOString(),
  }
}
```

---

#### Issue 3: Multiselect Values Not Displaying

**Symptoms:**
- Multiselect field shows empty
- Console error: `JSON.parse unexpected token`

**Debugging Steps:**
1. Check database value:
```sql
SELECT value FROM investor_field_values
WHERE investor_id = X AND investor_field_id = Y;
```

2. Verify it's valid JSON:
```typescript
const value = fieldValue.value
try {
  const parsed = JSON.parse(value)
  console.log('Parsed:', parsed)
} catch (error) {
  console.error('Invalid JSON:', value)
}
```

**Solution:**
- Re-save the field with proper JSON format
- Update the value manually if needed:
```sql
UPDATE investor_field_values
SET value = '["option1","option2"]'
WHERE id = X;
```

---

#### Issue 4: Custom Fields Not Showing in Form

**Symptoms:**
- Field exists in database but not in UI
- Section appears empty

**Checklist:**
1. ✅ Check field is active:
```sql
SELECT id, name, is_active FROM investor_fields WHERE id = X;
```

2. ✅ Check section assignment:
```sql
SELECT section_key FROM investor_fields WHERE id = X;
```

3. ✅ Check section is visible:
```sql
SELECT is_visible FROM investor_form_sections WHERE section_key = 'X';
```

4. ✅ Clear browser cache and refresh

**Fix:**
```sql
-- Activate field
UPDATE investor_fields SET is_active = 1 WHERE id = X;

-- Assign to section
UPDATE investor_fields SET section_key = 'investment_details' WHERE id = X;

-- Make section visible
UPDATE investor_form_sections SET is_visible = 1 WHERE section_key = 'investment_details';
```

---

### Database Queries

#### Get Investor with All Custom Fields
```sql
SELECT
  i.*,
  ifv.investor_field_id,
  if.name as field_name,
  if.label as field_label,
  if.type as field_type,
  ifv.value as field_value
FROM investors i
LEFT JOIN investor_field_values ifv ON i.id = ifv.investor_id
LEFT JOIN investor_fields if ON ifv.investor_field_id = if.id
WHERE i.id = 1;
```

#### Find Duplicate Phone Numbers
```sql
SELECT phone, COUNT(*) as count, GROUP_CONCAT(id) as investor_ids
FROM investors
WHERE phone IS NOT NULL
GROUP BY phone
HAVING count > 1;
```

#### List All Active Custom Fields by Section
```sql
SELECT
  ifs.name as section_name,
  ifs.sort_order as section_order,
  if.id,
  if.name,
  if.label,
  if.type,
  if.is_required,
  if.sort_order as field_order
FROM investor_fields if
JOIN investor_form_sections ifs ON if.section_key = ifs.section_key
WHERE if.is_active = 1 AND ifs.is_visible = 1
ORDER BY ifs.sort_order, if.sort_order;
```

#### Get Investor Field Statistics
```sql
SELECT
  if.label,
  COUNT(DISTINCT ifv.investor_id) as usage_count,
  COUNT(DISTINCT CASE WHEN ifv.value != '' THEN ifv.investor_id END) as filled_count
FROM investor_fields if
LEFT JOIN investor_field_values ifv ON if.id = ifv.investor_field_id
WHERE if.is_active = 1
GROUP BY if.id, if.label
ORDER BY usage_count DESC;
```

---

### Performance Optimization

#### Query Optimization Tips

1. **Use Proper Indexes:**
```sql
-- Add index on frequently queried fields
CREATE INDEX idx_investors_status ON investors(status);
CREATE INDEX idx_investors_source ON investors(source);
CREATE INDEX idx_investor_field_values_lookup
  ON investor_field_values(investor_id, investor_field_id);
```

2. **Batch Field Values:**
```typescript
// Instead of N queries
for (const investor of investors) {
  const fieldValues = await prisma.investor_field_values.findMany({
    where: { investor_id: investor.id }
  })
}

// Use single query
const allFieldValues = await prisma.investor_field_values.findMany({
  where: { investor_id: { in: investors.map(i => i.id) } }
})
```

3. **Pagination Best Practices:**
```typescript
// Use cursor-based pagination for large datasets
const investors = await prisma.investors.findMany({
  take: 50,
  skip: 1,
  cursor: { id: lastInvestorId },
  orderBy: { created_at: 'desc' }
})
```

---

### Debugging Tools

#### Enable Prisma Query Logging
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

#### API Response Logging
```typescript
// middleware.ts or API route
console.log('Request:', {
  method: req.method,
  url: req.url,
  body: req.body
})

console.log('Response:', {
  status: res.status,
  data: JSON.stringify(data).substring(0, 200)
})
```

#### Client-Side Debugging
```typescript
// components/investors/investor-form-client.tsx
useEffect(() => {
  console.log('Form State:', {
    staticData,
    dynamicFields,
    errors: form.formState.errors
  })
}, [staticData, dynamicFields, form.formState])
```

---

## 📊 Version History

| Version | Date | Changes | Migration Required |
|---------|------|---------|-------------------|
| **1.2.0** | 2025-10-04 | - Added user assignment system<br>- Added "Assigned To" column in list<br>- Added filter by assigned user<br>- Improved detail page layout | ✅ Yes - Run `npx prisma db push` |
| **1.1.0** | 2025-10-04 | - Added first_name and last_name columns<br>- Updated all components to use new columns<br>- Fixed name display in list and detail pages<br>- Updated API endpoints | ✅ Yes - DB schema change |
| **1.0.1** | 2025-10-03 | - Fixed phone uniqueness handling<br>- Improved error messages<br>- Added BigInt serialization helper | ❌ No |
| **1.0.0** | 2025-10-02 | - Initial investor module release<br>- Dynamic custom fields<br>- Form sections support<br>- CRUD operations | ✅ Yes - Initial setup |

---

## 📞 Support Contacts

**Technical Issues:**
- Check this documentation first
- Review error logs in browser console
- Check Prisma logs for database issues

**Database Issues:**
```bash
# Access MySQL container
docker exec -it crm_mysql mysql -u crm_user -psecret crm_single

# View recent errors
docker logs crm_mysql --tail 100
```

**Prisma Issues:**
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (CAUTION: deletes all data)
npx prisma db push --force-reset

# View Prisma studio (GUI)
npx prisma studio
```

---

## 🔗 Related Documentation

- [Lead Fields Documentation](/docs/leads/FIELDS.md)
- [API Documentation](/docs/api/README.md)
- [Database Schema](/docs/database/SCHEMA.md)
- [Component Library](/docs/components/README.md)

---

**Document Version:** 1.0
**Maintained By:** Marketing CRM Team
**Last Review:** 2025-10-04
