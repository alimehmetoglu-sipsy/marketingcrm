import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lead_id, investor_id, type, activity_type_id, subject, description, lead_status } = body

    // Validate required fields
    if (!type || !description) {
      return NextResponse.json(
        { success: false, message: "Type and description are required" },
        { status: 400 }
      )
    }

    // Ensure either lead_id or investor_id is provided
    if (!lead_id && !investor_id) {
      return NextResponse.json(
        { success: false, message: "Either lead_id or investor_id is required" },
        { status: 400 }
      )
    }

    // If activity_type_id is provided, fetch the activity type
    let activityType = null
    if (activity_type_id) {
      activityType = await prisma.activity_types.findUnique({
        where: { id: BigInt(activity_type_id) }
      })
    }

    // Create activity
    const activity = await prisma.activities.create({
      data: {
        lead_id: lead_id ? BigInt(lead_id) : null,
        investor_id: investor_id ? BigInt(investor_id) : null,
        activity_type_id: activity_type_id ? BigInt(activity_type_id) : null,
        type: activityType?.name || type,
        subject: subject || activityType?.label || "Activity",
        description: description,
        status: "completed",
        scheduled_at: null,
        activity_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Update lead's status and last_activity_at if lead_id is provided
    if (lead_id) {
      await prisma.leads.update({
        where: { id: BigInt(lead_id) },
        data: {
          last_activity_at: new Date(),
          ...(lead_status && { status: lead_status }),
        },
      })
    }

    // Update investor's last_activity_at if investor_id is provided
    if (investor_id) {
      await prisma.investors.update({
        where: { id: BigInt(investor_id) },
        data: {
          last_activity_at: new Date(),
        },
      })
    }

    // Serialize BigInt values
    const serializedActivity = {
      ...activity,
      id: Number(activity.id),
      lead_id: activity.lead_id ? Number(activity.lead_id) : null,
      investor_id: activity.investor_id ? Number(activity.investor_id) : null,
      activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
      representative_id: activity.representative_id ? Number(activity.representative_id) : null,
      user_id: activity.user_id ? Number(activity.user_id) : null,
    }

    return NextResponse.json({
      success: true,
      message: "Activity created successfully",
      activity: serializedActivity,
    })
  } catch (error: any) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create activity" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lead_id = searchParams.get("lead_id")
    const investor_id = searchParams.get("investor_id")

    const where: any = {}
    if (lead_id) where.lead_id = BigInt(lead_id)
    if (investor_id) where.investor_id = BigInt(investor_id)

    const activities = await prisma.activities.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        leads: {
          select: {
            full_name: true,
            email: true,
          },
        },
        investors: {
          select: {
            full_name: true,
            email: true,
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
      },
    })

    // Serialize BigInt values
    const serializedActivities = activities.map((activity) => ({
      ...activity,
      id: Number(activity.id),
      lead_id: activity.lead_id ? Number(activity.lead_id) : null,
      investor_id: activity.investor_id ? Number(activity.investor_id) : null,
      activity_type_id: activity.activity_type_id ? Number(activity.activity_type_id) : null,
      representative_id: activity.representative_id ? Number(activity.representative_id) : null,
      user_id: activity.user_id ? Number(activity.user_id) : null,
      activity_types: activity.activity_types ? {
        ...activity.activity_types,
        id: Number(activity.activity_types.id),
      } : null,
    }))

    return NextResponse.json({
      success: true,
      activities: serializedActivities,
    })
  } catch (error: any) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
