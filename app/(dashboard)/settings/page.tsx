import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sliders, Database, Activity, Users, KeyRound, FileUp } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth-config"
import { canAccessSettings } from "@/lib/permissions"

const settingsPages = [
  {
    title: "Lead Properties",
    description: "Manage custom fields and properties for leads",
    icon: Sliders,
    href: "/settings/lead-fields",
    color: "from-indigo-500 to-purple-500",
    permission: "leadFields" as const,
  },
  {
    title: "Investor Properties",
    description: "Manage custom fields and properties for investors",
    icon: Database,
    href: "/settings/investor-fields",
    color: "from-emerald-500 to-teal-500",
    permission: "investorFields" as const,
  },
  {
    title: "Import/Export",
    description: "Import and export leads and investors data",
    icon: FileUp,
    href: "/settings/import-export",
    color: "from-blue-500 to-indigo-500",
    permission: null,
  },
  {
    title: "Activity Types",
    description: "Configure activity types, colors and icons",
    icon: Activity,
    href: "/settings/activity-types",
    color: "from-green-500 to-emerald-500",
    permission: "activityTypes" as const,
  },
  {
    title: "Users",
    description: "Manage system users and their access",
    icon: Users,
    href: "/settings/users",
    color: "from-blue-500 to-indigo-500",
    permission: "users" as const,
  },
  {
    title: "Roles & Permissions",
    description: "Configure user roles and access control",
    icon: KeyRound,
    href: "/settings/roles",
    color: "from-purple-500 to-pink-500",
    permission: "roles" as const,
  },
]

export default async function SettingsPage() {
  const session = await auth()

  // Filter settings pages based on permissions
  const accessiblePages = settingsPages.filter((page) => {
    if (page.permission === null) return true // General settings always visible
    return canAccessSettings(session?.user?.permissions, page.permission)
  })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your CRM settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessiblePages.map((page) => {
          const Icon = page.icon
          return (
            <Link key={page.href} href={page.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${page.color} text-white mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{page.title}</CardTitle>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
