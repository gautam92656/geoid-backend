import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleInsituTestTypeDefaults,
  moduleHasInsituTestTypeDefaults,
} from "../../../shared/constants/insituTestTypeDefaults"
import {
  parseInsituTestTypeDTO,
  parseInsituTestTypeDTOList,
  type InsituTestTypeDTO,
} from "../../../shared/constants/insituTestTypeTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import * as insituTestTypeRepo from "./config-module.insituTestType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasInsituTestTypeDefaults(slug.trim())
}

function createOptionKey(name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || "insitu-test-type"}-${Date.now().toString(36)}-${index}`
}

/**
 * Ensure common templates exist and stay aligned with built-in defaults.
 * Upserts every default (including settings) so catalog data stays current.
 */
export async function ensureInsituTestTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const defaults = getModuleInsituTestTypeDefaults(moduleSlug)
  if (defaults.length === 0) {
    return insituTestTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  }

  for (const [index, option] of defaults.entries()) {
    await insituTestTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return insituTestTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getInsituTestTypeTemplates(
  moduleSlug: string
): Promise<InsituTestTypeDTO[]> {
  const templates = await ensureInsituTestTypeTemplates(moduleSlug)
  return templates.map(insituTestTypeRepo.toInsituTestTypeDTO)
}

/** Copy common templates into the config-scoped collection when they have none yet. */
export async function ensureUserInsituTestTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await insituTestTypeRepo.countUserInsituTestTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const templates = await ensureInsituTestTypeTemplates(moduleSlug)
  const defaultKeys = new Set(
    getModuleInsituTestTypeDefaults(moduleSlug).map((entry) => entry.id.trim())
  )
  // Only sync the current default catalog (not obsolete leftover templates).
  const defaultTemplates = templates.filter((template) =>
    defaultKeys.has(template.optionKey)
  )

  if (count > 0) {
    await insituTestTypeRepo.syncMissingUserInsituTestTypesFromTemplates(
      ownerUserId,
      configId,
      moduleSlug,
      defaultTemplates
    )
    return insituTestTypeRepo.backfillEmptyUserInsituTestTypeSettings(
      ownerUserId,
      configId,
      moduleSlug,
      defaultTemplates
    )
  }

  return insituTestTypeRepo.createUserInsituTestTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    defaultTemplates
  )
}

export async function getUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<InsituTestTypeDTO[]> {
  const rows = await ensureUserInsituTestTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(insituTestTypeRepo.toInsituTestTypeDTO)
}

export async function saveUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: InsituTestTypeDTO[]
): Promise<InsituTestTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const parsed = parseInsituTestTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid Insitu testing types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createOptionKey(option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserInsituTestTypes(userId, configId, moduleSlug)
  const rows = await insituTestTypeRepo.replaceUserInsituTestTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(insituTestTypeRepo.toInsituTestTypeDTO)
}

export async function createUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: InsituTestTypeDTO
): Promise<InsituTestTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const parsed = parseInsituTestTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid Insitu testing type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserInsituTestTypes(userId, configId, moduleSlug)
  const existing = await insituTestTypeRepo.listUserInsituTestTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key = parsed.id.trim() || createOptionKey(parsed.name, existing.length)

  if (
    await insituTestTypeRepo.findUserInsituTestType(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("An Insitu testing type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An Insitu testing type with this name already exists")
  }

  const row = await insituTestTypeRepo.createUserInsituTestType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return insituTestTypeRepo.toInsituTestTypeDTO(row)
}

export async function updateUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: InsituTestTypeDTO
): Promise<InsituTestTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await insituTestTypeRepo.findUserInsituTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Insitu testing type not found")

  const parsed = parseInsituTestTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid Insitu testing type")

  const siblings = await insituTestTypeRepo.listUserInsituTestTypes(
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
    throw new ValidationError("An Insitu testing type with this name already exists")
  }

  const row = await insituTestTypeRepo.updateUserInsituTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return insituTestTypeRepo.toInsituTestTypeDTO(row)
}

export async function deleteUserInsituTestType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await insituTestTypeRepo.findUserInsituTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Insitu testing type not found")

  await insituTestTypeRepo.deleteUserInsituTestType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserInsituTestTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<InsituTestTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu testing types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureInsituTestTypeTemplates(moduleSlug)
  const defaultKeys = new Set(
    getModuleInsituTestTypeDefaults(moduleSlug).map((entry) => entry.id.trim())
  )
  const defaultTemplates = templates.filter((template) =>
    defaultKeys.has(template.optionKey)
  )
  await insituTestTypeRepo.deleteUserInsituTestTypes(ownerUserId, configId, moduleSlug)
  const rows = await insituTestTypeRepo.createUserInsituTestTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    defaultTemplates
  )
  return rows.map(insituTestTypeRepo.toInsituTestTypeDTO)
}
