# BUG-001: Role Name Length Validation Missing

## Test Case
**TC-ROLES-CREATE-005**: Validation Tests

## Severity
Medium

## Priority
High

## Status
Open

## Date Found
2025-10-04

## Environment
- Application: Marketing CRM
- URL: http://localhost:3000/settings/roles
- Browser: Playwright (Chromium)
- User: admin@example.com

## Description
When creating a new role with a very long name (>255 characters), the application returns a 500 Internal Server Error instead of showing a proper validation error message to the user.

## Steps to Reproduce
1. Navigate to http://localhost:3000/settings/roles
2. Click "Create Role" button
3. Enter a very long role name (>255 characters):
   ```
   This is a very long role name that exceeds the maximum allowed length of 255 characters to test validation. This is a very long role name that exceeds the maximum allowed length of 255 characters to test validation. This is a very long role name that exceeds the maximum allowed length of 255 characters to test validation.
   ```
4. Click "Create Role" button
5. Observe the result

## Expected Behavior
- Frontend should validate the role name length before submission
- Should show a user-friendly error message like: "Role name must be less than 255 characters"
- Should prevent the form submission
- No server error should occur

## Actual Behavior
- 500 Internal Server Error from API
- No user-friendly error message
- Dialog remains open with entered data
- Console error: `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`

## Technical Details
- **API Endpoint**: POST /api/settings/roles
- **Error Type**: 500 Internal Server Error
- **Frontend Component**: Create Role Dialog (role-form-dialog.tsx)
- **Expected Validation**: maxLength: 255 on role name field

## Screenshots
- TC-ROLES-CREATE-005-02-long-name-error.png

## Suggested Fix
1. **Frontend (Immediate Fix)**:
   - Add `maxLength: 255` validation to role name field in the form schema
   - Add character counter below the field
   - Show validation error before submission

2. **Backend (Additional Fix)**:
   - Add proper error handling for database constraints
   - Return 400 Bad Request with proper error message instead of 500
   - Validate input length before database operation

## Example Code Fix
```typescript
// In role-form-dialog.tsx or similar
const formSchema = z.object({
  name: z.string()
    .min(1, "Role name is required")
    .max(255, "Role name must be less than 255 characters"),
  // ... other fields
})
```

## Impact
- Poor user experience
- No clear feedback about what went wrong
- Users might retry multiple times
- Server errors logged unnecessarily

## Related Tests
- TC-ROLES-CREATE-005: Validation Tests (Step: Test very long name validation)

## Notes
- The slug field also needs length validation (currently auto-generates from name)
- Same validation should be applied to Edit Role dialog
- Similar validation needed for description field if it has length limits
