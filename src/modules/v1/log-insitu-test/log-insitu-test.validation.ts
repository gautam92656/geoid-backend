import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const DEPTH_MAX_LENGTH = 50
const TEST_TYPE_ID_MAX_LENGTH = 100
const TEST_TYPE_NAME_MAX_LENGTH = 200
const RESULTS_MAX_LENGTH = 5000
const COMMENTS_MAX_LENGTH = 5000

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()

const resultValuesSchema = Joi.object().unknown(true).optional()

export const createLogInsituTestSchema = Joi.object({
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).required(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  testTypeId: Joi.string().trim().max(TEST_TYPE_ID_MAX_LENGTH).required(),
  testTypeName: Joi.string().trim().max(TEST_TYPE_NAME_MAX_LENGTH).required(),
  results: optionalTrimmed(RESULTS_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  resultValues: resultValuesSchema,
  sampleId: Joi.alternatives()
    .try(Joi.number().integer().min(1), Joi.string().trim().pattern(/^\d+$/))
    .optional()
    .allow(null, ""),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogInsituTestSchema = Joi.object({
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).optional(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  testTypeId: Joi.string().trim().max(TEST_TYPE_ID_MAX_LENGTH).optional(),
  testTypeName: Joi.string().trim().max(TEST_TYPE_NAME_MAX_LENGTH).optional(),
  results: optionalTrimmed(RESULTS_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  resultValues: resultValuesSchema,
  sampleId: Joi.alternatives()
    .try(Joi.number().integer().min(1), Joi.string().trim().pattern(/^\d+$/), Joi.valid(null))
    .optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogInsituTestsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  onlyDeleted: Joi.string().valid("true", "false").optional(),
  sampleId: Joi.alternatives()
    .try(Joi.number().integer().min(1), Joi.string().trim().pattern(/^\d+$/))
    .optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid(
      "id",
      "depthFrom",
      "depthTo",
      "testTypeName",
      "results",
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
