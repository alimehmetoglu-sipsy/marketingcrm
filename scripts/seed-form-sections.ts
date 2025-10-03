import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

async function seedFormSections() {
  const sections = [
    {
      section_key: "contact_information",
      name: "Contact Information",
      is_visible: true,
      is_default_open: true,
      sort_order: 1,
      icon: "user",
      gradient: "bg-gradient-to-br from-[#FF7A59] to-[#FF9B82]",
    },
    {
      section_key: "company_information",
      name: "Company Information",
      is_visible: true,
      is_default_open: true,
      sort_order: 2,
      icon: "briefcase",
      gradient: "bg-gradient-to-br from-[#0091AE] to-[#00B8D4]",
    },
    {
      section_key: "lead_details",
      name: "Lead Details",
      is_visible: true,
      is_default_open: true,
      sort_order: 3,
      icon: "document",
      gradient: "bg-gradient-to-br from-[#00BDA5] to-[#00D4B8]",
    },
    {
      section_key: "custom_fields",
      name: "Additional Information",
      is_visible: true,
      is_default_open: false,
      sort_order: 4,
      icon: "layout",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
  ]

  console.log("Seeding lead form sections...")

  for (const section of sections) {
    const existing = await prisma.lead_form_sections.findUnique({
      where: { section_key: section.section_key },
    })

    if (!existing) {
      await prisma.lead_form_sections.create({
        data: section,
      })
      console.log(`✓ Created section: ${section.name}`)
    } else {
      console.log(`- Section already exists: ${section.name}`)
    }
  }

  console.log("Seeding completed!")
}

seedFormSections()
  .catch((e) => {
    console.error("Error seeding form sections:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
