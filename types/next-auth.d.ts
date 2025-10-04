import "next-auth"
import { PermissionsStructure } from "@/lib/permissions"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      roleId?: string
      roleName?: string
      permissions?: PermissionsStructure
    }
  }

  interface User {
    id: string
    email: string
    name: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    roleId?: string
    roleName?: string
    permissions?: PermissionsStructure
  }
}
