import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleCoreDefectTypeDefaults,
  moduleHasCoreDefectTypeDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  CORE_DEFECT_TYPES_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseCoreDefectTypeDTO,
  parseCoreDefectTypeDTOList,
  type CoreDefectTypeDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as coreDefectTypeRepo from "./config-module.coreDefectType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasCoreDefectTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureCoreDefectTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const existing = await coreDefectTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleCoreDefectTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await coreDefectTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return coreDefectTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getCoreDefectTypeTemplates(
  moduleSlug: string
): Promise<CoreDefectTypeDTO[]> {
  const templates = await ensureCoreDefectTypeTemplates(moduleSlug)
  return templates.map(coreDefectTypeRepo.toCoreDefectTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserCoreDefectTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await coreDefectTypeRepo.countUserCoreDefectTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return coreDefectTypeRepo.listUserCoreDefectTypes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseCoreDefectTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      CORE_DEFECT_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return coreDefectTypeRepo.replaceUserCoreDefectTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureCoreDefectTypeTemplates(moduleSlug)
  return coreDefectTypeRepo.createUserCoreDefectTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<CoreDefectTypeDTO[]> {
  const rows = await ensureUserCoreDefectTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(coreDefectTypeRepo.toCoreDefectTypeDTO)
}

export async function saveUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: CoreDefectTypeDTO[]
): Promise<CoreDefectTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const parsed = parseCoreDefectTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid core defect types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("core-defect-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserCoreDefectTypes(userId, configId, moduleSlug)
  const rows = await coreDefectTypeRepo.replaceUserCoreDefectTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(coreDefectTypeRepo.toCoreDefectTypeDTO)
}

export async function createUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: CoreDefectTypeDTO
): Promise<CoreDefectTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const parsed = parseCoreDefectTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid core defect type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserCoreDefectTypes(userId, configId, moduleSlug)
  const existing = await coreDefectTypeRepo.listUserCoreDefectTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("core-defect-type", parsed.name, existing.length)

  if (
    await coreDefectTypeRepo.findUserCoreDefectType(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("A core defect type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A core defect type with this name already exists")
  }

  const row = await coreDefectTypeRepo.createUserCoreDefectType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return coreDefectTypeRepo.toCoreDefectTypeDTO(row)
}

export async function updateUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: CoreDefectTypeDTO
): Promise<CoreDefectTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await coreDefectTypeRepo.findUserCoreDefectType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Core defect type not found")

  const parsed = parseCoreDefectTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid core defect type")

  const siblings = await coreDefectTypeRepo.listUserCoreDefectTypes(
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
    throw new ValidationError("A core defect type with this name already exists")
  }

  const row = await coreDefectTypeRepo.updateUserCoreDefectType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return coreDefectTypeRepo.toCoreDefectTypeDTO(row)
}

export async function deleteUserCoreDefectType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await coreDefectTypeRepo.findUserCoreDefectType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Core defect type not found")

  await coreDefectTypeRepo.deleteUserCoreDefectType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserCoreDefectTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<CoreDefectTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module core defect types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureCoreDefectTypeTemplates(moduleSlug)
  await coreDefectTypeRepo.deleteUserCoreDefectTypes(ownerUserId, configId, moduleSlug)
  const rows = await coreDefectTypeRepo.createUserCoreDefectTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(coreDefectTypeRepo.toCoreDefectTypeDTO)
}
