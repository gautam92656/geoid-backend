import Joi from "joi"
import { parseLogConfigurationFieldGroupFromUrl } from "../../../shared/constants/logConfigurationFieldOptions"
import {
  MANAGEABLE_LOG_DETAIL_FIELD_KEYS,
  LOG_DETAIL_FIELD_KEYS,
} from "../../../shared/constants/logDetailFields"
import {
  MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS,
  PROJECT_DETAIL_FIELD_KEYS,
} from "../../../shared/constants/projectDetailFields"

export { parseLogConfigurationFieldGroupFromUrl }

const URL_FIELD_GROUPS = ["project-detail", "log-detail"] as const

export const replaceFieldOptionsSchema = Joi.object({
  options: Joi.array().items(Joi.string().trim().max(200)).required(),
})

export const fieldOptionsRouteParamsSchema = Joi.object({
  fieldGroup: Joi.string()
    .valid(...URL_FIELD_GROUPS)
    .required(),
  fieldKey: Joi.string().trim().required(),
}).unknown(true)

export function resolveFieldKeyForGroup(
  fieldGroup: ReturnType<typeof parseLogConfigurationFieldGroupFromUrl>,
  fieldKey: string
): string | null {
  if (!fieldGroup) return null

  if (fieldGroup === "project_detail") {
    return (MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS as readonly string[]).includes(fieldKey)
      ? fieldKey
      : null
  }

  return (MANAGEABLE_LOG_DETAIL_FIELD_KEYS as readonly string[]).includes(fieldKey) ? fieldKey : null
}

export const projectDetailFieldsEnabledSchema = Joi.object({
  enabled: Joi.object(
    PROJECT_DETAIL_FIELD_KEYS.reduce(
      (acc, key) => {
        acc[key] = Joi.boolean().optional()
        return acc
      },
      {} as Record<string, Joi.BooleanSchema>
    )
  ).optional(),
}).optional()

export const logDetailFieldsEnabledSchema = Joi.object({
  enabled: Joi.object(
    LOG_DETAIL_FIELD_KEYS.reduce(
      (acc, key) => {
        acc[key] = Joi.boolean().optional()
        return acc
      },
      {} as Record<string, Joi.BooleanSchema>
    )
  ).optional(),
}).optional()
