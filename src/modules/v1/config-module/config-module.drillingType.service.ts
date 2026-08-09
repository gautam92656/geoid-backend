import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleDrillingTypeDefaults,
  moduleHasDrillingTypeDefaults,
} from "../../../shared/constants/drillingObservationsOptionDefaults"
import {
  DRILLING_TYPES_DATA_TYPE_ID,
  createDrillingObservationsOptionKey,
  parseDrillingTypeDTO,
  parseDrillingTypeDTOList,
  type DrillingTypeDTO,
} from "../../../shared/constants/drillingObservationsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as drillingTypeRepo from "./config-module.drillingType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasDrillingTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureDrillingTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const existing = await drillingTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleDrillingTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await drillingTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return drillingTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getDrillingTypeTemplates(moduleSlug: string): Promise<DrillingTypeDTO[]> {
  const templates = await ensureDrillingTypeTemplates(moduleSlug)
  return templates.map(drillingTypeRepo.toDrillingTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserDrillingTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await drillingTypeRepo.countUserDrillingTypes(ownerUserId, configId, moduleSlug)
  if (count > 0) {
    return drillingTypeRepo.listUserDrillingTypes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseDrillingTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DRILLING_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return drillingTypeRepo.replaceUserDrillingTypes(ownerUserId, configId, moduleSlug, legacy)
  }

  const templates = await ensureDrillingTypeTemplates(moduleSlug)
  return drillingTypeRepo.createUserDrillingTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingTypeDTO[]> {
  const rows = await ensureUserDrillingTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(drillingTypeRepo.toDrillingTypeDTO)
}

export async function saveUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DrillingTypeDTO[]
): Promise<DrillingTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const parsed = parseDrillingTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid drilling types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createDrillingObservationsOptionKey("drilling-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingTypes(userId, configId, moduleSlug)
  const rows = await drillingTypeRepo.replaceUserDrillingTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(drillingTypeRepo.toDrillingTypeDTO)
}

export async function createUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DrillingTypeDTO
): Promise<DrillingTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const parsed = parseDrillingTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid drilling type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingTypes(userId, configId, moduleSlug)
  const existing = await drillingTypeRepo.listUserDrillingTypes(ownerUserId, configId, moduleSlug)
  const key =
    parsed.id.trim() ||
    createDrillingObservationsOptionKey("drilling-type", parsed.name, existing.length)

  if (await drillingTypeRepo.findUserDrillingType(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("A drilling type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A drilling type with this name already exists")
  }

  const row = await drillingTypeRepo.createUserDrillingType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return drillingTypeRepo.toDrillingTypeDTO(row)
}

export async function updateUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DrillingTypeDTO
): Promise<DrillingTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingTypeRepo.findUserDrillingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling type not found")

  const parsed = parseDrillingTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid drilling type")

  const siblings = await drillingTypeRepo.listUserDrillingTypes(ownerUserId, configId, moduleSlug)
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A drilling type with this name already exists")
  }

  const row = await drillingTypeRepo.updateUserDrillingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return drillingTypeRepo.toDrillingTypeDTO(row)
}

export async function deleteUserDrillingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingTypeRepo.findUserDrillingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling type not found")

  await drillingTypeRepo.deleteUserDrillingType(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserDrillingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDrillingTypeTemplates(moduleSlug)
  await drillingTypeRepo.deleteUserDrillingTypes(ownerUserId, configId, moduleSlug)
  const rows = await drillingTypeRepo.createUserDrillingTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(drillingTypeRepo.toDrillingTypeDTO)
}
