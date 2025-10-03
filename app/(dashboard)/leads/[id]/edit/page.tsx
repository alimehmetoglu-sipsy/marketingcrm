import { prisma } from "@/lib/prisma"
import { LeadFormClient } from "@/components/leads/lead-form-client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

async function getFormData(leadId: string) {
  const [lead, customFields, sourceField, statusField, priorityField] = await Promise.all([
    prisma.leads.findUnique({
      where: { id: parseInt(leadId) },
      include: {
        lead_field_values: {
          include: {
            lead_fields: true,
          },
        },
      },
    }),
    prisma.lead_fields.findMany({
      where: { is_active: true },
      include: {
        lead_field_options: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
        },
      },
      orderBy: { sort_order: "asc" },
    }),
    // Fetch source field and its options from database
    prisma.lead_fields.findFirst({
      where: { name: "source", is_active: true },
      include: {
        lead_field_options: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
        },
      },
    }),
    // Fetch status field and its options from database
    prisma.lead_fields.findFirst({
      where: { name: "status", is_active: true },
      include: {
        lead_field_options: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
        },
      },
    }),
    // Fetch priority field and its options from database
    prisma.lead_fields.findFirst({
      where: { name: "priority", is_active: true },
      include: {
        lead_field_options: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
        },
      },
    }),
  ])

  if (!lead) {
    notFound()
  }

  // Convert BigInt to number for JSON serialization
  // Parse multiselect values from JSON strings
  const serializedLead = {
    ...lead,
    id: Number(lead.id),
    notes: lead.notes_text || "",
    updated_at: lead.updated_at || undefined,
    lead_field_values: lead.lead_field_values?.map(fv => {
      let parsedValue = fv.value || ""

      // Try to parse JSON for multiselect fields
      if (parsedValue && typeof parsedValue === 'string') {
        const fieldType = fv.lead_fields?.type
        if (fieldType === 'multiselect' || fieldType === 'multiselect_dropdown') {
          try {
            parsedValue = JSON.parse(parsedValue)
          } catch (e) {
            // If parsing fails, keep as string
          }
        }
      }

      return {
        lead_field_id: Number(fv.lead_field_id),
        value: parsedValue,
      }
    }) || [],
  }

  const serializedFields = customFields.map(field => ({
    ...field,
    id: Number(field.id),
    lead_field_options: field.lead_field_options.map(opt => ({
      ...opt,
      id: Number(opt.id),
      lead_field_id: Number(opt.lead_field_id),
    })),
  }))

  // Convert field options to simple array format
  const sources = sourceField?.lead_field_options.map(opt => ({
    value: opt.value,
    label: opt.label
  })) || []

  const statuses = statusField?.lead_field_options.map(opt => ({
    value: opt.value,
    label: opt.label
  })) || []

  const priorities = priorityField?.lead_field_options.map(opt => ({
    value: opt.value,
    label: opt.label
  })) || []

  return {
    lead: serializedLead,
    customFields: serializedFields,
    sources,
    statuses,
    priorities,
    sourceRequired: sourceField?.is_required || false,
    statusRequired: statusField?.is_required || false,
    priorityRequired: priorityField?.is_required || false,
  }
}

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const formData = await getFormData(id)

  return (
    <div className="h-full bg-gray-50">
      <LeadFormClient {...formData} />
    </div>
  )
}
