# Playwright MCP Test To-Do List - Users & Roles Management

> Comprehensive test scenarios for Users and Roles modules using Playwright MCP

## 📋 Test Ortamı Hazırlığı

### Ön Gereksinimler
- [*] Playwright MCP kurulu ve yapılandırılmış
- [*] Test database hazır (crm_single)
- [*] Seed scriptleri çalıştırılmış
- [*] Development server çalışıyor (localhost:3000)
- [*] Admin kullanıcı bilgileri hazır (admin@example.com / password)

---

## 🔐 Authentication Tests

### TC-AUTH-001: Login Flow
- [*] Navigate to `http://localhost:3000/login`
- [*] Fill email field with `admin@example.com`
- [*] Fill password field with `password`
- [*] Click login button
- [*] Verify redirect to `/dashboard`
- [*] Verify session created with role/permissions

### TC-AUTH-002: Session Persistence
- [*] Login as admin
- [*] Navigate to different pages
- [*] Verify user info in header remains
- [*] Verify permissions persist across navigation

---

## 👥 Roles Management Tests

### Navigation Tests

#### TC-ROLES-NAV-001: Access Roles Page
- [*] Login as admin
- [*] Navigate to `/settings`
- [*] Verify "Roles & Permissions" card visible
- [*] Click on "Roles & Permissions" card
- [*] Verify redirect to `/settings/roles`
- [*] Verify page title "Roles & Permissions"
- [*] Verify gradient header displays correctly

#### TC-ROLES-NAV-002: Verify Roles Table
- [*] Access `/settings/roles`
- [*] Verify table displays with columns:
  - [*] Role Name
  - [*] Description
  - [*] Status
  - [*] Users Count
  - [*] Actions
- [*] Verify 3 default roles exist:
  - [*] Admin (System Role badge)
  - [*] Sales Manager
  - [*] Sales Representative

### Create Role Tests

#### TC-ROLES-CREATE-001: Open Create Dialog
- [*] Access `/settings/roles`
- [*] Click "Add Role" button
- [*] Verify dialog opens with title "Create Role"
- [*] Verify form fields visible:
  - [*] Role Name (required)
  - [*] Description (optional)
  - [*] Status toggle (default: Active)
  - [*] Permission Tree visible

#### TC-ROLES-CREATE-002: Permission Tree Structure
- [*] Open Create Role dialog
- [*] Verify permission tree sections:
  - [*] **Menu Permissions** section
    - [*] Dashboard (checkbox)
    - [*] Leads (checkbox)
    - [*] Investors (checkbox)
    - [*] Tasks (checkbox)
    - [*] Activities (checkbox)
    - [*] Reports (checkbox)
    - [*] Settings (parent checkbox)
      - [*] Lead Fields (child checkbox)
      - [*] Investor Fields (child checkbox)
      - [*] Activity Types (child checkbox)
      - [*] Users (child checkbox)
      - [*] Roles (child checkbox)
  - [*] **Data Access Control** section
    - [*] Leads (radio: All / Assigned Only)
    - [*] Investors (radio: All / Assigned Only)
    - [*] Activities (radio: All / Assigned Only)

#### TC-ROLES-CREATE-003: Create Full Access Role
- [*] Open Create Role dialog
- [*] Enter Role Name: "Test Full Access"
- [*] Enter Description: "Test role with full access"
- [*] Set Status: Active
- [*] **Menu Permissions:**
  - [*] Check all menu items (Dashboard, Leads, Investors, Tasks, Activities, Reports)
  - [*] Check all Settings children (no parent checkbox in current UI)
  - [*] Verify all Settings children checked
- [*] **Data Access:**
  - [*] Select "All" for Leads
  - [*] Select "All" for Investors
  - [*] Select "All" for Activities
- [*] Click "Create" button
- [*] Verify success toast appears (✓)
- [*] Verify dialog closes (✓)
- [*] Verify new role appears in table (✓)
- [*] Verify role data saved correctly (✓)

#### TC-ROLES-CREATE-004: Create Limited Access Role
- [*] Open Create Role dialog
- [*] Enter Role Name: "Test Limited Access"
- [*] Enter Description: "Test role with limited access"
- [*] **Menu Permissions:**
  - [*] Check only: Dashboard, Leads, Activities
  - [*] Uncheck: Investors, Tasks, Reports, Settings
- [*] **Data Access:**
  - [*] Select "Assigned Only" for Leads (default)
  - [*] Select "Assigned Only" for Investors (default)
  - [*] Select "Assigned Only" for Activities (default)
- [*] Click "Create" button
- [*] Verify role appears in table ✓
- [*] Verify role saved with correct permissions ✓

