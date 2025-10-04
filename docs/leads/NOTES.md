# Leads Module - Notes & Troubleshooting

[← Back to README](./README.md)

---

## 📋 Table of Contents

- [Important Notes](#important-notes)
- [Known Issues](#known-issues)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Future Improvements](#future-improvements)

---

## Important Notes

### 1. BigInt Serialization

**Issue:** Prisma returns `BigInt` for `BIGINT UNSIGNED` columns, which cannot be JSON serialized directly.

**Solution:**
```typescript
// ✅ Always convert BigInt to Number before JSON response
const serializedLead = {
  ...lead,
  id: Number(lead.id),
  representative_id: lead.representative_id ? Number(lead.representative_id) : null
}

return NextResponse.json(serializedLead)
```

**Files Affected:**
- `app/api/leads/route.ts`
- `app/api/leads/[id]/route.ts`
- `app/(dashboard)/leads/page.tsx`
- `app/(dashboard)/leads/[id]/page.tsx`

---

### 2. Unique Constraints

**Email & Phone Uniqueness:**
- Email must be unique across all leads
- Phone must be unique across all leads
- Server-side validation in POST/PUT endpoints

**Handling Duplicates:**
```typescript
// Check before creation
const existing Email = await prisma.leads.findUnique({
  where: { email: leadData.email }
})

if (existingEmail) {
  return NextResponse.json(
    { error: "A lead with this email already exists" },
    { status: 400 }
  )
}
```

---

### 3. System Fields vs Custom Fields

**System Fields** (stored in `leads` table):
- `source` - Lead acquisition source
- `status` - Current lead status
- `priority` - Priority level

**Custom Fields** (stored in `lead_field_values` table):
- All other fields created by users
- Multiselect fields stored as JSON arrays

**Important:** System fields are handled differently in API:
```typescript
// Extract system field values from customFields
const sourceValue = customFields?.[sourceFieldId.toString()] || "website"
const statusValue = customFields?.[statusFieldId.toString()] || "new"

// Update leads table
await prisma.leads.update({
  data: {
    source: sourceValue,
    status: statusValue,
    priority: priorityValue
  }
})

// Other custom fields go to lead_field_values
```

---

### 4. Multiselect Field Storage

**Storage Format:** JSON string array

```typescript
// Saving multiselect
value: JSON.stringify(["option1", "option2", "option3"])

// Reading multiselect
let parsedValue = []
try {
  parsedValue = JSON.parse(fieldValue.value)
} catch {
  parsedValue = []
}
```

**Display:**
```tsx
{Array.isArray(value) && value.map(val => (
  <Badge key={val} className="bg-blue-100 text-blue-700">
    {getOptionLabel(val)}
  </Badge>
))}
```

---

## Known Issues

### 1. Form Completion Tracking

**Issue:** Form completion percentage may not always reflect custom fields accurately.

**Cause:** Custom fields are loaded asynchronously and may not be counted immediately.

**Workaround:**
```typescript
const completedFields = useMemo(() => {
  // Count required contact fields
  const contactCompleted = ['full_name', 'email', 'phone'].filter(
    field => formValues[field]
  ).length

  // Count custom fields
  const customCompleted = Object.keys(customFieldValues).filter(
    key => customFieldValues[key] !== "" && customFieldValues[key] !== null
  ).length

  return {
    completed: contactCompleted + customCompleted,
    total: 3 + customFields.length
  }
}, [formValues, customFieldValues, customFields.length])
```

---

### 2. Field Section Assignment

**Issue:** Fields without `section_key` won't appear in detail view sections.

**Solution:**
- Always assign fields to sections via Settings → Lead Fields → Form Layout
- Use "Unassigned" section as fallback

---

### 3. Required Field Validation

**Issue:** Required field validation happens on server, not always on client.

**Current State:**
- Server validates required fields on POST/PUT
- Client uses React Hook Form for contact fields only

**Future Improvement:**
- Add client-side validation for all required custom fields

---

## Troubleshooting

### Problem 1: "A lead with this email already exists"

**Cause:** Attempting to create lead with duplicate email.

**Solutions:**
1. Check if lead already exists: Search in leads list
2. Use different email
3. If duplicate is intentional, modify unique constraint (not recommended)

---

### Problem 2: Custom field values not saving

**Symptoms:**
- Lead created successfully
- Custom field values missing

**Debugging:**
```typescript
console.log('Custom Fields:', customFields)
console.log('Field IDs:', Object.keys(customFields))
console.log('Is numeric?', Object.keys(customFields).map(k => !isNaN(parseInt(k))))
```

**Common Causes:**
- Field IDs passed as field names instead of numbers
- System fields not filtered out correctly
- Empty values not filtered

**Solution:**
```typescript
// Ensure field IDs are numeric
const fieldValues = Object.entries(customFields)
  .filter(([key, value]) => {
    const fieldId = parseInt(key)
    return !isNaN(fieldId) && value !== "" && value !== null
  })
  .map(([fieldId, value]) => ({
    lead_id: BigInt(id),
    lead_field_id: parseInt(fieldId),
    value: typeof value === "object" ? JSON.stringify(value) : String(value)
  }))
```

---

### Problem 3: Multiselect not displaying as badges

**Symptoms:**
- Multiselect field shows `["value1","value2"]` as text

**Cause:** Value not parsed as JSON array.

**Solution:**
```typescript
// In detail view
let parsedValue = fieldValue.value
if (typeof parsedValue === 'string' && field.type === 'multiselect') {
  try {
    parsedValue = JSON.parse(parsedValue)
  } catch {
    parsedValue = []
  }
}

// Render
{Array.isArray(parsedValue) && parsedValue.map(...)}
```

---

### Problem 4: BigInt serialization error

**Error Message:**
```
TypeError: Do not know how to serialize a BigInt
```

**Cause:** Attempting to JSON.stringify() a Prisma object with BigInt fields.

**Solution:**
```typescript
// Convert before serialization
const serialized = leads.map(lead => ({
  ...lead,
  id: Number(lead.id),
  representative_id: lead.representative_id ? Number(lead.representative_id) : null,
  activity_id: lead.activity_id ? Number(lead.activity_id) : null
}))

return NextResponse.json(serialized)
```

---

### Problem 5: Section not visible in form

**Checklist:**
- [ ] `is_visible: true` in `lead_form_sections`?
- [ ] Fields assigned to section via `section_key`?
- [ ] Fields `is_active: true`?
- [ ] Section fetched in page component?
- [ ] Browser cache cleared?

---

## Best Practices

### 1. Field Naming

```typescript
// ✅ Good - Snake case for name
{
  name: "interest_area",
  label: "Interest Area"
}

// ❌ Bad - Inconsistent casing
{
  name: "interestArea",
  label: "interest area"
}
```

---

### 2. Field Organization

- Keep total custom fields under 30 for optimal UX
- Group related fields in same section
- Use descriptive section names
- Order fields logically (most important first)

---

### 3. Validation

```typescript
// Always validate server-side
const requiredFields = await prisma.lead_fields.findMany({
  where: { is_required: true, is_active: true }
})

for (const field of requiredFields) {
  const value = customFields[field.id]
  if (!value) {
    return NextResponse.json(
      { error: `${field.label} is required` },
      { status: 400 }
    )
  }
}
```

---

### 4. Performance

```typescript
// ✅ Good - Fetch with includes
const leads = await prisma.leads.findMany({
  include: {
    lead_field_values: {
      include: { lead_fields: { include: { lead_field_options: true } } }
    }
  }
})

// ❌ Bad - N+1 queries
const leads = await prisma.leads.findMany()
for (const lead of leads) {
  lead.values = await prisma.lead_field_values.findMany({ where: { lead_id: lead.id } })
}
```

---

### 5. Error Messages

```typescript
// ✅ Good - User-friendly
{
  error: "Required fields are missing",
  details: "Please fill in: Email, Phone",
  missingFields: ["Email", "Phone"]
}

// ❌ Bad - Technical jargon
{
  error: "Prisma validation error: P2002"
}
```

---

## Future Improvements

### Planned Features

#### 1. User Assignment System (Priority: High)
- Assign leads to team members
- Track assignment history
- Filter by assigned user

**Status:** 🔄 In development (see refactor plan)

---

#### 2. Bulk Operations (Priority: Medium)
- Select multiple leads
- Bulk status update
- Bulk assignment
- Bulk export

**Implementation:**
```typescript
// UI: Checkbox column in table
// API: POST /api/leads/bulk-update
{
  leadIds: [1, 2, 3],
  updates: { status: "contacted", priority: "high" }
}
```

---

#### 3. Advanced Filtering (Priority: Medium)
- Date range filters
- Multiple filter combination (AND/OR logic)
- Save filter presets
- Share filters with team

---

#### 4. Email Integration (Priority: High)
- Send emails directly from lead detail
- Email templates
- Track email opens/clicks
- Auto-create activity on send

---

#### 5. Conversion Tracking (Priority: High)
- Lead → Investor conversion wizard
- Preserve data on conversion
- Conversion funnel analytics
- Conversion rate by source

---

#### 6. Import/Export (Priority: Medium)
- CSV import with field mapping
- Excel export with formatting
- Bulk import validation
- Import preview/confirmation

---

#### 7. Activity Auto-logging (Priority: Low)
- Auto-create activity on status change
- Auto-log email sends
- Auto-log phone calls (if integrated)

---

#### 8. Mobile App (Priority: Low)
- React Native version
- Offline support
- Push notifications for new leads

---

### Technical Debt

#### 1. Client-side validation for custom fields
- Currently only server-side
- Add Zod schema generation from field definitions

#### 2. Optimistic UI updates
- Currently full page refresh after mutations
- Implement React Query or similar for optimistic updates

#### 3. Real-time updates
- WebSocket for live lead updates
- Show when other users are editing same lead

---

## Performance Metrics

### Current Performance
- Lead list load: ~300ms (100 leads)
- Lead creation: ~500ms
- Lead update: ~400ms
- Search/Filter: ~50ms (client-side)

### Optimization Opportunities
1. Implement pagination (currently loads all)
2. Add server-side search/filter
3. Use React Query for caching
4. Lazy load custom field options

---

## Migration Notes

### From Old Lead System

If migrating from a previous system:

1. **Map old fields to new schema**
   - Create field definitions in `lead_fields`
   - Migrate data to `lead_field_values`

2. **Preserve relationships**
   - Maintain lead_id references
   - Update foreign keys

3. **Data validation**
   - Check email/phone uniqueness
   - Validate enum values for source/status/priority

4. **Testing checklist**
   - [ ] All leads imported
   - [ ] Custom fields display correctly
   - [ ] Multiselect values parse correctly
   - [ ] Activities linked properly
   - [ ] No BigInt serialization errors

---

## Support & Feedback

**Report Issues:**
- GitHub: [Project Issues](link-to-issues)
- Email: dev@example.com

**Feature Requests:**
- Use GitHub Discussions
- Include use case and mockups

---

[← Back to README](./README.md)

**Last Updated:** 2025-01-04
**Version:** 1.0.0
