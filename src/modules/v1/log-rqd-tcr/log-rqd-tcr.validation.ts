import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const DEPTH_MAX_LENGTH = 50
const FIELD_MAX_LENGTH = 50
const PHOTO_NAME_MAX_LENGTH = 255

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()
const requiredTrimmed = (max: number) => Joi.string().trim().min(1).max(max).required()

export const createLogRqdTcrSchema = Joi.object({
  depthFrom: optionalTrimmed(DEPTH_MAX_LENGTH),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  startDate: optionalTrimmed(FIELD_MAX_LENGTH),
  startTime: optionalTrimmed(FIELD_MAX_LENGTH),
  endDate: optionalTrimmed(FIELD_MAX_LENGTH),
  endTime: optionalTrimmed(FIELD_MAX_LENGTH),
  corePieceLength: optionalTrimmed(FIELD_MAX_LENGTH),
  rqdPercent: requiredTrimmed(FIELD_MAX_LENGTH),
  coreLossLength: requiredTrimmed(FIELD_MAX_LENGTH),
  coreRecoveryLength: requiredTrimmed(FIELD_MAX_LENGTH),
  tcrPercent: requiredTrimmed(FIELD_MAX_LENGTH),
  photoName: optionalTrimmed(PHOTO_NAME_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogRqdTcrSchema = Joi.object({
  depthFrom: optionalTrimmed(DEPTH_MAX_LENGTH),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  startDate: optionalTrimmed(FIELD_MAX_LENGTH),
  startTime: optionalTrimmed(FIELD_MAX_LENGTH),
  endDate: optionalTrimmed(FIELD_MAX_LENGTH),
  endTime: optionalTrimmed(FIELD_MAX_LENGTH),
  corePieceLength: optionalTrimmed(FIELD_MAX_LENGTH),
  rqdPercent: Joi.string().trim().max(FIELD_MAX_LENGTH).optional(),
  coreLossLength: Joi.string().trim().max(FIELD_MAX_LENGTH).optional(),
  coreRecoveryLength: Joi.string().trim().max(FIELD_MAX_LENGTH).optional(),
  tcrPercent: Joi.string().trim().max(FIELD_MAX_LENGTH).optional(),
  photoName: optionalTrimmed(PHOTO_NAME_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogRqdTcrsQuerySchema = Joi.object({
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
      "startDate",
      "endDate",
      "rqdPercent",
      "tcrPercent",
      "corePieceLength",
      "coreLossLength",
      "coreRecoveryLength",
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
