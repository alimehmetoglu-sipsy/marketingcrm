import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"

// GET single lead
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
    const lead = await prisma.leads.findUnique({
      where: { id: BigInt(id) },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

// PUT update lead
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
    const { customFields, ...leadData } = body

    console.log("=== UPDATE LEAD DEBUG ===")
    console.log("Lead ID:", id)
    console.log("Body:", JSON.stringify(body, null, 2))
    console.log("Custom Fields:", customFields)
    console.log("Lead Data:", leadData)

    // Get system field definitions (source, status, priority)
    const systemFields = await prisma.lead_fields.findMany({
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
      full_name: leadData.full_name,
      email: leadData.email,
      phone: leadData.phone,
      updated_at: new Date(),
    }

    // Handle source field - check both by field ID and by name
    if (sourceField && customFields?.[sourceField.id.toString()]) {
      updateData.source = customFields[sourceField.id.toString()]
    } else if (customFields?.source || leadData.source) {
      updateData.source = customFields?.source || leadData.source
    }

    // Handle status field - check both by field ID and by name
    if (statusField && customFields?.[statusField.id.toString()]) {
      updateData.status = customFields[statusField.id.toString()]
    } else if (customFields?.status || leadData.status) {
      updateData.status = customFields?.status || leadData.status
    }

    // Handle priority field - check both by field ID and by name
    if (priorityField && customFields?.[priorityField.id.toString()] !== undefined) {
      updateData.priority = customFields[priorityField.id.toString()] || null
    } else if (customFields?.priority !== undefined) {
      updateData.priority = customFields.priority || null
    } else if (leadData.priority !== undefined) {
      updateData.priority = leadData.priority || null
    }

    if (leadData.notes !== undefined) {
      updateData.notes_text = leadData.notes
    }

    const lead = await prisma.leads.update({
      where: { id: BigInt(id) },
      data: updateData,
    })

    // Update custom field values
    if (customFields && typeof customFields === "object") {
      // Delete existing custom field values
      await prisma.lead_field_values.deleteMany({
        where: { lead_id: BigInt(id) },
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
          lead_id: BigInt(id),
          lead_field_id: parseInt(fieldId),
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
          created_at: new Date(),
          updated_at: new Date(),
        }))

      if (fieldValues.length > 0) {
        await prisma.lead_field_values.createMany({
          data: fieldValues,
        })
      }
    }

    // Serialize BigInt to number for JSON response
    const serializedLead = {
      ...lead,
      id: Number(lead.id),
    }

    return NextResponse.json(serializedLead)
  } catch (error: any) {
    console.error("Error updating lead:", error)
    console.error("Error message:", error?.message)
    console.error("Error stack:", error?.stack)
    return NextResponse.json({
      error: "Failed to update lead",
      details: error?.message || String(error)
    }, { status: 500 })
  }
}

// DELETE lead
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
    await prisma.leads.delete({
      where: { id: BigInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
