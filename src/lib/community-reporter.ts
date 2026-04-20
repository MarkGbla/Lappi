import { prisma } from "@/lib/db"

// Shared Person used as the reporter for anonymous /scan/[id] submissions.
// isActive: false so the row never surfaces in staff pickers or directories.
const COMMUNITY_REPORTER_EMAIL = "community@cf.lappi.internal"

let cachedId: string | null = null

export async function getCommunityReporterId(): Promise<string> {
  if (cachedId) return cachedId
  const person = await prisma.person.upsert({
    where: { email: COMMUNITY_REPORTER_EMAIL },
    update: {},
    create: {
      firstName: "Community",
      lastName: "Reporter",
      email: COMMUNITY_REPORTER_EMAIL,
      role: "MEMBER",
      isActive: false,
    },
  })
  cachedId = person.id
  return person.id
}
