import Joi from "joi"
import { PROJECT_STATUSES } from "../../../shared/constants"

export const projectIdParamSchema = Joi.object({
  projectId: Joi.number().integer().min(1).required(),
})

export const createProjectStatusHistorySchema = Joi.object({
  status: Joi.string()
    .valid(...PROJECT_STATUSES)
    .required(),
})
