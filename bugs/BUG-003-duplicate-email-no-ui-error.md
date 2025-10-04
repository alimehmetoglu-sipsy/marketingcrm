# BUG-003: Duplicate Email - No UI Error Message

## Test Case
**TC-USERS-CREATE-006**: Validation Tests

## Severity
Medium

## Priority
Medium

## Description
When creating a new user with a duplicate email address (e.g., "admin@example.com"), the API correctly returns a 400 Bad Request error, but no user-friendly error message is displayed in the UI. The dialog remains open with no feedback.

## Steps to Reproduce
1. Navigate to http://localhost:3000/settings/users
2. Click "Add User" button
3. Fill in form:
   - Full Name: "Test User"
   - Email: "admin@example.com" (already exists)
   - Password: "password123"
4. Click "Create User" button
5. Observe the result

## Expected Behavior
- Should display a user-friendly error message in the dialog
- Error message should state: "A user with this email already exists" or similar
- The error should appear near the Email field or as a toast notification
- Form should remain filled for user to correct

## Actual Behavior
- 400 Bad Request from API (correct)
- No visible error message in the UI
- Dialog remains open with entered data
- No feedback to the user about what went wrong
- Console error: `Failed to load resource: the server responded with a status of 400 (Bad Request)`

## Impact
Users cannot understand why their user creation failed, leading to confusion and potential duplicate submission attempts.

## Environment
- URL: http://localhost:3000/settings/users
- Browser: Playwright MCP
- Date: 2025-10-04

## Suggested Fix

### Frontend (Immediate Fix)
1. **Add error state handling in user form component**:
   ```typescript
   // In components/settings/user-form-dialog.tsx
   const [error, setError] = useState<string | null>(null)

   // In form submit handler
   try {
     const response = await fetch('/api/settings/users', {...})
     if (!response.ok) {
       const data = await response.json()
       setError(data.message || 'Failed to create user')
       return
     }
   } catch (err) {
     setError('An error occurred. Please try again.')
   }
   ```

2. **Display error message**:
   ```tsx
   {error && (
     <Alert variant="destructive">
       <AlertDescription>{error}</AlertDescription>
     </Alert>
   )}
   ```

3. **OR use toast notification**:
   ```typescript
   import { toast } from 'sonner'

   // In error handler
   toast.error(data.message || 'Email already exists')
   ```

### Backend (Enhancement)
Ensure API returns structured error messages:
```typescript
// In app/api/settings/users/route.ts
if (existingUser) {
  return NextResponse.json(
    {
      success: false,
      message: 'A user with this email already exists',
      field: 'email'
    },
    { status: 400 }
  )
}
```

## Related
- Similar to BUG-002 (Duplicate role name - no UI error)
- Both indicate missing error handling pattern in form dialogs
