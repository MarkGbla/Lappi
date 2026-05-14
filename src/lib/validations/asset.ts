import { z } from "zod"

const assetBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum([
    "LAPTOP", "DESKTOP", "TABLET", "PROJECTOR", "ROUTER",
    "PHONE", "CAMERA", "PRINTER", "NETWORKING", "OTHER",
  ]),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  serialNumber: z.string().max(100).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  imageKeys: z.array(z.string().min(1).max(200)).max(5).optional(),
  otherTypeLabel: z.string().max(100).optional().or(z.literal("")),
})

export const createAssetSchema = assetBaseSchema.superRefine((data, ctx) => {
  if (data.type === "OTHER" && !data.otherTypeLabel?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the device type",
      path: ["otherTypeLabel"],
    })
  }
})

export const updateAssetSchema = assetBaseSchema.partial().superRefine((data, ctx) => {
  if (data.type === "OTHER" && !data.otherTypeLabel?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the device type",
      path: ["otherTypeLabel"],
    })
  }
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
