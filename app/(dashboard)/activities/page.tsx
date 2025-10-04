import { prisma } from "@/lib/prisma"
import { ActivitiesClient } from "@/components/activities/activities-client"

async function getActivitiesData() {
  // Fetch activities with all relations
  const activities = await prisma.activities.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
    include: {
      leads: {
        select: {
          id: true,
          full_name: true,
          email: true,
          status: true,
        },
      },
      investors: {
        select: {
          id: true,
          full_name: true,
          email: true,
          status: true,
        },
      },
      activity_types: {
        select: {
          id: true,
          name: true,
          label: true,
          icon: true,
          color: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // Fetch activity types for filter dropdown
  const activityTypes = await prisma.activity_types.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  })

  // Fetch users for filter dropdown
  const users = await prisma.users.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  // Serialize BigInt values
  const serializedActivities = activities.map((activity) => ({
    ...activity,
    id: Number(activity.id),
    lead_id: activity.lead_id ? Number(activity.lead_id) : null,
    investor_id: activity.investor_id ? Number(activity.investor_id) : null,
    activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
    assigned_to: activity.assigned_to ? Number(activity.assigned_to) : null,
    user_id: activity.user_id ? Number(activity.user_id) : null,
    activity_types: activity.activity_types ? {
      ...activity.activity_types,
      id: Number(activity.activity_types.id),
    } : null,
    leads: activity.leads ? {
      ...activity.leads,
      id: Number(activity.leads.id),
    } : null,
    investors: activity.investors ? {
      ...activity.investors,
      id: Number(activity.investors.id),
    } : null,
    users: activity.users ? {
      ...activity.users,
      id: Number(activity.users.id),
    } : null,
    assignedUser: activity.assignedUser ? {
      ...activity.assignedUser,
      id: Number(activity.assignedUser.id),
    } : null,
  }))

  const serializedActivityTypes = activityTypes.map((type) => ({
    ...type,
    id: Number(type.id),
  }))

  const serializedUsers = users.map((user) => ({
    ...user,
    id: Number(user.id),
  }))

  return {
    activities: serializedActivities,
    activityTypes: serializedActivityTypes,
    users: serializedUsers,
  }
}

export default async function ActivitiesPage() {
  const { activities, activityTypes, users } = await getActivitiesData()

  return (
    <ActivitiesClient
      activities={activities}
      activityTypes={activityTypes}
      users={users}
    />
  )
}
