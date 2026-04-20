import { z } from "zod"

export const createRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
})

export const reviewRequestSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["APPROVED", "DENIED"]),
  reviewNotes: z.string().max(2000).optional().or(z.literal("")),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>
