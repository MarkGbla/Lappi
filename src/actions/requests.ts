"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { logActivity } from "@/lib/activity"
import {
  createRequestSchema,
  reviewRequestSchema,
} from "@/lib/validations/request"
import type { ActionResult } from "@/types"
import type { TechRequest } from "@/generated/prisma/client"

export async function createTechRequest(
  input: unknown
): Promise<ActionResult<TechRequest>> {
  const user = await requireAuth()
  const parsed = createRequestSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const request = await prisma.techRequest.create({
    data: {
      ...parsed.data,
      requestedById: user.id,
    },
  })

  await logActivity({
    personId: user.id,
    action: "REQUEST_CREATED",
    entityType: "TechRequest",
    entityId: request.id,
    metadata: { title: request.title, urgency: request.urgency },
  })

  revalidatePath("/requests")
  revalidatePath("/")
  return { success: true, data: request }
}

export async function reviewTechRequest(
  input: unknown
): Promise<ActionResult<TechRequest>> {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    return { success: false, error: "Only admins can review requests" }
  }
  const parsed = reviewRequestSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { requestId, decision, reviewNotes } = parsed.data

  const existing = await prisma.techRequest.findUnique({ where: { id: requestId } })
  if (!existing) return { success: false, error: "Request not found" }
  if (existing.status !== "PENDING") {
    return {
      success: false,
      error: `Request has already been ${existing.status.toLowerCase()}`,
    }
  }

  const request = await prisma.techRequest.update({
    where: { id: requestId },
    data: {
      status: decision,
      reviewNotes: reviewNotes || null,
      reviewedById: user.id,
      reviewedAt: new Date(),
    },
  })

  await logActivity({
    personId: user.id,
    action: `REQUEST_${decision}`,
    entityType: "TechRequest",
    entityId: request.id,
    metadata: { title: request.title, decision },
  })

  revalidatePath("/requests")
  revalidatePath(`/requests/${requestId}`)
  return { success: true, data: request }
}

export async function deleteTechRequest(
  id: string,
): Promise<ActionResult<void>> {
  const user = await requireAuth()

  const existing = await prisma.techRequest.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Request not found" }

  // A request's requester can delete their own request while it's still
  // pending; admins can always delete.
  const isOwner = existing.requestedById === user.id
  const isAdmin = user.role === "ADMIN"
  if (!isAdmin && !(isOwner && existing.status === "PENDING")) {
    return {
      success: false,
      error:
        "Only admins can delete this request. You can only delete your own pending requests.",
    }
  }

  await prisma.techRequest.delete({ where: { id } })

  await logActivity({
    personId: user.id,
    action: "REQUEST_DELETED",
    entityType: "TechRequest",
    entityId: id,
    metadata: { title: existing.title },
  })

  revalidatePath("/requests")
  return { success: true, data: undefined }
}

export async function fulfillTechRequest(
  requestId: string
): Promise<ActionResult<TechRequest>> {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    return { success: false, error: "Only admins can mark requests fulfilled" }
  }

  const existing = await prisma.techRequest.findUnique({ where: { id: requestId } })
  if (!existing) return { success: false, error: "Request not found" }
  if (existing.status !== "APPROVED") {
    return {
      success: false,
      error: "Only approved requests can be marked fulfilled",
    }
  }

  const request = await prisma.techRequest.update({
    where: { id: requestId },
    data: { status: "FULFILLED" },
  })

  await logActivity({
    personId: user.id,
    action: "REQUEST_FULFILLED",
    entityType: "TechRequest",
    entityId: request.id,
    metadata: { title: request.title },
  })

  revalidatePath("/requests")
  revalidatePath(`/requests/${requestId}`)
  return { success: true, data: request }
}
