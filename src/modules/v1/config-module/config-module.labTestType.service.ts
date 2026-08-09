import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleLabTestTypeDefaults,
  moduleHasLabTestTypeDefaults,
} from "../../../shared/constants/labTestsOptionDefaults"
import {
  LAB_TEST_TYPES_DATA_TYPE_ID,
  createLabTestsOptionKey,
  parseLabTestTypeDTO,
  parseLabTestTypeDTOList,
  type LabTestTypeDTO,
} from "../../../shared/constants/labTestsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as labTestTypeRepo from "./config-module.labTestType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasLabTestTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureLabTestTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const existing = await labTestTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleLabTestTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await labTestTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return labTestTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getLabTestTypeTemplates(moduleSlug: string): Promise<LabTestTypeDTO[]> {
  const templates = await ensureLabTestTypeTemplates(moduleSlug)
  return templates.map(labTestTypeRepo.toLabTestTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserLabTestTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await labTestTypeRepo.countUserLabTestTypes(ownerUserId, configId, moduleSlug)
  if (count > 0) {
    return labTestTypeRepo.listUserLabTestTypes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseLabTestTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      LAB_TEST_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return labTestTypeRepo.replaceUserLabTestTypes(ownerUserId, configId, moduleSlug, legacy)
  }

  const templates = await ensureLabTestTypeTemplates(moduleSlug)
  return labTestTypeRepo.createUserLabTestTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<LabTestTypeDTO[]> {
  const rows = await ensureUserLabTestTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(labTestTypeRepo.toLabTestTypeDTO)
}

export async function saveUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: LabTestTypeDTO[]
): Promise<LabTestTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const parsed = parseLabTestTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid lab test types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createLabTestsOptionKey("lab-test-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserLabTestTypes(userId, configId, moduleSlug)
  const rows = await labTestTypeRepo.replaceUserLabTestTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(labTestTypeRepo.toLabTestTypeDTO)
}

export async function createUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: LabTestTypeDTO
): Promise<LabTestTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const parsed = parseLabTestTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid lab test type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserLabTestTypes(userId, configId, moduleSlug)
  const existing = await labTestTypeRepo.listUserLabTestTypes(ownerUserId, configId, moduleSlug)
  const key =
    parsed.id.trim() || createLabTestsOptionKey("lab-test-type", parsed.name, existing.length)

  if (await labTestTypeRepo.findUserLabTestType(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("A lab test type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A lab test type with this name already exists")
  }

  const row = await labTestTypeRepo.createUserLabTestType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return labTestTypeRepo.toLabTestTypeDTO(row)
}

export async function updateUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: LabTestTypeDTO
): Promise<LabTestTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await labTestTypeRepo.findUserLabTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Lab test type not found")

  const parsed = parseLabTestTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid lab test type")

  const siblings = await labTestTypeRepo.listUserLabTestTypes(ownerUserId, configId, moduleSlug)
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A lab test type with this name already exists")
  }

  const row = await labTestTypeRepo.updateUserLabTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return labTestTypeRepo.toLabTestTypeDTO(row)
}

export async function deleteUserLabTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await labTestTypeRepo.findUserLabTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Lab test type not found")

  await labTestTypeRepo.deleteUserLabTestType(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserLabTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<LabTestTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module lab test types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureLabTestTypeTemplates(moduleSlug)
  await labTestTypeRepo.deleteUserLabTestTypes(ownerUserId, configId, moduleSlug)
  const rows = await labTestTypeRepo.createUserLabTestTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(labTestTypeRepo.toLabTestTypeDTO)
}
