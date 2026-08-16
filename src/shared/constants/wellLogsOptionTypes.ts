export const WELL_LOGS_MODULE_SLUG = "well-logs" as const

export const WELL_TYPES_DATA_TYPE_ID = "well-types" as const
export const WELL_CASING_TYPES_DATA_TYPE_ID = "well-casing-types" as const
export const WELL_CASING_TOPS_DATA_TYPE_ID = "well-casing-tops" as const
export const WELL_COVER_TYPES_DATA_TYPE_ID = "well-cover-types" as const
export const WELL_PROBE_TYPES_DATA_TYPE_ID = "well-probe-types" as const
export const WELL_BACKFILL_TYPES_DATA_TYPE_ID = "well-backfill-types" as const
export const DEFAULT_WELL_IDS_DATA_TYPE_ID = "default-well-ids" as const

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

function asWellCasingKind(value: unknown): "surface" | "regular" {
  if (typeof value === "string") {
    const n = value.trim().toLowerCase()
    if (n === "regular") return "regular"
  }
  return "surface"
}

function asGraphicAlignment(value: unknown): "top" | "bottom" {
  if (typeof value === "string" && value.trim().toLowerCase() === "top") return "top"
  return "bottom"
}

export type WellTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  allowNegativeDepth?: boolean
}

export function parseWellTypeDTO(
  value: unknown,
  index: number
): WellTypeDTO | null {
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
          : `well-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? false
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),
  }
}

export function parseWellTypeDTOList(value: unknown): WellTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export type WellCasingTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  type?: "surface" | "regular"
  graphic?: string | null
  allowNegativeDepth?: boolean
}

export function parseWellCasingTypeDTO(
  value: unknown,
  index: number
): WellCasingTypeDTO | null {
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
          : `well-casing-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    type: asWellCasingKind(value.type),
    graphic: asNullableString(value.graphic),
    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? false
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),
  }
}

export function parseWellCasingTypeDTOList(value: unknown): WellCasingTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellCasingTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellCasingTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export type WellCasingTopDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  allowNegativeDepth?: boolean
}

export function parseWellCasingTopDTO(
  value: unknown,
  index: number
): WellCasingTopDTO | null {
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
          : `well-casing-top-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? true
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),
  }
}

export function parseWellCasingTopDTOList(value: unknown): WellCasingTopDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellCasingTopDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellCasingTopDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export type WellCoverTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  allowNegativeDepth?: boolean
  graphicAlignment?: "top" | "bottom"
}

export function parseWellCoverTypeDTO(
  value: unknown,
  index: number
): WellCoverTypeDTO | null {
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
          : `well-cover-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? false
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),
    graphicAlignment: asGraphicAlignment(
      value.graphicAlignment ?? value.graphic_alignment
    ),
  }
}

export function parseWellCoverTypeDTOList(value: unknown): WellCoverTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellCoverTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellCoverTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export type WellProbeTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  recordDepthTo?: boolean
  allowNegativeDepth?: boolean
}

export function parseWellProbeTypeDTO(
  value: unknown,
  index: number
): WellProbeTypeDTO | null {
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
          : `well-probe-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    recordDepthTo: (() => {
      const unset =
        value.recordDepthTo === undefined && value.record_depth_to === undefined
      return unset
        ? true
        : asBool(value.recordDepthTo) || asBool(value.record_depth_to)
    })(),
    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? false
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),
  }
}

export function parseWellProbeTypeDTOList(value: unknown): WellProbeTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellProbeTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellProbeTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export type WellBackfillTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  allowNegativeDepth?: boolean
}

export function parseWellBackfillTypeDTO(
  value: unknown,
  index: number
): WellBackfillTypeDTO | null {
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
          : `well-backfill-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ??
      asNullableString(value.tablogs_alias) ??
      asNullableString(value.alias),
    graphic: asNullableString(value.graphic),
    allowNegativeDepth: (() => {
      const unset =
        value.allowNegativeDepth === undefined && value.allow_negative_depth === undefined
      return unset
        ? false
        : asBool(value.allowNegativeDepth) || asBool(value.allow_negative_depth)
    })(),
  }
}

export function parseWellBackfillTypeDTOList(value: unknown): WellBackfillTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellBackfillTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellBackfillTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export type WellDefaultWellIdDTO = {
  id: string
  name: string
}

export function parseWellDefaultWellIdDTO(
  value: unknown,
  index: number
): WellDefaultWellIdDTO | null {
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
          : `default-well-id-${index + 1}`

  return {
    id,
    name,

  }
}

export function parseWellDefaultWellIdDTOList(value: unknown): WellDefaultWellIdDTO[] {
  if (!Array.isArray(value)) return []
  const options: WellDefaultWellIdDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseWellDefaultWellIdDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createWellLogsOptionKey(
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
