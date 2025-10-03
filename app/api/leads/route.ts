import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"

// GET all leads
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leads = await prisma.leads.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    })

    // Convert BigInt to number
    const serializedLeads = leads.map(lead => ({
      ...lead,
      id: Number(lead.id),
      representative_id: lead.representative_id ? Number(lead.representative_id) : null,
      activity_id: lead.activity_id ? Number(lead.activity_id) : null,
    }))

    return NextResponse.json(serializedLeads)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

// POST create lead
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { customFields, ...leadData } = body

    // Check for unique email
    const existingEmail = await prisma.leads.findUnique({
      where: { email: leadData.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "A lead with this email already exists" },
        { status: 400 }
      )
    }

    // Check for unique phone
    const existingPhone = await prisma.leads.findUnique({
      where: { phone: leadData.phone },
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: "A lead with this phone number already exists" },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = await prisma.lead_fields.findMany({
      where: { is_required: true, is_active: true },
      select: { id: true, name: true, label: true }
    })

    const missingFields: string[] = []

    for (const field of requiredFields) {
      const fieldValue = customFields?.[field.name] || customFields?.[field.id.toString()]

      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        missingFields.push(field.label)
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Required fields are missing",
          details: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          missingFields
        },
        { status: 400 }
      )
    }

    // Get system field values from customFields
    const sourceFieldId = await prisma.lead_fields.findFirst({
      where: { name: "source" },
      select: { id: true }
    })
    const statusFieldId = await prisma.lead_fields.findFirst({
      where: { name: "status" },
      select: { id: true }
    })
    const priorityFieldId = await prisma.lead_fields.findFirst({
      where: { name: "priority" },
      select: { id: true }
    })

    // Extract system field values - check both by name and by ID
    // Only use default values for required fields (source and status)
    const sourceValue = customFields?.["source"] ||
                       (sourceFieldId && customFields?.[sourceFieldId.id.toString()]) ||
                       "website"
    const statusValue = customFields?.["status"] ||
                       (statusFieldId && customFields?.[statusFieldId.id.toString()]) ||
                       "new"

    // Priority is optional - only set if provided by user, otherwise null
    const priorityValue = customFields?.["priority"] ||
                         (priorityFieldId && customFields?.[priorityFieldId.id.toString()]) ||
                         null

    const lead = await prisma.leads.create({
      data: {
        full_name: leadData.full_name,
        email: leadData.email,
        phone: leadData.phone,
        source: sourceValue,
        status: statusValue,
        priority: priorityValue,
        notes_text: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Save custom field values
    if (customFields && typeof customFields === "object") {
      const fieldValues = Object.entries(customFields)
        .filter(([fieldId, value]) => {
          // Filter out system fields (source, status, priority) and empty values
          if (["source", "status", "priority"].includes(fieldId)) return false
          if (value === null || value === undefined || value === "") return false
          return true
        })
        .map(([fieldId, value]) => ({
          lead_id: lead.id,
          lead_field_id: BigInt(fieldId),
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

    return NextResponse.json({
      ...lead,
      id: Number(lead.id),
      representative_id: lead.representative_id ? Number(lead.representative_id) : null,
      activity_id: lead.activity_id ? Number(lead.activity_id) : null,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create lead" },
      { status: 500 }
    )
  }
}
