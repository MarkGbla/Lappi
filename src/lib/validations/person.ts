import { z } from "zod"

export const createPersonSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "STAFF", "MEMBER"]),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
})

export const updatePersonSchema = createPersonSchema.omit({ password: true }).partial()

export type CreatePersonInput = z.infer<typeof createPersonSchema>
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>