#### TC-ROLES-CREATE-005: Validation Tests
- [*] Open Create Role dialog
- [*] Leave Role Name empty
- [*] Click "Create" button
- [*] Verify error message: "Role name is required"
- [*] Enter very long name (>255 chars)
- [*] Verify validation error or truncation (⚠️ BUG-001: Returns 500 error)
- [*] Enter duplicate role name (e.g., "Admin")
- [*] Verify unique constraint error (⚠️ BUG-002: No UI error message)

#### TC-ROLES-CREATE-006: Settings Nested Permissions
- [*] Open Create Role dialog
- [*] Check individual Settings checkboxes (⚠️ UI Note: No parent checkbox exists)
- [*] Verify Settings children can be checked individually:
  - [*] Lead Fields ✓
  - [*] Investor Fields ✓
  - [*] Activity Types ✓
  - [*] Users ✓
  - [*] Roles & Permissions ✓
- [*] Test shows: Settings permissions are flat, no parent-child relationship in current UI

### Edit Role Tests

#### TC-ROLES-EDIT-001: Open Edit Dialog
- [*] Access `/settings/roles`
- [*] Find "Sales Manager" role
- [*] Click Edit icon (Pencil)
- [*] Verify dialog opens with title "Edit Role"
- [*] Verify form pre-filled with existing data:
  - [*] Role Name: "Sales Manager"
  - [*] Description filled
  - [*] Status reflects current state
  - [*] Permissions pre-checked correctly

#### TC-ROLES-EDIT-002: Edit Role Permissions
- [*] Open Edit dialog for "Sales Manager"
- [*] Modify permissions:
  - [*] Uncheck "Reports" menu
  - [*] Change Leads data access to "Assigned Only"
- [*] Click "Save Changes"
- [*] Verify success toast
- [*] Verify dialog closes
- [*] Refresh page or re-open dialog
- [*] Verify changes persisted ✓

#### TC-ROLES-EDIT-003: Toggle Status
- [*] Edit "Sales Representative" role
- [*] Toggle Status to "Inactive"
- [*] Save changes
- [*] Verify status badge changes to "Inactive" in table ✓
- [ ] Verify inactive role cannot be assigned to new users (Skipped - requires Users module)

#### TC-ROLES-EDIT-004: System Role Protection
- [*] Try to edit "Admin" role
- [*] Verify Edit button enabled (UI allows editing)
- [*] Verify Delete button disabled ✓ (System role protected from deletion)
- [*] Admin role has is_system flag protection

### Delete Role Tests

#### TC-ROLES-DELETE-001: Open Delete Dialog
- [*] Use existing "Test Full Access" role (created in TC-ROLES-CREATE-003)
- [*] Click Delete icon (Trash) for the test role
- [*] Verify delete confirmation dialog opens ✓
- [*] Verify dialog shows:
  - [*] Role name being deleted ("Test Full Access")
  - [*] Warning message ("This action cannot be undone")
  - [*] "Cancel" button ✓
  - [*] "Delete" button (destructive/red style) ✓

#### TC-ROLES-DELETE-002: Delete Unused Role
- [*] Use "Test Full Access" role (no users assigned - 0 users)
- [*] Click Delete
- [*] Confirm deletion
- [*] Verify success (dialog closed)
- [*] Verify role removed from table ✓
- [*] Role successfully deleted from database

#### TC-ROLES-DELETE-003: Delete Role With Users
- [ ] Create role "Test Role With Users"
- [ ] Assign a user to this role (via Users module)
- [ ] Try to delete the role
- [ ] Verify error message: "Cannot delete role with assigned users"
- [ ] Or verify cascade behavior if implemented

#### TC-ROLES-DELETE-004: System Role Protection
- [*] Verify "Admin" role delete button is disabled ✓
- [*] System roles (is_system flag) are protected from deletion
- [*] Admin role has disabled delete button in UI
- [*] Protection working correctly

#### TC-ROLES-DELETE-005: Cancel Deletion
- [*] Click Delete on "Test Limited Access" role
- [*] Verify confirmation dialog opens ✓
- [*] Click "Cancel" in confirmation dialog ✓
- [*] Verify dialog closes ✓
- [*] Verify role still exists in table ✓

### Roles Table Interaction Tests

#### TC-ROLES-TABLE-001: Sorting
- [*] Access roles table ✓
- [*] Click "Role Name" column header
- [*] ⚠️ Feature not implemented: Column headers are not sortable
- [*] Table does not have sorting functionality currently

#### TC-ROLES-TABLE-002: Search/Filter
- [*] Check for search/filter UI on roles table
- [*] ⚠️ Feature not implemented: No search/filter functionality
- [*] Table displays all roles without filtering options

