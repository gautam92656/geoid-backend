import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleDrillingResistanceDefaults,
  moduleHasDrillingResistanceDefaults,
} from "../../../shared/constants/drillingObservationsOptionDefaults"
import {
  DRILLING_RESISTANCES_DATA_TYPE_ID,
  createDrillingObservationsOptionKey,
  parseDrillingResistanceDTO,
  parseDrillingResistanceDTOList,
  type DrillingResistanceDTO,
} from "../../../shared/constants/drillingObservationsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as drillingResistanceRepo from "./config-module.drillingResistance.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasDrillingResistanceDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureDrillingResistanceTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const existing = await drillingResistanceRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleDrillingResistanceDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await drillingResistanceRepo.upsertTemplate(moduleSlug, option, index)
  }

  return drillingResistanceRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getDrillingResistanceTemplates(
  moduleSlug: string
): Promise<DrillingResistanceDTO[]> {
  const templates = await ensureDrillingResistanceTemplates(moduleSlug)
  return templates.map(drillingResistanceRepo.toDrillingResistanceDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserDrillingResistances(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await drillingResistanceRepo.countUserDrillingResistances(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return drillingResistanceRepo.listUserDrillingResistances(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseDrillingResistanceDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DRILLING_RESISTANCES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return drillingResistanceRepo.replaceUserDrillingResistances(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureDrillingResistanceTemplates(moduleSlug)
  return drillingResistanceRepo.createUserDrillingResistancesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserDrillingResistances(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingResistanceDTO[]> {
  const rows = await ensureUserDrillingResistances(userId, logConfigurationId, moduleSlug)
  return rows.map(drillingResistanceRepo.toDrillingResistanceDTO)
}

export async function saveUserDrillingResistances(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DrillingResistanceDTO[]
): Promise<DrillingResistanceDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const parsed = parseDrillingResistanceDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid drilling resistances provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createDrillingObservationsOptionKey("drilling-resistance", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingResistances(userId, configId, moduleSlug)
  const rows = await drillingResistanceRepo.replaceUserDrillingResistances(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(drillingResistanceRepo.toDrillingResistanceDTO)
}

export async function createUserDrillingResistance(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DrillingResistanceDTO
): Promise<DrillingResistanceDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const parsed = parseDrillingResistanceDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid drilling resistance")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingResistances(userId, configId, moduleSlug)
  const existing = await drillingResistanceRepo.listUserDrillingResistances(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createDrillingObservationsOptionKey("drilling-resistance", parsed.name, existing.length)

  if (
    await drillingResistanceRepo.findUserDrillingResistance(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("A drilling resistance with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A drilling resistance with this name already exists")
  }

  const row = await drillingResistanceRepo.createUserDrillingResistance(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return drillingResistanceRepo.toDrillingResistanceDTO(row)
}

export async function updateUserDrillingResistance(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DrillingResistanceDTO
): Promise<DrillingResistanceDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingResistanceRepo.findUserDrillingResistance(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling resistance not found")

  const parsed = parseDrillingResistanceDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid drilling resistance")

  const siblings = await drillingResistanceRepo.listUserDrillingResistances(
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
    throw new ValidationError("A drilling resistance with this name already exists")
  }

  const row = await drillingResistanceRepo.updateUserDrillingResistance(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return drillingResistanceRepo.toDrillingResistanceDTO(row)
}

export async function deleteUserDrillingResistance(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingResistanceRepo.findUserDrillingResistance(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling resistance not found")

  await drillingResistanceRepo.deleteUserDrillingResistance(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserDrillingResistances(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingResistanceDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling resistances not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDrillingResistanceTemplates(moduleSlug)
  await drillingResistanceRepo.deleteUserDrillingResistances(ownerUserId, configId, moduleSlug)
  const rows = await drillingResistanceRepo.createUserDrillingResistancesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(drillingResistanceRepo.toDrillingResistanceDTO)
}
