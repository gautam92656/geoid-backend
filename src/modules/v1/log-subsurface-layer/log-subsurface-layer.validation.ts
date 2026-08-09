import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const HATCH_VALUES = ["concrete", "fill", "clay", "silt", "sand", "empty"] as const

const DEPTH_MAX_LENGTH = 50
const CLASSIFICATION_MAX_LENGTH = 100
const ORIGIN_MAX_LENGTH = 100
const CONSISTENCY_MAX_LENGTH = 100
const MOISTURE_MAX_LENGTH = 100
const HATCH_MAX_LENGTH = 50
const DESCRIPTION_MAX_LENGTH = 10000
const REMARKS_MAX_LENGTH = 5000

const optionalTrimmed = (max: number) =>
  Joi.string().trim().max(max).allow("").optional()

const valuesSchema = Joi.object().unknown(true).optional()

const layerFields = {
  depth: Joi.string().trim().max(DEPTH_MAX_LENGTH).required(),
  classification: optionalTrimmed(CLASSIFICATION_MAX_LENGTH),
  origin: optionalTrimmed(ORIGIN_MAX_LENGTH),
  description: optionalTrimmed(DESCRIPTION_MAX_LENGTH),
  consistency: optionalTrimmed(CONSISTENCY_MAX_LENGTH),
  moisture: optionalTrimmed(MOISTURE_MAX_LENGTH),
  remarks: optionalTrimmed(REMARKS_MAX_LENGTH),
  hatch: Joi.string()
    .trim()
    .max(HATCH_MAX_LENGTH)
    .valid(...HATCH_VALUES)
    .optional(),
  values: valuesSchema,
  sortOrder: Joi.number().integer().min(0).optional(),
}

export const createLogSubsurfaceLayerSchema = Joi.object({
  ...layerFields,
})

export const updateLogSubsurfaceLayerSchema = Joi.object({
  depth: Joi.string().trim().max(DEPTH_MAX_LENGTH).optional(),
  classification: optionalTrimmed(CLASSIFICATION_MAX_LENGTH),
  origin: optionalTrimmed(ORIGIN_MAX_LENGTH),
  description: optionalTrimmed(DESCRIPTION_MAX_LENGTH),
  consistency: optionalTrimmed(CONSISTENCY_MAX_LENGTH),
  moisture: optionalTrimmed(MOISTURE_MAX_LENGTH),
  remarks: optionalTrimmed(REMARKS_MAX_LENGTH),
  hatch: Joi.string()
    .trim()
    .max(HATCH_MAX_LENGTH)
    .valid(...HATCH_VALUES)
    .optional(),
  values: valuesSchema,
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogSubsurfaceLayersQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  onlyDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid("id", "depth", "classification", "origin", "sortOrder", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})

export const projectLogParamsSchema = Joi.object({
  projectId: Joi.number().integer().min(1).required(),
  logId: Joi.number().integer().min(1).required(),
})
