import Joi from "joi"
import {
  CLIENT_COMPANY_CONTACT_MAX_LENGTH,
  CLIENT_COMPANY_NAME_MAX_LENGTH,
  CLIENT_EXTERNAL_ID_MAX_LENGTH,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  USER_EMAIL_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
} from "../../../shared/constants"

const clientStatusSchema = Joi.string().valid("active", "inactive")

export const createClientSchema = Joi.object({
  companyName: Joi.string().trim().max(CLIENT_COMPANY_NAME_MAX_LENGTH).required(),
  companyContact: Joi.string().trim().max(CLIENT_COMPANY_CONTACT_MAX_LENGTH).allow("").optional(),
  email: Joi.string().trim().email().max(USER_EMAIL_MAX_LENGTH).allow("").optional(),
  phone: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("").optional(),
  externalId: Joi.string().trim().max(CLIENT_EXTERNAL_ID_MAX_LENGTH).allow("").optional(),
  status: clientStatusSchema.default("active"),
})

export const updateClientSchema = Joi.object({
  companyName: Joi.string().trim().max(CLIENT_COMPANY_NAME_MAX_LENGTH).optional(),
  companyContact: Joi.string().trim().max(CLIENT_COMPANY_CONTACT_MAX_LENGTH).allow("").optional(),
  email: Joi.string().trim().email().max(USER_EMAIL_MAX_LENGTH).allow("").optional(),
  phone: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("").optional(),
  externalId: Joi.string().trim().max(CLIENT_EXTERNAL_ID_MAX_LENGTH).allow("").optional(),
  status: clientStatusSchema.optional(),
}).min(1)

export const listClientsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  status: clientStatusSchema.optional(),
  sortBy: Joi.string()
    .valid("id", "companyName", "companyContact", "email", "status", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
