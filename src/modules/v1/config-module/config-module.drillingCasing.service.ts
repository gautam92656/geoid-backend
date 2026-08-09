import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleDrillingCasingDefaults,
  moduleHasDrillingCasingDefaults,
} from "../../../shared/constants/drillingObservationsOptionDefaults"
import {
  DRILLING_CASINGS_DATA_TYPE_ID,
  createDrillingObservationsOptionKey,
  parseDrillingCasingDTO,
  parseDrillingCasingDTOList,
  type DrillingCasingDTO,
} from "../../../shared/constants/drillingObservationsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as drillingCasingRepo from "./config-module.drillingCasing.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasDrillingCasingDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureDrillingCasingTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const existing = await drillingCasingRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleDrillingCasingDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await drillingCasingRepo.upsertTemplate(moduleSlug, option, index)
  }

  return drillingCasingRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getDrillingCasingTemplates(
  moduleSlug: string
): Promise<DrillingCasingDTO[]> {
  const templates = await ensureDrillingCasingTemplates(moduleSlug)
  return templates.map(drillingCasingRepo.toDrillingCasingDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserDrillingCasings(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await drillingCasingRepo.countUserDrillingCasings(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return drillingCasingRepo.listUserDrillingCasings(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseDrillingCasingDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DRILLING_CASINGS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return drillingCasingRepo.replaceUserDrillingCasings(ownerUserId, configId, moduleSlug, legacy)
  }

  const templates = await ensureDrillingCasingTemplates(moduleSlug)
  return drillingCasingRepo.createUserDrillingCasingsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserDrillingCasings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingCasingDTO[]> {
  const rows = await ensureUserDrillingCasings(userId, logConfigurationId, moduleSlug)
  return rows.map(drillingCasingRepo.toDrillingCasingDTO)
}

export async function saveUserDrillingCasings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DrillingCasingDTO[]
): Promise<DrillingCasingDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const parsed = parseDrillingCasingDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid drilling casings provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createDrillingObservationsOptionKey("drilling-casing", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingCasings(userId, configId, moduleSlug)
  const rows = await drillingCasingRepo.replaceUserDrillingCasings(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(drillingCasingRepo.toDrillingCasingDTO)
}

export async function createUserDrillingCasing(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DrillingCasingDTO
): Promise<DrillingCasingDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const parsed = parseDrillingCasingDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid drilling casing")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDrillingCasings(userId, configId, moduleSlug)
  const existing = await drillingCasingRepo.listUserDrillingCasings(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createDrillingObservationsOptionKey("drilling-casing", parsed.name, existing.length)

  if (await drillingCasingRepo.findUserDrillingCasing(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("A drilling casing with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A drilling casing with this name already exists")
  }

  const row = await drillingCasingRepo.createUserDrillingCasing(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return drillingCasingRepo.toDrillingCasingDTO(row)
}

export async function updateUserDrillingCasing(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DrillingCasingDTO
): Promise<DrillingCasingDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingCasingRepo.findUserDrillingCasing(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling casing not found")

  const parsed = parseDrillingCasingDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid drilling casing")

  const siblings = await drillingCasingRepo.listUserDrillingCasings(
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
    throw new ValidationError("A drilling casing with this name already exists")
  }

  const row = await drillingCasingRepo.updateUserDrillingCasing(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return drillingCasingRepo.toDrillingCasingDTO(row)
}

export async function deleteUserDrillingCasing(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await drillingCasingRepo.findUserDrillingCasing(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Drilling casing not found")

  await drillingCasingRepo.deleteUserDrillingCasing(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserDrillingCasings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DrillingCasingDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module drilling casings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDrillingCasingTemplates(moduleSlug)
  await drillingCasingRepo.deleteUserDrillingCasings(ownerUserId, configId, moduleSlug)
  const rows = await drillingCasingRepo.createUserDrillingCasingsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(drillingCasingRepo.toDrillingCasingDTO)
}
