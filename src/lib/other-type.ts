// Encodes an "Other" asset type label into the notes field so no extra
// DB column is needed. Format: "__type__Smart TV\n\nActual notes…"

const PREFIX = "__type__"

export function encodeOtherType(
  label: string | undefined,
  notes: string | undefined,
): string {
  const cleanLabel = label?.trim() ?? ""
  const cleanNotes = notes ?? ""
  if (!cleanLabel) return cleanNotes
  return `${PREFIX}${cleanLabel}${cleanNotes ? `\n\n${cleanNotes}` : ""}`
}

export function decodeOtherType(notes: string | null | undefined): {
  label: string | null
  notes: string | null
} {
  if (!notes?.startsWith(PREFIX)) return { label: null, notes: notes ?? null }
  const body = notes.slice(PREFIX.length)
  const sep = body.indexOf("\n\n")
  if (sep >= 0) {
    return { label: body.slice(0, sep) || null, notes: body.slice(sep + 2) || null }
  }
  return { label: body || null, notes: null }
}
