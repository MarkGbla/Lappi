export type FieldChange = {
  field: string
  from: unknown
  to: unknown
}

/**
 * Shallow diff of two objects over a list of field names.
 * Normalises null/undefined to the same bucket so "" vs null doesn't register.
 */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
  fields: (keyof T)[]
): FieldChange[] {
  const changes: FieldChange[] = []
  for (const field of fields) {
    if (!(field in after)) continue
    const from = before[field]
    const to = after[field]
    if (normalise(from) !== normalise(to)) {
      changes.push({ field: String(field), from, to })
    }
  }
  return changes
}

function normalise(v: unknown): string {
  if (v === null || v === undefined || v === "") return ""
  if (v instanceof Date) return v.toISOString()
  return String(v)
}
