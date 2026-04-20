"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { logActivity } from "@/lib/activity"
import { createPersonSchema, updatePersonSchema } from "@/lib/validations/person"
import { diffFields } from "@/lib/diff"
import type { ActionResult } from "@/types"
import { Prisma, type Person } from "@/generated/prisma/client"

export async function createPerson(input: unknown): Promise<ActionResult<Person>> {
  const user = await requireAuth()
  const parsed = createPersonSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { password, email, phone, ...rest } = parsed.data

  let hashedPassword: string | null = null
  if (rest.role !== "MEMBER" && password) {
    hashedPassword = await bcrypt.hash(password, 10)
  }

  const person = await prisma.person.create({
    data: {
      ...rest,
      email: email || null,
      phone: phone || null,
      hashedPassword,
    },
  })

  await logActivity({
    personId: user.id,
    action: "PERSON_CREATED",
    entityType: "Person",
    entityId: person.id,
    metadata: { name: `${person.firstName} ${person.lastName}`, role: person.role },
  })

  revalidatePath("/people")
  revalidatePath("/")
  return { success: true, data: person }
}

export async function updatePerson(id: string, input: unknown): Promise<ActionResult<Person>> {
  const user = await requireAuth()
  const parsed = updatePersonSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const existing = await prisma.person.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Person not found" }

  const { email, phone, ...rest } = parsed.data
  const person = await prisma.person.update({
    where: { id },
    data: {
      ...rest,
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
    },
  })

  const changes = diffFields(
    existing as unknown as Record<string, unknown>,
    person as unknown as Record<string, unknown>,
    ["firstName", "lastName", "email", "phone", "role"]
  )

  await logActivity({
    personId: user.id,
    action: "PERSON_UPDATED",
    entityType: "Person",
    entityId: person.id,
    metadata: {
      name: `${person.firstName} ${person.lastName}`,
      changes: JSON.parse(JSON.stringify(changes)),
    },
  })

  revalidatePath("/people")
  revalidatePath(`/people/${id}`)
  return { success: true, data: person }
}

export async function deactivatePerson(id: string): Promise<ActionResult<Person>> {
  const user = await requireAuth()

  // Prevent deactivating yourself
  if (id === user.id) {
    return { success: false, error: "You cannot deactivate your own account" }
  }

  const person = await prisma.person.update({
    where: { id },
    data: { isActive: false },
  })

  await logActivity({
    personId: user.id,
    action: "PERSON_DEACTIVATED",
    entityType: "Person",
    entityId: person.id,
    metadata: { name: `${person.firstName} ${person.lastName}` },
  })

  revalidatePath("/people")
  revalidatePath(`/people/${id}`)
  return { success: true, data: person }
}

export async function deletePerson(id: string): Promise<ActionResult<void>> {
  const user = await requireAuth()
  if (id === user.id) {
    return { success: false, error: "You cannot delete your own account" }
  }

  const existing = await prisma.person.findUnique({
    where: { id },
    select: {
      firstName: true,
      lastName: true,
      _count: {
        select: {
          sessions: true,
          reportedIssues: true,
          techRequests: true,
          activityLogs: true,
        },
      },
    },
  })
  if (!existing) return { success: false, error: "Person not found" }

  const hasHistory =
    existing._count.sessions > 0 ||
    existing._count.reportedIssues > 0 ||
    existing._count.techRequests > 0 ||
    existing._count.activityLogs > 0

  if (hasHistory) {
    return {
      success: false,
      error:
        "This person has session, issue, or request history. Deactivate them instead of deleting to preserve records.",
    }
  }

  try {
    await prisma.person.delete({ where: { id } })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return {
        success: false,
        error: "This person is still referenced by other records.",
      }
    }
    throw err
  }

  await logActivity({
    personId: user.id,
    action: "PERSON_DELETED",
    entityType: "Person",
    entityId: id,
    metadata: { name: `${existing.firstName} ${existing.lastName}` },
  })

  revalidatePath("/people")
  revalidatePath("/")
  return { success: true, data: undefined }
}

export async function reactivatePerson(id: string): Promise<ActionResult<Person>> {
  const user = await requireAuth()

  const person = await prisma.person.update({
    where: { id },
    data: { isActive: true },
  })

  await logActivity({
    personId: user.id,
    action: "PERSON_REACTIVATED",
    entityType: "Person",
    entityId: person.id,
    metadata: { name: `${person.firstName} ${person.lastName}` },
  })

  revalidatePath("/people")
  revalidatePath(`/people/${id}`)
  return { success: true, data: person }
}
