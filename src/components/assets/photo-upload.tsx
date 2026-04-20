"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Camera, CircleNotch, UploadSimple, X } from "@phosphor-icons/react"
import { useUploadThing } from "@/lib/uploadthing"
import { compressImage } from "@/lib/image-compress"
import { keyToUrl } from "@/lib/ut-url"
import { Label } from "@/components/ui/label"
import { CameraCapture } from "@/components/shared/camera-capture"

const MAX_PHOTOS = 5

type PendingUpload = {
  id: string
  localUrl: string
}

type Props = {
  value: string[]
  onChange: (keys: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
}

export function PhotoUpload({ value, onChange, onUploadingChange }: Props) {
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const uploading = pending.length > 0
  const slotsLeft = MAX_PHOTOS - value.length - pending.length

  // Cache local object URLs keyed by the UploadThing key returned after upload.
  // When the upload resolves, the pending tile disappears and the committed tile
  // renders from this cache instead of hitting the CDN — the image pops in
  // instantly with no loading flash. Falls back to keyToUrl() for keys that
  // were loaded from the server (existing assets).
  const localByKey = useRef(new Map<string, string>())

  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    onUploadingChange?.(uploading)
  }, [uploading, onUploadingChange])

  useEffect(() => {
    if (slotsLeft <= 0 && cameraOpen) setCameraOpen(false)
  }, [slotsLeft, cameraOpen])

  // Revoke cached object URLs on unmount. During the component's lifetime we
  // keep them alive so re-renders (and re-ordering via removeAt) stay instant.
  useEffect(() => {
    const cache = localByKey.current
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url))
      cache.clear()
    }
  }, [])

  // UploadThing v7's startUpload swallows errors into onUploadError and then
  // returns undefined. Without capturing the real error here, the only thing
  // the caller sees is "startUpload returned undefined" — useless for
  // diagnostics. Stash it so uploadFiles can rethrow with the real cause.
  const lastErrorRef = useRef<Error | null>(null)

  const { startUpload } = useUploadThing("assetImage", {
    onUploadError: (err) => {
      lastErrorRef.current = err
      if (process.env.NODE_ENV !== "production") {
        console.error("[UploadThing] upload failed:", err, {
          code: (err as { code?: string }).code,
          data: (err as { data?: unknown }).data,
          cause: (err as { cause?: unknown }).cause,
        })
      }
      toast.error(err.message || "Upload failed")
    },
  })

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      if (files.length > slotsLeft) {
        toast.error(
          `You can only add ${slotsLeft} more photo${slotsLeft === 1 ? "" : "s"}`,
        )
        return
      }

      // Optimistic previews — rendered immediately, before compression or upload.
      type Entry = PendingUpload & { file: File }
      const entries: Entry[] = files.map((f, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        localUrl: URL.createObjectURL(f),
        file: f,
      }))
      setPending((p) => [...p, ...entries])

      // Per-file pipeline: compress in worker → upload → commit. Running each
      // file's (compress, upload) chain concurrently means CPU time for one
      // file overlaps with the network time of another, instead of the whole
      // batch waiting for every compression to finish before any bytes go out.
      const results = await Promise.allSettled(
        entries.map(async (entry) => {
          const compressed = await compressImage(entry.file)
          lastErrorRef.current = null
          const res = await startUpload([compressed])
          if (process.env.NODE_ENV !== "production") {
            console.log("[UploadThing] startUpload result:", {
              resIsArray: Array.isArray(res),
              resLength: res?.length,
              firstItemKeys: res?.[0] ? Object.keys(res[0]) : null,
              firstItem: res?.[0],
            })
          }
          const key = res?.[0]?.key
          if (!key) {
            if (lastErrorRef.current) throw lastErrorRef.current
            if (!res) throw new Error("Upload failed — startUpload returned undefined (check /api/uploadthing Network response)")
            if (res.length === 0) throw new Error("Upload failed — server returned empty result array")
            throw new Error(`Upload failed — result missing key. Shape: ${JSON.stringify(Object.keys(res[0] ?? {}))}`)
          }

          // Hand the local object URL to the committed cache before we drop
          // the pending tile — seamless swap, no flash to a CDN fetch.
          localByKey.current.set(key, entry.localUrl)
          const next = [...valueRef.current, key].slice(0, MAX_PHOTOS)
          valueRef.current = next
          onChange(next)
          setPending((p) => p.filter((x) => x.id !== entry.id))
          return key
        }),
      )

      const failures = results.filter((r) => r.status === "rejected")
      const successes = results.length - failures.length

      if (successes > 0) {
        toast.success(
          successes === 1 ? "Photo uploaded" : `${successes} photos uploaded`,
        )
      }
      if (failures.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "[UploadThing] failed uploads:",
            failures.map((f) => (f as PromiseRejectedResult).reason),
          )
        }
        toast.error(
          failures.length === 1
            ? "A photo failed to upload"
            : `${failures.length} photos failed to upload`,
        )
      }

      // Clean up any still-pending entries from this batch (failed paths)
      // and revoke their object URLs.
      setPending((p) => {
        const stillHere = p.filter((x) => entries.some((e) => e.id === x.id))
        stillHere.forEach((x) => URL.revokeObjectURL(x.localUrl))
        return p.filter((x) => !entries.some((e) => e.id === x.id))
      })
    },
    [slotsLeft, onChange, startUpload],
  )

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ""
    await uploadFiles(picked)
  }

  function removeAt(index: number) {
    const key = value[index]
    const localUrl = localByKey.current.get(key)
    if (localUrl) {
      URL.revokeObjectURL(localUrl)
      localByKey.current.delete(key)
    }
    onChange(value.filter((_, i) => i !== index))
  }

  const tileClass =
    "flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-border hover:bg-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&:has(input:disabled)]:opacity-50 [&:has(input:disabled)]:cursor-not-allowed"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Photos</Label>
        <span className="text-xs text-muted-foreground">
          {value.length + pending.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {value.map((key, idx) => {
          const src = localByKey.current.get(key) ?? keyToUrl(key)
          return (
            <div
              key={key}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Asset photo ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 rounded-full bg-background/90 p-1 hover:bg-background"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X size={12} />
              </button>
            </div>
          )
        })}

        {pending.map((p) => (
          <div
            key={p.id}
            className="relative w-24 h-24 rounded-lg overflow-hidden border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.localUrl}
              alt="Uploading"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <CircleNotch
                size={22}
                weight="bold"
                className="text-white animate-spin"
              />
            </div>
          </div>
        ))}

        {slotsLeft > 0 && (
          <>
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className={tileClass}
            >
              <Camera
                size={22}
                weight="thin"
                className="text-muted-foreground"
              />
              <span className="mt-1 text-[10px] text-muted-foreground">
                Take photo
              </span>
            </button>

            <label className={tileClass}>
              <UploadSimple
                size={22}
                weight="thin"
                className="text-muted-foreground"
              />
              <span className="mt-1 text-[10px] text-muted-foreground">
                Upload
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={handleFiles}
                className="sr-only"
              />
            </label>
          </>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Up to {MAX_PHOTOS} photos · auto-compressed before upload · PNG, JPG, WebP
      </p>

      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(file) => {
          void uploadFiles([file])
        }}
        slotsLeft={slotsLeft}
        capturedCount={value.length + pending.length}
        maxPhotos={MAX_PHOTOS}
      />
    </div>
  )
}
