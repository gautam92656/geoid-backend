export const USER_MANAGED_DATA_TYPE_IDS = [
  "rock_type",
  "non_soil_type",
  "rock_texture",
  "finish-reasons",
  "finish-texts",
  "geomodal_layer",
  "colors",
] as const
export type UserManagedDataTypeId = (typeof USER_MANAGED_DATA_TYPE_IDS)[number]

export function isUserManagedDataTypeId(value: string): value is UserManagedDataTypeId {
  return (USER_MANAGED_DATA_TYPE_IDS as readonly string[]).includes(value)
}

/** Shared DTO for rock / non-soil / texture / finishing-reason / geomodal / colors catalogs. */
export type DataTypeOptionDTO = {
  id: string
  name: string
  code?: string | null
  /** Alias used by finishing reasons (stored in `code`). */
  abbreviation?: string | null
  graphic?: string | null
  rockGroup?: string | null
  /** Geomodal layer / colors catalog fill color. */
  color?: string | null
  /** Geomodal layer graphic overlay color. */
  overlayColor?: string | null
  /** Colors catalog label text color. */
  textColor?: string | null
  showAutoScale?: boolean
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  return fallback
}

export function parseDataTypeOptionDTO(
  value: unknown,
  index: number
): DataTypeOptionDTO | null {
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
          : `option-${index + 1}`

  return {
    id,
    name,
    code:
      asNullableString(value.code) ??
      asNullableString(value.abbreviation),
    abbreviation:
      asNullableString(value.abbreviation) ??
      asNullableString(value.code),
    graphic: asNullableString(value.graphic),
    rockGroup:
      asNullableString(value.rockGroup) ?? asNullableString(value.rock_group),
    color: asNullableString(value.color),
    overlayColor:
      asNullableString(value.overlayColor) ??
      asNullableString(value.overlay_color),
    textColor:
      asNullableString(value.textColor) ?? asNullableString(value.text_color),
    showAutoScale: asBool(
      value.showAutoScale ?? value.show_auto_scale,
      true
    ),
  }
}

export function parseDataTypeOptionDTOList(value: unknown): DataTypeOptionDTO[] {
  if (!Array.isArray(value)) return []
  const options: DataTypeOptionDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseDataTypeOptionDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}
