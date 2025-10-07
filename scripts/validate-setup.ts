import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

interface ValidationResult {
  check: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: string
}

const results: ValidationResult[] = []

function addResult(check: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: string) {
  results.push({ check, status, message, details })
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('🔍 MARKETING CRM - SETUP VALIDATION REPORT')
  console.log('='.repeat(80) + '\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.check}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   ${result.details}`)
    }
    console.log()
  })

  console.log('='.repeat(80))
  console.log('\n📊 SUMMARY')
  console.log(`   ✅ Passed:   ${passed}`)
  console.log(`   ❌ Failed:   ${failed}`)
  console.log(`   ⚠️  Warnings: ${warnings}`)
  console.log(`   📋 Total:    ${results.length}\n`)

  if (failed > 0) {
    console.log('❌ Setup validation FAILED! Please fix the errors above.\n')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('⚠️  Setup validation completed with warnings.\n')
    process.exit(0)
  } else {
    console.log('🎉 Setup validation PASSED! Your CRM is ready to use.\n')
    process.exit(0)
  }
}

async function validateEnvironment() {
  console.log('Checking environment variables...')

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    addResult('Environment Variables', 'FAIL', 'DATABASE_URL is not set',
      'Please create a .env file with DATABASE_URL')
    return
  }

  addResult('Environment Variables', 'PASS', 'DATABASE_URL is configured')

  // Check NEXTAUTH_URL
  if (!process.env.NEXTAUTH_URL) {
    addResult('NextAuth URL', 'WARN', 'NEXTAUTH_URL is not set',
      'Authentication may not work correctly')
  } else {
    addResult('NextAuth URL', 'PASS', `NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
  }

  // Check NEXTAUTH_SECRET
  if (!process.env.NEXTAUTH_SECRET) {
    addResult('NextAuth Secret', 'WARN', 'NEXTAUTH_SECRET is not set',
      'Please set a secure secret for production')
  } else if (process.env.NEXTAUTH_SECRET === 'your-secret-key-change-in-production') {
    addResult('NextAuth Secret', 'WARN', 'Using default NEXTAUTH_SECRET',
      'Change this to a secure value in production!')
  } else {
    addResult('NextAuth Secret', 'PASS', 'NEXTAUTH_SECRET is configured')
  }

  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development'
  addResult('Node Environment', 'PASS', `NODE_ENV: ${nodeEnv}`)
}

async function validateDatabaseConnection() {
  console.log('Testing database connection...')

  try {
    await prisma.$connect()
    addResult('Database Connection', 'PASS', 'Successfully connected to database')
  } catch (error) {
    addResult('Database Connection', 'FAIL', 'Failed to connect to database',
      error instanceof Error ? error.message : String(error))
    return false
  }

  return true
}

async function validateTables() {
  console.log('Validating database tables...')

  const requiredTables = [
    'users',
    'leads',
    'investors',
    'activities',
    'lead_fields',
    'lead_field_options',
    'lead_field_values',
    'lead_form_sections',
    'investor_fields',
    'investor_field_options',
    'investor_field_values',
    'investor_form_sections',
  ]

  let allTablesExist = true

  for (const table of requiredTables) {
    try {
      // Test if table exists by running a simple query
      await prisma.$queryRawUnsafe(`SELECT 1 FROM \`${table}\` LIMIT 1`)
    } catch (error) {
      addResult(`Table: ${table}`, 'FAIL', `Table '${table}' does not exist`,
        'Run: npx prisma db push')
      allTablesExist = false
      continue
    }
  }

  if (allTablesExist) {
    addResult('Database Schema', 'PASS', `All ${requiredTables.length} required tables exist`)
  }
}

async function validateAdminUser() {
  console.log('Checking admin user...')

  try {
    const adminUser = await prisma.users.findUnique({
      where: { email: 'admin@example.com' },
    })

    if (adminUser) {
      addResult('Admin User', 'PASS', 'Admin user exists',
        'Email: admin@example.com | Password: password')
    } else {
      addResult('Admin User', 'FAIL', 'Admin user not found',
        'Run: npm run seed:all')
    }
  } catch (error) {
    addResult('Admin User', 'FAIL', 'Failed to check admin user',
      error instanceof Error ? error.message : String(error))
  }
}

