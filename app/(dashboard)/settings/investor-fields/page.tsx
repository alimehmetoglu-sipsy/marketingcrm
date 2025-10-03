import { prisma } from "@/lib/prisma"
import { InvestorFieldsClient } from "@/components/settings/investor-fields-client"
import { InvestorFormViewConfigurator } from "@/components/settings/investor-form-view-configurator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

async function getInvestorFields() {
  const fields = await prisma.investor_fields.findMany({
    include: {
      investor_field_options: {
        orderBy: { sort_order: "asc" },
      },
    },
    orderBy: { sort_order: "asc" },
  })

  // Convert BigInt to number for JSON serialization
  return fields.map(field => ({
    ...field,
    id: Number(field.id),
    investor_field_options: field.investor_field_options.map(opt => ({
      ...opt,
      id: Number(opt.id),
      investor_field_id: Number(opt.investor_field_id),
    })),
  }))
}

async function getFormSections() {
  const sections = await prisma.investor_form_sections.findMany({
    orderBy: { sort_order: "asc" },
  })

  return sections.map(section => ({
    ...section,
    id: Number(section.id),
  }))
}

export default async function InvestorFieldsPage() {
  const fields = await getInvestorFields()
  const sections = await getFormSections()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 mb-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Investor Properties</h1>
        <p className="text-emerald-100">
          Manage custom fields and configure investor properties
        </p>
      </div>

      <Tabs defaultValue="configurator" className="flex-1 flex flex-col">
        <TabsList className="mb-6">
          <TabsTrigger value="configurator">Form Layout Configurator</TabsTrigger>
          <TabsTrigger value="properties">Properties Management</TabsTrigger>
        </TabsList>

        <TabsContent value="configurator" className="flex-1">
          <InvestorFormViewConfigurator initialSections={sections} initialFields={fields} />
        </TabsContent>

        <TabsContent value="properties" className="flex-1">
          <InvestorFieldsClient fields={fields} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