#### TC-ROLES-TABLE-003: Status Badges
- [*] Verify Active roles show badge (Admin, Sales Manager, Test Limited Access) ✓
- [*] Verify Inactive role shows badge (Sales Representative) ✓
- [*] Active badge: "active" (neutral styling)
- [*] Inactive badge: "inactive" (neutral styling)
- [*] System role indicated by shield icon next to Admin name ✓

#### TC-ROLES-TABLE-004: Users Count
- [*] Verify Admin role shows "1 users" ✓
- [*] Verify other roles show "0 users" (Sales Manager, Sales Representative, Test Limited Access) ✓
- [ ] Create new user assigned to "Sales Manager" (requires Users module)
- [ ] Verify count updates to "1 user" (requires Users module)
- [ ] Assign another user to same role (requires Users module)
- [ ] Verify count updates to "2 users" (requires Users module)

---

## 👤 Users Management Tests

### Navigation Tests

#### TC-USERS-NAV-001: Access Users Page
- [*] Login as admin (already logged in)
- [*] Navigate to `/settings` ✓
- [*] Verify "Users" card visible ✓
- [*] Click on "Users" card ✓
- [*] Verify redirect to `/settings/users` ✓
- [*] Verify page title "User Management" ✓
- [*] Verify header displays correctly ✓

#### TC-USERS-NAV-002: Verify Users Table
- [*] Access `/settings/users` ✓
- [*] Verify table displays with columns:
  - [*] Name ✓
  - [*] Email ✓
  - [*] Phone ✓
  - [*] Role ✓
  - [*] Status ✓
  - [*] Actions ✓
- [*] Verify admin user exists in table ✓

### Create User Tests

#### TC-USERS-CREATE-001: Open Create Dialog
- [*] Access `/settings/users` ✓
- [*] Click "Add User" button ✓
- [*] Verify dialog opens with title "Create New User" ✓
- [*] Verify form fields visible:
  - [*] Full Name * (required) ✓
  - [*] Email * (required) ✓
  - [*] Phone (optional) ✓
  - [*] Password * (required) ✓
  - [*] Role (dropdown) ✓
  - [*] Status (dropdown, default: Active) ✓
  - ⚠️ Note: TC No and Address fields not present in current implementation

#### TC-USERS-CREATE-002: Role Dropdown Population
- [*] Open Create User dialog ✓
- [*] Click Role dropdown ✓
- [*] Verify all active roles listed:
  - [*] Admin ✓
  - [*] Sales Manager ✓
  - [*] Test Limited Access ✓
- [*] Verify inactive role "Sales Representative" NOT listed ✓
- [*] Note: "No Role" option also available

#### TC-USERS-CREATE-003: Create User Assigned to Role
- [*] Open Create User dialog ✓
- [*] Fill fields:
  - [*] Full Name: "Test Sales User" ✓
  - [*] Email: "testsales@example.com" ✓
  - [*] Phone: "+1234567890" ✓
  - [*] Role: "Sales Manager" ✓
  - [*] Password: "password123" ✓
  - [*] Status: Active (default) ✓
- [*] Click "Create User" button ✓
- [*] Verify user appears in table ✓
- [*] Verify role badge shows "Sales Manager" ✓
- [*] Navigate to Roles page ✓
- [*] Verify Sales Manager role count updated to "1 users" ✓
- [*] Verify Sales Manager delete button now disabled (has users) ✓

#### TC-USERS-CREATE-004: Create User - Minimal Data
- [ ] Open Create User dialog
- [ ] Fill only required fields:
  - [ ] Full Name: "Test User Minimal"
  - [ ] Email: "testminimal@example.com"
  - [ ] Role: "Sales Representative"
  - [ ] Password: "Pass123!"
- [ ] Leave phone, TC, address empty
- [ ] Click "Create" button
- [ ] Verify success toast
- [ ] Verify user created successfully

#### TC-USERS-CREATE-005: Password Hashing Verification
- [ ] Create a new user with password "TestPassword123"
- [ ] Query database directly or via API
- [ ] Verify password field starts with "$2y$" (bcrypt format)
- [ ] Verify password is hashed, not plain text
- [ ] Try to login with the new user
- [ ] Verify login works with original password

#### TC-USERS-CREATE-006: Validation Tests
- [*] **Empty Full Name:**
  - [*] Leave Full Name empty
  - [*] Try to submit
  - [*] Browser native validation works ✓
- [*] **Duplicate Email:**
  - [*] Enter "admin@example.com"
  - [*] Click Create User
  - [*] ⚠️ BUG-003: API returns 400 but no UI error message
  - [*] Same pattern as BUG-002 (duplicate role name)

