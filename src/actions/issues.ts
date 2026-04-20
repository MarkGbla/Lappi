"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { logActivity } from "@/lib/activity"
import { createIssueSchema, updateIssueStatusSchema, assignIssueSchema } from "@/lib/validations/issue"
import type { ActionResult } from "@/types"
import type { Issue } from "@/generated/prisma/client"

export async function createIssue(input: unknown): Promise<ActionResult<Issue>> {
  const user = await requireAuth()
  const parsed = createIssueSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const issue = await prisma.issue.create({
    data: {
      ...parsed.data,
      reportedById: user.id,
    },
  })

  // Auto-update asset status based on severity
  if (parsed.data.severity === "CRITICAL") {
    await prisma.asset.update({
      where: { id: parsed.data.assetId },
      data: { status: "MAINTENANCE" },
    })
  } else if (parsed.data.severity === "HIGH" || parsed.data.severity === "MEDIUM") {
    const asset = await prisma.asset.findUnique({ where: { id: parsed.data.assetId } })
    if (asset && asset.status === "AVAILABLE") {
      await prisma.asset.update({
        where: { id: parsed.data.assetId },
        data: { status: "NEEDS_ATTENTION" },
      })
    }
  }

  await logActivity({
    personId: user.id,
    action: "ISSUE_REPORTED",
    entityType: "Issue",
    entityId: issue.id,
    metadata: { title: issue.title, severity: issue.severity, assetId: issue.assetId },
  })

  revalidatePath("/issues")
  revalidatePath("/assets")
  revalidatePath(`/assets/${parsed.data.assetId}`)
  revalidatePath("/")
  return { success: true, data: issue }
}

export async function assignIssue(input: unknown): Promise<ActionResult<Issue>> {
  const user = await requireAuth()
  const parsed = assignIssueSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed" }
  }

  const issue = await prisma.issue.update({
    where: { id: parsed.data.issueId },
    data: {
      assignedToId: parsed.data.assignedToId,
      status: "IN_PROGRESS",
    },
  })

  await logActivity({
    personId: user.id,
    action: "ISSUE_ASSIGNED",
    entityType: "Issue",
    entityId: issue.id,
    metadata: { assignedToId: parsed.data.assignedToId },
  })

  revalidatePath("/issues")
  revalidatePath(`/issues/${parsed.data.issueId}`)
  return { success: true, data: issue }
}

export async function deleteIssue(id: string): Promise<ActionResult<void>> {
  const user = await requireAuth()

  const existing = await prisma.issue.findUnique({
    where: { id },
    select: { title: true, assetId: true },
  })
  if (!existing) return { success: false, error: "Issue not found" }

  await prisma.issue.delete({ where: { id } })

  await logActivity({
    personId: user.id,
    action: "ISSUE_DELETED",
    entityType: "Issue",
    entityId: id,
    metadata: { title: existing.title },
  })

  revalidatePath("/issues")
  revalidatePath(`/assets/${existing.assetId}`)
  return { success: true, data: undefined }
}

export async function updateIssueStatus(input: unknown): Promise<ActionResult<Issue>> {
  const user = await requireAuth()
  const parsed = updateIssueStatusSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed" }
  }

  const { issueId, status, resolutionNotes, repairCost } = parsed.data

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: {
      status,
      ...(resolutionNotes && { resolutionNotes }),
      ...(repairCost !== undefined && repairCost !== null && { repairCost }),
      ...(status === "RESOLVED" && { resolvedAt: new Date() }),
      ...(status === "OPEN" && { resolvedAt: null }),
    },
  })

  // If resolved, consider returning asset to AVAILABLE
  if (status === "RESOLVED" || status === "CLOSED") {
    const openIssues = await prisma.issue.count({
      where: {
        assetId: issue.assetId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
        id: { not: issue.id },
      },
    })
    if (openIssues === 0) {
      const asset = await prisma.asset.findUnique({ where: { id: issue.assetId } })
      if (asset && (asset.status === "MAINTENANCE" || asset.status === "NEEDS_ATTENTION")) {
        await prisma.asset.update({
          where: { id: issue.assetId },
          data: { status: "AVAILABLE" },
        })
      }
    }
  }

  await logActivity({
    personId: user.id,
    action: "ISSUE_STATUS_CHANGED",
    entityType: "Issue",
    entityId: issue.id,
    metadata: { status, resolutionNotes },
  })

  revalidatePath("/issues")
  revalidatePath(`/issues/${issueId}`)
  revalidatePath("/assets")
  revalidatePath(`/assets/${issue.assetId}`)
  revalidatePath("/")
  return { success: true, data: issue }
}
