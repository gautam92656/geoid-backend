import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  OFFICE_ADDRESS_MAX_LENGTH,
  OFFICE_EXTERNAL_ID_MAX_LENGTH,
  OFFICE_LABORATORY_MAX_LENGTH,
  OFFICE_NAME_MAX_LENGTH,
  OFFICE_NUMBER_MAX_LENGTH,
  OFFICE_STATE_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
} from "../../../shared/constants"

export const createOfficeSchema = Joi.object({
  name: Joi.string().trim().max(OFFICE_NAME_MAX_LENGTH).required(),
  address: Joi.string().trim().max(OFFICE_ADDRESS_MAX_LENGTH).allow("").optional(),
  phone: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("").optional(),
  externalId: Joi.string().trim().max(OFFICE_EXTERNAL_ID_MAX_LENGTH).allow("").optional(),
  officeNumber: Joi.string().trim().max(OFFICE_NUMBER_MAX_LENGTH).allow("").optional(),
  state: Joi.string().trim().max(OFFICE_STATE_MAX_LENGTH).allow("").optional(),
  laboratory: Joi.string().trim().max(OFFICE_LABORATORY_MAX_LENGTH).allow("").optional(),
})

export const updateOfficeSchema = Joi.object({
  name: Joi.string().trim().max(OFFICE_NAME_MAX_LENGTH).optional(),
  address: Joi.string().trim().max(OFFICE_ADDRESS_MAX_LENGTH).allow("").optional(),
  phone: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("").optional(),
  externalId: Joi.string().trim().max(OFFICE_EXTERNAL_ID_MAX_LENGTH).allow("").optional(),
  officeNumber: Joi.string().trim().max(OFFICE_NUMBER_MAX_LENGTH).allow("").optional(),
  state: Joi.string().trim().max(OFFICE_STATE_MAX_LENGTH).allow("").optional(),
  laboratory: Joi.string().trim().max(OFFICE_LABORATORY_MAX_LENGTH).allow("").optional(),
}).min(1)

export const listOfficesQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid("id", "name", "address", "phone", "state", "laboratory", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