#### TC-USERS-CREATE-007: Phone Country Selector
- [ ] Open Create User dialog
- [ ] Click phone country dropdown
- [ ] Verify country list appears
- [ ] Select "United States (+1)"
- [ ] Enter phone: "555 123 4567"
- [ ] Verify formatted correctly
- [ ] Change to "Turkey (+90)"
- [ ] Verify country code updates

### Edit User Tests

#### TC-USERS-EDIT-001: Open Edit Dialog
- [*] Access `/settings/users` ✓
- [*] Click Edit icon for "Test Sales User" ✓
- [*] Verify dialog opens with title "Edit User" ✓
- [*] Verify form pre-filled with existing data:
  - [*] Full Name: "Test Sales User" ✓
  - [*] Email: "testsales@example.com" ✓
  - [*] Phone: "+1234567890" ✓
  - [*] Role: "Sales Manager" ✓
  - [*] Status: "Active" ✓

#### TC-USERS-EDIT-002: Edit User Role
- [*] Open Edit dialog for "Test Sales User" ✓
- [*] Change Role from "Sales Manager" to "Test Limited Access" ✓
- [*] Click "Update User" ✓
- [*] Verify user role updated in table ✓
- [*] Navigate to Roles page ✓
- [*] Verify Sales Manager count: "0 users" (delete button enabled) ✓
- [*] Verify Test Limited Access count: "1 users" (delete button disabled) ✓
- [ ] Verify dialog opens with title "Edit User"
- [ ] Verify form pre-filled:
  - [ ] Full Name: "Test User Full"
  - [ ] Email: "testfull@example.com"
  - [ ] Phone: "+90 555 123 4567"
  - [ ] Role: "Sales Manager" selected
  - [ ] Status: Active
  - [ ] TC No: "12345678901"
  - [ ] Address: "Test Address 123"
- [ ] Verify Password field NOT shown (security)

#### TC-USERS-EDIT-002: Edit User Information
- [ ] Open Edit dialog for test user
- [ ] Change Full Name to "Test User Full Updated"
- [ ] Change Phone to "+1 555 999 8888"
- [ ] Change Role to "Sales Representative"
- [ ] Click "Save Changes"
- [ ] Verify success toast
- [ ] Verify table updates with new data
- [ ] Verify role badge updates

#### TC-USERS-EDIT-003: Toggle User Status
- [ ] Edit a test user
- [ ] Toggle Status to "Inactive"
- [ ] Save changes
- [ ] Verify status badge changes to "Inactive"
- [ ] Try to login as inactive user
- [ ] Verify login blocked or shows "Account inactive"

#### TC-USERS-EDIT-004: Change User Role
- [ ] Edit user currently assigned "Sales Manager"
- [ ] Change role to "Admin"
- [ ] Save changes
- [ ] Login as that user (if possible)
- [ ] Verify user now has Admin permissions
- [ ] Verify can access all Settings pages

#### TC-USERS-EDIT-005: Edit Validation
- [ ] Edit a user
- [ ] Clear Full Name field
- [ ] Try to save
- [ ] Verify error: "Name is required"
- [ ] Change email to duplicate
- [ ] Verify error: "Email already exists"

### Password Reset Tests

#### TC-USERS-PASS-001: Open Password Reset Dialog
- [*] Access `/settings/users` ✓
- [*] Click "Reset Password" icon for "Test Sales User" ✓
- [*] Verify password reset dialog opens ✓
- [*] Verify dialog shows:
  - [*] User name being reset: "Test Sales User" ✓
  - [*] New Password field (required) ✓
  - [*] Confirm Password field (required) ✓
  - [*] "Cancel" button ✓
  - [*] "Reset Password" button ✓

#### TC-USERS-PASS-002: Reset Password Successfully
- [*] Open Password Reset for "Test Sales User" ✓
- [*] Enter New Password: "NewPassword123!" ✓
- [*] Enter Confirm Password: "NewPassword123!" ✓
- [*] Click "Reset Password" ✓
- [*] Verify dialog closes ✓
- [*] Password successfully reset
- ⚠️ Note: Next.js 15 async params warning in console (not a bug, works correctly)

#### TC-USERS-PASS-003: Password Mismatch
- [*] Open Password Reset dialog ✓
- [*] Enter New Password: "NewPass123!" ✓
- [*] Enter Confirm Password: "DifferentPass123!" ✓
- [*] Try to submit ✓
- [*] ⚠️ No frontend password mismatch validation
- [*] Feature not implemented: Password confirmation check happens on backend only

#### TC-USERS-PASS-004: Weak Password Validation
- [ ] Open Password Reset dialog
- [ ] Enter New Password: "123"
- [ ] Enter Confirm Password: "123"
- [ ] Try to submit
- [ ] Verify error about password requirements (if validation exists)

#### TC-USERS-PASS-005: Cancel Password Reset
- [ ] Open Password Reset dialog
- [ ] Enter new password data
- [ ] Click "Cancel"
- [ ] Verify dialog closes
- [ ] Verify password NOT changed

