export const LOG_DETAIL_FIELD_KEYS = [
  "locationAccuracy",
  "coordinateSystem",
  "elevationNotes",
  "coordinateMethod",
  "logType",
  "logNumericalId",
  "abandonmentMethod",
  "logFinish",
  "defaultBorelogTemplate",
  "defaultCorelogTemplate",
  "completedDate",
  "logCarrierType",
  "specialProduction",
  "projectEngineer",
  "csjNumber",
  "highway",
  "district",
  "county",
  "azimuth",
  "inclination",
  "alignment",
  "stationOffset",
  "station",
  "stateRoute",
  "section",
  "segmentOffset",
  "segment",
  "offsetFromCentreline",
  "direction",
  "lane",
  "line",
  "finishingComment",
  "comments",
  "locationComment",
  "operator",
  "structure",
  "temperature",
  "weather",
] as const

export const MANAGEABLE_LOG_DETAIL_FIELD_KEYS = [
  "logType",
  "abandonmentMethod",
  "logCarrierType",
] as const

export type LogDetailFieldKey = (typeof LOG_DETAIL_FIELD_KEYS)[number]
export type ManageableLogDetailFieldKey = (typeof MANAGEABLE_LOG_DETAIL_FIELD_KEYS)[number]

export type LogDetailFieldsSettings = {
  enabled: Record<LogDetailFieldKey, boolean>
  options: Record<ManageableLogDetailFieldKey, string[]>
}

export const DEFAULT_LOG_DETAIL_FIELD_ENABLED: Record<LogDetailFieldKey, boolean> = {
  locationAccuracy: true,
  coordinateSystem: true,
  elevationNotes: false,
  coordinateMethod: false,
  logType: true,
  logNumericalId: false,
  abandonmentMethod: false,
  logFinish: true,
  defaultBorelogTemplate: false,
  defaultCorelogTemplate: false,
  completedDate: true,
  logCarrierType: false,
  specialProduction: false,
  projectEngineer: false,
  csjNumber: false,
  highway: false,
  district: false,
  county: false,
  azimuth: true,
  inclination: true,
  alignment: false,
  stationOffset: false,
  station: true,
  stateRoute: false,
  section: false,
  segmentOffset: false,
  segment: false,
  offsetFromCentreline: false,
  direction: false,
  lane: false,
  line: false,
  finishingComment: true,
  comments: true,
  locationComment: true,
  operator: false,
  structure: false,
  temperature: false,
  weather: false,
}

export const DEFAULT_LOG_DETAIL_FIELD_OPTIONS: Record<ManageableLogDetailFieldKey, string[]> = {
  logType: ["Borehole", "Test Pit", "Cone Penetration Test"],
  abandonmentMethod: ["Grouted", "Cut and Capped", "Left Open"],
  logCarrierType: ["Truck", "ATV", "Foot"],
}

function createDefaultOptions(): Record<ManageableLogDetailFieldKey, string[]> {
  return MANAGEABLE_LOG_DETAIL_FIELD_KEYS.reduce(
    (acc, key) => {
      acc[key] = [...DEFAULT_LOG_DETAIL_FIELD_OPTIONS[key]]
      return acc
    },
    {} as Record<ManageableLogDetailFieldKey, string[]>
  )
}

export const DEFAULT_LOG_DETAIL_FIELDS_SETTINGS: LogDetailFieldsSettings = {
  enabled: { ...DEFAULT_LOG_DETAIL_FIELD_ENABLED },
  options: createDefaultOptions(),
}

function isLogDetailFieldKey(value: string): value is LogDetailFieldKey {
  return (LOG_DETAIL_FIELD_KEYS as readonly string[]).includes(value)
}

function isManageableLogDetailFieldKey(value: string): value is ManageableLogDetailFieldKey {
  return (MANAGEABLE_LOG_DETAIL_FIELD_KEYS as readonly string[]).includes(value)
}

function normalizeOptionList(values: unknown): string[] {
  if (!Array.isArray(values)) return []

  const seen = new Set<string>()
  const normalized: string[] = []

  for (const value of values) {
    if (typeof value !== "string") continue
    const trimmed = value.trim()
    if (!trimmed) continue
    const dedupeKey = trimmed.toLowerCase()
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    normalized.push(trimmed)
  }

  return normalized
}

export function parseLogDetailFieldsSettings(value: unknown): LogDetailFieldsSettings {
  const defaults = DEFAULT_LOG_DETAIL_FIELDS_SETTINGS

  if (!value || typeof value !== "object") {
    return {
      enabled: { ...defaults.enabled },
      options: createDefaultOptions(),
    }
  }

  const record = value as Record<string, unknown>
  const enabled = { ...defaults.enabled }
  const options = createDefaultOptions()

  if (record.enabled && typeof record.enabled === "object") {
    for (const [key, enabledValue] of Object.entries(record.enabled)) {
      if (isLogDetailFieldKey(key) && typeof enabledValue === "boolean") {
        enabled[key] = enabledValue
      }
    }
  }

  return { enabled, options }
}

export function parseLogDetailFieldsEnabled(
  value: unknown
): Record<LogDetailFieldKey, boolean> {
  return parseLogDetailFieldsSettings(value).enabled
}

export function buildLogDetailFieldsSettings(
  enabled: Record<LogDetailFieldKey, boolean>,
  options: Record<ManageableLogDetailFieldKey, string[]>
): LogDetailFieldsSettings {
  return {
    enabled: { ...enabled },
    options: MANAGEABLE_LOG_DETAIL_FIELD_KEYS.reduce(
      (acc, key) => {
        acc[key] = [...options[key]]
        return acc
      },
      {} as Record<ManageableLogDetailFieldKey, string[]>
    ),
  }
}

export function serializeLogDetailFieldsEnabled(
  settings: Pick<LogDetailFieldsSettings, "enabled">
): { enabled: Record<LogDetailFieldKey, boolean> } {
  return { enabled: { ...settings.enabled } }
}
