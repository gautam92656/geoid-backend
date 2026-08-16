import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleSurfaceShapeDefaults,
  moduleHasSurfaceShapeDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  SURFACE_SHAPES_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseSurfaceShapeDTO,
  parseSurfaceShapeDTOList,
  type SurfaceShapeDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as surfaceShapeRepo from "./config-module.surfaceShape.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasSurfaceShapeDefaults(slug.trim())
}

export async function ensureSurfaceShapeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const existing = await surfaceShapeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleSurfaceShapeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await surfaceShapeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return surfaceShapeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getSurfaceShapeTemplates(
  moduleSlug: string
): Promise<SurfaceShapeDTO[]> {
  const templates = await ensureSurfaceShapeTemplates(moduleSlug)
  return templates.map(surfaceShapeRepo.toSurfaceShapeDTO)
}

export async function ensureUserSurfaceShapes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await surfaceShapeRepo.countUserSurfaceShapes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return surfaceShapeRepo.listUserSurfaceShapes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseSurfaceShapeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      SURFACE_SHAPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return surfaceShapeRepo.replaceUserSurfaceShapes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureSurfaceShapeTemplates(moduleSlug)
  return surfaceShapeRepo.createUserSurfaceShapesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserSurfaceShapes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<SurfaceShapeDTO[]> {
  const rows = await ensureUserSurfaceShapes(userId, logConfigurationId, moduleSlug)
  return rows.map(surfaceShapeRepo.toSurfaceShapeDTO)
}

export async function saveUserSurfaceShapes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: SurfaceShapeDTO[]
): Promise<SurfaceShapeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const parsed = parseSurfaceShapeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid surface shapes provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("surface-shape", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserSurfaceShapes(userId, configId, moduleSlug)
  const rows = await surfaceShapeRepo.replaceUserSurfaceShapes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(surfaceShapeRepo.toSurfaceShapeDTO)
}

export async function createUserSurfaceShape(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: SurfaceShapeDTO
): Promise<SurfaceShapeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const parsed = parseSurfaceShapeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid surface shape")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserSurfaceShapes(userId, configId, moduleSlug)
  const existing = await surfaceShapeRepo.listUserSurfaceShapes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("surface-shape", parsed.name, existing.length)

  if (
    await surfaceShapeRepo.findUserSurfaceShape(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("A surface shape with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A surface shape with this name already exists")
  }

  const row = await surfaceShapeRepo.createUserSurfaceShape(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return surfaceShapeRepo.toSurfaceShapeDTO(row)
}

export async function updateUserSurfaceShape(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: SurfaceShapeDTO
): Promise<SurfaceShapeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await surfaceShapeRepo.findUserSurfaceShape(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Surface shape not found")

  const parsed = parseSurfaceShapeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid surface shape")

  const siblings = await surfaceShapeRepo.listUserSurfaceShapes(
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
    throw new ValidationError("A surface shape with this name already exists")
  }

  const row = await surfaceShapeRepo.updateUserSurfaceShape(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return surfaceShapeRepo.toSurfaceShapeDTO(row)
}

export async function deleteUserSurfaceShape(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await surfaceShapeRepo.findUserSurfaceShape(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Surface shape not found")

  await surfaceShapeRepo.deleteUserSurfaceShape(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserSurfaceShapes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<SurfaceShapeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module surface shapes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureSurfaceShapeTemplates(moduleSlug)
  await surfaceShapeRepo.deleteUserSurfaceShapes(ownerUserId, configId, moduleSlug)
  const rows = await surfaceShapeRepo.createUserSurfaceShapesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(surfaceShapeRepo.toSurfaceShapeDTO)
}
