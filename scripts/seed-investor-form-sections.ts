import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding investor form sections...')

  const sections = [
    {
      section_key: 'investor_information',
      name: 'Investor Information',
      is_visible: true,
      is_default_open: true,
      sort_order: 1,
      icon: 'user',
      gradient: 'bg-gradient-to-br from-emerald-600 to-teal-500',
    },
    {
      section_key: 'investment_details',
      name: 'Investor Details',
      is_visible: true,
      is_default_open: true,
      sort_order: 2,
      icon: 'briefcase',
      gradient: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    },
  ]

  for (const section of sections) {
    await prisma.investor_form_sections.upsert({
      where: { section_key: section.section_key },
      update: section,
      create: section,
    })
  }

  console.log('✅ Investor form sections seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
