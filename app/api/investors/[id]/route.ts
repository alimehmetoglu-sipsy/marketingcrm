import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"

// GET single investor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const investor = await prisma.investors.findUnique({
      where: { id: BigInt(id) },
    })

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 })
    }

    return NextResponse.json(investor)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch investor" }, { status: 500 })
  }
}

// PUT update investor
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { customFields, ...investorData } = body

    console.log("=== UPDATE INVESTOR DEBUG ===")
    console.log("Investor ID:", id)
    console.log("Body:", JSON.stringify(body, null, 2))
    console.log("Custom Fields:", customFields)
    console.log("Investor Data:", investorData)

    // Get system field definitions (source, status, priority)
    const systemFields = await prisma.investor_fields.findMany({
      where: {
        name: { in: ['source', 'status', 'priority'] },
        is_active: true
      }
    })

    const sourceField = systemFields.find(f => f.name === 'source')
    const statusField = systemFields.find(f => f.name === 'status')
    const priorityField = systemFields.find(f => f.name === 'priority')

    // Prepare update data
    const updateData: any = {
      full_name: investorData.full_name,
      email: investorData.email,
      phone: investorData.phone,
      updated_at: new Date(),
    }

    // Handle source field - check both by field ID and by name
    if (sourceField && customFields?.[sourceField.id.toString()]) {
      updateData.source = customFields[sourceField.id.toString()]
    } else if (customFields?.source || investorData.source) {
      updateData.source = customFields?.source || investorData.source
    }

    // Handle status field - check both by field ID and by name
    if (statusField && customFields?.[statusField.id.toString()]) {
      updateData.status = customFields[statusField.id.toString()]
    } else if (customFields?.status || investorData.status) {
      updateData.status = customFields?.status || investorData.status
    }

    // Handle priority field - check both by field ID and by name
    if (priorityField && customFields?.[priorityField.id.toString()] !== undefined) {
      updateData.priority = customFields[priorityField.id.toString()] || null
    } else if (customFields?.priority !== undefined) {
      updateData.priority = customFields.priority || null
    } else if (investorData.priority !== undefined) {
      updateData.priority = investorData.priority || null
    }

    if (investorData.notes !== undefined) {
      updateData.notes = investorData.notes
    }

    const investor = await prisma.investors.update({
      where: { id: BigInt(id) },
      data: updateData,
    })

    // Update custom field values
    if (customFields && typeof customFields === "object") {
      // Delete existing custom field values
      await prisma.investor_field_values.deleteMany({
        where: { investor_id: BigInt(id) },
      })

      // Insert new custom field values, excluding system fields
      const systemFieldIds = [
        sourceField?.id.toString(),
        statusField?.id.toString(),
        priorityField?.id.toString()
      ].filter(Boolean)

      const fieldValues = Object.entries(customFields)
        .filter(([key, value]) => {
          // Exclude system fields by name
          if (key === "source" || key === "status" || key === "priority") {
            return false
          }
          // Exclude system fields by ID
          if (systemFieldIds.includes(key)) {
            return false
          }
          // Exclude if value is empty
          if (value === null || value === undefined || value === "") {
            return false
          }
          // Exclude if key is not a valid number (field ID)
          const fieldId = parseInt(key)
          if (isNaN(fieldId)) {
            console.log("Skipping non-numeric field key:", key)
            return false
          }
          return true
        })
        .map(([fieldId, value]) => ({
          investor_id: BigInt(id),
          investor_field_id: parseInt(fieldId),
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
          created_at: new Date(),
          updated_at: new Date(),
        }))

      if (fieldValues.length > 0) {
        await prisma.investor_field_values.createMany({
          data: fieldValues,
        })
      }
    }

    // Serialize BigInt to number for JSON response
    const serializedInvestor = {
      ...investor,
      id: Number(investor.id),
      lead_id: investor.lead_id ? Number(investor.lead_id) : null,
      representative_id: investor.representative_id ? Number(investor.representative_id) : null,
      created_by: investor.created_by ? Number(investor.created_by) : null,
      updated_by: investor.updated_by ? Number(investor.updated_by) : null,
    }

    return NextResponse.json(serializedInvestor)
  } catch (error: any) {
    console.error("Error updating investor:", error)
    console.error("Error message:", error?.message)
    console.error("Error stack:", error?.stack)
    return NextResponse.json({
      error: "Failed to update investor",
      details: error?.message || String(error)
    }, { status: 500 })
  }
}

// DELETE investor
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.investors.delete({
      where: { id: BigInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting investor:", error)
    return NextResponse.json({ error: "Failed to delete investor" }, { status: 500 })
  }
}
