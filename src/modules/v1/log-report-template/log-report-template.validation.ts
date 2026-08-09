import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  LOG_REPORT_TEMPLATE_LOG_TYPES,
  LOG_REPORT_TEMPLATE_NAME_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"

const configSchema = Joi.object({
  columnData: Joi.array().items(Joi.object().unknown(true)).required(),
})
  .unknown(true)
  .optional()

/** Empty `{}` allowed so the service can seed catalog defaults. */
const configInputSchema = Joi.alternatives()
  .try(Joi.object().max(0), configSchema)
  .optional()

export const createLogReportTemplateSchema = Joi.object({
  name: Joi.string().trim().max(LOG_REPORT_TEMPLATE_NAME_MAX_LENGTH).required(),
  logType: Joi.string()
    .valid(...LOG_REPORT_TEMPLATE_LOG_TYPES)
    .required(),
  isDefault: Joi.boolean().optional(),
  config: configInputSchema,
  logConfigurationIds: Joi.array().items(Joi.alternatives(Joi.string(), Joi.number())).optional(),
  templateVersion: Joi.number().integer().min(1).optional(),
})

export const updateLogReportTemplateSchema = Joi.object({
  name: Joi.string().trim().max(LOG_REPORT_TEMPLATE_NAME_MAX_LENGTH).optional(),
  logType: Joi.string()
    .valid(...LOG_REPORT_TEMPLATE_LOG_TYPES)
    .optional(),
  isDefault: Joi.boolean().optional(),
  config: configInputSchema,
  logConfigurationIds: Joi.array().items(Joi.alternatives(Joi.string(), Joi.number())).optional(),
  templateVersion: Joi.number().integer().min(1).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogReportTemplatesQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  logType: Joi.string()
    .valid(...LOG_REPORT_TEMPLATE_LOG_TYPES)
    .optional(),
  grouped: Joi.string().valid("true", "false").optional(),
  sortBy: Joi.string()
    .valid("id", "name", "logType", "sortOrder", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})

export const reorderLogReportTemplatesSchema = Joi.object({
  orderedIds: Joi.array().items(Joi.number().integer().min(1)).min(1).required(),
})
