import { PrismaClient } from "../lib/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Checking users in database...")

  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      status: true,
      created_at: true,
    }
  })

  console.log(`\nFound ${users.length} users:`)

  for (const user of users) {
    console.log(`\n- ID: ${user.id}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Status: ${user.status}`)
    console.log(`  Password Hash: ${user.password.substring(0, 30)}...`)

    // Test password
    const testPassword = "password"
    const isValid = await bcrypt.compare(testPassword, user.password)
    console.log(`  Password "password" valid: ${isValid}`)
  }

  // If no users, create them
  if (users.length === 0) {
    console.log("\n⚠️ No users found! Creating default users...")

    const hashedPassword = await bcrypt.hash("password", 10)

    await prisma.users.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    await prisma.users.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    console.log("✅ Default users created!")
    console.log("   - admin@example.com / password")
    console.log("   - test@example.com / password")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
