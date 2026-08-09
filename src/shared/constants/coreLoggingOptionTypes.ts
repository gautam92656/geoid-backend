export const CORE_LOGGING_MODULE_SLUG = "core-logging" as const

export const CORE_DEFECT_TYPES_DATA_TYPE_ID = "core-defect-types" as const
export const APERTURE_COLORS_DATA_TYPE_ID = "aperture-colors" as const
export const APERTURE_MINERALS_DATA_TYPE_ID = "aperture-minerals" as const
export const INFILL_MATERIALS_DATA_TYPE_ID = "infill-materials" as const

export type CoreDefectTypeDTO = {
  id: string
  name: string
  code?: string | null
  graphic?: string | null
  defaultSampleTypeId?: string | null
}

export type ApertureColorDTO = {
  id: string
  name: string
  color?: string | null
  textColor?: string | null
}

export type ApertureMineralDTO = {
  id: string
  name: string
  code?: string | null
}

export type InfillMaterialDTO = {
  id: string
  name: string
  code?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeColorHex(value: string | null | undefined, fallback = "#000000"): string {
  const trimmed = (value ?? "").trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) {
    if (trimmed.length === 4) {
      const r = trimmed[1]
      const g = trimmed[2]
      const b = trimmed[3]
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
    }
    if (trimmed.length === 9) {
      return trimmed.slice(0, 7).toLowerCase()
    }
    return trimmed.toLowerCase()
  }
  return fallback.toLowerCase()
}

function normalizeTextColorHex(value: string | null | undefined): string {
  const hex = normalizeColorHex(value, "#ffffff")
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? "#ffffff" : "#000000"
}

export function parseCoreDefectTypeDTO(
  value: unknown,
  index: number
): CoreDefectTypeDTO | null {
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
          : `core-defect-type-${index + 1}`

  return {
    id,
    name,
    code: asNullableString(value.code) ?? "",
    graphic: asNullableString(value.graphic),
    defaultSampleTypeId:
      asNullableString(value.defaultSampleTypeId) ??
      asNullableString(value.default_sample_type_id),
  }
}

export function parseCoreDefectTypeDTOList(value: unknown): CoreDefectTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: CoreDefectTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseCoreDefectTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function parseApertureColorDTO(
  value: unknown,
  index: number
): ApertureColorDTO | null {
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
          : `aperture-color-${index + 1}`

  const color =
    asNullableString(value.color) ?? asNullableString(value.fill) ?? null
  const textColor =
    asNullableString(value.textColor) ??
    asNullableString(value.text_color) ??
    asNullableString(value.text) ??
    null

  return {
    id,
    name,
    color: color ? normalizeColorHex(color) : "#000000",
    textColor: normalizeTextColorHex(textColor ?? "#ffffff"),
  }
}

export function parseApertureColorDTOList(value: unknown): ApertureColorDTO[] {
  if (!Array.isArray(value)) return []
  const options: ApertureColorDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseApertureColorDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function parseApertureMineralDTO(
  value: unknown,
  index: number
): ApertureMineralDTO | null {
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
          : `aperture-mineral-${index + 1}`

  return {
    id,
    name,
    code: asNullableString(value.code) ?? "",
  }
}

export function parseApertureMineralDTOList(value: unknown): ApertureMineralDTO[] {
  if (!Array.isArray(value)) return []
  const options: ApertureMineralDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseApertureMineralDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function parseInfillMaterialDTO(
  value: unknown,
  index: number
): InfillMaterialDTO | null {
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
          : `infill-material-${index + 1}`

  return {
    id,
    name,
    code: asNullableString(value.code) ?? "",
  }
}

export function parseInfillMaterialDTOList(value: unknown): InfillMaterialDTO[] {
  if (!Array.isArray(value)) return []
  const options: InfillMaterialDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseInfillMaterialDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createCoreLoggingOptionKey(prefix: string, name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || prefix}-${Date.now().toString(36)}-${index}`
}
