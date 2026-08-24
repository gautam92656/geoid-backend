import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  LOG_ANGLE_MAX_LENGTH,
  LOG_CONFIG_ID_MAX_LENGTH,
  LOG_COORDINATE_SYSTEM_MAX_LENGTH,
  LOG_COORDINATE_VALUE_MAX_LENGTH,
  LOG_CREATION_STATUSES,
  LOG_STATUSES,
  LOG_ELEVATION_MAX_LENGTH,
  LOG_END_DEPTH_MAX_LENGTH,
  LOG_FINISHING_REASON_MAX_LENGTH,
  LOG_NUMBER_MAX_LENGTH,
  LOG_PERSON_NAME_MAX_LENGTH,
  LOG_STATION_MAX_LENGTH,
  LOG_TIME_MAX_LENGTH,
  LOG_TYPES,
  LOG_UTM_ZONE_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"

const logStatusSchema = Joi.string().valid(...LOG_CREATION_STATUSES)
const logUpdateStatusSchema = Joi.string().valid(...LOG_STATUSES)
const logTypeSchema = Joi.string().valid(...LOG_TYPES)

const optionalDateSchema = Joi.string()
  .trim()
  .empty("")
  .optional()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Date must be in YYYY-MM-DD format" })

const optionalTimeSchema = Joi.string()
  .trim()
  .empty("")
  .optional()
  .max(LOG_TIME_MAX_LENGTH)

const optionalIdSchema = Joi.number().integer().min(1).allow(null).optional()

const baseLogFields = {
  proposedBorelogId: optionalIdSchema,
  logNumber: Joi.string().trim().max(LOG_NUMBER_MAX_LENGTH).required(),
  logConfigId: Joi.string().trim().max(LOG_CONFIG_ID_MAX_LENGTH).required(),
  logType: logTypeSchema.required(),
  logStatus: logStatusSchema.default("to_do"),
  drillingDate: optionalDateSchema,
  drillingTime: optionalTimeSchema,
  finishLogDate: optionalDateSchema,
  finishLogTime: optionalTimeSchema,
  endDepth: Joi.string().trim().max(LOG_END_DEPTH_MAX_LENGTH).allow("").optional(),
  finishingReason: Joi.string()
    .trim()
    .max(LOG_FINISHING_REASON_MAX_LENGTH)
    .allow("")
    .optional(),
  finishingComment: Joi.string().trim().allow("").optional(),
  scaleLogReport: Joi.boolean().optional(),
  coordinateSystem: Joi.string().trim().max(LOG_COORDINATE_SYSTEM_MAX_LENGTH).allow("").optional(),
  latitude: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  longitude: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  easting: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  northing: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  utmZone: Joi.string().trim().max(LOG_UTM_ZONE_MAX_LENGTH).allow("").optional(),
  elevation: Joi.string().trim().max(LOG_ELEVATION_MAX_LENGTH).allow("").optional(),
  station: Joi.string().trim().max(LOG_STATION_MAX_LENGTH).allow("").optional(),
  locationComment: Joi.string().trim().allow("").optional(),
  supplierId: optionalIdSchema,
  equipmentId: optionalIdSchema,
  loggedBy: Joi.string().trim().max(LOG_PERSON_NAME_MAX_LENGTH).allow("").optional(),
  reviewedBy: Joi.string().trim().max(LOG_PERSON_NAME_MAX_LENGTH).allow("").optional(),
  inclination: Joi.string().trim().max(LOG_ANGLE_MAX_LENGTH).allow("").optional(),
  azimuth: Joi.string().trim().max(LOG_ANGLE_MAX_LENGTH).allow("").optional(),
  generalComments: Joi.string().trim().allow("").optional(),
}

export const createLogSchema = Joi.object({
  userId: Joi.number().integer().min(1).required(),
  projectId: Joi.number().integer().min(1).required(),
  ...baseLogFields,
})

export const updateLogSchema = Joi.object({
  proposedBorelogId: optionalIdSchema,
  logNumber: Joi.string().trim().max(LOG_NUMBER_MAX_LENGTH).optional(),
  logConfigId: Joi.string().trim().max(LOG_CONFIG_ID_MAX_LENGTH).allow("").optional(),
  logType: logTypeSchema.optional(),
  logStatus: logUpdateStatusSchema.optional(),
  drillingDate: optionalDateSchema,
  drillingTime: optionalTimeSchema,
  finishLogDate: optionalDateSchema,
  finishLogTime: optionalTimeSchema,
  endDepth: Joi.string().trim().max(LOG_END_DEPTH_MAX_LENGTH).allow("").optional(),
  finishingReason: Joi.string()
    .trim()
    .max(LOG_FINISHING_REASON_MAX_LENGTH)
    .allow("")
    .optional(),
  finishingComment: Joi.string().trim().allow("").optional(),
  scaleLogReport: Joi.boolean().optional(),
  coordinateSystem: Joi.string().trim().max(LOG_COORDINATE_SYSTEM_MAX_LENGTH).allow("").optional(),
  latitude: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  longitude: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  easting: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  northing: Joi.string().trim().max(LOG_COORDINATE_VALUE_MAX_LENGTH).allow("").optional(),
  utmZone: Joi.string().trim().max(LOG_UTM_ZONE_MAX_LENGTH).allow("").optional(),
  elevation: Joi.string().trim().max(LOG_ELEVATION_MAX_LENGTH).allow("").optional(),
  station: Joi.string().trim().max(LOG_STATION_MAX_LENGTH).allow("").optional(),
  locationComment: Joi.string().trim().allow("").optional(),
  supplierId: optionalIdSchema,
  equipmentId: optionalIdSchema,
  loggedBy: Joi.string().trim().max(LOG_PERSON_NAME_MAX_LENGTH).allow("").optional(),
  reviewedBy: Joi.string().trim().max(LOG_PERSON_NAME_MAX_LENGTH).allow("").optional(),
  inclination: Joi.string().trim().max(LOG_ANGLE_MAX_LENGTH).allow("").optional(),
  azimuth: Joi.string().trim().max(LOG_ANGLE_MAX_LENGTH).allow("").optional(),
  generalComments: Joi.string().trim().allow("").optional(),
}).min(1)

export const listLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  status: logStatusSchema.optional(),
  sortBy: Joi.string()
    .valid("id", "logNumber", "logType", "logStatus", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})

export const projectIdParamSchema = Joi.object({
  projectId: Joi.number().integer().min(1).required(),
})
