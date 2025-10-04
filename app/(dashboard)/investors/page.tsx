import { prisma } from "@/lib/prisma"
import { InvestorsTableWithFilters } from "@/components/investors/investors-table-with-filters"
import { AddInvestorButton } from "@/components/investors/add-investor-button"
import { auth } from "@/lib/auth-config"
import { checkMenuPermission } from "@/lib/permissions"
import { Unauthorized } from "@/components/unauthorized"

async function getInvestorsData() {
  const [investors, investorFields] = await Promise.all([
    prisma.investors.findMany({
      orderBy: { created_at: "desc" },
      include: {
        investor_field_values: {
          include: {
            investor_fields: true,
          },
        },
      },
    }),
    prisma.investor_fields.findMany({
      where: { is_active: true },
      include: {
        investor_field_options: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
        },
      },
      orderBy: { sort_order: "asc" },
    }),
  ])

  // Convert BigInt to number and parse JSON values
  const serializedInvestors = investors.map((investor) => ({
    ...investor,
    id: Number(investor.id),
    lead_id: investor.lead_id ? Number(investor.lead_id) : null,
    representative_id: investor.representative_id ? Number(investor.representative_id) : null,
    created_by: investor.created_by ? Number(investor.created_by) : null,
    updated_by: investor.updated_by ? Number(investor.updated_by) : null,
    investor_field_values: investor.investor_field_values.map((fv) => {
      let parsedValue = fv.value

      // Try to parse JSON for multiselect fields
      if (parsedValue && typeof parsedValue === 'string') {
        const fieldType = fv.investor_fields?.type
        if (fieldType === 'multiselect' || fieldType === 'multiselect_dropdown') {
          try {
            parsedValue = JSON.parse(parsedValue)
          } catch (e) {
            // If parsing fails, keep as string
          }
        }
      }

      return {
        ...fv,
        id: Number(fv.id),
        investor_id: Number(fv.investor_id),
        investor_field_id: Number(fv.investor_field_id),
        value: parsedValue,
      }
    }),
  }))

  const serializedFields = investorFields.map((field) => ({
    ...field,
    id: Number(field.id),
    investor_field_options: field.investor_field_options.map((opt) => ({
      ...opt,
      id: Number(opt.id),
      investor_field_id: Number(opt.investor_field_id),
    })),
  }))

  return { investors: serializedInvestors, investorFields: serializedFields }
}

export default async function InvestorsPage() {
  const session = await auth()

  // Check permission
  if (!checkMenuPermission(session?.user?.permissions, "investors")) {
    return <Unauthorized />
  }

  const { investors, investorFields } = await getInvestorsData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Investors</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your investor relationships
          </p>
        </div>
        <AddInvestorButton />
      </div>

      <InvestorsTableWithFilters investors={investors} investorFields={investorFields} />
    </div>
  )
}
