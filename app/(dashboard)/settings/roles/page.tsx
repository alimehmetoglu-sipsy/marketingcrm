import { prisma } from "@/lib/prisma"
import { RolesClient } from "@/components/settings/roles-client"

export const dynamic = "force-dynamic"

async function getRoles() {
  const roles = await prisma.roles.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { users: true },
      },
    },
  })

  // Serialize BigInt to Number
  return roles.map((role) => ({
    ...role,
    id: Number(role.id),
    permissions: role.permissions as any,
    userCount: role._count.users,
  }))
}

export default async function RolesPage() {
  const roles = await getRoles()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 mb-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Roles & Permissions</h1>
        <p className="text-purple-100">
          Configure user roles and manage access control
        </p>
      </div>

      <RolesClient roles={roles} />
    </div>
  )
}
