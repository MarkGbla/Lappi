import { prisma } from "@/lib/db"
import type { Prisma } from "@/generated/prisma/client"

type LogActivityParams = {
  personId: string
  action: string
  entityType: string
  entityId: string
  metadata?: Prisma.InputJsonValue
}

export async function logActivity({
  personId,
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      personId,
      action,
      entityType,
      entityId,
      metadata: metadata ?? undefined,
    },
  })
}
