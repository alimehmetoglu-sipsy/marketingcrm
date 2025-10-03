import { auth } from "@/lib/auth-config"

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}
