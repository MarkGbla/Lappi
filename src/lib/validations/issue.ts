import { z } from "zod"

export const createIssueSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
})

export const updateIssueStatusSchema = z.object({
  issueId: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  resolutionNotes: z.string().max(2000).optional().or(z.literal("")),
  repairCost: z
    .number()
    .nonnegative("Cost must be positive")
    .optional()
    .nullable(),
})

export const assignIssueSchema = z.object({
  issueId: z.string().min(1),
  assignedToId: z.string().min(1, "Assignee is required"),
})

export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>
export type AssignIssueInput = z.infer<typeof assignIssueSchema>
