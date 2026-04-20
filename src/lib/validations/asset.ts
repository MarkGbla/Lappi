import { z } from "zod"

export const createAssetSchema = z.object({
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
})

export const updateAssetSchema = createAssetSchema.partial()

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
