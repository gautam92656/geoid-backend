import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  PROJECT_ADDRESS_MAX_LENGTH,
  PROJECT_ASSIGNEE_MAX_LENGTH,
  PROJECT_BRIEF_MAX_LENGTH,
  PROJECT_COORDINATE_SYSTEM_MAX_LENGTH,
  PROJECT_COORDINATE_VALUE_MAX_LENGTH,
  PROJECT_LOG_CONFIG_ID_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_NO_MAX_LENGTH,
  PROJECT_OFFICE_MAX_LENGTH,
  PROJECT_STATUSES,
  PROJECT_UTM_ZONE_MAX_LENGTH,
} from "../../../shared/constants"

const projectStatusSchema = Joi.string().valid(...PROJECT_STATUSES)
const optionalDateSchema = Joi.string()
  .trim()
  .empty("")
  .optional()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Date must be in YYYY-MM-DD format" })

export const createProjectSchema = Joi.object({
  userId: Joi.number().integer().min(1).required(),
  projectNo: Joi.string().trim().max(PROJECT_NO_MAX_LENGTH).required(),
  name: Joi.string().trim().max(PROJECT_NAME_MAX_LENGTH).required(),
  address: Joi.string().trim().max(PROJECT_ADDRESS_MAX_LENGTH).required(),
  status: projectStatusSchema.default("to_do"),
  brief: Joi.string().trim().max(PROJECT_BRIEF_MAX_LENGTH).allow("").optional(),
  assignee: Joi.string().trim().max(PROJECT_ASSIGNEE_MAX_LENGTH).allow("").optional(),
  logConfigId: Joi.string().trim().max(PROJECT_LOG_CONFIG_ID_MAX_LENGTH).required(),
  clientId: Joi.number().integer().min(1).required(),
  office: Joi.string().trim().max(PROJECT_OFFICE_MAX_LENGTH).allow("").optional(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  coordinateSystem: Joi.string().trim().max(PROJECT_COORDINATE_SYSTEM_MAX_LENGTH).allow("").optional(),
  latitude: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  longitude: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  easting: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  northing: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  utmZone: Joi.string().trim().max(PROJECT_UTM_ZONE_MAX_LENGTH).allow("").optional(),
})

export const updateProjectSchema = Joi.object({
  projectNo: Joi.string().trim().max(PROJECT_NO_MAX_LENGTH).optional(),
  name: Joi.string().trim().max(PROJECT_NAME_MAX_LENGTH).optional(),
  address: Joi.string().trim().max(PROJECT_ADDRESS_MAX_LENGTH).allow("").optional(),
  status: projectStatusSchema.optional(),
  brief: Joi.string().trim().max(PROJECT_BRIEF_MAX_LENGTH).allow("").optional(),
  assignee: Joi.string().trim().max(PROJECT_ASSIGNEE_MAX_LENGTH).allow("").optional(),
  logConfigId: Joi.string().trim().max(PROJECT_LOG_CONFIG_ID_MAX_LENGTH).allow("").optional(),
  clientId: Joi.number().integer().min(1).allow(null).optional(),
  office: Joi.string().trim().max(PROJECT_OFFICE_MAX_LENGTH).allow("").optional(),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  coordinateSystem: Joi.string().trim().max(PROJECT_COORDINATE_SYSTEM_MAX_LENGTH).allow("").optional(),
  latitude: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  longitude: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  easting: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  northing: Joi.string().trim().max(PROJECT_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  utmZone: Joi.string().trim().max(PROJECT_UTM_ZONE_MAX_LENGTH).allow("").optional(),
}).min(1)

export const listProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  listScope: Joi.string().valid("active", "archived", "deleted").optional(),
  search: Joi.string().trim().optional(),
  status: projectStatusSchema.optional(),
  sortBy: Joi.string()
    .valid("id", "projectNo", "name", "status", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
