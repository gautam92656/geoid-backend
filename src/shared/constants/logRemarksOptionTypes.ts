export const LOG_REMARKS_MODULE_SLUG = "log-remarks" as const

export const REMARK_TYPES_DATA_TYPE_ID = "remark-types" as const
export const REMARKS_QUICK_NOTES_DATA_TYPE_ID = "remarks-quick-notes" as const

export type RemarkTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
}

export type RemarksQuickNoteDTO = {
  id: string
  name: string
  remarkTypeId: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function parseRemarkTypeDTO(value: unknown, index: number): RemarkTypeDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : typeof value.optionKey === "string" && value.optionKey.trim()
        ? value.optionKey.trim()
        : typeof value.id === "number"
          ? String(value.id)
          : `remark-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
  }
}

export function parseRemarkTypeDTOList(value: unknown): RemarkTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: RemarkTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseRemarkTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function parseRemarksQuickNoteDTO(
  value: unknown,
  index: number
): RemarksQuickNoteDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  const remarkTypeId =
    asNullableString(value.remarkTypeId) ?? asNullableString(value.remark_type_id) ?? ""
  if (!remarkTypeId) return null

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : typeof value.optionKey === "string" && value.optionKey.trim()
        ? value.optionKey.trim()
        : typeof value.id === "number"
          ? String(value.id)
          : `remarks-quick-note-${index + 1}`

  return { id, name, remarkTypeId }
}

export function parseRemarksQuickNoteDTOList(value: unknown): RemarksQuickNoteDTO[] {
  if (!Array.isArray(value)) return []
  const options: RemarksQuickNoteDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseRemarksQuickNoteDTO(entry, index)
    if (!parsed) continue
    const key = `${parsed.remarkTypeId}::${parsed.name.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createLogRemarksOptionKey(prefix: string, name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || prefix}-${Date.now().toString(36)}-${index}`
}
