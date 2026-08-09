import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWaterObservationTypeDefaults,
  moduleHasWaterObservationTypeDefaults,
} from "../../../shared/constants/waterObservationsOptionDefaults"
import {
  WATER_OBSERVATION_TYPES_DATA_TYPE_ID,
  createWaterObservationsOptionKey,
  parseWaterObservationTypeDTO,
  parseWaterObservationTypeDTOList,
  type WaterObservationTypeDTO,
} from "../../../shared/constants/waterObservationsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as waterObservationTypeRepo from "./config-module.waterObservationType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWaterObservationTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWaterObservationTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const existing = await waterObservationTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWaterObservationTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await waterObservationTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return waterObservationTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWaterObservationTypeTemplates(
  moduleSlug: string
): Promise<WaterObservationTypeDTO[]> {
  const templates = await ensureWaterObservationTypeTemplates(moduleSlug)
  return templates.map(waterObservationTypeRepo.toWaterObservationTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWaterObservationTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await waterObservationTypeRepo.countUserWaterObservationTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return waterObservationTypeRepo.listUserWaterObservationTypes(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWaterObservationTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WATER_OBSERVATION_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return waterObservationTypeRepo.replaceUserWaterObservationTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWaterObservationTypeTemplates(moduleSlug)
  return waterObservationTypeRepo.createUserWaterObservationTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWaterObservationTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WaterObservationTypeDTO[]> {
  const rows = await ensureUserWaterObservationTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(waterObservationTypeRepo.toWaterObservationTypeDTO)
}

export async function saveUserWaterObservationTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WaterObservationTypeDTO[]
): Promise<WaterObservationTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const parsed = parseWaterObservationTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid water observation types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWaterObservationsOptionKey("water-observation-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWaterObservationTypes(userId, configId, moduleSlug)
  const rows = await waterObservationTypeRepo.replaceUserWaterObservationTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(waterObservationTypeRepo.toWaterObservationTypeDTO)
}

export async function createUserWaterObservationType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WaterObservationTypeDTO
): Promise<WaterObservationTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const parsed = parseWaterObservationTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid water observation type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWaterObservationTypes(userId, configId, moduleSlug)
  const existing = await waterObservationTypeRepo.listUserWaterObservationTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWaterObservationsOptionKey("water-observation-type", parsed.name, existing.length)

  if (
    await waterObservationTypeRepo.findUserWaterObservationType(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A water observation type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A water observation type with this name already exists")
  }

  const row = await waterObservationTypeRepo.createUserWaterObservationType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return waterObservationTypeRepo.toWaterObservationTypeDTO(row)
}

export async function updateUserWaterObservationType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WaterObservationTypeDTO
): Promise<WaterObservationTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await waterObservationTypeRepo.findUserWaterObservationType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Water observation type not found")

  const parsed = parseWaterObservationTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid water observation type")

  const siblings = await waterObservationTypeRepo.listUserWaterObservationTypes(
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
    throw new ValidationError("A water observation type with this name already exists")
  }

  const row = await waterObservationTypeRepo.updateUserWaterObservationType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return waterObservationTypeRepo.toWaterObservationTypeDTO(row)
}

export async function deleteUserWaterObservationType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await waterObservationTypeRepo.findUserWaterObservationType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Water observation type not found")

  await waterObservationTypeRepo.deleteUserWaterObservationType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWaterObservationTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WaterObservationTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module water observation types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWaterObservationTypeTemplates(moduleSlug)
  await waterObservationTypeRepo.deleteUserWaterObservationTypes(ownerUserId, configId, moduleSlug)
  const rows = await waterObservationTypeRepo.createUserWaterObservationTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(waterObservationTypeRepo.toWaterObservationTypeDTO)
}
