import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding investor system fields (source, status, priority)...')

  // Source field
  const sourceField = await prisma.investor_fields.create({
    data: {
      name: 'source',
      label: 'Source',
      type: 'select',
      is_required: true,
      is_active: true,
      is_system_field: true,
      sort_order: 100,
      section_key: 'investor_information',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email', label: 'Email' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ]

  for (let i = 0; i < sourceOptions.length; i++) {
    await prisma.investor_field_options.create({
      data: {
        investor_field_id: sourceField.id,
        value: sourceOptions[i].value,
        label: sourceOptions[i].label,
        sort_order: i,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  // Status field
  const statusField = await prisma.investor_fields.create({
    data: {
      name: 'status',
      label: 'Status',
      type: 'select',
      is_required: false,
      is_active: true,
      is_system_field: true,
      sort_order: 101,
      section_key: 'investment_details',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  const statusOptions = [
    { value: 'potential', label: 'Potential' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interested', label: 'Interested' },
    { value: 'committed', label: 'Committed' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  for (let i = 0; i < statusOptions.length; i++) {
    await prisma.investor_field_options.create({
      data: {
        investor_field_id: statusField.id,
        value: statusOptions[i].value,
        label: statusOptions[i].label,
        sort_order: i,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  // Priority field
  const priorityField = await prisma.investor_fields.create({
    data: {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      is_required: false,
      is_active: true,
      is_system_field: true,
      sort_order: 102,
      section_key: 'investment_details',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  for (let i = 0; i < priorityOptions.length; i++) {
    await prisma.investor_field_options.create({
      data: {
        investor_field_id: priorityField.id,
        value: priorityOptions[i].value,
        label: priorityOptions[i].label,
        sort_order: i,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  console.log('✅ Investor system fields (source, status, priority) seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
