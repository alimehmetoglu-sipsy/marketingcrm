# BUG-004: User Creation Returns 400 Error with No UI Feedback

## Test Case
**TC-PERM-MENU-001**: Full Access Role - Create user for testing

## Severity
High

## Priority
High

## Description
When attempting to create a new user through the frontend UI, the API consistently returns a 400 Bad Request error, but no error message or feedback is displayed to the user. The dialog remains open with no indication of what went wrong.

This prevents the completion of permission integration tests as test users cannot be created through the frontend interface.

## Steps to Reproduce
1. Navigate to http://localhost:3000/settings/users
2. Click "Add User" button
3. Fill in form:
   - Full Name: "Test Full Access"
   - Email: "testfullaccess@example.com"
   - Password: "password123"
   - Role: "Test Full Access User"
   - Status: Active (default)
4. Click "Create User" button
5. Observe the result

## Expected Behavior
- User should be created successfully, OR
- If validation fails, a clear error message should be displayed in the UI explaining what is wrong
- Error message should appear as a toast notification or inline form error

## Actual Behavior
- API returns 400 Bad Request with response: `{ error: "Validation error" }`
- **Request sent**: `{ name: "Test Full Access", email: "testfullaccess@example.com", phone: null, password: "password123", role_id: 6, status: "active" }`
- **Response received**: `{ status: 400, statusText: "Bad Request", ok: false, data: { error: "Validation error" } }`
- No visible error message or toast notification in the UI
- Dialog remains open with entered data
- No feedback to the user about what went wrong
- Console error: `Failed to load resource: the server responded with a status of 400 (Bad Request) @ http://localhost:3000/api/settings/users`
- User cannot determine what validation rule is failing
- **Toast notification system is silently failing** - error is caught but toast.error() does not display anything

## Impact
- **Critical for Testing**: Cannot create test users through frontend UI for permission integration testing (TC-PERM-MENU-001)
- **User Experience**: Users have no way to know why user creation is failing
- **Same Pattern as BUG-002 and BUG-003**: API validates correctly but UI doesn't show error messages

## Related Test Cases
- TC-PERM-MENU-001: Full Access Role (blocked by this bug)
- TC-PERM-MENU-002: Limited Access Role (will be blocked by this bug)
- TC-USERS-CREATE-* (All user creation tests affected)

## Additional Notes
- Tried multiple email variations: testfull@example.com, testfullaccess@example.com
- Password meets minimum 8 character requirement
- Same error handling issue as BUG-002 (duplicate role name) and BUG-003 (duplicate email)
- This appears to be a systematic issue with error handling across all form dialogs

## Root Cause Analysis
After intercepting network requests, the issue has two parts:

### Part 1: API returns generic error without details
- API returns `{ error: "Validation error" }` but WITHOUT the `details` field
- According to `/app/api/settings/users/route.ts:109-113`, Zod validation errors should return `{ error: "Validation error", details: error.errors }`
- The missing `details` field indicates the error is NOT coming from Zod validation
- This suggests a different validation or database constraint is failing

### Part 2: Toast notification is not displaying (PRIMARY BUG)
- Frontend code at `/components/settings/user-form-dialog.tsx:110-118` correctly catches the error
- Code correctly calls `toast.error(error.message || "Failed to save user")`
- Error message should be "Validation error" based on API response
- **Toast notification is silently failing to display** - this is the actual bug blocking testing

## Suggested Fix
### Frontend (Critical - Toast System Fix)
1. **Verify Sonner toast provider is properly configured** in root layout
2. Check if `<Toaster />` component is mounted in the application
3. Test toast system with a manual trigger to confirm it works
4. Add fallback inline error display if toast system is broken
5. Add console.log in catch block to debug if error is being caught

### Backend (Enhancement - Better Error Details)
1. Add server-side logging to identify which validation is failing
2. Return detailed Zod validation errors in the `details` field
3. Ensure consistent error response format across all endpoints
4. Add field-level validation error mapping

## Workaround
Database-level user creation is possible but defeats the purpose of frontend testing. Frontend UI must be functional for proper integration testing.

## Resolution
✅ **FIXED** - 2025-10-04

### Changes Made:
1. **Added Toaster component** to `/app/providers.tsx`:
   ```tsx
   import { Toaster } from "sonner"

   export function Providers({ children }: { children: React.ReactNode }) {
     return (
       <SessionProvider>
         {children}
         <Toaster />
       </SessionProvider>
     )
   }
   ```

2. **Fixed phone field null handling** in `/components/settings/user-form-dialog.tsx`:
   - Changed: `phone: formData.phone || null`
   - To: `phone: formData.phone || undefined`
   - Reason: Zod schema expects `z.string().optional()` which accepts string or undefined, NOT null

### Verification:
- ✅ User "Test Full Access" created successfully via frontend UI
- ✅ Toast notification "User created successfully" displayed
- ✅ User appears in users table with correct role assignment
- ✅ Dialog closed automatically after successful creation

### Impact on Other Bugs:
This fix likely resolves BUG-001, BUG-002, and BUG-003 as well, since they all had the same root cause: missing Toaster component preventing error messages from displaying.

## Test Status
✅ **RESOLVED**: User creation now works correctly through frontend UI. Can proceed with TC-PERM-MENU-001 and subsequent permission integration tests.
