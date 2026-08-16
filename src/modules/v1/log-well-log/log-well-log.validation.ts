import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const DEPTH_MAX_LENGTH = 50
const WELL_ID_MAX_LENGTH = 100
const TYPE_ID_MAX_LENGTH = 100
const TYPE_NAME_MAX_LENGTH = 200
const COMMENTS_MAX_LENGTH = 5000

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()

export const createLogWellLogSchema = Joi.object({
  wellId: optionalTrimmed(WELL_ID_MAX_LENGTH),
  depthFrom: Joi.string().trim().min(1).max(DEPTH_MAX_LENGTH).required(),
  depthTo: Joi.string().trim().min(1).max(DEPTH_MAX_LENGTH).required(),
  wellTypeId: Joi.string().trim().min(1).max(TYPE_ID_MAX_LENGTH).required(),
  wellTypeName: Joi.string().trim().min(1).max(TYPE_NAME_MAX_LENGTH).required(),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogWellLogSchema = Joi.object({
  wellId: optionalTrimmed(WELL_ID_MAX_LENGTH),
  depthFrom: optionalTrimmed(DEPTH_MAX_LENGTH),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  wellTypeId: Joi.string().trim().max(TYPE_ID_MAX_LENGTH).optional(),
  wellTypeName: Joi.string().trim().max(TYPE_NAME_MAX_LENGTH).optional(),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogWellLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  onlyDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid(
      "id",
      "wellId",
      "depthFrom",
      "depthTo",
      "wellTypeName",
      "comments",
      "sortOrder",
      "createdAt",
      "updatedAt"
    )
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})

export const projectLogParamsSchema = Joi.object({
  projectId: Joi.number().integer().min(1).required(),
  logId: Joi.number().integer().min(1).required(),
})
