import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

interface PermissionsStructure {
  menus: {
    dashboard: boolean
    leads: boolean
    investors: boolean
    tasks: boolean
    activities: boolean
    reports: boolean
    settings: {
      leadFields: boolean
      investorFields: boolean
      activityTypes: boolean
      users: boolean
      roles: boolean
    }
  }
  dataAccess: {
    leads: "all" | "assigned"
    investors: "all" | "assigned"
    activities: "all" | "assigned"
  }
}

async function main() {
  console.log("🚀 Starting seed: Default Roles & Admin User")

  // 1. Admin Role
  const adminPermissions: PermissionsStructure = {
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
      leads: "all",
      investors: "all",
      activities: "all",
    },
  }

  const adminRole = await prisma.roles.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      name: "Admin",
      slug: "admin",
      description: "Full system access with all permissions",
      permissions: adminPermissions as any,
      is_system: true,
      status: "active",
    },
  })
  console.log("✅ Admin role created:", adminRole.name)

  // 2. Sales Manager Role
  const managerPermissions: PermissionsStructure = {
    menus: {
      dashboard: true,
      leads: true,
      investors: true,
      tasks: true,
      activities: true,
      reports: true,
      settings: {
        leadFields: false,
        investorFields: false,
        activityTypes: false,
        users: false,
        roles: false,
      },
    },
    dataAccess: {
      leads: "all",
      investors: "all",
      activities: "all",
    },
  }

  const managerRole = await prisma.roles.upsert({
    where: { slug: "sales-manager" },
    update: {},
    create: {
      name: "Sales Manager",
      slug: "sales-manager",
      description: "Can view all leads, investors, and activities. No settings access.",
      permissions: managerPermissions as any,
      is_system: false,
      status: "active",
    },
  })
  console.log("✅ Sales Manager role created:", managerRole.name)

  // 3. Sales Representative Role
  const repPermissions: PermissionsStructure = {
    menus: {
      dashboard: true,
      leads: true,
      investors: true,
      tasks: true,
      activities: true,
      reports: false,
      settings: {
        leadFields: false,
        investorFields: false,
        activityTypes: false,
        users: false,
        roles: false,
      },
    },
    dataAccess: {
      leads: "assigned",
      investors: "assigned",
      activities: "assigned",
    },
  }

  const repRole = await prisma.roles.upsert({
    where: { slug: "sales-representative" },
    update: {},
    create: {
      name: "Sales Representative",
      slug: "sales-representative",
      description: "Can only view assigned leads, investors, and activities",
      permissions: repPermissions as any,
      is_system: false,
      status: "active",
    },
  })
  console.log("✅ Sales Representative role created:", repRole.name)

  // 4. Update admin user with Admin role
  const adminUser = await prisma.users.findUnique({
    where: { email: "admin@example.com" },
  })

  if (adminUser) {
    await prisma.users.update({
      where: { id: adminUser.id },
      data: { role_id: adminRole.id },
    })
    console.log("✅ Admin user assigned to Admin role")
  } else {
    // Create admin user if not exists
    const hashedPassword = await bcrypt.hash("password", 10)
    const newAdmin = await prisma.users.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword.replace(/^\$2a\$/, "$2y$"),
        role_id: adminRole.id,
        status: "active",
      },
    })
    console.log("✅ Admin user created:", newAdmin.email)
  }

  console.log("\n🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
