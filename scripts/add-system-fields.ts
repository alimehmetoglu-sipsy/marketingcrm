import { PrismaClient } from "../lib/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  console.log("Adding system fields (Source, Status, Priority) to lead_fields...")

  // Check if fields already exist
  const existingFields = await prisma.lead_fields.findMany({
    where: {
      name: {
        in: ["source", "status", "priority"]
      }
    }
  })

  if (existingFields.length > 0) {
    console.log("System fields already exist, updating them...")

    // Update existing fields
    for (const field of existingFields) {
      await prisma.lead_fields.update({
        where: { id: field.id },
        data: {
          section_key: "lead_details",
          is_active: true,
          is_system_field: true,
          is_required: true,
          sort_order: field.name === "source" ? 1 : field.name === "status" ? 2 : 3
        }
      })
    }

    console.log("Updated existing system fields")
  } else {
    // Create Source field
    await prisma.lead_fields.create({
      data: {
        name: "source",
        label: "Source",
        type: "select",
        is_required: true,
        is_active: true,
        is_system_field: true,
        section_key: "lead_details",
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Create source options
    const sourceField = await prisma.lead_fields.findFirst({
      where: { name: "source" }
    })

    if (sourceField) {
      const sourceOptions = [
        { value: "website", label: "Website" },
        { value: "social_media", label: "Social Media" },
        { value: "referral", label: "Referral" },
        { value: "cold_call", label: "Cold Call" },
        { value: "email", label: "Email" },
        { value: "event", label: "Event" },
        { value: "other", label: "Other" },
      ]

      for (let i = 0; i < sourceOptions.length; i++) {
        await prisma.lead_field_options.create({
          data: {
            lead_field_id: sourceField.id,
            value: sourceOptions[i].value,
            label: sourceOptions[i].label,
            sort_order: i,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      }
    }

    // Create Status field
    await prisma.lead_fields.create({
      data: {
        name: "status",
        label: "Status",
        type: "select",
        is_required: true,
        is_active: true,
        is_system_field: true,
        section_key: "lead_details",
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Create status options
    const statusField = await prisma.lead_fields.findFirst({
      where: { name: "status" }
    })

    if (statusField) {
      const statusOptions = [
        { value: "new", label: "New" },
        { value: "contacted", label: "Contacted" },
        { value: "qualified", label: "Qualified" },
        { value: "proposal", label: "Proposal" },
        { value: "negotiation", label: "Negotiation" },
        { value: "won", label: "Won" },
        { value: "lost", label: "Lost" },
      ]

      for (let i = 0; i < statusOptions.length; i++) {
        await prisma.lead_field_options.create({
          data: {
            lead_field_id: statusField.id,
            value: statusOptions[i].value,
            label: statusOptions[i].label,
            sort_order: i,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      }
    }

    // Create Priority field
    await prisma.lead_fields.create({
      data: {
        name: "priority",
        label: "Priority",
        type: "select",
        is_required: true,
        is_active: true,
        is_system_field: true,
        section_key: "lead_details",
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Create priority options
    const priorityField = await prisma.lead_fields.findFirst({
      where: { name: "priority" }
    })

    if (priorityField) {
      const priorityOptions = [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" },
      ]

      for (let i = 0; i < priorityOptions.length; i++) {
        await prisma.lead_field_options.create({
          data: {
            lead_field_id: priorityField.id,
            value: priorityOptions[i].value,
            label: priorityOptions[i].label,
            sort_order: i,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      }
    }

    console.log("✅ Successfully added system fields!")
  }

  // Update custom field sort order to come after system fields
  const customFields = await prisma.lead_fields.findMany({
    where: {
      name: {
        notIn: ["source", "status", "priority"]
      }
    }
  })

  for (let i = 0; i < customFields.length; i++) {
    await prisma.lead_fields.update({
      where: { id: customFields[i].id },
      data: {
        sort_order: i + 10, // Start after system fields
        section_key: "lead_details"
      }
    })
  }

  console.log("✅ Updated custom field sort orders")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
