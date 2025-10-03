import { prisma } from "@/lib/prisma"
import { ActivitiesClient } from "@/components/activities/activities-client"

async function getActivities() {
  const activities = await prisma.activities.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
    include: {
      leads: {
        select: {
          full_name: true,
        }
      }
    }
  })

  // Serialize BigInt values
  return activities.map(activity => ({
    ...activity,
    id: activity.id,
    created_at: activity.created_at,
    leads: activity.leads,
  }))
}

export default async function ActivitiesPage() {
  const activities = await getActivities()

  return <ActivitiesClient activities={activities} />
}
