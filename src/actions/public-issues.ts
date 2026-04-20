"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import { getCommunityReporterId } from "@/lib/community-reporter"
import { createPublicIssueSchema } from "@/lib/validations/public-issue"
import type { ActionResult } from "@/types"

const MIN_SUBMIT_MS = 3_000
const HOURLY_LIMIT = 5
const DAILY_LIMIT = 20

async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]!.trim()
  return h.get("x-real-ip") ?? "unknown"
}

export async function submitPublicIssue(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createPublicIssueSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  const { assetId, title, description, renderedAt } = parsed.data

  if (Date.now() - renderedAt < MIN_SUBMIT_MS) {
    return { success: false, error: "Submission was too fast. Try again." }
  }

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, status: true },
  })
  if (!asset || asset.status === "RETIRED") {
    return { success: false, error: "This device is no longer tracked." }
  }

  const ip = await getClientIp()
  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [hourly, daily] = await Promise.all([
    prisma.issueSubmissionLog.count({
      where: { ip, createdAt: { gte: hourAgo } },
    }),
    prisma.issueSubmissionLog.count({
      where: { ip, createdAt: { gte: dayAgo } },
    }),
  ])
  if (hourly >= HOURLY_LIMIT || daily >= DAILY_LIMIT) {
    return {
      success: false,
      error: "Too many reports from this network. Try again later.",
    }
  }

  await prisma.issueSubmissionLog.create({ data: { ip, assetId } })

  const communityId = await getCommunityReporterId()
  const issue = await prisma.issue.create({
    data: {
      assetId,
      reportedById: communityId,
      title,
      description,
      severity: "LOW",
      source: "PUBLIC",
    },
    select: { id: true },
  })

  await logActivity({
    personId: communityId,
    action: "ISSUE_REPORTED_PUBLIC",
    entityType: "Issue",
    entityId: issue.id,
    metadata: { ip, assetId },
  })

  revalidatePath("/issues")
  revalidatePath(`/assets/${assetId}`)
  revalidatePath("/")

  return { success: true, data: { id: issue.id } }
}
