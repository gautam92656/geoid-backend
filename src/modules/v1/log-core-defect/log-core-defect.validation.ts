import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const DEPTH_MAX_LENGTH = 50
const FIELD_MAX_LENGTH = 50
const DEFECT_TYPE_ID_MAX_LENGTH = 100
const DEFECT_TYPE_NAME_MAX_LENGTH = 200
const COMMENTS_MAX_LENGTH = 5000
const PHOTO_NAME_MAX_LENGTH = 255
const OPTION_ID_MAX_LENGTH = 100
const OPTION_IDS_MAX_COUNT = 50

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()
const requiredTrimmed = (max: number) => Joi.string().trim().min(1).max(max).required()

const optionIdListSchema = Joi.array()
  .items(Joi.string().trim().max(OPTION_ID_MAX_LENGTH).allow(""))
  .max(OPTION_IDS_MAX_COUNT)
  .optional()

export const createLogCoreDefectSchema = Joi.object({
  defectTypeId: requiredTrimmed(DEFECT_TYPE_ID_MAX_LENGTH),
  defectTypeName: requiredTrimmed(DEFECT_TYPE_NAME_MAX_LENGTH),
  depthFrom: requiredTrimmed(DEPTH_MAX_LENGTH),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  defectOrientation: optionalTrimmed(FIELD_MAX_LENGTH),
  surfaceShapeIds: optionIdListSchema,
  surfaceRoughnessIds: optionIdListSchema,
  defectCoatingIds: optionIdListSchema,
  defectOpennessIds: optionIdListSchema,
  defectSpacingOverride: optionalTrimmed(FIELD_MAX_LENGTH),
  boundsOnDefectMin: optionalTrimmed(FIELD_MAX_LENGTH),
  boundsOnDefectMax: optionalTrimmed(FIELD_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  photoName: optionalTrimmed(PHOTO_NAME_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogCoreDefectSchema = Joi.object({
  defectTypeId: Joi.string().trim().max(DEFECT_TYPE_ID_MAX_LENGTH).optional(),
  defectTypeName: Joi.string().trim().max(DEFECT_TYPE_NAME_MAX_LENGTH).optional(),
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).optional(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  defectOrientation: optionalTrimmed(FIELD_MAX_LENGTH),
  surfaceShapeIds: optionIdListSchema,
  surfaceRoughnessIds: optionIdListSchema,
  defectCoatingIds: optionIdListSchema,
  defectOpennessIds: optionIdListSchema,
  defectSpacingOverride: optionalTrimmed(FIELD_MAX_LENGTH),
  boundsOnDefectMin: optionalTrimmed(FIELD_MAX_LENGTH),
  boundsOnDefectMax: optionalTrimmed(FIELD_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  photoName: optionalTrimmed(PHOTO_NAME_MAX_LENGTH),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogCoreDefectsQuerySchema = Joi.object({
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
      "defectTypeName",
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
