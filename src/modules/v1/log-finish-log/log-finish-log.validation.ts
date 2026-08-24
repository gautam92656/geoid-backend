import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const END_DEPTH_MAX_LENGTH = 50
const TYPE_ID_MAX_LENGTH = 100
const TYPE_NAME_MAX_LENGTH = 200
const COMMENTS_MAX_LENGTH = 5000

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()

const optionalDateSchema = Joi.string()
  .trim()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .allow("", null)
  .optional()

export const createLogFinishLogSchema = Joi.object({
  finishTypeId: Joi.string().trim().min(1).max(TYPE_ID_MAX_LENGTH).required(),
  finishTypeName: Joi.string().trim().min(1).max(TYPE_NAME_MAX_LENGTH).required(),
  completedDate: optionalDateSchema,
  endDepth: optionalTrimmed(END_DEPTH_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  scaleLogReport: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogFinishLogSchema = Joi.object({
  finishTypeId: Joi.string().trim().max(TYPE_ID_MAX_LENGTH).optional(),
  finishTypeName: Joi.string().trim().max(TYPE_NAME_MAX_LENGTH).optional(),
  completedDate: optionalDateSchema,
  endDepth: optionalTrimmed(END_DEPTH_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  scaleLogReport: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogFinishLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  onlyDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid(
      "id",
      "finishTypeName",
      "completedDate",
      "endDepth",
      "comments",
      "scaleLogReport",
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
