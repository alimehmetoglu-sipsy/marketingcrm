import { PrismaClient } from '../lib/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('\n📝 Checking/Creating admin role and user...')

  // Create or get admin role
  let adminRole = await prisma.roles.findUnique({
    where: { slug: 'admin' },
  })

  if (!adminRole) {
    adminRole = await prisma.roles.create({
      data: {
        name: 'Administrator',
        slug: 'admin',
        description: 'Full system access',
        permissions: {
          menus: {
            dashboard: true,
            leads: true,
            investors: true,
            tasks: true,
            activities: true,
            reports: true,
            settings: {
              leadFields: true,
              investorFields: true,
              activityTypes: true,
              users: true,
              roles: true,
            },
          },
          dataAccess: {
            leads: 'all',
            investors: 'all',
            activities: 'all',
          },
        },
        is_system: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
    console.log('✅ Admin role created')
  } else {
    console.log('✅ Admin role already exists')
  }

  // Check if admin user exists
  const existingUser = await prisma.users.findUnique({
    where: { email: 'admin@example.com' },
  })

  if (existingUser) {
    // Update existing user with role if needed
    if (!existingUser.role_id) {
      await prisma.users.update({
        where: { id: existingUser.id },
        data: { role_id: adminRole.id },
      })
      console.log('✅ Admin user updated with role: admin@example.com')
    } else {
      console.log('✅ Admin user already exists: admin@example.com')
    }
    return
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash('password', 10)

  await prisma.users.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role_id: adminRole.id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  console.log('✅ Admin user created: admin@example.com / password')
}

async function seedLeadFormSections() {
  console.log('\n📝 Seeding lead form sections...')

  const sections = [
    {
      section_key: 'contact_information',
      name: 'Contact Information',
      is_visible: true,
      is_default_open: true,
      sort_order: 1,
      icon: 'user',
      gradient: 'bg-gradient-to-br from-[#FF7A59] to-[#FF9B82]',
    },
    {
      section_key: 'company_information',
      name: 'Company Information',
      is_visible: true,
      is_default_open: true,
      sort_order: 2,
      icon: 'briefcase',
      gradient: 'bg-gradient-to-br from-[#0091AE] to-[#00B8D4]',
    },
    {
      section_key: 'lead_details',
      name: 'Lead Details',
      is_visible: true,
      is_default_open: true,
      sort_order: 3,
      icon: 'document',
      gradient: 'bg-gradient-to-br from-[#00BDA5] to-[#00D4B8]',
    },
    {
      section_key: 'custom_fields',
      name: 'Additional Information',
      is_visible: true,
      is_default_open: false,
      sort_order: 4,
      icon: 'layout',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
  ]

  for (const section of sections) {
    await prisma.lead_form_sections.upsert({
      where: { section_key: section.section_key },
      update: section,
      create: section,
    })
  }

  console.log('✅ Lead form sections seeded')
}

async function seedLeadSystemFields() {
  console.log('\n📝 Seeding lead system fields...')

  // Check if already seeded
  const existing = await prisma.lead_fields.findFirst({
    where: { name: 'source', is_system_field: true },
  })

  if (existing) {
    console.log('✅ Lead system fields already exist (skipping)')
    return
  }

  // Source field
  const sourceField = await prisma.lead_fields.create({
    data: {
      name: 'source',
      label: 'Source',
      type: 'select',
      is_required: false,
      is_active: true,
      is_system_field: true,
      sort_order: 100,
      section_key: 'lead_details',
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
    await prisma.lead_field_options.create({
      data: {
        lead_field_id: sourceField.id,
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
  const statusField = await prisma.lead_fields.create({
    data: {
      name: 'status',
      label: 'Status',
      type: 'select',
      is_required: false,
      is_active: true,
      is_system_field: true,
      sort_order: 101,
      section_key: 'lead_details',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
  ]

  for (let i = 0; i < statusOptions.length; i++) {
    await prisma.lead_field_options.create({
      data: {
        lead_field_id: statusField.id,
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
  const priorityField = await prisma.lead_fields.create({
    data: {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      is_required: false,
      is_active: true,
      is_system_field: true,
      sort_order: 102,
      section_key: 'lead_details',
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
    await prisma.lead_field_options.create({
      data: {
        lead_field_id: priorityField.id,
        value: priorityOptions[i].value,
        label: priorityOptions[i].label,
        sort_order: i,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  console.log('✅ Lead system fields seeded (source, status, priority)')
}

async function seedInvestorFormSections() {
  console.log('\n📝 Seeding investor form sections...')

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
      name: 'Investment Details',
      is_visible: true,
      is_default_open: true,
      sort_order: 2,
      icon: 'briefcase',
      gradient: 'bg-gradient-to-br from-blue-600 to-indigo-500',
    },
  ]

  for (const section of sections) {
    await prisma.investor_form_sections.upsert({
      where: { section_key: section.section_key },
      update: section,
      create: section,
    })
  }

  console.log('✅ Investor form sections seeded')
}

async function seedInvestorSystemFields() {
  console.log('\n📝 Seeding investor system fields...')

  // Check if already seeded
  const existing = await prisma.investor_fields.findFirst({
    where: { name: 'source', is_system_field: true },
  })

  if (existing) {
    console.log('✅ Investor system fields already exist (skipping)')
    return
  }

  // Source field
  const sourceField = await prisma.investor_fields.create({
    data: {
      name: 'source',
      label: 'Source',
      type: 'select',
      is_required: false,
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
      section_key: 'investor_information',
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
      section_key: 'investor_information',
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

  console.log('✅ Investor system fields seeded (source, status, priority)')
}

async function main() {
  console.log('🌱 Starting database seeding...\n')
  console.log('=' .repeat(60))

  await seedUsers()
  await seedLeadFormSections()
  await seedLeadSystemFields()
  await seedInvestorFormSections()
  await seedInvestorSystemFields()

  console.log('\n' + '='.repeat(60))
  console.log('\n🎉 All seeds completed successfully!')
  console.log('\n📋 Summary:')
  console.log('  ✅ Admin Role: Administrator (full system access)')
  console.log('  ✅ Admin User: admin@example.com / password')
  console.log('  ✅ Lead form sections')
  console.log('  ✅ Lead system fields (source, status, priority)')
  console.log('  ✅ Investor form sections')
  console.log('  ✅ Investor system fields (source, status, priority)')
  console.log('\n💡 You can now login at http://localhost:3000/login')
  console.log('   Email: admin@example.com')
  console.log('   Password: password')
  console.log('\n')
}

main()
  .catch((e) => {
    console.error('\n❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
