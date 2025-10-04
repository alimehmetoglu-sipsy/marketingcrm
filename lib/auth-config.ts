import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          return null
        }

        // Laravel uses $2y$ format, bcrypt.js expects $2a$ or $2b$
        const password = user.password.replace(/^\$2y\$/, '$2a$')
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id

        // Fetch user with role and permissions
        const userWithRole = await prisma.users.findUnique({
          where: { id: BigInt(user.id) },
          include: { roles: true },
        })

        if (userWithRole?.roles) {
          token.roleId = userWithRole.role_id?.toString()
          token.roleName = userWithRole.roles.name
          token.permissions = userWithRole.roles.permissions as any
        }
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roleId = token.roleId as string | undefined
        session.user.roleName = token.roleName as string | undefined
        session.user.permissions = token.permissions as any
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
