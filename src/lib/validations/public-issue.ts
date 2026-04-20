import { z } from "zod"

export const createPublicIssueSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  title: z.string().min(3, "Title is too short").max(200),
  description: z.string().min(20, "Describe the problem in at least 20 characters").max(2000),
  // Honeypot — real users never see this; bots fill it. Must be empty.
  website: z.string().max(0, "Invalid submission").optional().default(""),
  // Time-to-submit guard. Client sets this on mount; reject if delta < 3s.
  renderedAt: z.coerce.number().int().positive(),
})

export type CreatePublicIssueInput = z.infer<typeof createPublicIssueSchema>
