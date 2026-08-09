import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleInfillMaterialDefaults,
  moduleHasInfillMaterialDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  INFILL_MATERIALS_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseInfillMaterialDTO,
  parseInfillMaterialDTOList,
  type InfillMaterialDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as infillMaterialRepo from "./config-module.infillMaterial.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasInfillMaterialDefaults(slug.trim())
}

export async function ensureInfillMaterialTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const existing = await infillMaterialRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleInfillMaterialDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await infillMaterialRepo.upsertTemplate(moduleSlug, option, index)
  }

  return infillMaterialRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getInfillMaterialTemplates(
  moduleSlug: string
): Promise<InfillMaterialDTO[]> {
  const templates = await ensureInfillMaterialTemplates(moduleSlug)
  return templates.map(infillMaterialRepo.toInfillMaterialDTO)
}

export async function ensureUserInfillMaterials(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await infillMaterialRepo.countUserInfillMaterials(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return infillMaterialRepo.listUserInfillMaterials(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseInfillMaterialDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      INFILL_MATERIALS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return infillMaterialRepo.replaceUserInfillMaterials(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureInfillMaterialTemplates(moduleSlug)
  return infillMaterialRepo.createUserInfillMaterialsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserInfillMaterials(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<InfillMaterialDTO[]> {
  const rows = await ensureUserInfillMaterials(userId, logConfigurationId, moduleSlug)
  return rows.map(infillMaterialRepo.toInfillMaterialDTO)
}

export async function saveUserInfillMaterials(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: InfillMaterialDTO[]
): Promise<InfillMaterialDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const parsed = parseInfillMaterialDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid infill materials provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("infill-material", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserInfillMaterials(userId, configId, moduleSlug)
  const rows = await infillMaterialRepo.replaceUserInfillMaterials(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(infillMaterialRepo.toInfillMaterialDTO)
}

export async function createUserInfillMaterial(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: InfillMaterialDTO
): Promise<InfillMaterialDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const parsed = parseInfillMaterialDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid infill material")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserInfillMaterials(userId, configId, moduleSlug)
  const existing = await infillMaterialRepo.listUserInfillMaterials(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("infill-material", parsed.name, existing.length)

  if (
    await infillMaterialRepo.findUserInfillMaterial(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("An infill material with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An infill material with this name already exists")
  }

  const row = await infillMaterialRepo.createUserInfillMaterial(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return infillMaterialRepo.toInfillMaterialDTO(row)
}

export async function updateUserInfillMaterial(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: InfillMaterialDTO
): Promise<InfillMaterialDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await infillMaterialRepo.findUserInfillMaterial(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Infill material not found")

  const parsed = parseInfillMaterialDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid infill material")

  const siblings = await infillMaterialRepo.listUserInfillMaterials(
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
    throw new ValidationError("An infill material with this name already exists")
  }

  const row = await infillMaterialRepo.updateUserInfillMaterial(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return infillMaterialRepo.toInfillMaterialDTO(row)
}

export async function deleteUserInfillMaterial(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await infillMaterialRepo.findUserInfillMaterial(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Infill material not found")

  await infillMaterialRepo.deleteUserInfillMaterial(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserInfillMaterials(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<InfillMaterialDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module infill materials not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureInfillMaterialTemplates(moduleSlug)
  await infillMaterialRepo.deleteUserInfillMaterials(ownerUserId, configId, moduleSlug)
  const rows = await infillMaterialRepo.createUserInfillMaterialsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(infillMaterialRepo.toInfillMaterialDTO)
}
