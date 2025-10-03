import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { InvestorFormClient } from "@/components/investors/investor-form-client"

export const dynamic = "force-dynamic"

async function getInvestor(id: string) {
  const investor = await prisma.investors.findUnique({
    where: { id: parseInt(id) },
    include: {
      investor_field_values: {
        select: {
          investor_field_id: true,
          value: true,
        },
      },
    },
  })

  if (!investor) {
    return null
  }

  // Get custom fields
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

  // Convert BigInt to number
  const serializedInvestor = {
    ...investor,
    id: Number(investor.id),
    lead_id: investor.lead_id ? Number(investor.lead_id) : null,
    investor_field_values: investor.investor_field_values.map((fv) => ({
      investor_field_id: Number(fv.investor_field_id),
      value: fv.value,
    })),
  }

  const serializedFields = customFields.map((field) => ({
    ...field,
    id: Number(field.id),
    investor_field_options: field.investor_field_options.map((opt) => ({
      ...opt,
      id: Number(opt.id),
      investor_field_id: Number(opt.investor_field_id),
    })),
  }))

  return {
    investor: serializedInvestor,
    customFields: serializedFields,
  }
}

export default async function InvestorEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getInvestor(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="h-full bg-gray-50">
      <InvestorFormClient {...data} />
    </div>
  )
}
