import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  LOG_CONFIGURATION_NAME_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"
import {
  LOG_CONFIGURATION_COORDINATE_REQUIREMENTS,
  LOG_CONFIGURATION_COORDINATE_SYSTEM_UNITS,
  LOG_CONFIGURATION_DATE_FORMATS,
  LOG_CONFIGURATION_DESCRIPTION_MAX_LENGTH,
  LOG_CONFIGURATION_ELEVATION_UNITS,
  LOG_CONFIGURATION_MEASUREMENT_SYSTEMS,
  LOG_CONFIGURATION_TEMPLATE_SLUG_REF_MAX_LENGTH,
} from "../../../shared/constants/logConfigurationSettings"
import { REMOVED_CONFIG_MODULE_SLUGS } from "../../../shared/constants/configModuleCatalog"
import {
  MODULE_DISPLAY_NAME_MAX_LENGTH,
  MODULE_OPTION_NAME_MAX_LENGTH,
  MODULE_OPTIONS_MAX_COUNT,
  MODULE_STATUSES,
  WORKFLOW_FIELD_INPUT_TYPES,
  WORKFLOW_NAME_MAX_LENGTH,
  WORKFLOW_STEP_CONDITION_TYPES,
  WORKFLOW_STEP_TYPES,
  WORKFLOW_STEPS_MAX_COUNT,
} from "../../../shared/constants/configModuleSettings"
import { projectDetailFieldsEnabledSchema, logDetailFieldsEnabledSchema } from "./log-configuration-field-option.validation"

const moduleSlugSchema = Joi.string()
  .trim()
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100)
  .invalid(...REMOVED_CONFIG_MODULE_SLUGS)

const projectDetailFieldsSchema = projectDetailFieldsEnabledSchema
const logDetailFieldsSchema = logDetailFieldsEnabledSchema

const namedOptionSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  nameInDescription: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  codeInDescription: Joi.string().trim().max(100).allow(null, "").optional(),
  code: Joi.string().trim().max(100).allow(null, "").optional(),
  abbreviation: Joi.string().trim().max(100).allow(null, "").optional(),
  showAutoScale: Joi.boolean().optional(),
  classificationCodeOverride: Joi.boolean().optional(),
  type: Joi.string().trim().max(50).optional(),
  rockGroup: Joi.string().trim().max(100).allow(null, "").optional(),
  color: Joi.string().trim().max(100).allow(null, "").optional(),
  applyColorToPdf: Joi.boolean().optional(),
  overrideGraphic: Joi.boolean().optional(),
  splitGraphic: Joi.boolean().optional(),
  graphic: Joi.string().trim().max(255).allow(null, "").optional(),
}).unknown(true)

const workflowStepConditionSchema = Joi.object({
  type: Joi.string()
    .valid(...WORKFLOW_STEP_CONDITION_TYPES)
    .required(),
  field: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  value: Joi.alternatives().try(Joi.string(), Joi.boolean(), Joi.number()).required(),
  searchTerm: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  isOriginType: Joi.boolean().optional(),
  isRockGroup: Joi.boolean().optional(),
})

const workflowStepOptionSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  value: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  visible: Joi.boolean().optional(),
  group: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  rockGroup: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  abbreviation: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  isDefault: Joi.boolean().optional(),
  conditions: Joi.array().items(workflowStepConditionSchema).optional(),
})

const workflowStepSchema = Joi.object({
  id: Joi.string().trim().max(100).required(),
  name: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).required(),
  type: Joi.string()
    .valid(...WORKFLOW_STEP_TYPES)
    .required(),
  fieldName: Joi.string().trim().max(MODULE_OPTION_NAME_MAX_LENGTH).optional(),
  inputType: Joi.string()
    .valid(...WORKFLOW_FIELD_INPUT_TYPES)
    .optional(),
  databaseField: Joi.string().trim().max(100).optional(),
  required: Joi.boolean().optional(),
  unit: Joi.string().trim().max(20).optional(),
  optionSet: Joi.string().trim().max(100).allow(null).optional(),
  options: Joi.array().items(workflowStepOptionSchema).max(MODULE_OPTIONS_MAX_COUNT).optional(),
  conditions: Joi.array().items(workflowStepConditionSchema).optional(),
  multipleOptions: Joi.boolean().optional(),
  maxOptionsSelected: Joi.number().integer().min(1).max(20).optional(),
  allowFreeText: Joi.boolean().optional(),
  conditionsOperator: Joi.string().valid("AND", "OR").optional(),
  instructions: Joi.string().trim().max(2000).optional(),
})

