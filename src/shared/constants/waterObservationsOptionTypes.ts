export const WATER_OBSERVATIONS_MODULE_SLUG = "water-observations" as const
export const WATER_OBSERVATION_TYPES_DATA_TYPE_ID = "water-observation-types" as const

export type WaterObservationTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  depthRequired?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "yes"
  }
  return fallback
}

export function parseWaterObservationTypeDTO(
  value: unknown,
  index: number
): WaterObservationTypeDTO | null {
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
          : `water-observation-type-${index + 1}`

  const depthUnset =
    value.depthRequired === undefined && value.depth_required === undefined

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    depthRequired: depthUnset
      ? true
      : asBool(value.depthRequired) || asBool(value.depth_required),
  }
}

export function parseWaterObservationTypeDTOList(value: unknown): WaterObservationTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: WaterObservationTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWaterObservationTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createWaterObservationsOptionKey(
  prefix: string,
  name: string,
  index: number
): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || prefix}-${Date.now().toString(36)}-${index}`
}
