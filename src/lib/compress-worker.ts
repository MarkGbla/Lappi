// Web Worker — compresses an image to WebP off the main thread.
// Uses OffscreenCanvas so the UI stays responsive during encoding.

type CompressRequest = {
  file: File
  maxDimension: number
  quality: number
}

type CompressResponse =
  | { type: "ok"; blob: Blob }
  | { type: "skip" }
  | { type: "error"; message: string }

function reply(msg: CompressResponse) {
  ;(self as unknown as Worker).postMessage(msg)
}

self.onmessage = async (e: MessageEvent<CompressRequest>) => {
  try {
    const { file, maxDimension, quality } = e.data
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    )
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reply({ type: "error", message: "No 2D context in worker" })
      return
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await canvas.convertToBlob({ type: "image/webp", quality })
    if (blob.size >= file.size) {
      reply({ type: "skip" })
      return
    }
    reply({ type: "ok", blob })
  } catch (err) {
    reply({
      type: "error",
      message: err instanceof Error ? err.message : "Compression failed",
    })
  }
}
