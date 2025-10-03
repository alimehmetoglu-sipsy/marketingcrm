import { prisma } from "@/lib/prisma"
import { FormViewConfigurator } from "@/components/settings/form-view-configurator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadFieldsClient } from "@/components/settings/lead-fields-client"

export const dynamic = "force-dynamic"

async function getLeadFields() {
  const fields = await prisma.lead_fields.findMany({
    include: {
      lead_field_options: {
        orderBy: { sort_order: "asc" },
      },
    },
    orderBy: { sort_order: "asc" },
  })

  // Convert BigInt to number for JSON serialization
  return fields.map(field => ({
    ...field,
    id: Number(field.id),
    section_key: field.section_key,
    lead_field_options: field.lead_field_options.map(opt => ({
      ...opt,
      id: Number(opt.id),
      lead_field_id: Number(opt.lead_field_id),
    })),
  }))
}

async function getFormSections() {
  const sections = await prisma.lead_form_sections.findMany({
    orderBy: { sort_order: "asc" },
  })

  return sections.map(section => ({
    ...section,
    id: Number(section.id),
  }))
}

export default async function LeadFieldsPage() {
  const fields = await getLeadFields()
  const sections = await getFormSections()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 mb-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Lead Properties</h1>
        <p className="text-indigo-100">
          Manage custom fields and configure form layout
        </p>
      </div>

      <Tabs defaultValue="configurator" className="flex-1 flex flex-col">
        <TabsList className="mb-6">
          <TabsTrigger value="configurator">Form Layout Configurator</TabsTrigger>
          <TabsTrigger value="properties">Properties Management</TabsTrigger>
        </TabsList>

        <TabsContent value="configurator" className="flex-1">
          <FormViewConfigurator initialSections={sections} initialFields={fields} />
        </TabsContent>

        <TabsContent value="properties" className="flex-1">
          <LeadFieldsClient fields={fields} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
