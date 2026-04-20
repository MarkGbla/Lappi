import { z } from "zod"

export const checkOutSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  personId: z.string().min(1, "Person is required"),
  purpose: z.enum([
    "WORKSHOP", "COHORT", "PERSONAL_LEARNING",
    "RESEARCH", "COMMUNITY_USE", "STAFF_WORK",
  ]),
  notes: z.string().max(1000).optional().or(z.literal("")),
})

export const checkInSchema = z.object({
  sessionId: z.string().min(1, "Session is required"),
  conditionOnReturn: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
})

export type CheckOutInput = z.infer<typeof checkOutSchema>
export type CheckInInput = z.infer<typeof checkInSchema>
