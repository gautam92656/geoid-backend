import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const FIELD_MAX_LENGTH = 50
const TYPE_ID_MAX_LENGTH = 100
const TYPE_NAME_MAX_LENGTH = 200
const NOTES_MAX_LENGTH = 5000

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()

export const createLogWellCasingTopSchema = Joi.object({
  elevation: optionalTrimmed(FIELD_MAX_LENGTH),
  depthFrom: optionalTrimmed(FIELD_MAX_LENGTH),
  depthTo: optionalTrimmed(FIELD_MAX_LENGTH),
  casingTypeId: Joi.string().trim().min(1).max(TYPE_ID_MAX_LENGTH).required(),
  casingTypeName: Joi.string().trim().min(1).max(TYPE_NAME_MAX_LENGTH).required(),
  notes: optionalTrimmed(NOTES_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogWellCasingTopSchema = Joi.object({
  elevation: optionalTrimmed(FIELD_MAX_LENGTH),
  depthFrom: optionalTrimmed(FIELD_MAX_LENGTH),
  depthTo: optionalTrimmed(FIELD_MAX_LENGTH),
  casingTypeId: Joi.string().trim().max(TYPE_ID_MAX_LENGTH).optional(),
  casingTypeName: Joi.string().trim().max(TYPE_NAME_MAX_LENGTH).optional(),
  notes: optionalTrimmed(NOTES_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogWellCasingTopsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  onlyDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid(
      "id",
      "elevation",
      "depthFrom",
      "depthTo",
      "casingTypeName",
      "notes",
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
