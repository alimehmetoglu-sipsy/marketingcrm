import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Create user schema
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role_id: z.number().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})

// GET /api/settings/users - List all users
export async function GET() {
  try {
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
    const serialized = users.map((user) => ({
      ...user,
      id: Number(user.id),
      role_id: user.role_id ? Number(user.role_id) : null,
      roles: user.roles ? {
        ...user.roles,
        id: Number(user.roles.id),
      } : null,
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST /api/settings/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createUserSchema.parse(body)

    // Check if email already exists
    const existing = await prisma.users.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password with bcrypt (use $2a$ format for compatibility)
    const hashedPassword = await bcrypt.hash(validated.password, 10)
    // Convert to $2y$ for Laravel compatibility
    const laravelPassword = hashedPassword.replace(/^\$2a\$/, "$2y$")

    const user = await prisma.users.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        password: laravelPassword,
        role_id: validated.role_id ? BigInt(validated.role_id) : null,
        status: validated.status,
      },
      include: {
        roles: true,
      },
    })

    return NextResponse.json({
      ...user,
      id: Number(user.id),
      role_id: user.role_id ? Number(user.role_id) : null,
      roles: user.roles ? {
        ...user.roles,
        id: Number(user.roles.id),
      } : null,
      password: undefined, // Don't return password
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", JSON.stringify(error.issues, null, 2))
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
