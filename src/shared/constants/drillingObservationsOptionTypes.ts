export const DRILLING_OBSERVATIONS_MODULE_SLUG = "drilling-observations" as const

export const DRILLING_TYPES_DATA_TYPE_ID = "drilling-types" as const
export const DRILLING_RESISTANCES_DATA_TYPE_ID = "drilling-resistances" as const
export const DRILLING_OBSERVATIONS_DATA_TYPE_ID = "drilling-observations" as const
export const DRILLING_CASINGS_DATA_TYPE_ID = "drilling-casings" as const

export type DrillingLogKind = "bore" | "core"

export type DrillingTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  logKind?: DrillingLogKind
  graphic?: string | null
  enableRecoveryField?: boolean
  enableWindowedWindowless?: boolean
  waterAdded?: boolean
}

export type DrillingResistanceDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
}

export type DrillingObservationDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  depthRequired?: boolean
  observationDateTimeRequired?: boolean
  isDepthOfCasing?: boolean
  isDepthToWater?: boolean
}

export type DrillingCasingDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  startGraphic?: string | null
  endGraphic?: string | null
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

function parseLogKind(value: unknown): DrillingLogKind {
  if (typeof value !== "string") return "bore"
  const normalized = value.trim().toLowerCase()
  if (normalized === "core" || normalized === "core-log" || normalized === "core_log") {
    return "core"
  }
  return "bore"
}

function parseOptionId(value: Record<string, unknown>, index: number, prefix: string): string {
  if (typeof value.id === "string" && value.id.trim()) return value.id.trim()
  if (typeof value.optionKey === "string" && value.optionKey.trim()) return value.optionKey.trim()
  if (typeof value.id === "number") return String(value.id)
  return `${prefix}-${index + 1}`
}

export function parseDrillingTypeDTO(value: unknown, index: number): DrillingTypeDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  return {
    id: parseOptionId(value, index, "drilling-type"),
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    logKind: parseLogKind(value.logKind ?? value.log_kind),
    graphic: asNullableString(value.graphic),
    enableRecoveryField:
      asBool(value.enableRecoveryField) || asBool(value.enable_recovery_field),
    enableWindowedWindowless:
      asBool(value.enableWindowedWindowless) ||
      asBool(value.enable_windowed_windowless),
    waterAdded: asBool(value.waterAdded) || asBool(value.water_added),
  }
}

export function parseDrillingTypeDTOList(value: unknown): DrillingTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: DrillingTypeDTO[] = []
  const seen = new Set<string>()
  for (const [index, entry] of value.entries()) {
    const parsed = parseDrillingTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }
  return options
}

export function parseDrillingResistanceDTO(
  value: unknown,
  index: number
): DrillingResistanceDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  return {
    id: parseOptionId(value, index, "drilling-resistance"),
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
  }
}

export function parseDrillingResistanceDTOList(value: unknown): DrillingResistanceDTO[] {
  if (!Array.isArray(value)) return []
  const options: DrillingResistanceDTO[] = []
  const seen = new Set<string>()
  for (const [index, entry] of value.entries()) {
    const parsed = parseDrillingResistanceDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }
  return options
}

export function parseDrillingObservationDTO(
  value: unknown,
  index: number
): DrillingObservationDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  return {
    id: parseOptionId(value, index, "drilling-observation"),
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    depthRequired: asBool(value.depthRequired) || asBool(value.depth_required),
    observationDateTimeRequired:
      asBool(value.observationDateTimeRequired) ||
      asBool(value.observation_date_time_required),
    isDepthOfCasing: asBool(value.isDepthOfCasing) || asBool(value.is_depth_of_casing),
    isDepthToWater: asBool(value.isDepthToWater) || asBool(value.is_depth_to_water),
  }
}

export function parseDrillingObservationDTOList(value: unknown): DrillingObservationDTO[] {
  if (!Array.isArray(value)) return []
  const options: DrillingObservationDTO[] = []
  const seen = new Set<string>()
  for (const [index, entry] of value.entries()) {
    const parsed = parseDrillingObservationDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }
  return options
}

export function parseDrillingCasingDTO(value: unknown, index: number): DrillingCasingDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  return {
    id: parseOptionId(value, index, "drilling-casing"),
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    startGraphic:
      asNullableString(value.startGraphic) ?? asNullableString(value.start_graphic),
    endGraphic: asNullableString(value.endGraphic) ?? asNullableString(value.end_graphic),
  }
}

export function parseDrillingCasingDTOList(value: unknown): DrillingCasingDTO[] {
  if (!Array.isArray(value)) return []
  const options: DrillingCasingDTO[] = []
  const seen = new Set<string>()
  for (const [index, entry] of value.entries()) {
    const parsed = parseDrillingCasingDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }
  return options
}

export function createDrillingObservationsOptionKey(
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
