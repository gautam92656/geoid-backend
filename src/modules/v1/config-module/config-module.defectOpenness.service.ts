import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleDefectOpennessDefaults,
  moduleHasDefectOpennessDefaults,
} from "../../../shared/constants/coreLoggingOptionDefaults"
import {
  DEFECT_OPENNESSES_DATA_TYPE_ID,
  createCoreLoggingOptionKey,
  parseDefectOpennessDTO,
  parseDefectOpennessDTOList,
  type DefectOpennessDTO,
} from "../../../shared/constants/coreLoggingOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as defectOpennessRepo from "./config-module.defectOpenness.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasDefectOpennessDefaults(slug.trim())
}

export async function ensureDefectOpennessTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const existing = await defectOpennessRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleDefectOpennessDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await defectOpennessRepo.upsertTemplate(moduleSlug, option, index)
  }

  return defectOpennessRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getDefectOpennessTemplates(
  moduleSlug: string
): Promise<DefectOpennessDTO[]> {
  const templates = await ensureDefectOpennessTemplates(moduleSlug)
  return templates.map(defectOpennessRepo.toDefectOpennessDTO)
}

export async function ensureUserDefectOpennesses(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await defectOpennessRepo.countUserDefectOpennesses(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return defectOpennessRepo.listUserDefectOpennesses(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseDefectOpennessDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DEFECT_OPENNESSES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return defectOpennessRepo.replaceUserDefectOpennesses(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureDefectOpennessTemplates(moduleSlug)
  return defectOpennessRepo.createUserDefectOpennessesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserDefectOpennesses(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DefectOpennessDTO[]> {
  const rows = await ensureUserDefectOpennesses(userId, logConfigurationId, moduleSlug)
  return rows.map(defectOpennessRepo.toDefectOpennessDTO)
}

export async function saveUserDefectOpennesses(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: DefectOpennessDTO[]
): Promise<DefectOpennessDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const parsed = parseDefectOpennessDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid defect openness values provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createCoreLoggingOptionKey("defect-openness", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDefectOpennesses(userId, configId, moduleSlug)
  const rows = await defectOpennessRepo.replaceUserDefectOpennesses(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(defectOpennessRepo.toDefectOpennessDTO)
}

export async function createUserDefectOpenness(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: DefectOpennessDTO
): Promise<DefectOpennessDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const parsed = parseDefectOpennessDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid defect openness")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserDefectOpennesses(userId, configId, moduleSlug)
  const existing = await defectOpennessRepo.listUserDefectOpennesses(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createCoreLoggingOptionKey("defect-openness", parsed.name, existing.length)

  if (
    await defectOpennessRepo.findUserDefectOpenness(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A defect openness with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A defect openness with this name already exists")
  }

  const row = await defectOpennessRepo.createUserDefectOpenness(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return defectOpennessRepo.toDefectOpennessDTO(row)
}

export async function updateUserDefectOpenness(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: DefectOpennessDTO
): Promise<DefectOpennessDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await defectOpennessRepo.findUserDefectOpenness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Defect openness not found")

  const parsed = parseDefectOpennessDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid defect openness")

  const siblings = await defectOpennessRepo.listUserDefectOpennesses(
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
    throw new ValidationError("A defect openness with this name already exists")
  }

  const row = await defectOpennessRepo.updateUserDefectOpenness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return defectOpennessRepo.toDefectOpennessDTO(row)
}

export async function deleteUserDefectOpenness(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await defectOpennessRepo.findUserDefectOpenness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Defect openness not found")

  await defectOpennessRepo.deleteUserDefectOpenness(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserDefectOpennesses(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<DefectOpennessDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module defect openness not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureDefectOpennessTemplates(moduleSlug)
  await defectOpennessRepo.deleteUserDefectOpennesses(ownerUserId, configId, moduleSlug)
  const rows = await defectOpennessRepo.createUserDefectOpennessesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(defectOpennessRepo.toDefectOpennessDTO)
}
