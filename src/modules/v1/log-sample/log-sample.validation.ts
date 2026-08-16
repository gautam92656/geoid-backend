import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../../../shared/constants"

const DEPTH_MAX_LENGTH = 50
const SAMPLE_TYPE_ID_MAX_LENGTH = 100
const SAMPLE_TYPE_NAME_MAX_LENGTH = 200
const SAMPLE_NO_MAX_LENGTH = 200
const QC_SAMPLE_ID_MAX_LENGTH = 200
const DATE_MAX_LENGTH = 50
const TIME_MAX_LENGTH = 50
const RECOVERY_MAX_LENGTH = 100
const COMMENTS_MAX_LENGTH = 5000
const LAB_REQUEST_ID_MAX_LENGTH = 100
const LAB_REQUEST_NAME_MAX_LENGTH = 200
const CLASSIFICATION_MAX_LENGTH = 200

const optionalTrimmed = (max: number) => Joi.string().trim().max(max).allow("").optional()

const sampleInsituTestSchema = Joi.object({
  id: Joi.string().trim().max(100).allow("").optional(),
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).required(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  testTypeId: Joi.string().trim().max(SAMPLE_TYPE_ID_MAX_LENGTH).required(),
  testTypeName: Joi.string().trim().max(SAMPLE_TYPE_NAME_MAX_LENGTH).required(),
  results: optionalTrimmed(COMMENTS_MAX_LENGTH),
}).unknown(true)

const labTestTypeIdsSchema = Joi.array()
  .items(Joi.string().trim().max(SAMPLE_TYPE_ID_MAX_LENGTH))
  .optional()

export const createLogSampleSchema = Joi.object({
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).required(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  sampleTypeId: Joi.string().trim().max(SAMPLE_TYPE_ID_MAX_LENGTH).required(),
  sampleTypeName: Joi.string().trim().max(SAMPLE_TYPE_NAME_MAX_LENGTH).required(),
  sampleNo: optionalTrimmed(SAMPLE_NO_MAX_LENGTH),
  qcSampleId: optionalTrimmed(QC_SAMPLE_ID_MAX_LENGTH),
  sampleDate: optionalTrimmed(DATE_MAX_LENGTH),
  sampleTime: optionalTrimmed(TIME_MAX_LENGTH),
  recovery: optionalTrimmed(RECOVERY_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  labTestRequestId: optionalTrimmed(LAB_REQUEST_ID_MAX_LENGTH),
  labTestRequestName: optionalTrimmed(LAB_REQUEST_NAME_MAX_LENGTH),
  labTestTypeIds: labTestTypeIdsSchema,
  subsurfaceClassification: optionalTrimmed(CLASSIFICATION_MAX_LENGTH),
  insituTests: Joi.array().items(sampleInsituTestSchema).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
})

export const updateLogSampleSchema = Joi.object({
  depthFrom: Joi.string().trim().max(DEPTH_MAX_LENGTH).optional(),
  depthTo: optionalTrimmed(DEPTH_MAX_LENGTH),
  sampleTypeId: Joi.string().trim().max(SAMPLE_TYPE_ID_MAX_LENGTH).optional(),
  sampleTypeName: Joi.string().trim().max(SAMPLE_TYPE_NAME_MAX_LENGTH).optional(),
  sampleNo: optionalTrimmed(SAMPLE_NO_MAX_LENGTH),
  qcSampleId: optionalTrimmed(QC_SAMPLE_ID_MAX_LENGTH),
  sampleDate: optionalTrimmed(DATE_MAX_LENGTH),
  sampleTime: optionalTrimmed(TIME_MAX_LENGTH),
  recovery: optionalTrimmed(RECOVERY_MAX_LENGTH),
  comments: optionalTrimmed(COMMENTS_MAX_LENGTH),
  labTestRequestId: optionalTrimmed(LAB_REQUEST_ID_MAX_LENGTH),
  labTestRequestName: optionalTrimmed(LAB_REQUEST_NAME_MAX_LENGTH),
  labTestTypeIds: labTestTypeIdsSchema,
  subsurfaceClassification: optionalTrimmed(CLASSIFICATION_MAX_LENGTH),
  insituTests: Joi.array().items(sampleInsituTestSchema).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1)

export const listLogSamplesQuerySchema = Joi.object({
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
      "sampleTypeName",
      "sampleNo",
      "sampleDate",
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
