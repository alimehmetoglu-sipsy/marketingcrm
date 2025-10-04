import { prisma } from "@/lib/prisma"
import { LeadFormClient } from "@/components/leads/lead-form-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getFormData() {
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