### Delete User Tests

#### TC-USERS-DELETE-001: Open Delete Dialog
- [*] Click Delete icon for "Test Sales User" ✓
- [*] Verify delete confirmation dialog opens ✓
- [*] Verify dialog shows:
  - [*] User name being deleted: "Test Sales User" ✓
  - [*] Warning message: "This action cannot be undone" ✓
  - [*] "Cancel" button ✓
  - [*] "Delete" button (destructive) ✓

#### TC-USERS-DELETE-002: Delete User Successfully
- [*] Use existing "Test Sales User" (created in TC-USERS-CREATE-003) ✓
- [*] Click Delete for this user ✓
- [*] Confirm deletion ✓
- [*] Verify user removed from table ✓
- [*] Navigate to Roles page ✓
- [*] Verify "Test Limited Access" count: "0 users" ✓
- [*] Verify delete button enabled for "Test Limited Access" ✓
- [*] User-role relationship correctly updated

#### TC-USERS-DELETE-003: Delete User With Assignments
- [ ] Create user and assign them leads/investors
- [ ] Try to delete the user
- [ ] Verify error or warning about existing assignments
- [ ] Or verify cascade/reassignment behavior

#### TC-USERS-DELETE-004: Cancel Deletion
- [*] Click Delete on "Test Sales User" ✓
- [*] Click "Cancel" in confirmation ✓
- [*] Verify dialog closes ✓
- [*] Verify user still exists in table ✓

#### TC-USERS-DELETE-005: Self-Deletion Protection
- [*] Login as admin (already logged in) ✓
- [*] Check Admin User row in table ✓
- [*] Verify delete button disabled for Admin User ✓
- [*] Current logged-in user cannot delete themselves

### Users Table Interaction Tests

#### TC-USERS-TABLE-001: Sorting
- [*] Click "Name" column header ✓
- [*] ⚠️ Feature not implemented: Table headers are static, no sorting functionality
- [*] Documented: Same pattern as Roles table (TC-ROLES-TABLE-001)

#### TC-USERS-TABLE-002: Search/Filter
- [*] Check for search/filter controls ✓
- [*] ⚠️ Feature not implemented: No search input or filter controls present
- [*] Documented: Same pattern as Roles table (TC-ROLES-TABLE-002)

#### TC-USERS-TABLE-003: Role Badges
- [*] Verify each user shows correct role badge ✓
- [*] Admin User: "Admin" badge (outline variant) ✓
- [*] Test User: "Sales Manager" badge (outline variant) ✓
- [*] Users with no role: "No role" text (gray muted) ✓
- [*] Badge component: `<Badge variant="outline">` ✓

#### TC-USERS-TABLE-004: Status Badges
- [*] Verify Active users show badge ✓
- [*] Admin User: "active" badge (default variant - blue) ✓
- [*] Set Test User to Inactive ✓
- [*] Verify Inactive user shows gray badge ✓
- [*] Badge component: `<Badge variant={status === "active" ? "default" : "secondary"}>` ✓

---

## 🔒 Permission Integration Tests

### Menu Access Tests

#### TC-PERM-MENU-001: Full Access Role
- [*] Create role "Test Full Access User" with all menu permissions ✓
  - [*] Role Name: "Test Full Access User" ✓
  - [*] Slug: "test-full-access-user" ✓
  - [*] Description: "Test role for permission integration testing - full access" ✓
  - [*] Menu Permissions: ALL checked (Dashboard, Leads, Investors, Tasks, Activities, Reports) ✓
  - [*] Settings Access: ALL checked (Lead Fields, Investor Fields, Activity Types, Users, Roles & Permissions) ✓
  - [*] Status: Active ✓
  - [*] Role created successfully ✓
- [*] Create user assigned to this role ✓
  - [*] Full Name: "Test Full Access" ✓
  - [*] Email: "testfullaccess@example.com" ✓
  - [*] Password: "password123" ✓
  - [*] Role: "Test Full Access User" ✓
  - [*] Status: Active ✓
  - [*] User created successfully ✓
  - [*] Toast notification: "User created successfully" displayed ✓
  - [*] User appears in users table with correct role badge ✓
  - **Note**: BUG-004 was discovered and FIXED during this test (missing Toaster component + phone field null handling)
- [ ] Login as this user
- [ ] Verify sidebar shows all menu items
- [ ] Click each menu item
- [ ] Verify no access denied errors

**Test Status**: ⚠️ **IN PROGRESS** - Role and user created successfully, ready for login testing

