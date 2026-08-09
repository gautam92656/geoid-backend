export const LOG_NUMBER_MAX_LENGTH = 50
export const LOG_CONFIG_ID_MAX_LENGTH = 100
export const LOG_COORDINATE_SYSTEM_MAX_LENGTH = 100
export const LOG_COORDINATE_VALUE_MAX_LENGTH = 50
export const LOG_UTM_ZONE_MAX_LENGTH = 50
export const LOG_END_DEPTH_MAX_LENGTH = 50
export const LOG_ELEVATION_MAX_LENGTH = 50
export const LOG_STATION_MAX_LENGTH = 100
export const LOG_FINISHING_REASON_MAX_LENGTH = 200
export const LOG_PERSON_NAME_MAX_LENGTH = 200
export const LOG_ANGLE_MAX_LENGTH = 50
export const LOG_TIME_MAX_LENGTH = 10

export const LOG_CREATION_STATUSES = [
  "to_do",
  "in_progress",
  "field",
  "lab",
  "completed",
] as const

export const LOG_STATUSES = [
  ...LOG_CREATION_STATUSES,
  "preliminary",
  "draft",
  "final",
  "in_active",
] as const

export const LOG_TYPES = [
  "borelog",
  "test_pit",
  "probe",
  "monitoring_well",
  "inclined_borehole",
] as const

export const FINISHING_REASONS = [
  "Target depth reached",
  "Refusal",
  "Water encountered",
  "Equipment failure",
  "Client request",
  "Other",
] as const
