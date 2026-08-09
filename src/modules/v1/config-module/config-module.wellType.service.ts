import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellTypeDefaults,
  moduleHasWellTypeDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  WELL_TYPES_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellTypeDTO,
  parseWellTypeDTOList,
  type WellTypeDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellTypeRepo from "./config-module.wellType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const existing = await wellTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellTypeTemplates(
  moduleSlug: string
): Promise<WellTypeDTO[]> {
  const templates = await ensureWellTypeTemplates(moduleSlug)
  return templates.map(wellTypeRepo.toWellTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellTypeRepo.countUserWellTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellTypeRepo.listUserWellTypes(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WELL_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellTypeRepo.replaceUserWellTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellTypeTemplates(moduleSlug)
  return wellTypeRepo.createUserWellTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellTypeDTO[]> {
  const rows = await ensureUserWellTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(wellTypeRepo.toWellTypeDTO)
}

export async function saveUserWellTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellTypeDTO[]
): Promise<WellTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const parsed = parseWellTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid well types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("well-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellTypes(userId, configId, moduleSlug)
  const rows = await wellTypeRepo.replaceUserWellTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellTypeRepo.toWellTypeDTO)
}

export async function createUserWellType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellTypeDTO
): Promise<WellTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const parsed = parseWellTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid well type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellTypes(userId, configId, moduleSlug)
  const existing = await wellTypeRepo.listUserWellTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("well-type", parsed.name, existing.length)

  if (
    await wellTypeRepo.findUserWellType(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A well type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well type with this name already exists")
  }

  const row = await wellTypeRepo.createUserWellType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellTypeRepo.toWellTypeDTO(row)
}

export async function updateUserWellType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellTypeDTO
): Promise<WellTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellTypeRepo.findUserWellType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Type not found")

  const parsed = parseWellTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid well type")

  const siblings = await wellTypeRepo.listUserWellTypes(
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
    throw new ValidationError("A well type with this name already exists")
  }

  const row = await wellTypeRepo.updateUserWellType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellTypeRepo.toWellTypeDTO(row)
}

export async function deleteUserWellType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellTypeRepo.findUserWellType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Type not found")

  await wellTypeRepo.deleteUserWellType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellTypeTemplates(moduleSlug)
  await wellTypeRepo.deleteUserWellTypes(ownerUserId, configId, moduleSlug)
  const rows = await wellTypeRepo.createUserWellTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellTypeRepo.toWellTypeDTO)
}
