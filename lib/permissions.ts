// Permission types
export interface PermissionsStructure {
  menus: {
    dashboard: boolean
    leads: boolean
    investors: boolean
    tasks: boolean
    activities: boolean
    reports: boolean
    settings: {
      leadFields: boolean
      investorFields: boolean
      activityTypes: boolean
      users: boolean
      roles: boolean
    }
  }
  dataAccess: {
    leads: "all" | "assigned"
    investors: "all" | "assigned"
    activities: "all" | "assigned"
  }
}

/**
 * Check if user has permission to access a menu
 */
export function checkMenuPermission(
  permissions: PermissionsStructure | null | undefined,
  menu: string
): boolean {
  if (!permissions) return false
  if (!permissions.menus) return false

  // Handle nested settings menus
  if (menu.startsWith("settings.")) {
    if (!permissions.menus.settings) return false
    const settingKey = menu.split(".")[1] as keyof typeof permissions.menus.settings
    return permissions.menus.settings[settingKey] || false
  }

  // Handle top-level menus
  const menuKey = menu as keyof typeof permissions.menus
  if (menuKey === "settings") {
    // Access to settings if any sub-menu is accessible
    if (!permissions.menus.settings) return false
    return Object.values(permissions.menus.settings).some((v) => v === true)
  }

  return permissions.menus[menuKey] || false
}

/**
 * Get data access level for a specific entity type
 */
export function checkDataAccess(
  permissions: PermissionsStructure | null | undefined,
  entity: "leads" | "investors" | "activities"
): "all" | "assigned" | "none" {
  if (!permissions) return "none"
  if (!permissions.dataAccess) return "none"
  return permissions.dataAccess[entity] || "none"
}

/**
 * Check if user can access a specific settings page
 */
export function canAccessSettings(
  permissions: PermissionsStructure | null | undefined,
  settingsPage: keyof PermissionsStructure["menus"]["settings"]
): boolean {
  if (!permissions) return false
  if (!permissions.menus) return false
  if (!permissions.menus.settings) return false
  return permissions.menus.settings[settingsPage] || false
}

/**
 * Check if user has any settings permission
 */
export function hasAnySettingsPermission(
  permissions: PermissionsStructure | null | undefined
): boolean {
  if (!permissions) return false
  if (!permissions.menus) return false
  if (!permissions.menus.settings) return false
  return Object.values(permissions.menus.settings).some((v) => v === true)
}

/**
 * Get all accessible menus for a user
 */
export function getAccessibleMenus(
  permissions: PermissionsStructure | null | undefined
): string[] {
  if (!permissions) return []
  if (!permissions.menus) return []

  const menus: string[] = []

  // Top-level menus
  if (permissions.menus.dashboard) menus.push("dashboard")
  if (permissions.menus.leads) menus.push("leads")
  if (permissions.menus.investors) menus.push("investors")
  if (permissions.menus.tasks) menus.push("tasks")
  if (permissions.menus.activities) menus.push("activities")
  if (permissions.menus.reports) menus.push("reports")

  // Settings menu (if any sub-menu is accessible)
  if (hasAnySettingsPermission(permissions)) {
    menus.push("settings")
  }

  return menus
}

/**
 * Get accessible settings sub-menus
 */
export function getAccessibleSettingsMenus(
  permissions: PermissionsStructure | null | undefined
): string[] {
  if (!permissions) return []
  if (!permissions.menus) return []
  if (!permissions.menus.settings) return []

  const settingsMenus: string[] = []

  if (permissions.menus.settings.leadFields) settingsMenus.push("leadFields")
  if (permissions.menus.settings.investorFields) settingsMenus.push("investorFields")
  if (permissions.menus.settings.activityTypes) settingsMenus.push("activityTypes")
  if (permissions.menus.settings.users) settingsMenus.push("users")
  if (permissions.menus.settings.roles) settingsMenus.push("roles")

  return settingsMenus
}

/**
 * Check if user is admin (has all permissions)
 */
export function isAdmin(permissions: PermissionsStructure | null | undefined): boolean {
  if (!permissions) return false
  if (!permissions.menus) return false
  if (!permissions.menus.settings) return false
  if (!permissions.dataAccess) return false

  const allMenus = [
    permissions.menus.dashboard,
    permissions.menus.leads,
    permissions.menus.investors,
    permissions.menus.tasks,
    permissions.menus.activities,
    permissions.menus.reports,
  ]

  const allSettings = Object.values(permissions.menus.settings)

  const allDataAccess = [
    permissions.dataAccess.leads === "all",
    permissions.dataAccess.investors === "all",
    permissions.dataAccess.activities === "all",
  ]

  return (
    allMenus.every((v) => v === true) &&
    allSettings.every((v) => v === true) &&
    allDataAccess.every((v) => v === true)
  )
}
