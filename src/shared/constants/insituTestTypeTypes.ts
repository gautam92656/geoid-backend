export const INSITU_TESTS_MODULE_SLUG = "insitu-tests-usa" as const

export type InsituTestIntervalParam = {
  name?: string | null
  active: boolean
  interval?: number | null
  value?: string | number | null
  metricName?: string | null
  imperialName?: string | null
}

export type InsituTestOtherSetting = {
  name: string
  description?: string | null
  enabled?: boolean
  value?: string | number | null
  params?: InsituTestIntervalParam[]
  defaultInterval?: number | null
  density?: unknown[]
  consistency?: unknown[]
}

export type InsituTestUnitSettingField = {
  unit?: string | null
  column?: string | null
  unitType?: string | null
  dataField?: string | null
  displayName?: string | null
}

export type InsituTestTypeSettings = {
  otherSettings: InsituTestOtherSetting[]
  unitSettings?: InsituTestUnitSettingField[]
  order?: number | null
}

export type InsituTestTypeDTO = {
  id: string
  name: string
  active?: boolean
  graphic?: string | null
  enableSegregatedGraphic?: boolean
  topGraphic?: string | null
  bottomGraphic?: string | null
  depthFrequencyEnabled?: boolean
  depthFrequency?: string | null
  enableSampleLogging?: boolean
  enableSubsurfaceLogging?: boolean
  defaultSampleTypeId?: string | null
  enableAutoSampleDescription?: boolean
  settings?: InsituTestTypeSettings
}

export type InsituUnitSettingDTO = {
  id: string
  name: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
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
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "yes"
  }
  return fallback
}

function asNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asSettingValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") return value
  return null
}

function parseIntervalParam(value: unknown): InsituTestIntervalParam | null {
  if (!isRecord(value)) return null
  return {
    name: asNullableString(value.name),
    active: value.active === undefined ? true : asBool(value.active, true),
    interval:
      value.interval === undefined ? null : asNullableNumber(value.interval),
    value: asSettingValue(value.value),
    metricName:
      asNullableString(value.metricName) ?? asNullableString(value.metric_name),
    imperialName:
      asNullableString(value.imperialName) ??
      asNullableString(value.imperial_name),
  }
}

function parseOtherSetting(value: unknown): InsituTestOtherSetting | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  const setting: InsituTestOtherSetting = { name }
  const description = asNullableString(value.description)
  if (description !== null || value.description === null) {
    setting.description = description
  }
  if (value.enabled !== undefined) {
    setting.enabled = asBool(value.enabled, false)
  }
  if (value.value !== undefined) {
    setting.value = asSettingValue(value.value)
  }
  if (Array.isArray(value.params)) {
    setting.params = value.params
      .map(parseIntervalParam)
      .filter((entry): entry is InsituTestIntervalParam => entry !== null)
  }
  if (value.defaultInterval !== undefined || value.default_interval !== undefined) {
    setting.defaultInterval =
      asNullableNumber(value.defaultInterval) ??
      asNullableNumber(value.default_interval)
  }
  if (Array.isArray(value.density)) setting.density = value.density
  if (Array.isArray(value.consistency)) setting.consistency = value.consistency
  return setting
}

function parseUnitSettingField(value: unknown): InsituTestUnitSettingField | null {
  if (!isRecord(value)) return null
  return {
    unit: asNullableString(value.unit),
    column: asNullableString(value.column),
    unitType:
      asNullableString(value.unitType) ?? asNullableString(value.unit_type),
    dataField:
      asNullableString(value.dataField) ?? asNullableString(value.data_field),
    displayName:
      asNullableString(value.displayName) ??
      asNullableString(value.display_name),
  }
}

export function createBlankInsituTestTypeSettings(): InsituTestTypeSettings {
  return { otherSettings: [] }
}

