import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { updates } = await request.json()

    // Update all activity types with new sort orders
    await Promise.all(
      updates.map((update: { id: number; sort_order: number }) =>
        prisma.activity_types.update({
          where: { id: update.id },
          data: { sort_order: update.sort_order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder activity types:", error)
    return NextResponse.json(
      { error: "Failed to reorder activity types" },
      { status: 500 }
    )
  }
}
