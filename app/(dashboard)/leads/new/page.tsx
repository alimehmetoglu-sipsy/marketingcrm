import { prisma } from "@/lib/prisma"
import { LeadFormClient } from "@/components/leads/lead-form-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getFormData() {
  const [customFields, sourceField, statusField, priorityField] = await Promise.all([
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

  // Convert BigInt to number for JSON serialization
  const serializedFields = customFields.map(field => ({
    ...field,
    id: Number(field.id),
    lead_field_options: field.lead_field_options.map(opt => ({
      ...opt,
      id: Number(opt.id),
      lead_field_id: Number(opt.lead_field_id),
    })),
  }))

  return {
    customFields: serializedFields,
    sources,
    statuses,
    priorities,
    sourceRequired: sourceField?.is_required || false,
    statusRequired: statusField?.is_required || false,
    priorityRequired: priorityField?.is_required || false,
  }
}

export default async function NewLeadPage() {
  const formData = await getFormData()

  return (
    <div className="h-full bg-gray-50">
      <LeadFormClient {...formData} />
    </div>
  )
}