async function validateLeadFormSections() {
  console.log('Checking lead form sections...')

  try {
    const sections = await prisma.lead_form_sections.findMany()

    if (sections.length === 0) {
      addResult('Lead Form Sections', 'FAIL', 'No lead form sections found',
        'Run: npm run seed:all')
    } else {
      addResult('Lead Form Sections', 'PASS', `${sections.length} lead form sections configured`)
    }
  } catch (error) {
    addResult('Lead Form Sections', 'FAIL', 'Failed to check lead form sections',
      error instanceof Error ? error.message : String(error))
  }
}

async function validateLeadSystemFields() {
  console.log('Checking lead system fields...')

  try {
    const systemFields = await prisma.lead_fields.findMany({
      where: { is_system_field: true },
    })

    const requiredFields = ['source', 'status', 'priority']
    const foundFields = systemFields.map(f => f.name)
    const missingFields = requiredFields.filter(f => !foundFields.includes(f))

    if (missingFields.length > 0) {
      addResult('Lead System Fields', 'FAIL', `Missing system fields: ${missingFields.join(', ')}`,
        'Run: npm run seed:all')
    } else {
      addResult('Lead System Fields', 'PASS', `All ${requiredFields.length} system fields exist (source, status, priority)`)
    }
  } catch (error) {
    addResult('Lead System Fields', 'FAIL', 'Failed to check lead system fields',
      error instanceof Error ? error.message : String(error))
  }
}

async function validateInvestorFormSections() {
  console.log('Checking investor form sections...')

  try {
    const sections = await prisma.investor_form_sections.findMany()

    if (sections.length === 0) {
      addResult('Investor Form Sections', 'FAIL', 'No investor form sections found',
        'Run: npm run seed:all')
    } else {
      addResult('Investor Form Sections', 'PASS', `${sections.length} investor form sections configured`)
    }
  } catch (error) {
    addResult('Investor Form Sections', 'FAIL', 'Failed to check investor form sections',
      error instanceof Error ? error.message : String(error))
  }
}

async function validateInvestorSystemFields() {
  console.log('Checking investor system fields...')

  try {
    const systemFields = await prisma.investor_fields.findMany({
      where: { is_system_field: true },
    })

    const requiredFields = ['source', 'status', 'priority']
    const foundFields = systemFields.map(f => f.name)
    const missingFields = requiredFields.filter(f => !foundFields.includes(f))

    if (missingFields.length > 0) {
      addResult('Investor System Fields', 'FAIL', `Missing system fields: ${missingFields.join(', ')}`,
        'Run: npm run seed:all')
    } else {
      addResult('Investor System Fields', 'PASS', `All ${requiredFields.length} system fields exist (source, status, priority)`)
    }
  } catch (error) {
    addResult('Investor System Fields', 'FAIL', 'Failed to check investor system fields',
      error instanceof Error ? error.message : String(error))
  }
}

async function validateDataCounts() {
  console.log('Checking data statistics...')

  try {
    const [userCount, leadCount, investorCount, activityCount] = await Promise.all([
      prisma.users.count(),
      prisma.leads.count(),
      prisma.investors.count(),
      prisma.activities.count(),
    ])

    addResult('Data Statistics', 'PASS',
      `Users: ${userCount} | Leads: ${leadCount} | Investors: ${investorCount} | Activities: ${activityCount}`)
  } catch (error) {
    addResult('Data Statistics', 'WARN', 'Failed to get data counts',
      error instanceof Error ? error.message : String(error))
  }
}

async function main() {
  console.log('\n🔍 Starting Marketing CRM setup validation...\n')

  // 1. Validate environment
  await validateEnvironment()

  // 2. Test database connection
  const dbConnected = await validateDatabaseConnection()
  if (!dbConnected) {
    printResults()
    return
  }

  // 3. Validate schema
  await validateTables()

  // 4. Validate seed data
  await validateAdminUser()
  await validateLeadFormSections()
  await validateLeadSystemFields()
  await validateInvestorFormSections()
  await validateInvestorSystemFields()

  // 5. Data statistics
  await validateDataCounts()

  // Print results
  printResults()
}

main()
  .catch((error) => {
    console.error('\n❌ Validation error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
