import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  SUPPLIER_ABN_MAX_LENGTH,
  SUPPLIER_ADDRESS_MAX_LENGTH,
  SUPPLIER_BUSINESS_NAME_MAX_LENGTH,
  SUPPLIER_EXTERNAL_ID_MAX_LENGTH,
  SUPPLIER_LAB_TEST_TYPES,
  SUPPLIER_RELATIONSHIPS,
  SUPPLIER_TYPES,
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
} from "../../../shared/constants"

const supplierStatusSchema = Joi.string().valid("active", "inactive")
const supplierTypeSchema = Joi.string().valid(...SUPPLIER_TYPES)
const supplierRelationshipSchema = Joi.string().valid(...SUPPLIER_RELATIONSHIPS)
const labTestTypeSchema = Joi.string().valid(...SUPPLIER_LAB_TEST_TYPES)

export const createSupplierSchema = Joi.object({
  businessName: Joi.string().trim().max(SUPPLIER_BUSINESS_NAME_MAX_LENGTH).required(),
  supplierType: supplierTypeSchema.required(),
  supplierRelationship: supplierRelationshipSchema.allow("").optional(),
  supplierExternalId: Joi.string().trim().max(SUPPLIER_EXTERNAL_ID_MAX_LENGTH).allow("").optional(),
  labTestTypes: Joi.array().items(labTestTypeSchema).default([]),
  firstName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).allow("").optional(),
  lastName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).allow("").optional(),
  address: Joi.string().trim().max(SUPPLIER_ADDRESS_MAX_LENGTH).allow("").optional(),
  email: Joi.string().trim().email().max(USER_EMAIL_MAX_LENGTH).allow("").optional(),
  phone: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("").optional(),
  abn: Joi.string().trim().max(SUPPLIER_ABN_MAX_LENGTH).allow("").optional(),
  status: supplierStatusSchema.default("active"),
})

export const updateSupplierSchema = Joi.object({
  businessName: Joi.string().trim().max(SUPPLIER_BUSINESS_NAME_MAX_LENGTH).optional(),
  supplierType: supplierTypeSchema.optional(),
  supplierRelationship: supplierRelationshipSchema.allow("").optional(),
  supplierExternalId: Joi.string().trim().max(SUPPLIER_EXTERNAL_ID_MAX_LENGTH).allow("").optional(),
  labTestTypes: Joi.array().items(labTestTypeSchema).optional(),
  firstName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).allow("").optional(),
  lastName: Joi.string().trim().max(USER_NAME_MAX_LENGTH).allow("").optional(),
  address: Joi.string().trim().max(SUPPLIER_ADDRESS_MAX_LENGTH).allow("").optional(),
  email: Joi.string().trim().email().max(USER_EMAIL_MAX_LENGTH).allow("").optional(),
  phone: Joi.string().trim().max(USER_PHONE_MAX_LENGTH).allow("").optional(),
  abn: Joi.string().trim().max(SUPPLIER_ABN_MAX_LENGTH).allow("").optional(),
  status: supplierStatusSchema.optional(),
}).min(1)

export const listSuppliersQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  status: supplierStatusSchema.optional(),
  supplierType: supplierTypeSchema.optional(),
  sortBy: Joi.string()
    .valid("id", "businessName", "supplierType", "status", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
