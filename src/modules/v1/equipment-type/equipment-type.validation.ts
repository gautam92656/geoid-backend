import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  EQUIPMENT_FIELD_KEYS,
  EQUIPMENT_TYPE_DESCRIPTION_MAX_LENGTH,
  EQUIPMENT_TYPE_NAME_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"

const equipmentTypeStatusSchema = Joi.string().valid("active", "inactive")

const fieldConfigSchema = Joi.object(
  Object.fromEntries(
    EQUIPMENT_FIELD_KEYS.map((key) => [key, Joi.boolean().optional()])
  )
).optional()

export const createEquipmentTypeSchema = Joi.object({
  name: Joi.string().trim().max(EQUIPMENT_TYPE_NAME_MAX_LENGTH).required(),
  description: Joi.string().trim().max(EQUIPMENT_TYPE_DESCRIPTION_MAX_LENGTH).allow("").optional(),
  status: equipmentTypeStatusSchema.default("active"),
  fieldConfig: fieldConfigSchema,
})

export const updateEquipmentTypeSchema = Joi.object({
  name: Joi.string().trim().max(EQUIPMENT_TYPE_NAME_MAX_LENGTH).optional(),
  description: Joi.string().trim().max(EQUIPMENT_TYPE_DESCRIPTION_MAX_LENGTH).allow("").optional(),
  status: equipmentTypeStatusSchema.optional(),
  fieldConfig: fieldConfigSchema,
}).min(1)

export const listEquipmentTypesQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  status: equipmentTypeStatusSchema.optional(),
  sortBy: Joi.string().valid("id", "name", "status", "createdAt", "updatedAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
