import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding lead form sections...')

  // Delete existing sections first
  await prisma.lead_form_sections.deleteMany({})

  // Contact Information Section
  await prisma.lead_form_sections.create({
    data: {
      section_key: 'contact_information',
      name: 'Contact Information',
      is_visible: true,
      is_default_open: true,
      sort_order: 1,
      icon: 'user',
      gradient: 'bg-gradient-to-br from-blue-600 to-indigo-500',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Lead Details Section
  await prisma.lead_form_sections.create({
    data: {
      section_key: 'lead_details',
      name: 'Lead Details',
      is_visible: true,
      is_default_open: true,
      sort_order: 2,
      icon: 'briefcase',
      gradient: 'bg-gradient-to-br from-purple-600 to-pink-500',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  console.log('✅ Lead form sections seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
