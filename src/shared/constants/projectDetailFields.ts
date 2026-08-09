export const PROJECT_DETAIL_FIELD_KEYS = [
  "highway",
  "csjNumber",
  "district",
  "structure",
  "county",
  "contractId",
  "deliveryId",
  "projectIntent",
  "serviceLine",
  "laboratory",
  "serviceArea",
] as const

export const MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS = [
  "district",
  "serviceLine",
  "serviceArea",
] as const

export type ProjectDetailFieldKey = (typeof PROJECT_DETAIL_FIELD_KEYS)[number]
export type ManageableProjectDetailFieldKey =
  (typeof MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS)[number]

export type ProjectDetailFieldsSettings = {
  enabled: Record<ProjectDetailFieldKey, boolean>
  options: Record<ManageableProjectDetailFieldKey, string[]>
}

export const DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS: Record<
  ManageableProjectDetailFieldKey,
  string[]
> = {
  district: ["North", "South", "East", "West"],
  serviceLine: ["Geotechnical", "Environmental", "Materials Testing"],
  serviceArea: ["Victoria", "New South Wales", "Queensland"],
}

function createDefaultEnabledFields(): Record<ProjectDetailFieldKey, boolean> {
  return PROJECT_DETAIL_FIELD_KEYS.reduce(
    (acc, key) => {
      acc[key] = true
      return acc
    },
    {} as Record<ProjectDetailFieldKey, boolean>
  )
}

function createDefaultOptions(): Record<ManageableProjectDetailFieldKey, string[]> {
  return MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS.reduce(
    (acc, key) => {
      acc[key] = [...DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS[key]]
      return acc
    },
    {} as Record<ManageableProjectDetailFieldKey, string[]>
  )
}

export const DEFAULT_PROJECT_DETAIL_FIELDS_SETTINGS: ProjectDetailFieldsSettings = {
  enabled: createDefaultEnabledFields(),
  options: createDefaultOptions(),
}

function isProjectDetailFieldKey(value: string): value is ProjectDetailFieldKey {
  return (PROJECT_DETAIL_FIELD_KEYS as readonly string[]).includes(value)
}

function isManageableProjectDetailFieldKey(
  value: string
): value is ManageableProjectDetailFieldKey {
  return (MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS as readonly string[]).includes(value)
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

export function parseProjectDetailFieldsSettings(
  value: unknown
): ProjectDetailFieldsSettings {
  const defaults = DEFAULT_PROJECT_DETAIL_FIELDS_SETTINGS

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
      if (isProjectDetailFieldKey(key) && typeof enabledValue === "boolean") {
        enabled[key] = enabledValue
      }
    }
  }

  return { enabled, options }
}

export function parseProjectDetailFieldsEnabled(
  value: unknown
): Record<ProjectDetailFieldKey, boolean> {
  return parseProjectDetailFieldsSettings(value).enabled
}

export function buildProjectDetailFieldsSettings(
  enabled: Record<ProjectDetailFieldKey, boolean>,
  options: Record<ManageableProjectDetailFieldKey, string[]>
): ProjectDetailFieldsSettings {
  return {
    enabled: { ...enabled },
    options: MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS.reduce(
      (acc, key) => {
        acc[key] = [...options[key]]
        return acc
      },
      {} as Record<ManageableProjectDetailFieldKey, string[]>
    ),
  }
}

export function serializeProjectDetailFieldsEnabled(
  settings: Pick<ProjectDetailFieldsSettings, "enabled">
): { enabled: Record<ProjectDetailFieldKey, boolean> } {
  return { enabled: { ...settings.enabled } }
}
