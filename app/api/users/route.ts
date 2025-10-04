import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-config"

// GET active users list
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.users.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        roles: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    // Convert BigInt to number
    const serializedUsers = users.map((user) => ({
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role_id: user.role_id ? Number(user.role_id) : null,
      role: user.roles
        ? {
            id: Number(user.roles.id),
            name: user.roles.name,
            slug: user.roles.slug,
          }
        : null,
    }))

    return NextResponse.json(serializedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
