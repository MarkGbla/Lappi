"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { logActivity } from "@/lib/activity"
import { createAssetSchema, updateAssetSchema } from "@/lib/validations/asset"
import { diffFields } from "@/lib/diff"
import type { ActionResult } from "@/types"
import { Prisma, type Asset } from "@/generated/prisma/client"

export async function createAsset(input: unknown): Promise<ActionResult<Asset>> {
  const user = await requireAuth()
  const parsed = createAssetSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { serialNumber, purchaseDate, imageKeys, ...rest } = parsed.data
  const asset = await prisma.asset.create({
    data: {
      ...rest,
      serialNumber: serialNumber || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      imageKeys: imageKeys ?? [],
    },
  })

  await logActivity({
    personId: user.id,
    action: "ASSET_CREATED",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { name: asset.name, type: asset.type },
  })

  revalidatePath("/assets")
  return { success: true, data: asset }
}

export async function updateAsset(id: string, input: unknown): Promise<ActionResult<Asset>> {
  const user = await requireAuth()
  const parsed = updateAssetSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const existing = await prisma.asset.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Asset not found" }

  const { serialNumber, purchaseDate, imageKeys, ...rest } = parsed.data
  const asset = await prisma.asset.update({
    where: { id },
    data: {
      ...rest,
      ...(serialNumber !== undefined && { serialNumber: serialNumber || null }),
      ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
      ...(imageKeys !== undefined && { imageKeys }),
    },
  })

  const changes = diffFields(
    existing as unknown as Record<string, unknown>,
    asset as unknown as Record<string, unknown>,
    ["name", "type", "serialNumber", "status", "condition", "location", "purchaseDate", "notes"]
  )

  await logActivity({
    personId: user.id,
    action: "ASSET_UPDATED",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { name: asset.name, changes: JSON.parse(JSON.stringify(changes)) },
  })

  revalidatePath("/assets")
  revalidatePath(`/assets/${id}`)
  return { success: true, data: asset }
}

export async function deleteAsset(id: string): Promise<ActionResult<void>> {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    return { success: false, error: "Only admins can delete assets" }
  }

  const existing = await prisma.asset.findUnique({
    where: { id },
    select: { name: true, _count: { select: { sessions: true, issues: true } } },
  })
  if (!existing) return { success: false, error: "Asset not found" }

  // Hard delete blocks if the asset has session/issue history — those
  // records would be orphaned. Tell the user to retire it instead.
  if (existing._count.sessions > 0 || existing._count.issues > 0) {
    return {
      success: false,
      error:
        "This asset has session or issue history. Retire it instead of deleting to preserve records.",
    }
  }

  try {
    await prisma.asset.delete({ where: { id } })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return {
        success: false,
        error: "This asset is still referenced by other records.",
      }
    }
    throw err
  }

  await logActivity({
    personId: user.id,
    action: "ASSET_DELETED",
    entityType: "Asset",
    entityId: id,
    metadata: { name: existing.name },
  })

  revalidatePath("/assets")
  revalidatePath("/")
  return { success: true, data: undefined }
}

export async function retireAsset(id: string): Promise<ActionResult<Asset>> {
  const user = await requireAuth()

  const asset = await prisma.asset.update({
    where: { id },
    data: { status: "RETIRED" },
  })

  await logActivity({
    personId: user.id,
    action: "ASSET_RETIRED",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { name: asset.name },
  })

  revalidatePath("/assets")
  revalidatePath(`/assets/${id}`)
  return { success: true, data: asset }
}
