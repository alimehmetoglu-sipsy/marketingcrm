import { prisma } from "@/lib/prisma"
import { LeadsTableWithFilters } from "@/components/leads/leads-table-with-filters"
import { AddLeadButton } from "@/components/leads/add-lead-button"

async function getLeadsData() {
  const [leads, leadFields] = await Promise.all([
    prisma.leads.findMany({
      orderBy: { created_at: "desc" },
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
  ])

  // Convert BigInt to number and parse JSON values
  const serializedLeads = leads.map((lead) => ({
    ...lead,
    id: Number(lead.id),
    lead_field_values: lead.lead_field_values.map((fv) => {
      let parsedValue = fv.value

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
        ...fv,
        id: Number(fv.id),
        lead_id: Number(fv.lead_id),
        lead_field_id: Number(fv.lead_field_id),
        value: parsedValue,
      }
    }),
  }))

  const serializedFields = leadFields.map((field) => ({
    ...field,
    id: Number(field.id),
    lead_field_options: field.lead_field_options.map((opt) => ({
      ...opt,
      id: Number(opt.id),
      lead_field_id: Number(opt.lead_field_id),
    })),
  }))

  return { leads: serializedLeads, leadFields: serializedFields }
}

export default async function LeadsPage() {
  const { leads, leadFields } = await getLeadsData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your leads through the sales pipeline
          </p>
        </div>
        <AddLeadButton />
      </div>

      <LeadsTableWithFilters leads={leads} leadFields={leadFields} />
    </div>
  )
}
