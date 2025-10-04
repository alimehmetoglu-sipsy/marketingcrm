import { prisma } from "@/lib/prisma"
import { UsersClient } from "@/components/settings/users-client"

export const dynamic = "force-dynamic"

async function getUsers() {
  const users = await prisma.users.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role_id: true,
      status: true,
      created_at: true,
      updated_at: true,
      roles: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  // Serialize BigInt to Number
  return users.map((user) => ({
    ...user,
    id: Number(user.id),
    role_id: user.role_id ? Number(user.role_id) : null,
    roles: user.roles
      ? {
          ...user.roles,
          id: Number(user.roles.id),
        }
      : null,
  }))
}

async function getRoles() {
  const roles = await prisma.roles.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  return roles.map((role) => ({
    ...role,
    id: Number(role.id),
  }))
}

export default async function UsersPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 mb-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-blue-100">
          Manage system users and their access levels
        </p>
      </div>

      <UsersClient users={users} roles={roles} />
    </div>
  )
}