const storedModuleSettingsSchema = Joi.object({
  moduleName: Joi.string().trim().max(MODULE_DISPLAY_NAME_MAX_LENGTH).required(),
  status: Joi.string()
    .valid(...MODULE_STATUSES)
    .required(),
  showOnWeb: Joi.boolean().required(),
  showOnMobile: Joi.boolean().required(),
  displayName: Joi.string().trim().max(MODULE_DISPLAY_NAME_MAX_LENGTH).optional(),
  remarkTypes: Joi.array().items(namedOptionSchema).max(MODULE_OPTIONS_MAX_COUNT).optional(),
  dataTypeOptions: Joi.object()
    .pattern(Joi.string(), Joi.array().items(namedOptionSchema).max(MODULE_OPTIONS_MAX_COUNT))
    .optional(),
  // Module-specific settings (subsurface, coreLogging, wellLogs, etc.)
}).unknown(true)

const modulesMapSchema = Joi.object().pattern(moduleSlugSchema, storedModuleSettingsSchema)

const workflowSchema = Joi.object({
  enabled: Joi.boolean().required(),
  name: Joi.string().trim().max(WORKFLOW_NAME_MAX_LENGTH).required(),
  ignoreParentLegacySettings: Joi.boolean().optional(),
  steps: Joi.array().items(workflowStepSchema).max(WORKFLOW_STEPS_MAX_COUNT).required(),
  applyClassificationRules: Joi.boolean().optional(),
  classificationCodes: Joi.array().items(Joi.object()).optional(),
})

const moduleSettingsSchema = Joi.object({
  order: Joi.array().items(moduleSlugSchema).unique().optional(),
  modules: modulesMapSchema.optional(),
  workflow: workflowSchema.optional(),
})
  .pattern(moduleSlugSchema, storedModuleSettingsSchema)
  .optional()

const settingsFields = {
  description: Joi.string().trim().max(LOG_CONFIGURATION_DESCRIPTION_MAX_LENGTH).allow("").optional(),
  coordinateSystem: Joi.string().trim().optional(),
  coordinateSystemUnit: Joi.string()
    .valid(...LOG_CONFIGURATION_COORDINATE_SYSTEM_UNITS)
    .optional(),
  allowCoordinateSystemAtLog: Joi.boolean().optional(),
  allowCoordinateSystemAtProject: Joi.boolean().optional(),
  autoElevation: Joi.boolean().optional(),
  coordinateRequirement: Joi.string()
    .valid(...LOG_CONFIGURATION_COORDINATE_REQUIREMENTS)
    .optional(),
  allowDuplicateProjectNumbers: Joi.boolean().optional(),
  measurementSystem: Joi.string().valid(...LOG_CONFIGURATION_MEASUREMENT_SYSTEMS).optional(),
  dateFormat: Joi.string().valid(...LOG_CONFIGURATION_DATE_FORMATS).optional(),
  elevationUnit: Joi.string().valid(...LOG_CONFIGURATION_ELEVATION_UNITS).optional(),
  projectDetailFields: projectDetailFieldsSchema,
  logDetailFields: logDetailFieldsSchema,
  enabledModules: Joi.array().items(moduleSlugSchema).unique().optional(),
  moduleSettings: moduleSettingsSchema,
}

export const createLogConfigurationSchema = Joi.object({
  name: Joi.string().trim().max(LOG_CONFIGURATION_NAME_MAX_LENGTH).required(),
  status: Joi.string().valid("active", "inactive").optional(),
  templateSlug: Joi.string().trim().max(LOG_CONFIGURATION_TEMPLATE_SLUG_REF_MAX_LENGTH).optional(),
})

export const updateLogConfigurationSchema = Joi.object({
  name: Joi.string().trim().max(LOG_CONFIGURATION_NAME_MAX_LENGTH).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  ...settingsFields,
}).min(1)

export const listLogConfigurationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  sortBy: Joi.string().valid("id", "name", "status", "createdAt", "updatedAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
