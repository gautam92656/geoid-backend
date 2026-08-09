import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleDrillingObservationDefaults,
  moduleHasDrillingObservationDefaults,
} from "../../../shared/constants/drillingObservationsOptionDefaults"
import {
  DRILLING_OBSERVATIONS_DATA_TYPE_ID,
  createDrillingObservationsOptionKey,
  parseDrillingObservationDTO,
  parseDrillingObservationDTOList,
  type DrillingObservationDTO,
} from "../../../shared/constants/drillingObservationsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as drillingObservationRepo from "./config-module.drillingObservation.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasDrillingObservationDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureDrillingObservationTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const existing = await drillingObservationRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleDrillingObservationDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await drillingObservationRepo.upsertTemplate(moduleSlug, option, index)
  }

  return drillingObservationRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getDrillingObservationTemplates(
  moduleSlug: string
): Promise<DrillingObservationDTO[]> {
  const templates = await ensureDrillingObservationTemplates(moduleSlug)
  return templates.map(drillingObservationRepo.toDrillingObservationDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserDrillingObservations(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await drillingObservationRepo.countUserDrillingObservations(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return drillingObservationRepo.listUserDrillingObservations(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseDrillingObservationDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DRILLING_OBSERVATIONS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return drillingObservationRepo.replaceUserDrillingObservations(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureDrillingObservationTemplates(moduleSlug)
  return drillingObservationRepo.createUserDrillingObservationsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingObservationDTO[]> {
  const rows = await ensureUserDrillingObservations(userId, logConfigurationId, moduleSlug)
  return rows.map(drillingObservationRepo.toDrillingObservationDTO)
}

export async function saveUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DrillingObservationDTO[]
): Promise<DrillingObservationDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const parsed = parseDrillingObservationDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid drilling observations provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createDrillingObservationsOptionKey("drilling-observation", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingObservations(userId, configId, moduleSlug)
  const rows = await drillingObservationRepo.replaceUserDrillingObservations(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(drillingObservationRepo.toDrillingObservationDTO)
}

export async function createUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DrillingObservationDTO
): Promise<DrillingObservationDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const parsed = parseDrillingObservationDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid drilling observation")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingObservations(userId, configId, moduleSlug)
  const existing = await drillingObservationRepo.listUserDrillingObservations(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createDrillingObservationsOptionKey("drilling-observation", parsed.name, existing.length)

  if (
    await drillingObservationRepo.findUserDrillingObservation(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A drilling observation with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A drilling observation with this name already exists")
  }

  const row = await drillingObservationRepo.createUserDrillingObservation(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return drillingObservationRepo.toDrillingObservationDTO(row)
}

export async function updateUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DrillingObservationDTO
): Promise<DrillingObservationDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingObservationRepo.findUserDrillingObservation(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling observation not found")

  const parsed = parseDrillingObservationDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid drilling observation")

  const siblings = await drillingObservationRepo.listUserDrillingObservations(
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
    throw new ValidationError("A drilling observation with this name already exists")
  }

  const row = await drillingObservationRepo.updateUserDrillingObservation(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return drillingObservationRepo.toDrillingObservationDTO(row)
}

export async function deleteUserDrillingObservation(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingObservationRepo.findUserDrillingObservation(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling observation not found")

  await drillingObservationRepo.deleteUserDrillingObservation(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserDrillingObservations(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingObservationDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling observations not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDrillingObservationTemplates(moduleSlug)
  await drillingObservationRepo.deleteUserDrillingObservations(ownerUserId, configId, moduleSlug)
  const rows = await drillingObservationRepo.createUserDrillingObservationsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(drillingObservationRepo.toDrillingObservationDTO)
}
