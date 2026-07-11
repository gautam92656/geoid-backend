import Joi from "joi"
import { DEFAULT_LIMIT, DEFAULT_PAGE, FAQ_QUESTION_MAX_LENGTH, FAQ_ANSWER_MAX_LENGTH, MAX_LIMIT } from "../../../shared/constants"

export const createFaqSchema = Joi.object({
  question: Joi.string().trim().max(FAQ_QUESTION_MAX_LENGTH).required(),
  answer: Joi.string().trim().max(FAQ_ANSWER_MAX_LENGTH).required(),
  sortOrder: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
})

export const updateFaqSchema = Joi.object({
  question: Joi.string().trim().max(FAQ_QUESTION_MAX_LENGTH).optional(),
  answer: Joi.string().trim().max(FAQ_ANSWER_MAX_LENGTH).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1)

export const listFaqsQuerySchema = Joi.object({
  page: Joi.number().integer().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  includeDeleted: Joi.string().valid("true", "false").optional(),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string().valid("id", "question", "answer", "isActive", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
})
