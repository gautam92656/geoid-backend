import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  PASSWORD_MIN_LENGTH,
  PHONE_CODE_MAX_LENGTH,
  USER_COMPANY_LOGO_URL_MAX_LENGTH,
  USER_COMPANY_NAME_MAX_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_ROLES,
} from "../../../shared/constants"

const roleSchema = Joi.string().valid(...USER_ROLES)

const companyLogoUrlSchema = Joi.string().trim().max(USER_COMPANY_LOGO_URL_MAX_LENGTH).allow("", null)

export const createAdminUserSchema = Joi.object({
  firstName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).required(),
  lastName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).required(),
  email: Joi.string().trim().email().max(USER_EMAIL_MAX_LENGTH).required(),
  phoneCode: Joi.string().trim().max(PHONE_CODE_MAX_LENGTH).allow("", null).optional(),
  phoneNumber: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("", null).optional(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
  role: roleSchema.default("user"),
  isEmailVerified: Joi.boolean().default(true),
  termsAndConditions: Joi.boolean().default(true),
  companyName: Joi.when("role", {
    is: "user",
    then: Joi.string().trim().max(USER_COMPANY_NAME_MAX_LENGTH).required().messages({
      "any.required": "Company name is required for regular users.",
      "string.empty": "Company name is required for regular users.",
    }),
    otherwise: Joi.string().trim().max(USER_COMPANY_NAME_MAX_LENGTH).allow("", null).optional(),
  }),
  companyLogoUrl: companyLogoUrlSchema.optional(),
})

export const updateAdminUserSchema = Joi.object({
  firstName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).optional(),
  lastName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).optional(),
  email: Joi.string().trim().email().max(USER_EMAIL_MAX_LENGTH).optional(),
  phoneCode: Joi.string().trim().max(PHONE_CODE_MAX_LENGTH).allow("", null).optional(),
  phoneNumber: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("", null).optional(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).optional(),
  role: roleSchema.optional(),
  isEmailVerified: Joi.boolean().optional(),
  termsAndConditions: Joi.boolean().optional(),
  companyName: Joi.string().trim().max(USER_COMPANY_NAME_MAX_LENGTH).allow("", null).optional(),
  companyLogoUrl: companyLogoUrlSchema.optional(),
}).min(1)

export const listAdminUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  role: roleSchema.optional(),
  isEmailVerified: Joi.string().valid("true", "false").optional(),
  sortBy: Joi.string()
    .valid(
      "id",
      "firstName",
      "lastName",
      "email",
      "role",
      "isEmailVerified",
      "companyName",
      "createdAt",
      "updatedAt"
    )
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
