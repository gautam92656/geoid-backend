export type OriginOptionType = "Soil" | "Rock" | "Non-Soil" | string

/** Shared DTO for origin options (common templates + user copies). */
export type OriginOptionDTO = {
  id: string
  name: string
  nameInDescription?: string
  codeInDescription?: string | null
  classificationCodeOverride?: boolean
  type?: OriginOptionType
  color?: string | null
  applyColorToPdf?: boolean
  overrideGraphic?: boolean
  splitGraphic?: boolean
  graphic?: string | null
}

export function normalizeOriginOptionType(value: string | null | undefined): string {
  const trimmed = value?.trim() || "Soil"
  if (trimmed.toLowerCase() === "pavement") return "Non-Soil"
  return trimmed
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function parseOriginOptionDTO(
  value: unknown,
  index: number
): OriginOptionDTO | null {
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
          : `origin-${index + 1}`

  return {
    id,
    name,
    nameInDescription:
      typeof value.nameInDescription === "string"
        ? value.nameInDescription.trim()
        : typeof value.name_in_description === "string"
          ? value.name_in_description.trim()
          : name,
    codeInDescription:
      asNullableString(value.codeInDescription) ??
      asNullableString(value.code_in_description),
    classificationCodeOverride: asBool(
      value.classificationCodeOverride ?? value.classification_code_override,
      false
    ),
    type: normalizeOriginOptionType(
      typeof value.type === "string"
        ? value.type
        : typeof value.group === "string"
          ? value.group
          : "Soil"
    ),
    color: asNullableString(value.color),
    applyColorToPdf: asBool(
      value.applyColorToPdf ?? value.apply_color_to_pdf,
      false
    ),
    overrideGraphic: asBool(
      value.overrideGraphic ?? value.override_graphic,
      false
    ),
    splitGraphic: asBool(value.splitGraphic ?? value.split_graphic, false),
    graphic: asNullableString(value.graphic),
  }
}

export function parseOriginOptionDTOList(value: unknown): OriginOptionDTO[] {
  if (!Array.isArray(value)) return []
  const options: OriginOptionDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseOriginOptionDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}
