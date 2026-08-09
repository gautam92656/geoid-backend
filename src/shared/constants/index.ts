export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

export const USER_NAME_MAX_LENGTH = 50
export const USER_EMAIL_MAX_LENGTH = 255
export const USER_PHONE_MAX_LENGTH = 20
export const USER_COMPANY_NAME_MAX_LENGTH = 200
export const USER_COMPANY_LOGO_URL_MAX_LENGTH = 2_000_000
export const PHONE_CODE_MAX_LENGTH = 10
export const PASSWORD_MIN_LENGTH = 8

export const FAQ_QUESTION_MAX_LENGTH = 500
export const FAQ_ANSWER_MAX_LENGTH = 5000

export const CLIENT_COMPANY_NAME_MAX_LENGTH = 200
export const CLIENT_COMPANY_CONTACT_MAX_LENGTH = 200
export const CLIENT_EXTERNAL_ID_MAX_LENGTH = 100

export const SUPPLIER_BUSINESS_NAME_MAX_LENGTH = 200
export const SUPPLIER_EXTERNAL_ID_MAX_LENGTH = 100
export const SUPPLIER_ABN_MAX_LENGTH = 20
export const SUPPLIER_ADDRESS_MAX_LENGTH = 500
export const SUPPLIER_LAB_TEST_TYPES = [
  "Moisture Content",
  "Particle Size Distribution",
  "Atterberg Limits",
  "IS50",
  "GS - Mechanical Grain Size",
  "w - Moisture Content",
  "C - Consolidation Test",
  "L-Pile",
  "HCSI",
  "DR - Relative Density",
  "k - Permeability Coefficient",
  "q - Triaxial Test",
  "UCS - Unconfined Compressive Strength",
  "SB - Shear Box Test",
  "Y - Unit Weight",
  "Yd - Dry Unit Weight",
  "p - Density",
  "Pd - Dry Density",
] as const
export const SUPPLIER_TYPES = ["Laboratory", "Equipment"] as const
export const SUPPLIER_RELATIONSHIPS = ["Internal supplier", "External supplier"] as const
export type SupplierRelationshipLabel = (typeof SUPPLIER_RELATIONSHIPS)[number]

export const SUPPLIER_RELATIONSHIP_TO_PRISMA = {
  "Internal supplier": "InternalSupplier",
  "External supplier": "ExternalSupplier",
} as const satisfies Record<SupplierRelationshipLabel, string>

export const SUPPLIER_RELATIONSHIP_FROM_PRISMA: Record<
  (typeof SUPPLIER_RELATIONSHIP_TO_PRISMA)[SupplierRelationshipLabel],
  SupplierRelationshipLabel
> = {
  InternalSupplier: "Internal supplier",
  ExternalSupplier: "External supplier",
}

export const PROJECT_NO_MAX_LENGTH = 50
export const PROJECT_NAME_MAX_LENGTH = 200
export const PROJECT_ADDRESS_MAX_LENGTH = 500
export const PROJECT_BRIEF_MAX_LENGTH = 5000
export const PROJECT_ASSIGNEE_MAX_LENGTH = 100
export const PROJECT_OFFICE_MAX_LENGTH = 200

export const OFFICE_NAME_MAX_LENGTH = 200
export const OFFICE_ADDRESS_MAX_LENGTH = 500
export const OFFICE_EXTERNAL_ID_MAX_LENGTH = 100
export const OFFICE_NUMBER_MAX_LENGTH = 100
export const OFFICE_STATE_MAX_LENGTH = 100
export const OFFICE_LABORATORY_MAX_LENGTH = 200

export const HEADER_FOOTER_TEMPLATE_NAME_MAX_LENGTH = 200
export const HEADER_FOOTER_TEMPLATE_KINDS = ["header", "footer"] as const
export const HEADER_FOOTER_REPORT_TYPES = ["borelog", "corelog"] as const

export const LOG_REPORT_TEMPLATE_NAME_MAX_LENGTH = 200
export const LOG_REPORT_TEMPLATE_LOG_TYPES = ["borelog", "corelog"] as const

export const PROJECT_LOG_CONFIG_ID_MAX_LENGTH = 100
export const PROJECT_COORDINATE_SYSTEM_MAX_LENGTH = 100
export const PROJECT_COORDINATE_VALUE_MAX_LENGTH = 50
export const PROJECT_UTM_ZONE_MAX_LENGTH = 50
export const PROJECT_STATUSES = [
  "draft",
  "to_do",
  "in_planning",
  "scheduled",
  "onsite_works",
  "onsite_works_completed",
  "lab_testing",
  "reporting",
  "complete",
] as const

export const LOG_CONFIGURATION_NAME_MAX_LENGTH = 500

export {
  LOG_CONFIGURATION_TEMPLATE_SLUG_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_NAME_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_REGION_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_REGIONS,
  LOG_CONFIGURATION_TEMPLATE_DISCIPLINES,
} from "./logConfigurationTemplate"

export {
  CONFIG_MODULE_SLUG_MAX_LENGTH,
  CONFIG_MODULE_TITLE_MAX_LENGTH,
  CONFIG_MODULE_DESCRIPTION_MAX_LENGTH,
  CONFIG_MODULE_SCOPES,
  CONFIG_MODULE_FILTER_CATEGORIES,
} from "./configModuleCatalog"

export const EQUIPMENT_TYPE_NAME_MAX_LENGTH = 100
export const EQUIPMENT_TYPE_DESCRIPTION_MAX_LENGTH = 500
export const EQUIPMENT_NO_MAX_LENGTH = 100
export const EQUIPMENT_NAME_MAX_LENGTH = 200
export const EQUIPMENT_TEXT_FIELD_MAX_LENGTH = 200
export const EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH = 50

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

export const EQUIPMENT_FIELD_KEYS = [
  "equipmentNo",
  "equipmentName",
  "suppliers",
  "mounting",
  "driveWeight",
  "drop",
  "manufacturer",
  "model",
  "energyTransferRatio",
  "hammerEfficiencyCorrection",
  "netAreaRatio",
  "tipArea",
  "porePressureTransducerLocation",
  "frictionReducerType",
  "frictionReducer",
  "frictionRatio",
  "calibratedBy",
  "dateOfCalibration",
  "bucketWidth",
] as const

export const BCRYPT_SALT_ROUNDS = 10
export const OTP_CODE_LENGTH = 4
export const OTP_EXPIRY_MINUTES = 10

export const SMTP_CONNECTION_TIMEOUT_MS = 15_000
export const SMTP_GREETING_TIMEOUT_MS = 15_000
export const SMTP_SOCKET_TIMEOUT_MS = 15_000

export const PG_CONNECTION_TIMEOUT_MS = 10_000

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const USER_APP_LANGUAGES = ["en", "hi"] as const
export type UserAppLanguage = (typeof USER_APP_LANGUAGES)[number]

export const USER_ROLES = ["user", "super_admin"] as const
export type UserRole = (typeof USER_ROLES)[number]
