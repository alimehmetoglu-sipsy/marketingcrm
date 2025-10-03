import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { fields } = await request.json()

    // Update each field's section assignment
    for (const field of fields) {
      await prisma.investor_fields.update({
        where: { id: BigInt(field.id) },
        data: {
          section_key: field.section_key,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error assigning investor fields to sections:", error)
    return NextResponse.json(
      { error: "Failed to assign fields to sections" },
      { status: 500 }
    )
  }
}
