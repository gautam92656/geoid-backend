import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleSampleTypeDefaults,
  moduleHasSampleTypeDefaults,
} from "../../../shared/constants/samplesOptionDefaults"
import {
  SAMPLE_TYPES_DATA_TYPE_ID,
  createSamplesOptionKey,
  parseSampleTypeDTO,
  parseSampleTypeDTOList,
  type SampleTypeDTO,
} from "../../../shared/constants/samplesOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as sampleTypeRepo from "./config-module.sampleType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasSampleTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureSampleTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const existing = await sampleTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleSampleTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await sampleTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return sampleTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getSampleTypeTemplates(moduleSlug: string): Promise<SampleTypeDTO[]> {
  const templates = await ensureSampleTypeTemplates(moduleSlug)
  return templates.map(sampleTypeRepo.toSampleTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserSampleTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await sampleTypeRepo.countUserSampleTypes(ownerUserId, configId, moduleSlug)
  if (count > 0) {
    return sampleTypeRepo.listUserSampleTypes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseSampleTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      SAMPLE_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return sampleTypeRepo.replaceUserSampleTypes(ownerUserId, configId, moduleSlug, legacy)
  }

  const templates = await ensureSampleTypeTemplates(moduleSlug)
  return sampleTypeRepo.createUserSampleTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<SampleTypeDTO[]> {
  const rows = await ensureUserSampleTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(sampleTypeRepo.toSampleTypeDTO)
}

export async function saveUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: SampleTypeDTO[]
): Promise<SampleTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const parsed = parseSampleTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid sample types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createSamplesOptionKey("sample-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserSampleTypes(userId, configId, moduleSlug)
  const rows = await sampleTypeRepo.replaceUserSampleTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(sampleTypeRepo.toSampleTypeDTO)
}

export async function createUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: SampleTypeDTO
): Promise<SampleTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const parsed = parseSampleTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid sample type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserSampleTypes(userId, configId, moduleSlug)
  const existing = await sampleTypeRepo.listUserSampleTypes(ownerUserId, configId, moduleSlug)
  const key =
    parsed.id.trim() || createSamplesOptionKey("sample-type", parsed.name, existing.length)

  if (await sampleTypeRepo.findUserSampleType(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("A sample type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A sample type with this name already exists")
  }

  const row = await sampleTypeRepo.createUserSampleType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return sampleTypeRepo.toSampleTypeDTO(row)
}

export async function updateUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: SampleTypeDTO
): Promise<SampleTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await sampleTypeRepo.findUserSampleType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Sample type not found")

  const parsed = parseSampleTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid sample type")

  const siblings = await sampleTypeRepo.listUserSampleTypes(ownerUserId, configId, moduleSlug)
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A sample type with this name already exists")
  }

  const row = await sampleTypeRepo.updateUserSampleType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return sampleTypeRepo.toSampleTypeDTO(row)
}

export async function deleteUserSampleType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await sampleTypeRepo.findUserSampleType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Sample type not found")

  await sampleTypeRepo.deleteUserSampleType(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserSampleTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<SampleTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module sample types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureSampleTypeTemplates(moduleSlug)
  await sampleTypeRepo.deleteUserSampleTypes(ownerUserId, configId, moduleSlug)
  const rows = await sampleTypeRepo.createUserSampleTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(sampleTypeRepo.toSampleTypeDTO)
}
