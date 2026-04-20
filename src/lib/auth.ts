import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"

// Internal tool, shared access — everyone on staff signs in with the same
// token. Activity attributes to a single shared Person record (accepted
// trade-off: no per-person audit).
const SHARED_STAFF_EMAIL = "staff@cf.lappi.internal"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        token: { label: "Access Token", type: "password" },
      },
      async authorize(credentials) {
        const expected = process.env.STAFF_ACCESS_TOKEN
        if (!expected) return null
        const submitted = typeof credentials?.token === "string" ? credentials.token.trim() : ""
        if (!submitted) return null
        if (submitted !== expected.trim()) return null

        // Env var is the source of truth for the token; the Person row just
        // anchors the session + activity log. Don't duplicate the token into
        // Person.accessToken — that field is @unique and has no second reader.
        const person = await prisma.person.upsert({
          where: { email: SHARED_STAFF_EMAIL },
          update: { isActive: true },
          create: {
            firstName: "Staff",
            lastName: "Team",
            email: SHARED_STAFF_EMAIL,
            role: "ADMIN",
            isActive: true,
          },
        })

        return {
          id: person.id,
          name: `${person.firstName} ${person.lastName}`,
          email: person.email,
          role: person.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role: string }).role = token.role as string
      }
      return session
    },
  },
})
