import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleRemarkTypeDefaults,
  moduleHasRemarkTypeDefaults,
} from "../../../shared/constants/logRemarksOptionDefaults"
import {
  REMARK_TYPES_DATA_TYPE_ID,
  createLogRemarksOptionKey,
  parseRemarkTypeDTO,
  parseRemarkTypeDTOList,
  type RemarkTypeDTO,
} from "../../../shared/constants/logRemarksOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as remarkTypeRepo from "./config-module.remarkType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasRemarkTypeDefaults(slug.trim())
}

export async function ensureRemarkTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const existing = await remarkTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleRemarkTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await remarkTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return remarkTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getRemarkTypeTemplates(moduleSlug: string): Promise<RemarkTypeDTO[]> {
  const templates = await ensureRemarkTypeTemplates(moduleSlug)
  return templates.map(remarkTypeRepo.toRemarkTypeDTO)
}

export async function ensureUserRemarkTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await remarkTypeRepo.countUserRemarkTypes(ownerUserId, configId, moduleSlug)
  if (count > 0) {
    return remarkTypeRepo.listUserRemarkTypes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseRemarkTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      REMARK_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return remarkTypeRepo.replaceUserRemarkTypes(ownerUserId, configId, moduleSlug, legacy)
  }

  const templates = await ensureRemarkTypeTemplates(moduleSlug)
  return remarkTypeRepo.createUserRemarkTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserRemarkTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<RemarkTypeDTO[]> {
  const rows = await ensureUserRemarkTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(remarkTypeRepo.toRemarkTypeDTO)
}

export async function saveUserRemarkTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: RemarkTypeDTO[]
): Promise<RemarkTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const parsed = parseRemarkTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid remark types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createLogRemarksOptionKey("remark-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserRemarkTypes(userId, configId, moduleSlug)
  const rows = await remarkTypeRepo.replaceUserRemarkTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(remarkTypeRepo.toRemarkTypeDTO)
}

export async function createUserRemarkType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: RemarkTypeDTO
): Promise<RemarkTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const parsed = parseRemarkTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid remark type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserRemarkTypes(userId, configId, moduleSlug)
  const existing = await remarkTypeRepo.listUserRemarkTypes(ownerUserId, configId, moduleSlug)
  const key =
    parsed.id.trim() || createLogRemarksOptionKey("remark-type", parsed.name, existing.length)

  if (await remarkTypeRepo.findUserRemarkType(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("A remark type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A remark type with this name already exists")
  }

  const row = await remarkTypeRepo.createUserRemarkType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return remarkTypeRepo.toRemarkTypeDTO(row)
}

export async function updateUserRemarkType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: RemarkTypeDTO
): Promise<RemarkTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await remarkTypeRepo.findUserRemarkType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Remark type not found")

  const parsed = parseRemarkTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid remark type")

  const siblings = await remarkTypeRepo.listUserRemarkTypes(ownerUserId, configId, moduleSlug)
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A remark type with this name already exists")
  }

  const row = await remarkTypeRepo.updateUserRemarkType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return remarkTypeRepo.toRemarkTypeDTO(row)
}

export async function deleteUserRemarkType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await remarkTypeRepo.findUserRemarkType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Remark type not found")

  await remarkTypeRepo.deleteUserRemarkType(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserRemarkTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<RemarkTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remark types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureRemarkTypeTemplates(moduleSlug)
  await remarkTypeRepo.deleteUserRemarkTypes(ownerUserId, configId, moduleSlug)
  const rows = await remarkTypeRepo.createUserRemarkTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(remarkTypeRepo.toRemarkTypeDTO)
}
