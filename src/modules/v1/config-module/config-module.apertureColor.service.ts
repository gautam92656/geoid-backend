import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleApertureColorDefaults,
  moduleHasApertureColorDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  APERTURE_COLORS_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseApertureColorDTO,
  parseApertureColorDTOList,
  type ApertureColorDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as apertureColorRepo from "./config-module.apertureColor.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasApertureColorDefaults(slug.trim())
}

export async function ensureApertureColorTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const existing = await apertureColorRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleApertureColorDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await apertureColorRepo.upsertTemplate(moduleSlug, option, index)
  }

  return apertureColorRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getApertureColorTemplates(
  moduleSlug: string
): Promise<ApertureColorDTO[]> {
  const templates = await ensureApertureColorTemplates(moduleSlug)
  return templates.map(apertureColorRepo.toApertureColorDTO)
}

export async function ensureUserApertureColors(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await apertureColorRepo.countUserApertureColors(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return apertureColorRepo.listUserApertureColors(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseApertureColorDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      APERTURE_COLORS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return apertureColorRepo.replaceUserApertureColors(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureApertureColorTemplates(moduleSlug)
  return apertureColorRepo.createUserApertureColorsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<ApertureColorDTO[]> {
  const rows = await ensureUserApertureColors(userId, logConfigurationId, moduleSlug)
  return rows.map(apertureColorRepo.toApertureColorDTO)
}

export async function saveUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: ApertureColorDTO[]
): Promise<ApertureColorDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const parsed = parseApertureColorDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid aperture colors provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("aperture-color", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserApertureColors(userId, configId, moduleSlug)
  const rows = await apertureColorRepo.replaceUserApertureColors(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(apertureColorRepo.toApertureColorDTO)
}

export async function createUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: ApertureColorDTO
): Promise<ApertureColorDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const parsed = parseApertureColorDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid aperture color")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserApertureColors(userId, configId, moduleSlug)
  const existing = await apertureColorRepo.listUserApertureColors(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("aperture-color", parsed.name, existing.length)

  if (
    await apertureColorRepo.findUserApertureColor(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("An aperture color with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An aperture color with this name already exists")
  }

  const row = await apertureColorRepo.createUserApertureColor(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return apertureColorRepo.toApertureColorDTO(row)
}

export async function updateUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: ApertureColorDTO
): Promise<ApertureColorDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await apertureColorRepo.findUserApertureColor(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Aperture color not found")

  const parsed = parseApertureColorDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid aperture color")

  const siblings = await apertureColorRepo.listUserApertureColors(
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
    throw new ValidationError("An aperture color with this name already exists")
  }

  const row = await apertureColorRepo.updateUserApertureColor(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return apertureColorRepo.toApertureColorDTO(row)
}

export async function deleteUserApertureColor(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await apertureColorRepo.findUserApertureColor(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Aperture color not found")

  await apertureColorRepo.deleteUserApertureColor(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserApertureColors(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<ApertureColorDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module aperture colors not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureApertureColorTemplates(moduleSlug)
  await apertureColorRepo.deleteUserApertureColors(ownerUserId, configId, moduleSlug)
  const rows = await apertureColorRepo.createUserApertureColorsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(apertureColorRepo.toApertureColorDTO)
}
