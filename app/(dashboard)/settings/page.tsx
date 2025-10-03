import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings2, Sliders, Bell, Shield, Database, Palette, Activity } from "lucide-react"
import Link from "next/link"

const settingsPages = [
  {
    title: "Lead Properties",
    description: "Manage custom fields and properties for leads",
    icon: Sliders,
    href: "/settings/lead-fields",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Investor Properties",
    description: "Manage custom fields and properties for investors",
    icon: Database,
    href: "/settings/investor-fields",
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Activity Types",
    description: "Configure activity types, colors and icons",
    icon: Activity,
    href: "/settings/activity-types",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "General Settings",
    description: "Configure general application settings",
    icon: Settings2,
    href: "/settings/general",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Notifications",
    description: "Manage notification preferences",
    icon: Bell,
    href: "/settings/notifications",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Security",
    description: "Security and privacy settings",
    icon: Shield,
    href: "/settings/security",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Appearance",
    description: "Customize the look and feel",
    icon: Palette,
    href: "/settings/appearance",
    color: "from-violet-500 to-purple-500",
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your CRM settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsPages.map((page) => {
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
