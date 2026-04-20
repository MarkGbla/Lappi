// WebP compression before upload. Offloaded to a Web Worker so the UI thread
// stays responsive — users can still scroll, tap, and watch the spinner
// animate smoothly while a batch of photos is being encoded. Falls back to
// the main thread if the browser lacks Worker + OffscreenCanvas (older Safari).

const MAX_DIMENSION = 1280
const QUALITY = 0.82
// Below this size, compression usually costs more time than it saves bytes.
const MIN_SIZE = 500 * 1024

type CompressResponse =
  | { type: "ok"; blob: Blob }
  | { type: "skip" }
  | { type: "error"; message: string }

export async function compressImage(file: File): Promise<File> {
  // Sanitize filename before anything else — UploadThing's ingest rejects
  // names with spaces, parentheses, colons, etc. with a 400. Small files
  // (screenshots, etc.) skip compression but still get here, and we need
  // them to go through with a clean name too.
  const safe = withSafeName(file)

  if (safe.size < MIN_SIZE) return safe
  if (!safe.type.startsWith("image/")) return safe
  // Animated GIFs lose their animation when rasterised to WebP.
  if (safe.type === "image/gif") return safe

  const canWorker =
    typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined"

  if (canWorker) {
    try {
      return await compressInWorker(safe)
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[compress] worker path failed, using main thread:", err)
      }
    }
  }
  return compressOnMainThread(safe)
}

async function compressInWorker(file: File): Promise<File> {
  const worker = new Worker(
    new URL("./compress-worker.ts", import.meta.url),
    { type: "module" },
  )
  try {
    const result = await new Promise<CompressResponse>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<CompressResponse>) => resolve(e.data)
      worker.onerror = (e) => reject(new Error(e.message || "Worker error"))
      worker.postMessage({
        file,
        maxDimension: MAX_DIMENSION,
        quality: QUALITY,
      })
    })
    if (result.type === "error") throw new Error(result.message)
    if (result.type === "skip") return file
    return toWebPFile(file, result.blob)
  } finally {
    worker.terminate()
  }
}

async function compressOnMainThread(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  )
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  )
  if (!blob || blob.size >= file.size) return file
  return toWebPFile(file, blob)
}

function sanitizeBaseName(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120) || "photo"
  )
}

function extOf(file: File): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(file.name)
  if (m) return m[1].toLowerCase()
  // Fall back to MIME type. Some capture pipelines produce `Blob`-shaped
  // Files with no extension at all, which also trips the ingest validator.
  const t = file.type.toLowerCase()
  if (t === "image/jpeg") return "jpg"
  if (t.startsWith("image/")) return t.slice("image/".length)
  return "bin"
}

function withSafeName(file: File): File {
  const base = sanitizeBaseName(file.name)
  const ext = extOf(file)
  const cleanName = `${base}.${ext}`
  if (cleanName === file.name) return file
  return new File([file], cleanName, {
    type: file.type,
    lastModified: file.lastModified,
  })
}

function toWebPFile(original: File, blob: Blob): File {
  const baseName = sanitizeBaseName(original.name)
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: original.lastModified,
  })
}
