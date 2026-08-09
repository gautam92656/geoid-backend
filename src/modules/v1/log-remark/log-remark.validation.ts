import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const DEPTH_MAX_LENGTH = 50
const REMARK_TYPE_ID_MAX_LENGTH = 100
const REMARK_TYPE_NAME_MAX_LENGTH = 200
const REMARKS_MAX_LENGTH = 5000

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()

export const createLogRemarkSchema = Joi.object({
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).required(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  remarkTypeId: Joi.string().trim().max(REMARK_TYPE_ID_MAX_LENGTH).required(),
  remarkTypeName: Joi.string().trim().max(REMARK_TYPE_NAME_MAX_LENGTH).required(),
  remarks: optionalTrimmed(REMARKS_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogRemarkSchema = Joi.object({
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).optional(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  remarkTypeId: Joi.string().trim().max(REMARK_TYPE_ID_MAX_LENGTH).optional(),
  remarkTypeName: Joi.string().trim().max(REMARK_TYPE_NAME_MAX_LENGTH).optional(),
  remarks: optionalTrimmed(REMARKS_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogRemarksQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  onlyDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid(
      "id",
      "depthFrom",
      "depthTo",
      "remarkTypeName",
      "remarks",
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
