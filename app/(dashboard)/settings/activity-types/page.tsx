import { prisma } from "@/lib/prisma"
import { ActivityTypesSettings } from "@/components/settings/activity-types-settings"

async function getActivityTypes() {
  const activityTypes = await prisma.activity_types.findMany({
    orderBy: { sort_order: "asc" },
  })

  return activityTypes.map(type => ({
    ...type,
    id: Number(type.id),
  }))
}

export default async function ActivityTypesPage() {
  const activityTypes = await getActivityTypes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Types</h1>
        <p className="text-muted-foreground">
          Manage activity types for leads and investors
        </p>
      </div>

      <ActivityTypesSettings activityTypes={activityTypes} />
    </div>
  )
}
