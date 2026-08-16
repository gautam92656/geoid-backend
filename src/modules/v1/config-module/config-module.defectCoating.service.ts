import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleDefectCoatingDefaults,
  moduleHasDefectCoatingDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  DEFECT_COATINGS_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseDefectCoatingDTO,
  parseDefectCoatingDTOList,
  type DefectCoatingDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as defectCoatingRepo from "./config-module.defectCoating.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasDefectCoatingDefaults(slug.trim())
}

export async function ensureDefectCoatingTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const existing = await defectCoatingRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleDefectCoatingDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await defectCoatingRepo.upsertTemplate(moduleSlug, option, index)
  }

  return defectCoatingRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getDefectCoatingTemplates(
  moduleSlug: string
): Promise<DefectCoatingDTO[]> {
  const templates = await ensureDefectCoatingTemplates(moduleSlug)
  return templates.map(defectCoatingRepo.toDefectCoatingDTO)
}

export async function ensureUserDefectCoatings(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await defectCoatingRepo.countUserDefectCoatings(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return defectCoatingRepo.listUserDefectCoatings(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseDefectCoatingDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DEFECT_COATINGS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return defectCoatingRepo.replaceUserDefectCoatings(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureDefectCoatingTemplates(moduleSlug)
  return defectCoatingRepo.createUserDefectCoatingsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserDefectCoatings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DefectCoatingDTO[]> {
  const rows = await ensureUserDefectCoatings(userId, logConfigurationId, moduleSlug)
  return rows.map(defectCoatingRepo.toDefectCoatingDTO)
}

export async function saveUserDefectCoatings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DefectCoatingDTO[]
): Promise<DefectCoatingDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const parsed = parseDefectCoatingDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid defect coatings provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("defect-coating", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDefectCoatings(userId, configId, moduleSlug)
  const rows = await defectCoatingRepo.replaceUserDefectCoatings(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(defectCoatingRepo.toDefectCoatingDTO)
}

export async function createUserDefectCoating(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DefectCoatingDTO
): Promise<DefectCoatingDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const parsed = parseDefectCoatingDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid defect coating")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDefectCoatings(userId, configId, moduleSlug)
  const existing = await defectCoatingRepo.listUserDefectCoatings(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("defect-coating", parsed.name, existing.length)

  if (
    await defectCoatingRepo.findUserDefectCoating(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("A defect coating with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A defect coating with this name already exists")
  }

  const row = await defectCoatingRepo.createUserDefectCoating(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return defectCoatingRepo.toDefectCoatingDTO(row)
}

export async function updateUserDefectCoating(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DefectCoatingDTO
): Promise<DefectCoatingDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await defectCoatingRepo.findUserDefectCoating(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("defect coating not found")

  const parsed = parseDefectCoatingDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid defect coating")

  const siblings = await defectCoatingRepo.listUserDefectCoatings(
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
    throw new ValidationError("A defect coating with this name already exists")
  }

  const row = await defectCoatingRepo.updateUserDefectCoating(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return defectCoatingRepo.toDefectCoatingDTO(row)
}

export async function deleteUserDefectCoating(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await defectCoatingRepo.findUserDefectCoating(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("defect coating not found")

  await defectCoatingRepo.deleteUserDefectCoating(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserDefectCoatings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DefectCoatingDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect coatings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDefectCoatingTemplates(moduleSlug)
  await defectCoatingRepo.deleteUserDefectCoatings(ownerUserId, configId, moduleSlug)
  const rows = await defectCoatingRepo.createUserDefectCoatingsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(defectCoatingRepo.toDefectCoatingDTO)
}
