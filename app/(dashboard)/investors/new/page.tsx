import { prisma } from "@/lib/prisma"
import { InvestorFormClient } from "@/components/investors/investor-form-client"

export const dynamic = "force-dynamic"

async function getFormData() {
  const customFields = await prisma.investor_fields.findMany({
    where: { is_active: true },
    include: {
      investor_field_options: {
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
    investor_field_options: field.investor_field_options.map(opt => ({
      ...opt,
      id: Number(opt.id),
      investor_field_id: Number(opt.investor_field_id),
    })),
  }))

  return {
    customFields: serializedFields,
  }
}

export default async function NewInvestorPage() {
  const formData = await getFormData()

  return (
    <div className="h-full bg-gray-50">
      <InvestorFormClient {...formData} />
    </div>
  )
}
