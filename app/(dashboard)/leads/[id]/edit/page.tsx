import { prisma } from "@/lib/prisma"
import { LeadFormClient } from "@/components/leads/lead-form-client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

async function getFormData(leadId: string) {
  const lead = await prisma.leads.findUnique({
    where: { id: parseInt(leadId) },
    include: {
      lead_field_values: {
        select: {
          lead_field_id: true,
          value: true,
        },
      },
    },
  })

  if (!lead) {
    return null
  }

  // Get custom fields
  const customFields = await prisma.lead_fields.findMany({
    where: { is_active: true },
    include: {
      lead_field_options: {
        where: { is_active: true },
        orderBy: { sort_order: "asc" },
      },
    },
    orderBy: { sort_order: "asc" },
  })

  // Convert BigInt to number for JSON serialization
  const serializedLead = {
    ...lead,
    id: Number(lead.id),
    lead_field_values: lead.lead_field_values.map((fv) => ({
      lead_field_id: Number(fv.lead_field_id),
      value: fv.value,
    })),
  }

  const serializedFields = customFields.map((field) => ({
    ...field,
    id: Number(field.id),
    lead_field_options: field.lead_field_options.map((opt) => ({
      ...opt,
      id: Number(opt.id),
      lead_field_id: Number(opt.lead_field_id),
    })),
  }))

  return {
    lead: serializedLead,
    customFields: serializedFields,
  }
}

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getFormData(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="h-full bg-gray-50">
      <LeadFormClient {...data} />
    </div>
  )
}
