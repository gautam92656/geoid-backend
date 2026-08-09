export const SAMPLES_MODULE_SLUG = "samples" as const
export const SAMPLE_TYPES_DATA_TYPE_ID = "sample-types" as const

export type SampleTypeDTO = {
  id: string
  name: string
  tablogsAlias?: string | null
  graphic?: string | null
  sampleAbbreviation?: string | null
  noteRecovery?: boolean
  displayQcId?: boolean
  enableSegregatedGraphic?: boolean
  topGraphic?: string | null
  bottomGraphic?: string | null
  enableSubsurfaceLogging?: boolean
  enableAssignLabTest?: boolean
  enableInsituTestLogging?: boolean
  defaultInsituTestTypeId?: string | null
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

export function parseSampleTypeDTO(value: unknown, index: number): SampleTypeDTO | null {
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
          : `sample-type-${index + 1}`

  return {
    id,
    name,
    tablogsAlias:
      asNullableString(value.tablogsAlias) ?? asNullableString(value.tablogs_alias),
    graphic: asNullableString(value.graphic),
    sampleAbbreviation:
      asNullableString(value.sampleAbbreviation) ??
      asNullableString(value.sample_abbreviation) ??
      asNullableString(value.abbreviation),
    noteRecovery: asBool(value.noteRecovery) || asBool(value.note_recovery),
    displayQcId: asBool(value.displayQcId) || asBool(value.display_qc_id),
    enableSegregatedGraphic:
      asBool(value.enableSegregatedGraphic) ||
      asBool(value.enable_segregated_graphic) ||
      asBool(value.splitGraphic) ||
      asBool(value.split_graphic),
    topGraphic: asNullableString(value.topGraphic) ?? asNullableString(value.top_graphic),
    bottomGraphic:
      asNullableString(value.bottomGraphic) ?? asNullableString(value.bottom_graphic),
    enableSubsurfaceLogging:
      asBool(value.enableSubsurfaceLogging) || asBool(value.enable_subsurface_logging),
    enableAssignLabTest:
      asBool(value.enableAssignLabTest) || asBool(value.enable_assign_lab_test),
    enableInsituTestLogging:
      asBool(value.enableInsituTestLogging) || asBool(value.enable_insitu_test_logging),
    defaultInsituTestTypeId:
      asNullableString(value.defaultInsituTestTypeId) ??
      asNullableString(value.default_insitu_test_type_id),
  }
}

export function parseSampleTypeDTOList(value: unknown): SampleTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: SampleTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseSampleTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function createSamplesOptionKey(prefix: string, name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || prefix}-${Date.now().toString(36)}-${index}`
}
