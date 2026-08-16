import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleSurfaceRoughnessDefaults,
  moduleHasSurfaceRoughnessDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  SURFACE_ROUGHNESSES_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseSurfaceRoughnessDTO,
  parseSurfaceRoughnessDTOList,
  type SurfaceRoughnessDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as surfaceRoughnessRepo from "./config-module.surfaceRoughness.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasSurfaceRoughnessDefaults(slug.trim())
}

export async function ensureSurfaceRoughnessTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const existing = await surfaceRoughnessRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleSurfaceRoughnessDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await surfaceRoughnessRepo.upsertTemplate(moduleSlug, option, index)
  }

  return surfaceRoughnessRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getSurfaceRoughnessTemplates(
  moduleSlug: string
): Promise<SurfaceRoughnessDTO[]> {
  const templates = await ensureSurfaceRoughnessTemplates(moduleSlug)
  return templates.map(surfaceRoughnessRepo.toSurfaceRoughnessDTO)
}

export async function ensureUserSurfaceRoughnesses(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await surfaceRoughnessRepo.countUserSurfaceRoughnesses(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return surfaceRoughnessRepo.listUserSurfaceRoughnesses(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseSurfaceRoughnessDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      SURFACE_ROUGHNESSES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return surfaceRoughnessRepo.replaceUserSurfaceRoughnesses(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureSurfaceRoughnessTemplates(moduleSlug)
  return surfaceRoughnessRepo.createUserSurfaceRoughnessesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserSurfaceRoughnesses(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<SurfaceRoughnessDTO[]> {
  const rows = await ensureUserSurfaceRoughnesses(userId, logConfigurationId, moduleSlug)
  return rows.map(surfaceRoughnessRepo.toSurfaceRoughnessDTO)
}

export async function saveUserSurfaceRoughnesses(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: SurfaceRoughnessDTO[]
): Promise<SurfaceRoughnessDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const parsed = parseSurfaceRoughnessDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid surface roughness values provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("surface-roughness", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserSurfaceRoughnesses(userId, configId, moduleSlug)
  const rows = await surfaceRoughnessRepo.replaceUserSurfaceRoughnesses(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(surfaceRoughnessRepo.toSurfaceRoughnessDTO)
}

export async function createUserSurfaceRoughness(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: SurfaceRoughnessDTO
): Promise<SurfaceRoughnessDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const parsed = parseSurfaceRoughnessDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid surface roughness")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserSurfaceRoughnesses(userId, configId, moduleSlug)
  const existing = await surfaceRoughnessRepo.listUserSurfaceRoughnesses(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("surface-roughness", parsed.name, existing.length)

  if (
    await surfaceRoughnessRepo.findUserSurfaceRoughness(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A surface roughness with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A surface roughness with this name already exists")
  }

  const row = await surfaceRoughnessRepo.createUserSurfaceRoughness(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return surfaceRoughnessRepo.toSurfaceRoughnessDTO(row)
}

export async function updateUserSurfaceRoughness(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: SurfaceRoughnessDTO
): Promise<SurfaceRoughnessDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await surfaceRoughnessRepo.findUserSurfaceRoughness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Surface roughness not found")

  const parsed = parseSurfaceRoughnessDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid surface roughness")

  const siblings = await surfaceRoughnessRepo.listUserSurfaceRoughnesses(
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
    throw new ValidationError("A surface roughness with this name already exists")
  }

  const row = await surfaceRoughnessRepo.updateUserSurfaceRoughness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return surfaceRoughnessRepo.toSurfaceRoughnessDTO(row)
}

export async function deleteUserSurfaceRoughness(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await surfaceRoughnessRepo.findUserSurfaceRoughness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Surface roughness not found")

  await surfaceRoughnessRepo.deleteUserSurfaceRoughness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserSurfaceRoughnesses(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<SurfaceRoughnessDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface roughness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureSurfaceRoughnessTemplates(moduleSlug)
  await surfaceRoughnessRepo.deleteUserSurfaceRoughnesses(ownerUserId, configId, moduleSlug)
  const rows = await surfaceRoughnessRepo.createUserSurfaceRoughnessesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(surfaceRoughnessRepo.toSurfaceRoughnessDTO)
}
