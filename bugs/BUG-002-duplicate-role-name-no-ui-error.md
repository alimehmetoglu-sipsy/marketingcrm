# BUG-002: Duplicate Role Name - No UI Error Message

## Test Case
**TC-ROLES-CREATE-005**: Validation Tests

## Severity
Medium

## Priority
Medium

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
When creating a new role with a duplicate name (e.g., "Admin"), the API correctly returns a 400 Bad Request error, but no user-friendly error message is displayed in the UI. The dialog remains open with no feedback.

## Steps to Reproduce
1. Navigate to http://localhost:3000/settings/roles
2. Click "Create Role" button
3. Enter "Admin" in the Role Name field (a role that already exists)
4. Click "Create Role" button
5. Observe the result

## Expected Behavior
- Should display a user-friendly error message in the dialog
- Error message should state: "A role with this name already exists" or similar
- The error should appear near the Role Name field or as a toast notification
- User should be able to correct the error without reloading

## Actual Behavior
- 400 Bad Request from API (correct)
- No visible error message in the UI
- Dialog remains open with entered data
- No feedback to the user about what went wrong
- Console error: `Failed to load resource: the server responded with a status of 400 (Bad Request)`

## Technical Details
- **API Endpoint**: POST /api/settings/roles
- **Error Type**: 400 Bad Request (correct status code)
- **Frontend Component**: Create Role Dialog (role-form-dialog.tsx)
- **Missing**: Error state handling and display in frontend

## Screenshots
- TC-ROLES-CREATE-005-03-duplicate-name.png

## Suggested Fix
1. **Frontend Error Handling**:
   - Catch the 400 error response
   - Parse the error message from API
   - Display error using toast notification (Sonner) or form field error
   - Example:
     ```typescript
     try {
       await createRole(data);
       toast.success("Role created successfully");
       onSuccess();
     } catch (error) {
       const message = error.response?.data?.message || "Failed to create role";
       toast.error(message);
       // OR set form field error:
       form.setError("name", { message });
     }
     ```

2. **Backend (Optional Enhancement)**:
   - Ensure error response has clear message:
     ```json
     {
       "error": "A role with this name already exists",
       "field": "name"
     }
     ```

## Impact
- Poor user experience
- Users don't understand why the role wasn't created
- Users might retry multiple times thinking it's a loading issue
- Confusion about whether the action succeeded or failed

## Related Tests
- TC-ROLES-CREATE-005: Validation Tests (Step: Test duplicate role name validation)

## Notes
- This applies to slug uniqueness as well (should be tested)
- Same error handling should be implemented in Edit Role dialog
- Consider showing inline error under the field instead of just toast
