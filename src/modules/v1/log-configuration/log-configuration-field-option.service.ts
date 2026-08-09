import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import type { LogConfigurationFieldGroup } from "../../../shared/constants/logConfigurationFieldOptions"
import {
  DEFAULT_LOG_DETAIL_FIELD_OPTIONS,
  MANAGEABLE_LOG_DETAIL_FIELD_KEYS,
  type ManageableLogDetailFieldKey,
} from "../../../shared/constants/logDetailFields"
import {
  DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS,
  MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS,
  type ManageableProjectDetailFieldKey,
} from "../../../shared/constants/projectDetailFields"
import * as configRepo from "./log-configuration.repository"
import * as optionRepo from "./log-configuration-field-option.repository"

const PROJECT_DETAIL_FIELD_KEY_SET = new Set<string>(MANAGEABLE_PROJECT_DETAIL_FIELD_KEYS)
const LOG_DETAIL_FIELD_KEY_SET = new Set<string>(MANAGEABLE_LOG_DETAIL_FIELD_KEYS)

function assertManageableFieldKey(
  fieldGroup: LogConfigurationFieldGroup,
  fieldKey: string
): ManageableProjectDetailFieldKey | ManageableLogDetailFieldKey {
  if (fieldGroup === "project_detail") {
    if (!PROJECT_DETAIL_FIELD_KEY_SET.has(fieldKey)) {
      throw new ValidationError("Invalid project detail field key")
    }
    return fieldKey as ManageableProjectDetailFieldKey
  }

  if (!LOG_DETAIL_FIELD_KEY_SET.has(fieldKey)) {
    throw new ValidationError("Invalid log detail field key")
  }
  return fieldKey as ManageableLogDetailFieldKey
}

async function assertConfigurationAccess(userId: number, configurationId: number) {
  const config = await configRepo.findByIdForUser(configurationId, userId)
  if (!config || config.deletedAt) {
    throw new NotFoundError("Log configuration not found")
  }
  return config
}

export async function ensureDefaultFieldOptions(configurationId: number) {
  await optionRepo.ensureDefaultOptionsForConfiguration(configurationId, {
    projectDetail: DEFAULT_PROJECT_DETAIL_FIELD_OPTIONS,
    logDetail: DEFAULT_LOG_DETAIL_FIELD_OPTIONS,
  })
}

export async function getFieldOptions(
  userId: number,
  configurationId: number,
  fieldGroup: LogConfigurationFieldGroup,
  fieldKey: string
) {
  assertManageableFieldKey(fieldGroup, fieldKey)
  await assertConfigurationAccess(userId, configurationId)
  await ensureDefaultFieldOptions(configurationId)

  const options = await optionRepo.listOptionsForField(configurationId, fieldGroup, fieldKey)
  return { options }
}

export async function replaceFieldOptions(
  userId: number,
  configurationId: number,
  fieldGroup: LogConfigurationFieldGroup,
  fieldKey: string,
  options: string[]
) {
  assertManageableFieldKey(fieldGroup, fieldKey)
  await assertConfigurationAccess(userId, configurationId)
  await ensureDefaultFieldOptions(configurationId)

  const savedOptions = await optionRepo.replaceOptionsForField(
    configurationId,
    fieldGroup,
    fieldKey,
    options
  )

  return { options: savedOptions }
}

export async function loadGroupedFieldOptions(configurationId: number) {
  await ensureDefaultFieldOptions(configurationId)
  return optionRepo.listGroupedOptionsForConfiguration(configurationId)
}
