export const LOG_CONFIGURATION_COORDINATE_SYSTEM_MAX_LENGTH = 100
export const LOG_CONFIGURATION_COORDINATE_SYSTEM_UNIT_MAX_LENGTH = 50
export const LOG_CONFIGURATION_COORDINATE_REQUIREMENT_MAX_LENGTH = 50
export const LOG_CONFIGURATION_MEASUREMENT_SYSTEM_MAX_LENGTH = 50
export const LOG_CONFIGURATION_DATE_FORMAT_MAX_LENGTH = 50
export const LOG_CONFIGURATION_ELEVATION_UNIT_MAX_LENGTH = 50
export const LOG_CONFIGURATION_TEMPLATE_SLUG_REF_MAX_LENGTH = 100
export const LOG_CONFIGURATION_DESCRIPTION_MAX_LENGTH = 2000

export const LOG_CONFIGURATION_COORDINATE_REQUIREMENTS = [
  "can-be-null",
  "required",
] as const

export const LOG_CONFIGURATION_COORDINATE_SYSTEM_UNITS = ["meters", "feet"] as const
export const LOG_CONFIGURATION_MEASUREMENT_SYSTEMS = ["metric", "imperial"] as const
export const LOG_CONFIGURATION_DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const
export const LOG_CONFIGURATION_ELEVATION_UNITS = ["meters", "feet"] as const

export type LogConfigurationCoordinateRequirement =
  (typeof LOG_CONFIGURATION_COORDINATE_REQUIREMENTS)[number]

export type LogConfigurationSettings = {
  coordinateSystem: string
  coordinateSystemUnit: (typeof LOG_CONFIGURATION_COORDINATE_SYSTEM_UNITS)[number]
  allowCoordinateSystemAtLog: boolean
  allowCoordinateSystemAtProject: boolean
  autoElevation: boolean
  coordinateRequirement: LogConfigurationCoordinateRequirement
  allowDuplicateProjectNumbers: boolean
  measurementSystem: (typeof LOG_CONFIGURATION_MEASUREMENT_SYSTEMS)[number]
  dateFormat: (typeof LOG_CONFIGURATION_DATE_FORMATS)[number]
  elevationUnit: (typeof LOG_CONFIGURATION_ELEVATION_UNITS)[number]
}

export const DEFAULT_LOG_CONFIGURATION_SETTINGS: LogConfigurationSettings = {
  coordinateSystem: "easting-northing",
  coordinateSystemUnit: "meters",
  allowCoordinateSystemAtLog: true,
  allowCoordinateSystemAtProject: true,
  autoElevation: true,
  coordinateRequirement: "can-be-null",
  allowDuplicateProjectNumbers: false,
  measurementSystem: "metric",
  dateFormat: "DD/MM/YYYY",
  elevationUnit: "meters",
}

export const LOG_CONFIGURATION_TEMPLATE_SETTINGS: Partial<
  Record<string, Partial<LogConfigurationSettings>>
> = {
  "as1726-rev2": {
    coordinateSystem: "easting-northing",
    measurementSystem: "metric",
    dateFormat: "DD/MM/YYYY",
  },
  "as1726-environmental": {
    coordinateSystem: "easting-northing",
    measurementSystem: "metric",
    dateFormat: "DD/MM/YYYY",
  },
}

export function resolveLogConfigurationSettings(
  templateSlug?: string | null
): LogConfigurationSettings {
  const overrides = templateSlug ? LOG_CONFIGURATION_TEMPLATE_SETTINGS[templateSlug] ?? {} : {}
  return { ...DEFAULT_LOG_CONFIGURATION_SETTINGS, ...overrides }
}
