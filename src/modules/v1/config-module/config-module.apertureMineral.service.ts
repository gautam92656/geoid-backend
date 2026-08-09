import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleApertureMineralDefaults,
  moduleHasApertureMineralDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  APERTURE_MINERALS_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseApertureMineralDTO,
  parseApertureMineralDTOList,
  type ApertureMineralDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as apertureMineralRepo from "./config-module.apertureMineral.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasApertureMineralDefaults(slug.trim())
}

export async function ensureApertureMineralTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const existing = await apertureMineralRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleApertureMineralDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await apertureMineralRepo.upsertTemplate(moduleSlug, option, index)
  }

  return apertureMineralRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getApertureMineralTemplates(
  moduleSlug: string
): Promise<ApertureMineralDTO[]> {
  const templates = await ensureApertureMineralTemplates(moduleSlug)
  return templates.map(apertureMineralRepo.toApertureMineralDTO)
}

export async function ensureUserApertureMinerals(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await apertureMineralRepo.countUserApertureMinerals(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return apertureMineralRepo.listUserApertureMinerals(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseApertureMineralDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      APERTURE_MINERALS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return apertureMineralRepo.replaceUserApertureMinerals(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureApertureMineralTemplates(moduleSlug)
  return apertureMineralRepo.createUserApertureMineralsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserApertureMinerals(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<ApertureMineralDTO[]> {
  const rows = await ensureUserApertureMinerals(userId, logConfigurationId, moduleSlug)
  return rows.map(apertureMineralRepo.toApertureMineralDTO)
}

export async function saveUserApertureMinerals(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: ApertureMineralDTO[]
): Promise<ApertureMineralDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const parsed = parseApertureMineralDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid aperture minerals provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("aperture-mineral", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserApertureMinerals(userId, configId, moduleSlug)
  const rows = await apertureMineralRepo.replaceUserApertureMinerals(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(apertureMineralRepo.toApertureMineralDTO)
}

export async function createUserApertureMineral(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: ApertureMineralDTO
): Promise<ApertureMineralDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const parsed = parseApertureMineralDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid aperture mineral")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserApertureMinerals(userId, configId, moduleSlug)
  const existing = await apertureMineralRepo.listUserApertureMinerals(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("aperture-mineral", parsed.name, existing.length)

  if (
    await apertureMineralRepo.findUserApertureMineral(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("An aperture mineral with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An aperture mineral with this name already exists")
  }

  const row = await apertureMineralRepo.createUserApertureMineral(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return apertureMineralRepo.toApertureMineralDTO(row)
}

export async function updateUserApertureMineral(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: ApertureMineralDTO
): Promise<ApertureMineralDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await apertureMineralRepo.findUserApertureMineral(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Aperture mineral not found")

  const parsed = parseApertureMineralDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid aperture mineral")

  const siblings = await apertureMineralRepo.listUserApertureMinerals(
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
    throw new ValidationError("An aperture mineral with this name already exists")
  }

  const row = await apertureMineralRepo.updateUserApertureMineral(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return apertureMineralRepo.toApertureMineralDTO(row)
}

export async function deleteUserApertureMineral(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await apertureMineralRepo.findUserApertureMineral(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Aperture mineral not found")

  await apertureMineralRepo.deleteUserApertureMineral(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserApertureMinerals(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<ApertureMineralDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture minerals not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureApertureMineralTemplates(moduleSlug)
  await apertureMineralRepo.deleteUserApertureMinerals(ownerUserId, configId, moduleSlug)
  const rows = await apertureMineralRepo.createUserApertureMineralsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(apertureMineralRepo.toApertureMineralDTO)
}
