import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellCoverTypeDefaults,
  moduleHasWellCoverTypeDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  WELL_COVER_TYPES_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellCoverTypeDTO,
  parseWellCoverTypeDTOList,
  type WellCoverTypeDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellCoverTypeRepo from "./config-module.wellCoverType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellCoverTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellCoverTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const existing = await wellCoverTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellCoverTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellCoverTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellCoverTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellCoverTypeTemplates(
  moduleSlug: string
): Promise<WellCoverTypeDTO[]> {
  const templates = await ensureWellCoverTypeTemplates(moduleSlug)
  return templates.map(wellCoverTypeRepo.toWellCoverTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellCoverTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellCoverTypeRepo.countUserWellCoverTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellCoverTypeRepo.listUserWellCoverTypes(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellCoverTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WELL_COVER_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellCoverTypeRepo.replaceUserWellCoverTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellCoverTypeTemplates(moduleSlug)
  return wellCoverTypeRepo.createUserWellCoverTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellCoverTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellCoverTypeDTO[]> {
  const rows = await ensureUserWellCoverTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(wellCoverTypeRepo.toWellCoverTypeDTO)
}

export async function saveUserWellCoverTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellCoverTypeDTO[]
): Promise<WellCoverTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const parsed = parseWellCoverTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid well cover types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("well-cover-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellCoverTypes(userId, configId, moduleSlug)
  const rows = await wellCoverTypeRepo.replaceUserWellCoverTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellCoverTypeRepo.toWellCoverTypeDTO)
}

export async function createUserWellCoverType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellCoverTypeDTO
): Promise<WellCoverTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const parsed = parseWellCoverTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid well cover type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellCoverTypes(userId, configId, moduleSlug)
  const existing = await wellCoverTypeRepo.listUserWellCoverTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("well-cover-type", parsed.name, existing.length)

  if (
    await wellCoverTypeRepo.findUserWellCoverType(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A well cover type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well cover type with this name already exists")
  }

  const row = await wellCoverTypeRepo.createUserWellCoverType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellCoverTypeRepo.toWellCoverTypeDTO(row)
}

export async function updateUserWellCoverType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellCoverTypeDTO
): Promise<WellCoverTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellCoverTypeRepo.findUserWellCoverType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Cover Type not found")

  const parsed = parseWellCoverTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid well cover type")

  const siblings = await wellCoverTypeRepo.listUserWellCoverTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well cover type with this name already exists")
  }

  const row = await wellCoverTypeRepo.updateUserWellCoverType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellCoverTypeRepo.toWellCoverTypeDTO(row)
}

export async function deleteUserWellCoverType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellCoverTypeRepo.findUserWellCoverType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Cover Type not found")

  await wellCoverTypeRepo.deleteUserWellCoverType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellCoverTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellCoverTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well cover types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellCoverTypeTemplates(moduleSlug)
  await wellCoverTypeRepo.deleteUserWellCoverTypes(ownerUserId, configId, moduleSlug)
  const rows = await wellCoverTypeRepo.createUserWellCoverTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellCoverTypeRepo.toWellCoverTypeDTO)
}