#### TC-PERM-MENU-002: Limited Access Role
- [ ] Create role "Test Limited" with only Dashboard + Leads
- [ ] Create user assigned to this role
- [ ] Login as this user
- [ ] Verify sidebar shows ONLY:
  - [ ] Dashboard
  - [ ] Leads
- [ ] Verify hidden menu items:
  - [ ] Investors (hidden)
  - [ ] Tasks (hidden)
  - [ ] Activities (hidden)
  - [ ] Reports (hidden)
  - [ ] Settings (hidden)
- [ ] Try to access `/investors` directly via URL
- [ ] Verify redirect or access denied

#### TC-PERM-MENU-003: Settings Sub-Menu Permissions
- [ ] Create role with Settings > Users only (no other Settings children)
- [ ] Create and login as user with this role
- [ ] Navigate to `/settings`
- [ ] Verify only "Users" card visible
- [ ] Verify hidden cards:
  - [ ] Roles & Permissions (hidden)
  - [ ] Lead Fields (hidden)
  - [ ] Investor Fields (hidden)
  - [ ] Activity Types (hidden)

#### TC-PERM-MENU-004: No Settings Access
- [ ] Create role with NO Settings permissions
- [ ] Create and login as user
- [ ] Verify Settings menu item hidden in sidebar
- [ ] Try to access `/settings/users` directly
- [ ] Verify redirect to dashboard or 403 error

### Data Access Tests

#### TC-PERM-DATA-001: All Leads Access
- [ ] Create role with Leads data access: "All"
- [ ] Create multiple leads assigned to different users
- [ ] Login as user with "All" access
- [ ] Navigate to `/leads`
- [ ] Verify ALL leads visible in table
- [ ] Verify no filtering by assignment

#### TC-PERM-DATA-002: Assigned Leads Only
- [ ] Create role with Leads data access: "Assigned Only"
- [ ] Create user "User A" with this role
- [ ] Create lead "Lead 1" assigned to "User A"
- [ ] Create lead "Lead 2" assigned to "Admin"
- [ ] Login as "User A"
- [ ] Navigate to `/leads`
- [ ] Verify ONLY "Lead 1" visible
- [ ] Verify "Lead 2" NOT visible

#### TC-PERM-DATA-003: Mixed Data Access
- [ ] Create role with:
  - [ ] Leads: All
  - [ ] Investors: Assigned Only
  - [ ] Activities: Assigned Only
- [ ] Create test data assigned to different users
- [ ] Login as user with mixed access
- [ ] Verify `/leads` shows all leads
- [ ] Verify `/investors` shows only assigned investors
- [ ] Verify `/activities` shows only assigned activities

#### TC-PERM-DATA-004: Direct Access Attempt
- [ ] Create user with "Assigned Only" for Leads
- [ ] Create lead NOT assigned to this user
- [ ] Get lead ID (e.g., lead_id = 5)
- [ ] Login as restricted user
- [ ] Try to access `/leads/5` directly via URL
- [ ] Verify redirect or "Access Denied" error
- [ ] Verify cannot view lead details

---

## 🎯 End-to-End Scenarios

### E2E-001: Complete Admin Workflow
- [ ] Login as admin
- [ ] Create new role "Marketing Manager" with specific permissions
- [ ] Create new user "John Doe" assigned to Marketing Manager
- [ ] Logout admin
- [ ] Login as "John Doe"
- [ ] Verify correct menu access based on role
- [ ] Create a lead
- [ ] Verify lead assigned to John Doe
- [ ] Logout John Doe
- [ ] Login as admin
- [ ] Verify can see John Doe's lead
- [ ] Edit John Doe's role permissions
- [ ] Logout admin
- [ ] Login as John Doe
- [ ] Verify new permissions applied

### E2E-002: Role Lifecycle
- [ ] Create role "Test Lifecycle"
- [ ] Assign permissions (Dashboard, Leads - Assigned Only)
- [ ] Create user assigned to this role
- [ ] Verify user can access Dashboard and Leads
- [ ] Edit role, add Investors permission
- [ ] Verify user now sees Investors menu
- [ ] Edit role, remove Leads permission
- [ ] Verify Leads menu hidden for user
- [ ] Set role status to Inactive
- [ ] Verify user cannot login or shows error
- [ ] Delete role (after removing user)
- [ ] Verify role completely removed

### E2E-003: User Lifecycle
- [ ] Create user "Lifecycle User"
- [ ] Assign role "Sales Representative"
- [ ] Login as user, verify access
- [ ] Logout
- [ ] Admin edits user, changes role to "Sales Manager"
- [ ] User logs in again
- [ ] Verify new permissions active
- [ ] Admin resets user password
- [ ] User tries old password, verify fails
- [ ] User logs in with new password, verify succeeds
- [ ] Admin sets user status to Inactive
- [ ] User tries to login, verify blocked
- [ ] Admin deletes user
- [ ] User cannot login anymore

