"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createAssetSchema, type CreateAssetInput } from "@/lib/validations/asset"
import { createAsset, updateAsset } from "@/actions/assets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhotoUpload } from "@/components/assets/photo-upload"

const assetTypes = [
  "LAPTOP", "DESKTOP", "TABLET", "PROJECTOR", "ROUTER",
  "PHONE", "CAMERA", "PRINTER", "NETWORKING", "OTHER",
]

const conditions = ["EXCELLENT", "GOOD", "FAIR", "POOR"]

type AssetFormProps = {
  asset?: {
    id: string
    name: string
    type: string
    condition: string
    serialNumber: string | null
    location: string | null
    purchaseDate: Date | null
    notes: string | null
    imageKeys: string[]
  }
}

export function AssetForm({ asset }: AssetFormProps) {
  const router = useRouter()
  const isEditing = !!asset
  const [photosUploading, setPhotosUploading] = useState(false)

  // Prefetch the destination so post-save navigation feels instant.
  useEffect(() => {
    router.prefetch(isEditing && asset ? `/assets/${asset.id}` : "/assets")
  }, [router, isEditing, asset])

  const form = useForm<CreateAssetInput>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: asset?.name ?? "",
      type: (asset?.type as CreateAssetInput["type"]) ?? "LAPTOP",
      condition: (asset?.condition as CreateAssetInput["condition"]) ?? "GOOD",
      serialNumber: asset?.serialNumber ?? "",
      location: asset?.location ?? "",
      purchaseDate: asset?.purchaseDate
        ? new Date(asset.purchaseDate).toISOString().split("T")[0]
        : "",
      notes: asset?.notes ?? "",
      imageKeys: asset?.imageKeys ?? [],
    },
  })

  async function onSubmit(data: CreateAssetInput) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[asset-form] submitting with imageKeys:", data.imageKeys)
    }
    const result = isEditing
      ? await updateAsset(asset!.id, data)
      : await createAsset(data)

    if (result.success) {
      toast.success(isEditing ? "Asset updated" : "Asset created")
      router.push(isEditing ? `/assets/${asset!.id}` : "/assets")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Dell Latitude 5520 #1"
          aria-invalid={!!form.formState.errors.name}
          aria-describedby={form.formState.errors.name ? "name-error" : undefined}
        />
        {form.formState.errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(v) => form.setValue("type", v as CreateAssetInput["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assetTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Condition *</Label>
          <Select
            value={form.watch("condition")}
            onValueChange={(v) => form.setValue("condition", v as CreateAssetInput["condition"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input id="serialNumber" {...form.register("serialNumber")} placeholder="Optional" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...form.register("location")} placeholder="Lab A, Storage, etc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input id="purchaseDate" type="date" {...form.register("purchaseDate")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...form.register("notes")} rows={3} placeholder="Optional notes about this device" />
      </div>

      <PhotoUpload
        value={form.watch("imageKeys") ?? []}
        onChange={(keys) => form.setValue("imageKeys", keys)}
        onUploadingChange={setPhotosUploading}
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting || photosUploading}>
          {form.formState.isSubmitting
            ? "Saving..."
            : photosUploading
            ? "Uploading photos..."
            : isEditing
            ? "Save Changes"
            : "Create Asset"}
        </Button>
      </div>
    </form>
  )
}
