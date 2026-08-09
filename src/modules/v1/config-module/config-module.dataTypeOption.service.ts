import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { REMOVED_CONFIG_MODULE_SLUGS } from "../../../shared/constants/configModuleCatalog"
import {
  getModuleDataTypeOptionDefaults,
  listSeededDataTypeIdsForModule,
  moduleHasDataTypeOptionDefaults,
} from "../../../shared/constants/dataTypeOptionDefaults"
import {
  isUserManagedDataTypeId,
  parseDataTypeOptionDTO,
  parseDataTypeOptionDTOList,
  type DataTypeOptionDTO,
  type UserManagedDataTypeId,
} from "../../../shared/constants/dataTypeOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as dataTypeOptionRepo from "./config-module.dataTypeOption.repository"

function isValidModuleSlug(slug: string): boolean {
  const trimmed = slug.trim()
  return (
    trimmed.length > 0 &&
    !(REMOVED_CONFIG_MODULE_SLUGS as readonly string[]).includes(trimmed)
  )
}

function assertDataTypeId(dataTypeId: string): UserManagedDataTypeId {
  if (!isUserManagedDataTypeId(dataTypeId)) {
    throw new NotFoundError("Data type options not found")
  }
  return dataTypeId
}

function createOptionKey(name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || "option"}-${Date.now().toString(36)}-${index}`
}

export async function ensureDataTypeOptionTemplates(
  moduleSlug: string,
  dataTypeId: UserManagedDataTypeId
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module data type options not found")
  }

  const existing = await dataTypeOptionRepo.listTemplates(moduleSlug, dataTypeId)
  if (existing.length > 0) return existing

  const defaults = getModuleDataTypeOptionDefaults(moduleSlug, dataTypeId)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await dataTypeOptionRepo.upsertTemplate(moduleSlug, dataTypeId, option, index)
  }

  return dataTypeOptionRepo.listTemplates(moduleSlug, dataTypeId)
}

export async function getDataTypeOptionTemplates(
  moduleSlug: string,
  dataTypeId: string
): Promise<DataTypeOptionDTO[]> {
  const typeId = assertDataTypeId(dataTypeId)
  const templates = await ensureDataTypeOptionTemplates(moduleSlug, typeId)
  return templates.map(dataTypeOptionRepo.toDataTypeOptionDTO)
}

export async function ensureUserDataTypeOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module data type options not found")
  }
  const typeId = assertDataTypeId(dataTypeId)

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const count = await dataTypeOptionRepo.countUserOptions(
    ownerUserId,
    configId,
    moduleSlug,
    typeId
  )
  if (count > 0) {
    return dataTypeOptionRepo.listUserOptions(ownerUserId, configId, moduleSlug, typeId)
  }

  const legacy = parseDataTypeOptionDTOList(
    await readLegacyModuleDataTypeOptions(ownerUserId, configId, moduleSlug, typeId)
  )
  if (legacy.length > 0) {
    return dataTypeOptionRepo.replaceUserOptions(
      ownerUserId,
      configId,
      moduleSlug,
      typeId,
      legacy
    )
  }

  const templates = await ensureDataTypeOptionTemplates(moduleSlug, typeId)
  return dataTypeOptionRepo.createUserOptionsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    templates
  )
}

/** Ensure all seeded data-type catalogs for a module are copied for the config. */
export async function ensureAllUserDataTypeOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  const typeIds = listSeededDataTypeIdsForModule(moduleSlug)
  for (const dataTypeId of typeIds) {
    await ensureUserDataTypeOptions(userId, logConfigurationId, moduleSlug, dataTypeId)
  }
}

export async function getUserDataTypeOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
): Promise<DataTypeOptionDTO[]> {
  const rows = await ensureUserDataTypeOptions(
    userId,
    logConfigurationId,
    moduleSlug,
    dataTypeId
  )
  return rows.map(dataTypeOptionRepo.toDataTypeOptionDTO)
}

export async function saveUserDataTypeOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  options: DataTypeOptionDTO[]
): Promise<DataTypeOptionDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module data type options not found")
  }
  const typeId = assertDataTypeId(dataTypeId)

  const parsed = parseDataTypeOptionDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid options provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createOptionKey(option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDataTypeOptions(userId, configId, moduleSlug, typeId)
  const rows = await dataTypeOptionRepo.replaceUserOptions(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    normalized
  )
  return rows.map(dataTypeOptionRepo.toDataTypeOptionDTO)
}

export async function createUserDataTypeOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  option: DataTypeOptionDTO
): Promise<DataTypeOptionDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module data type options not found")
  }
  const typeId = assertDataTypeId(dataTypeId)

  const parsed = parseDataTypeOptionDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid option")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDataTypeOptions(userId, configId, moduleSlug, typeId)
  const existing = await dataTypeOptionRepo.listUserOptions(
    ownerUserId,
    configId,
    moduleSlug,
    typeId
  )
  const key = parsed.id.trim() || createOptionKey(parsed.name, existing.length)

  if (
    await dataTypeOptionRepo.findUserOption(
      ownerUserId,
      configId,
      moduleSlug,
      typeId,
      key
    )
  ) {
    throw new ValidationError("An option with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An option with this name already exists")
  }

  const row = await dataTypeOptionRepo.createUserOption(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    { ...parsed, id: key },
    existing.length
  )
  return dataTypeOptionRepo.toDataTypeOptionDTO(row)
}

export async function updateUserDataTypeOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  optionKey: string,
  option: DataTypeOptionDTO
): Promise<DataTypeOptionDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module data type options not found")
  }
  const typeId = assertDataTypeId(dataTypeId)

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await dataTypeOptionRepo.findUserOption(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    optionKey
  )
  if (!existing) throw new NotFoundError("Option not found")

  const parsed = parseDataTypeOptionDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid option")

  const siblings = await dataTypeOptionRepo.listUserOptions(
    ownerUserId,
    configId,
    moduleSlug,
    typeId
  )
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An option with this name already exists")
  }

  const row = await dataTypeOptionRepo.updateUserOption(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return dataTypeOptionRepo.toDataTypeOptionDTO(row)
}

export async function deleteUserDataTypeOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module data type options not found")
  }
  const typeId = assertDataTypeId(dataTypeId)

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await dataTypeOptionRepo.findUserOption(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    optionKey
  )
  if (!existing) throw new NotFoundError("Option not found")

  await dataTypeOptionRepo.deleteUserOption(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    optionKey
  )
}

export async function resetUserDataTypeOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  dataTypeId: string
): Promise<DataTypeOptionDTO[]> {
  if (!isValidModuleSlug(moduleSlug) || !moduleHasDataTypeOptionDefaults(moduleSlug, dataTypeId)) {
    throw new NotFoundError("Module data type options not found")
  }
  const typeId = assertDataTypeId(dataTypeId)

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDataTypeOptionTemplates(moduleSlug, typeId)
  await dataTypeOptionRepo.deleteUserOptions(ownerUserId, configId, moduleSlug, typeId)
  const rows = await dataTypeOptionRepo.createUserOptionsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    typeId,
    templates
  )
  return rows.map(dataTypeOptionRepo.toDataTypeOptionDTO)
}