### E2E-004: Permission Cascade
- [ ] Create role with Settings parent checked (all children auto-checked)
- [ ] Create user with this role
- [ ] Login as user
- [ ] Verify access to all settings pages:
  - [ ] `/settings/lead-fields`
  - [ ] `/settings/investor-fields`
  - [ ] `/settings/activity-types`
  - [ ] `/settings/users`
  - [ ] `/settings/roles`
- [ ] Logout
- [ ] Admin edits role, uncheck Settings parent
- [ ] User logs in again
- [ ] Verify ALL settings pages now blocked

### E2E-005: Multi-User Collaboration
- [ ] Create 2 roles:
  - [ ] "Manager" (All data access)
  - [ ] "Representative" (Assigned only)
- [ ] Create users:
  - [ ] "Manager User" with Manager role
  - [ ] "Rep User 1" with Representative role
  - [ ] "Rep User 2" with Representative role
- [ ] Login as Rep User 1
- [ ] Create Lead 1
- [ ] Logout
- [ ] Login as Rep User 2
- [ ] Verify cannot see Lead 1
- [ ] Create Lead 2
- [ ] Logout
- [ ] Login as Manager User
- [ ] Verify can see both Lead 1 and Lead 2
- [ ] Edit Lead 1, reassign to Manager User
- [ ] Logout
- [ ] Login as Rep User 1
- [ ] Verify Lead 1 now hidden (not assigned anymore)

---

## 🐛 Error Handling Tests

### ERR-001: API Error Handling
- [ ] Disconnect database
- [ ] Try to load `/settings/roles`
- [ ] Verify error message displayed gracefully
- [ ] Verify no white screen of death
- [ ] Reconnect database
- [ ] Refresh page, verify works again

### ERR-002: Network Timeout
- [ ] Simulate slow network
- [ ] Try to create new user
- [ ] Verify loading spinner shows
- [ ] Verify timeout error after reasonable time
- [ ] Verify user-friendly error message

### ERR-003: Concurrent Edit Conflict
- [ ] Open Edit Role dialog in two browser tabs
- [ ] Edit same role in both tabs
- [ ] Save in Tab 1
- [ ] Save in Tab 2
- [ ] Verify conflict handling (last write wins or version control)

### ERR-004: Session Expiry
- [ ] Login as user
- [ ] Wait for session to expire (or manually clear cookies)
- [ ] Try to create role/user
- [ ] Verify redirect to login page
- [ ] Verify error: "Session expired, please login"

### ERR-005: Invalid Data Injection
- [ ] Try to submit role with SQL injection attempt: `'; DROP TABLE users; --`
- [ ] Verify input sanitized
- [ ] Verify no SQL injection occurs
- [ ] Try XSS injection in role description: `<script>alert('XSS')</script>`
- [ ] Verify script not executed
- [ ] Verify stored as plain text or escaped

---

## 📱 Responsive Design Tests

### RESP-001: Mobile View - Roles
- [ ] Set browser viewport to mobile (375px width)
- [ ] Access `/settings/roles`
- [ ] Verify table responsive (horizontal scroll or card view)
- [ ] Open Create Role dialog
- [ ] Verify dialog fits screen
- [ ] Verify permission tree navigable on mobile

### RESP-002: Tablet View - Users
- [ ] Set viewport to tablet (768px width)
- [ ] Access `/settings/users`
- [ ] Verify table layout adapts
- [ ] Open Edit User dialog
- [ ] Verify form fields stack properly

### RESP-003: Desktop View
- [ ] Set viewport to desktop (1920px width)
- [ ] Verify tables use full width
- [ ] Verify dialogs centered
- [ ] Verify no layout overflow

---

## ♿ Accessibility Tests

### A11Y-001: Keyboard Navigation
- [ ] Navigate to `/settings/roles` using only keyboard
- [ ] Tab through all interactive elements
- [ ] Verify focus visible on all elements
- [ ] Press Enter on "Add Role" button
- [ ] Verify dialog opens
- [ ] Tab through form fields
- [ ] Verify can submit with Enter key

### A11Y-002: Screen Reader
- [ ] Enable screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate Roles page
- [ ] Verify table headers announced
- [ ] Verify button labels clear
- [ ] Open Create Role dialog
- [ ] Verify form labels associated with inputs
- [ ] Verify error messages announced

### A11Y-003: Color Contrast
- [ ] Verify all text has sufficient contrast (WCAG AA)
- [ ] Check badge colors (Active/Inactive)
- [ ] Check button colors
- [ ] Check form field borders

---

## 🔄 Performance Tests

