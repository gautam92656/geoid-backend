import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleLabTestPresetDefaults,
  moduleHasLabTestPresetDefaults,
} from "../../../shared/constants/labTestPresetOptionDefaults"
import {
  LAB_TEST_PRESETS_DATA_TYPE_ID,
  parseLabTestPresetDTO,
  parseLabTestPresetDTOList,
  type LabTestPresetDTO,
} from "../../../shared/constants/labTestPresetOptionTypes"
import { createLabTestsOptionKey } from "../../../shared/constants/labTestsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as labTestPresetRepo from "./config-module.labTestPreset.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasLabTestPresetDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureLabTestPresetTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const existing = await labTestPresetRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleLabTestPresetDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await labTestPresetRepo.upsertTemplate(moduleSlug, option, index)
  }

  return labTestPresetRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getLabTestPresetTemplates(moduleSlug: string): Promise<LabTestPresetDTO[]> {
  const templates = await ensureLabTestPresetTemplates(moduleSlug)
  return templates.map(labTestPresetRepo.toLabTestPresetDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserLabTestPresets(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await labTestPresetRepo.countUserLabTestPresets(ownerUserId, configId, moduleSlug)
  if (count > 0) {
    return labTestPresetRepo.listUserLabTestPresets(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseLabTestPresetDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      LAB_TEST_PRESETS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return labTestPresetRepo.replaceUserLabTestPresets(ownerUserId, configId, moduleSlug, legacy)
  }

  const templates = await ensureLabTestPresetTemplates(moduleSlug)
  return labTestPresetRepo.createUserLabTestPresetsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<LabTestPresetDTO[]> {
  const rows = await ensureUserLabTestPresets(userId, logConfigurationId, moduleSlug)
  return rows.map(labTestPresetRepo.toLabTestPresetDTO)
}

export async function saveUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: LabTestPresetDTO[]
): Promise<LabTestPresetDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const parsed = parseLabTestPresetDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid lab test presets provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createLabTestsOptionKey("lab-test-preset", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserLabTestPresets(userId, configId, moduleSlug)
  const rows = await labTestPresetRepo.replaceUserLabTestPresets(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(labTestPresetRepo.toLabTestPresetDTO)
}

export async function createUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: LabTestPresetDTO
): Promise<LabTestPresetDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const parsed = parseLabTestPresetDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid lab test preset")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserLabTestPresets(userId, configId, moduleSlug)
  const existing = await labTestPresetRepo.listUserLabTestPresets(ownerUserId, configId, moduleSlug)
  const key =
    parsed.id.trim() || createLabTestsOptionKey("lab-test-preset", parsed.name, existing.length)

  if (await labTestPresetRepo.findUserLabTestPreset(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("A lab test preset with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A lab test preset with this name already exists")
  }

  const row = await labTestPresetRepo.createUserLabTestPreset(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return labTestPresetRepo.toLabTestPresetDTO(row)
}

export async function updateUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: LabTestPresetDTO
): Promise<LabTestPresetDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await labTestPresetRepo.findUserLabTestPreset(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Lab test preset not found")

  const parsed = parseLabTestPresetDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid lab test preset")

  const siblings = await labTestPresetRepo.listUserLabTestPresets(ownerUserId, configId, moduleSlug)
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A lab test preset with this name already exists")
  }

  const row = await labTestPresetRepo.updateUserLabTestPreset(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return labTestPresetRepo.toLabTestPresetDTO(row)
}

export async function deleteUserLabTestPreset(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await labTestPresetRepo.findUserLabTestPreset(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Lab test preset not found")

  await labTestPresetRepo.deleteUserLabTestPreset(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserLabTestPresets(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<LabTestPresetDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test presets not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureLabTestPresetTemplates(moduleSlug)
  await labTestPresetRepo.deleteUserLabTestPresets(ownerUserId, configId, moduleSlug)
  const rows = await labTestPresetRepo.createUserLabTestPresetsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(labTestPresetRepo.toLabTestPresetDTO)
}
