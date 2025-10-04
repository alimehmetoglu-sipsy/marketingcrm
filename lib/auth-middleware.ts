import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

// Minimal auth config for Edge Runtime (middleware)
// This doesn't include Prisma-dependent callbacks or providers
const config: NextAuthConfig = {
  providers: [], // Providers will be added by main auth config
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
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

export const { auth } = NextAuth(config)
