import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  EQUIPMENT_NAME_MAX_LENGTH,
  EQUIPMENT_NO_MAX_LENGTH,
  EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH,
  EQUIPMENT_TEXT_FIELD_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"

const optionalString = (max: number) => Joi.string().trim().max(max).allow("").optional()

const equipmentFieldsSchema = {
  equipmentNo: optionalString(EQUIPMENT_NO_MAX_LENGTH),
  equipmentName: optionalString(EQUIPMENT_NAME_MAX_LENGTH),
  suppliers: Joi.array().items(Joi.string().trim().max(EQUIPMENT_TEXT_FIELD_MAX_LENGTH)).default([]),
  mounting: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  driveWeight: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  drop: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  manufacturer: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  model: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  energyTransferRatio: optionalString(EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH),
  hammerEfficiencyCorrection: optionalString(EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH),
  netAreaRatio: optionalString(EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH),
  tipArea: optionalString(EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH),
  frictionRatio: optionalString(EQUIPMENT_NUMERIC_FIELD_MAX_LENGTH),
  porePressureTransducerLocation: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  frictionReducerType: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  frictionReducer: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  calibratedBy: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
  dateOfCalibration: Joi.string().trim().allow("").optional(),
  bucketWidth: optionalString(EQUIPMENT_TEXT_FIELD_MAX_LENGTH),
}

export const createEquipmentSchema = Joi.object({
  equipmentTypeId: Joi.number().integer().min(1).required(),
  ...equipmentFieldsSchema,
})

export const updateEquipmentSchema = Joi.object({
  equipmentTypeId: Joi.number().integer().min(1).optional(),
  ...equipmentFieldsSchema,
}).min(1)

export const listEquipmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  equipmentTypeId: Joi.number().integer().min(1).optional(),
  sortBy: Joi.string()
    .valid("id", "equipmentNo", "equipmentName", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
