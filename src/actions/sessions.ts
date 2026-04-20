"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { logActivity } from "@/lib/activity"
import { checkOutSchema, checkInSchema } from "@/lib/validations/session"
import type { ActionResult } from "@/types"
import type { UsageSession } from "@/generated/prisma/client"

export async function checkOutAsset(input: unknown): Promise<ActionResult<UsageSession>> {
  const user = await requireAuth()
  const parsed = checkOutSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { assetId, personId, purpose, notes } = parsed.data

  // Verify asset is available
  const asset = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!asset) return { success: false, error: "Asset not found" }
  if (asset.status !== "AVAILABLE") return { success: false, error: "Asset is not available for check-out" }

  // Create session and update asset status atomically
  const session = await prisma.usageSession.create({
    data: {
      assetId,
      personId,
      checkedOutById: user.id,
      purpose,
      notes: notes || null,
    },
  })

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "CHECKED_OUT" },
  })

  const person = await prisma.person.findUnique({ where: { id: personId } })

  await logActivity({
    personId: user.id,
    action: "SESSION_STARTED",
    entityType: "UsageSession",
    entityId: session.id,
    metadata: {
      assetName: asset.name,
      personName: person ? `${person.firstName} ${person.lastName}` : "Unknown",
      purpose,
    },
  })

  revalidatePath("/sessions")
  revalidatePath("/assets")
  revalidatePath(`/assets/${assetId}`)
  revalidatePath("/")
  return { success: true, data: session }
}

export async function deleteSession(id: string): Promise<ActionResult<void>> {
  const user = await requireAuth()

  const existing = await prisma.usageSession.findUnique({
    where: { id },
    include: { asset: true, person: true },
  })
  if (!existing) return { success: false, error: "Session not found" }

  // Deleting an active (un-returned) session would leave the asset stuck
  // in CHECKED_OUT. Put it back to AVAILABLE in the same transaction.
  await prisma.$transaction(async (tx) => {
    await tx.usageSession.delete({ where: { id } })
    if (!existing.checkedInAt) {
      await tx.asset.update({
        where: { id: existing.assetId },
        data: { status: "AVAILABLE" },
      })
    }
  })

  await logActivity({
    personId: user.id,
    action: "SESSION_DELETED",
    entityType: "UsageSession",
    entityId: id,
    metadata: {
      assetName: existing.asset.name,
      personName: `${existing.person.firstName} ${existing.person.lastName}`,
    },
  })

  revalidatePath("/sessions")
  revalidatePath("/assets")
  revalidatePath(`/assets/${existing.assetId}`)
  revalidatePath("/")
  return { success: true, data: undefined }
}

export async function checkInAsset(input: unknown): Promise<ActionResult<UsageSession>> {
  const user = await requireAuth()
  const parsed = checkInSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { sessionId, conditionOnReturn, notes } = parsed.data

  const existingSession = await prisma.usageSession.findUnique({
    where: { id: sessionId },
    include: { asset: true, person: true },
  })
  if (!existingSession) return { success: false, error: "Session not found" }
  if (existingSession.checkedInAt) return { success: false, error: "Session already checked in" }

  const session = await prisma.usageSession.update({
    where: { id: sessionId },
    data: {
      checkedInAt: new Date(),
      checkedInById: user.id,
      conditionOnReturn: conditionOnReturn || null,
      notes: notes ? (existingSession.notes ? `${existingSession.notes}\n---\nReturn: ${notes}` : notes) : existingSession.notes,
    },
  })

  await prisma.asset.update({
    where: { id: existingSession.assetId },
    data: {
      status: "AVAILABLE",
      ...(conditionOnReturn && { condition: conditionOnReturn }),
    },
  })

  await logActivity({
    personId: user.id,
    action: "SESSION_ENDED",
    entityType: "UsageSession",
    entityId: session.id,
    metadata: {
      assetName: existingSession.asset.name,
      personName: `${existingSession.person.firstName} ${existingSession.person.lastName}`,
      conditionOnReturn,
    },
  })

  revalidatePath("/sessions")
  revalidatePath("/assets")
  revalidatePath(`/assets/${existingSession.assetId}`)
  revalidatePath("/")
  return { success: true, data: session }
}
