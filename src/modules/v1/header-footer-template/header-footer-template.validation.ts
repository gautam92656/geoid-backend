import Joi from "joi"
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  HEADER_FOOTER_REPORT_TYPES,
  HEADER_FOOTER_TEMPLATE_KINDS,
  HEADER_FOOTER_TEMPLATE_NAME_MAX_LENGTH,
  MAX_LIMIT,
} from "../../../shared/constants"

const headerFooterContentShapeSchema = Joi.object({
  version: Joi.number().integer().valid(1).required(),
  page: Joi.object({
    size: Joi.string().valid("A4", "Letter", "Legal").required(),
    orientation: Joi.string().valid("portrait", "landscape").required(),
  })
    .unknown(true)
    .required(),
  sections: Joi.object({
    header: Joi.object().unknown(true).required(),
    footer: Joi.object().unknown(true).required(),
    leftFrame: Joi.object().unknown(true).required(),
    rightFrame: Joi.object().unknown(true).required(),
    content: Joi.object().unknown(true).required(),
  })
    .unknown(true)
    .required(),
  ui: Joi.object().unknown(true).optional(),
}).unknown(true)

/** Empty `{}` is allowed so the service can seed defaults. */
const headerFooterContentSchema = Joi.alternatives()
  .try(Joi.object().max(0), headerFooterContentShapeSchema)
  .optional()

export const createHeaderFooterTemplateSchema = Joi.object({
  name: Joi.string().trim().max(HEADER_FOOTER_TEMPLATE_NAME_MAX_LENGTH).required(),
  kind: Joi.string()
    .valid(...HEADER_FOOTER_TEMPLATE_KINDS)
    .required(),
  reportType: Joi.string()
    .valid(...HEADER_FOOTER_REPORT_TYPES)
    .allow(null, "")
    .optional(),
  content: headerFooterContentSchema,
})

export const updateHeaderFooterTemplateSchema = Joi.object({
  name: Joi.string().trim().max(HEADER_FOOTER_TEMPLATE_NAME_MAX_LENGTH).optional(),
  kind: Joi.string()
    .valid(...HEADER_FOOTER_TEMPLATE_KINDS)
    .optional(),
  reportType: Joi.string()
    .valid(...HEADER_FOOTER_REPORT_TYPES)
    .allow(null, "")
    .optional(),
  content: headerFooterContentSchema,
}).min(1)

export const listHeaderFooterTemplatesQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  kind: Joi.string()
    .valid(...HEADER_FOOTER_TEMPLATE_KINDS)
    .optional(),
  sortBy: Joi.string()
    .valid("id", "name", "kind", "reportType", "createdAt", "updatedAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
