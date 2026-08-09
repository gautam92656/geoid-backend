import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  LOG_CONFIGURATION_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_DISCIPLINES,
  LOG_CONFIGURATION_TEMPLATE_NAME_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_REGIONS,
  LOG_CONFIGURATION_TEMPLATE_REGION_MAX_LENGTH,
  LOG_CONFIGURATION_TEMPLATE_SLUG_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createLogConfigurationTemplateSchema = Joi.object({
  slug: Joi.string()
    .trim()
    .max(LOG_CONFIGURATION_TEMPLATE_SLUG_MAX_LENGTH)
    .pattern(slugPattern)
    .required(),
  name: Joi.string().trim().max(LOG_CONFIGURATION_TEMPLATE_NAME_MAX_LENGTH).required(),
  description: Joi.string().trim().max(LOG_CONFIGURATION_TEMPLATE_DESCRIPTION_MAX_LENGTH).required(),
  region: Joi.string()
    .trim()
    .max(LOG_CONFIGURATION_TEMPLATE_REGION_MAX_LENGTH)
    .valid(...LOG_CONFIGURATION_TEMPLATE_REGIONS)
    .required(),
  disciplines: Joi.array()
    .items(Joi.string().valid(...LOG_CONFIGURATION_TEMPLATE_DISCIPLINES))
    .min(1)
    .required(),
  isAvailable: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().min(0).default(0),
})

export const updateLogConfigurationTemplateSchema = Joi.object({
  slug: Joi.string()
    .trim()
    .max(LOG_CONFIGURATION_TEMPLATE_SLUG_MAX_LENGTH)
    .pattern(slugPattern)
    .optional(),
  name: Joi.string().trim().max(LOG_CONFIGURATION_TEMPLATE_NAME_MAX_LENGTH).optional(),
  description: Joi.string().trim().max(LOG_CONFIGURATION_TEMPLATE_DESCRIPTION_MAX_LENGTH).optional(),
  region: Joi.string()
    .trim()
    .max(LOG_CONFIGURATION_TEMPLATE_REGION_MAX_LENGTH)
    .valid(...LOG_CONFIGURATION_TEMPLATE_REGIONS)
    .optional(),
  disciplines: Joi.array()
    .items(Joi.string().valid(...LOG_CONFIGURATION_TEMPLATE_DISCIPLINES))
    .min(1)
    .optional(),
  isAvailable: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogConfigurationTemplatesQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  availableOnly: Joi.string().valid("true", "false").default("true"),
  search: Joi.string().trim().optional(),
  region: Joi.string()
    .trim()
    .max(LOG_CONFIGURATION_TEMPLATE_REGION_MAX_LENGTH)
    .valid(...LOG_CONFIGURATION_TEMPLATE_REGIONS)
    .optional(),
  discipline: Joi.string().valid(...LOG_CONFIGURATION_TEMPLATE_DISCIPLINES).optional(),
  sortBy: Joi.string().valid("id", "slug", "name", "region", "sortOrder", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
