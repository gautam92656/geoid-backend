import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellCasingTypeDefaults,
  moduleHasWellCasingTypeDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  WELL_CASING_TYPES_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellCasingTypeDTO,
  parseWellCasingTypeDTOList,
  type WellCasingTypeDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellCasingTypeRepo from "./config-module.wellCasingType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellCasingTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellCasingTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const existing = await wellCasingTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellCasingTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellCasingTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellCasingTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellCasingTypeTemplates(
  moduleSlug: string
): Promise<WellCasingTypeDTO[]> {
  const templates = await ensureWellCasingTypeTemplates(moduleSlug)
  return templates.map(wellCasingTypeRepo.toWellCasingTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellCasingTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellCasingTypeRepo.countUserWellCasingTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellCasingTypeRepo.listUserWellCasingTypes(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellCasingTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WELL_CASING_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellCasingTypeRepo.replaceUserWellCasingTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellCasingTypeTemplates(moduleSlug)
  return wellCasingTypeRepo.createUserWellCasingTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellCasingTypeDTO[]> {
  const rows = await ensureUserWellCasingTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(wellCasingTypeRepo.toWellCasingTypeDTO)
}

export async function saveUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellCasingTypeDTO[]
): Promise<WellCasingTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const parsed = parseWellCasingTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid well casing types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("well-casing-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellCasingTypes(userId, configId, moduleSlug)
  const rows = await wellCasingTypeRepo.replaceUserWellCasingTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellCasingTypeRepo.toWellCasingTypeDTO)
}

export async function createUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellCasingTypeDTO
): Promise<WellCasingTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const parsed = parseWellCasingTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid well casing type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellCasingTypes(userId, configId, moduleSlug)
  const existing = await wellCasingTypeRepo.listUserWellCasingTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("well-casing-type", parsed.name, existing.length)

  if (
    await wellCasingTypeRepo.findUserWellCasingType(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A well casing type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well casing type with this name already exists")
  }

  const row = await wellCasingTypeRepo.createUserWellCasingType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellCasingTypeRepo.toWellCasingTypeDTO(row)
}

export async function updateUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellCasingTypeDTO
): Promise<WellCasingTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellCasingTypeRepo.findUserWellCasingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Casing Type not found")

  const parsed = parseWellCasingTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid well casing type")

  const siblings = await wellCasingTypeRepo.listUserWellCasingTypes(
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
    throw new ValidationError("A well casing type with this name already exists")
  }

  const row = await wellCasingTypeRepo.updateUserWellCasingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellCasingTypeRepo.toWellCasingTypeDTO(row)
}

export async function deleteUserWellCasingType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellCasingTypeRepo.findUserWellCasingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Casing Type not found")

  await wellCasingTypeRepo.deleteUserWellCasingType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellCasingTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellCasingTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellCasingTypeTemplates(moduleSlug)
  await wellCasingTypeRepo.deleteUserWellCasingTypes(ownerUserId, configId, moduleSlug)
  const rows = await wellCasingTypeRepo.createUserWellCasingTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellCasingTypeRepo.toWellCasingTypeDTO)
}
