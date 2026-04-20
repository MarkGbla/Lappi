import { auth } from "@/lib/auth"
import { Role } from "@/generated/prisma/client"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null
  return session.user as SessionUser
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) throw new Error("Not authenticated")
  return user
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== role) throw new Error("Insufficient permissions")
  return user
}
