import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellBackfillTypeDefaults,
  moduleHasWellBackfillTypeDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  WELL_BACKFILL_TYPES_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellBackfillTypeDTO,
  parseWellBackfillTypeDTOList,
  type WellBackfillTypeDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellBackfillTypeRepo from "./config-module.wellBackfillType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellBackfillTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellBackfillTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const existing = await wellBackfillTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellBackfillTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellBackfillTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellBackfillTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellBackfillTypeTemplates(
  moduleSlug: string
): Promise<WellBackfillTypeDTO[]> {
  const templates = await ensureWellBackfillTypeTemplates(moduleSlug)
  return templates.map(wellBackfillTypeRepo.toWellBackfillTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellBackfillTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellBackfillTypeRepo.countUserWellBackfillTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellBackfillTypeRepo.listUserWellBackfillTypes(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellBackfillTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WELL_BACKFILL_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellBackfillTypeRepo.replaceUserWellBackfillTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellBackfillTypeTemplates(moduleSlug)
  return wellBackfillTypeRepo.createUserWellBackfillTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellBackfillTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellBackfillTypeDTO[]> {
  const rows = await ensureUserWellBackfillTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(wellBackfillTypeRepo.toWellBackfillTypeDTO)
}

export async function saveUserWellBackfillTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellBackfillTypeDTO[]
): Promise<WellBackfillTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const parsed = parseWellBackfillTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid well backfill types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("well-backfill-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellBackfillTypes(userId, configId, moduleSlug)
  const rows = await wellBackfillTypeRepo.replaceUserWellBackfillTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellBackfillTypeRepo.toWellBackfillTypeDTO)
}

export async function createUserWellBackfillType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellBackfillTypeDTO
): Promise<WellBackfillTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const parsed = parseWellBackfillTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid well backfill type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellBackfillTypes(userId, configId, moduleSlug)
  const existing = await wellBackfillTypeRepo.listUserWellBackfillTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("well-backfill-type", parsed.name, existing.length)

  if (
    await wellBackfillTypeRepo.findUserWellBackfillType(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A well backfill type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well backfill type with this name already exists")
  }

  const row = await wellBackfillTypeRepo.createUserWellBackfillType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellBackfillTypeRepo.toWellBackfillTypeDTO(row)
}

export async function updateUserWellBackfillType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellBackfillTypeDTO
): Promise<WellBackfillTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellBackfillTypeRepo.findUserWellBackfillType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Backfill Type not found")

  const parsed = parseWellBackfillTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid well backfill type")

  const siblings = await wellBackfillTypeRepo.listUserWellBackfillTypes(
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
    throw new ValidationError("A well backfill type with this name already exists")
  }

  const row = await wellBackfillTypeRepo.updateUserWellBackfillType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellBackfillTypeRepo.toWellBackfillTypeDTO(row)
}

export async function deleteUserWellBackfillType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellBackfillTypeRepo.findUserWellBackfillType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Backfill Type not found")

  await wellBackfillTypeRepo.deleteUserWellBackfillType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellBackfillTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellBackfillTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well backfill types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellBackfillTypeTemplates(moduleSlug)
  await wellBackfillTypeRepo.deleteUserWellBackfillTypes(ownerUserId, configId, moduleSlug)
  const rows = await wellBackfillTypeRepo.createUserWellBackfillTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellBackfillTypeRepo.toWellBackfillTypeDTO)
}
