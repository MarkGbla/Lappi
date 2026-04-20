"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, ArrowClockwise, CameraRotate, Check, X } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
  /** Remaining slots for the current asset. If ≤ 1, "Use photo" closes the dialog after adding. */
  slotsLeft: number
  /** Photos already committed or in-flight for this asset — shown in the header as N/M. */
  capturedCount: number
  /** Absolute max for this asset (shown as the denominator). */
  maxPhotos: number
}

type Phase = "starting" | "live" | "preview" | "error"
type Facing = "environment" | "user"

export function CameraCapture({
  open,
  onOpenChange,
  onCapture,
  slotsLeft,
  capturedCount,
  maxPhotos,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<Phase>("starting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [facing, setFacing] = useState<Facing>("environment")
  const [switching, setSwitching] = useState(false)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startStream = useCallback(
    async (mode: Facing) => {
      setPhase("starting")
      setErrorMessage(null)

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setErrorMessage("Camera API not available in this browser.")
        setPhase("error")
        return
      }

      // Kill any stream from a previous mode before requesting a new one —
      // some browsers (Safari iOS) won't hand out a second camera while the
      // first one is still live on the same page.
      stopStream()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {})
        }
        setPhase("live")
      } catch (err) {
        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission was denied. Allow access in your browser settings and try again."
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "No camera was found on this device."
              : err instanceof Error
                ? err.message
                : "Could not start the camera."
        setErrorMessage(msg)
        setPhase("error")
      }
    },
    [stopStream],
  )

  async function flipCamera() {
    if (switching || phase !== "live") return
    setSwitching(true)
    const next: Facing = facing === "environment" ? "user" : "environment"
    const prev = facing
    setFacing(next)
    try {
      await startStream(next)
    } catch {
      // If the device only has one camera, revert state so the button
      // reflects reality and we don't get stuck in "starting".
      setFacing(prev)
      toast.error("Couldn't switch camera")
      await startStream(prev)
    } finally {
      setSwitching(false)
    }
  }

  useEffect(() => {
    if (!open) {
      stopStream()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPreviewBlob(null)
      setPhase("starting")
      setFacing("environment")
      return
    }
    startStream(facing)
    return () => {
      stopStream()
    }
    // Only reopen should trigger a fresh start — facing changes go through
    // flipCamera which restarts the stream itself. previewUrl cleanup is
    // handled in the !open branch above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startStream, stopStream])

  function capture() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      toast.error("Could not capture photo")
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Could not capture photo")
          return
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewBlob(blob)
        setPreviewUrl(URL.createObjectURL(blob))
        setPhase("preview")
        stopStream()
      },
      "image/jpeg",
      0.92,
    )
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewBlob(null)
    startStream(facing)
  }

  // Guard against a rapid double-click on "Use photo" within the same preview.
  const usedRef = useRef(false)
  function usePhoto() {
    if (!previewBlob || usedRef.current) return
    usedRef.current = true
    const file = new File([previewBlob], `photo-${Date.now()}.jpg`, {
      type: "image/jpeg",
    })
    onCapture(file)

    // This capture fills the last remaining slot — parent will close us anyway,
    // but closing explicitly here makes the UX snappier and avoids a flash of
    // live video before the effect in parent takes the dialog away.
    if (slotsLeft <= 1) {
      onOpenChange(false)
      return
    }

    // Otherwise, reset for another capture: clear the preview, restart the
    // stream, and re-arm the "Use photo" guard.
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewBlob(null)
    usedRef.current = false
    startStream(facing)
  }

  useEffect(() => {
    if (!open) usedRef.current = false
  }, [open])

  const counter = `${Math.min(capturedCount, maxPhotos)}/${maxPhotos}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Take a photo</DialogTitle>
            <span className="text-xs font-medium text-muted-foreground">
              {counter}
            </span>
          </div>
          <DialogDescription>
            {slotsLeft > 1
              ? `Capture up to ${slotsLeft} more photos — camera stays open so you can take several in a row.`
              : "Position the device in the frame, then capture."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {phase !== "preview" && (
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
            />
          )}
          {phase === "preview" && previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Captured photo preview"
              className="h-full w-full object-cover"
            />
          )}
          {phase === "starting" && (
            <div className="absolute inset-0 grid place-items-center text-xs text-white/70">
              Starting camera…
            </div>
          )}
          {phase === "error" && (
            <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-white/80">
              {errorMessage}
            </div>
          )}
          {phase === "live" && (
            <button
              type="button"
              onClick={flipCamera}
              disabled={switching}
              aria-label={facing === "environment" ? "Switch to front camera" : "Switch to back camera"}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CameraRotate size={20} weight="bold" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {phase === "live" && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                <X /> Done
              </Button>
              <Button onClick={capture}>
                <Camera /> Capture
              </Button>
            </>
          )}
          {phase === "preview" && (
            <>
              <Button variant="ghost" onClick={retake}>
                <ArrowClockwise /> Retake
              </Button>
              <Button onClick={usePhoto}>
                <Check />
                {slotsLeft <= 1 ? "Use photo" : "Use & take another"}
              </Button>
            </>
          )}
          {phase === "error" && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => startStream(facing)}>
                <ArrowClockwise /> Try again
              </Button>
            </>
          )}
          {phase === "starting" && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