export function parseInsituTestTypeSettings(value: unknown): InsituTestTypeSettings {
  if (!isRecord(value)) return createBlankInsituTestTypeSettings()

  const otherRaw = value.otherSettings ?? value.other_settings
  const unitRaw = value.unitSettings ?? value.unit_settings
  const settings: InsituTestTypeSettings = {
    otherSettings: Array.isArray(otherRaw)
      ? otherRaw
          .map(parseOtherSetting)
          .filter((entry): entry is InsituTestOtherSetting => entry !== null)
      : [],
  }

  if (Array.isArray(unitRaw)) {
    settings.unitSettings = unitRaw
      .map(parseUnitSettingField)
      .filter((entry): entry is InsituTestUnitSettingField => entry !== null)
  }

  if (value.order !== undefined) {
    settings.order = asNullableNumber(value.order)
  }

  return settings
}

export function parseInsituTestTypeDTO(
  value: unknown,
  index: number
): InsituTestTypeDTO | null {
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
          : `testing-type-${index + 1}`

  const graphicRaw =
    asNullableString(value.graphic) ??
    asNullableString(value.testingGraphic) ??
    asNullableString(value.testing_graphic)

  return {
    id,
    name,
    active:
      value.active !== undefined
        ? asBool(value.active, true)
        : value.is_active !== undefined
          ? asBool(value.is_active, true)
          : true,
    graphic: graphicRaw ?? "graphic_00.png",
    enableSegregatedGraphic:
      asBool(value.enableSegregatedGraphic, false) ||
      asBool(value.enable_segregated_graphic, false),
    topGraphic:
      asNullableString(value.topGraphic) ?? asNullableString(value.top_graphic),
    bottomGraphic:
      asNullableString(value.bottomGraphic) ??
      asNullableString(value.bottom_graphic),
    depthFrequencyEnabled:
      asBool(value.depthFrequencyEnabled, false) ||
      asBool(value.depth_frequency_enabled, false) ||
      asBool(value.is_depth_frequency_enabled, false),
    depthFrequency:
      asNullableString(value.depthFrequency) ??
      asNullableString(value.depth_frequency),
    enableSampleLogging:
      asBool(value.enableSampleLogging, false) ||
      asBool(value.enable_sample_logging, false) ||
      asBool(value.is_sample_logging_enabled, false),
    enableSubsurfaceLogging:
      asBool(value.enableSubsurfaceLogging, false) ||
      asBool(value.enable_subsurface_logging, false) ||
      asBool(value.is_subsurface_logging_enabled, false),
    defaultSampleTypeId:
      asNullableString(value.defaultSampleTypeId) ??
      asNullableString(value.default_sample_type_id) ??
      asNullableString(value.sample_type_name) ??
      (typeof value.sample_type === "number" ? String(value.sample_type) : null) ??
      asNullableString(value.sample_type),
    enableAutoSampleDescription:
      asBool(value.enableAutoSampleDescription, false) ||
      asBool(value.enable_auto_sample_description, false) ||
      asBool(value.is_auto_sample, false),
    settings: parseInsituTestTypeSettings(value.settings),
  }
}

export function parseInsituTestTypeDTOList(value: unknown): InsituTestTypeDTO[] {
  if (!Array.isArray(value)) return []
  const options: InsituTestTypeDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseInsituTestTypeDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}

export function parseInsituUnitSettingDTO(
  value: unknown,
  index: number
): InsituUnitSettingDTO | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === "string" ? value.name.trim() : ""
  if (!name) return null

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : typeof value.optionKey === "string" && value.optionKey.trim()
        ? value.optionKey.trim()
        : `unit-setting-${index + 1}`

  return { id, name }
}

export function parseInsituUnitSettingDTOList(value: unknown): InsituUnitSettingDTO[] {
  if (!Array.isArray(value)) return []
  const options: InsituUnitSettingDTO[] = []
  const seen = new Set<string>()

  for (const [index, entry] of value.entries()) {
    const parsed = parseInsituUnitSettingDTO(entry, index)
    if (!parsed) continue
    const key = parsed.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    options.push(parsed)
  }

  return options
}