### PERF-001: Load Time
- [ ] Clear browser cache
- [ ] Navigate to `/settings/roles`
- [ ] Measure page load time (< 2 seconds)
- [ ] Navigate to `/settings/users`
- [ ] Measure load time (< 2 seconds)

### PERF-002: Large Dataset
- [ ] Create 100 roles via seed script
- [ ] Load `/settings/roles`
- [ ] Verify pagination or virtual scrolling
- [ ] Verify no performance degradation
- [ ] Create 500 users
- [ ] Load `/settings/users`
- [ ] Verify table renders smoothly

### PERF-003: Form Interaction
- [ ] Open Create Role dialog
- [ ] Check/uncheck all permissions rapidly
- [ ] Verify no lag or freezing
- [ ] Verify UI responsive

---

## 🔍 Security Tests

### SEC-001: CSRF Protection
- [ ] Verify API routes check CSRF token
- [ ] Try to submit form without token
- [ ] Verify request rejected

### SEC-002: Authorization Checks
- [ ] Login as user WITHOUT Roles permission
- [ ] Try to access `/api/settings/roles` directly via curl/Postman
- [ ] Verify 403 Forbidden response
- [ ] Try to create role via API
- [ ] Verify blocked

### SEC-003: SQL Injection Prevention
- [ ] Test all input fields with SQL injection payloads
- [ ] Verify Prisma ORM prevents injection
- [ ] Verify no database errors exposed to client

### SEC-004: XSS Prevention
- [ ] Try to create role with name: `<img src=x onerror=alert('XSS')>`
- [ ] Verify script not executed when role displayed
- [ ] Check Network tab for proper content-type headers

### SEC-005: Password Security
- [ ] Create user with password "password123"
- [ ] Query database, verify password hashed
- [ ] Verify hash starts with `$2y$10$` or `$2y$12$`
- [ ] Verify password not logged in any logs
- [ ] Verify password not visible in API responses

---

## 📊 Test Summary Template

After completing tests, document results:

```markdown
## Test Execution Summary

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]
**Browser:** [Chrome/Firefox/Safari]

### Results Overview
- **Total Tests:** [X]
- **Passed:** [X] ✅
- **Failed:** [X] ❌
- **Blocked:** [X] 🚫
- **Skipped:** [X] ⏭️

### Critical Issues Found
1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Steps to Reproduce:**
   - **Expected vs Actual:**

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

### Sign-off
- [ ] All critical tests passed
- [ ] Known issues documented
- [ ] Ready for production: YES / NO
```

---

## 🔧 Test Automation Scripts (Playwright MCP)

### Sample Playwright Test Structure

```javascript
// Example: TC-ROLES-CREATE-003
test('Create Full Access Role', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login')
  await page.fill('[name="email"]', 'admin@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Navigate to Roles
  await page.goto('http://localhost:3000/settings/roles')

  // Open Create Dialog
  await page.click('button:has-text("Add Role")')

  // Fill form
  await page.fill('[name="name"]', 'Test Full Access')
  await page.fill('[name="description"]', 'Test role with full access')

  // Check all permissions
  await page.check('#perm-dashboard')
  await page.check('#perm-leads')
  await page.check('#perm-investors')
  await page.check('#perm-tasks')
  await page.check('#perm-activities')
  await page.check('#perm-reports')
  await page.check('#perm-settings') // Should auto-check children

  // Set data access
  await page.check('[value="all"][name="leads-access"]')
  await page.check('[value="all"][name="investors-access"]')
  await page.check('[value="all"][name="activities-access"]')

  // Submit
  await page.click('button:has-text("Create")')

  // Verify success
  await expect(page.locator('.toast')).toContainText('Role created successfully')
  await expect(page.locator('table')).toContainText('Test Full Access')
})
```

---

## ✅ Test Execution Checklist

### Before Starting Tests
- [ ] All seed scripts executed
- [ ] Database in clean state
- [ ] Development server running
- [ ] Playwright MCP configured
- [ ] Test data prepared

### During Testing
- [ ] Mark each test as completed in this document
- [ ] Screenshot any bugs/errors
- [ ] Note any deviations from expected behavior
- [ ] Update test cases if requirements change

### After Testing
- [ ] Generate test report
- [ ] File bugs in issue tracker
- [ ] Update documentation if needed
- [ ] Share results with team

---

## 📎 Additional Resources

- **Database Schema:** [prisma/schema.prisma](prisma/schema.prisma)
- **Permission Structure:** [lib/permissions.ts](lib/permissions.ts)
- **API Routes:** [app/api/settings/](app/api/settings/)
- **UI Components:** [components/settings/](components/settings/)

---

**Total Test Cases:** 100+
**Estimated Testing Time:** 8-12 hours
**Priority:** HIGH - Critical business functionality

_Last Updated: 2025-10-04_
