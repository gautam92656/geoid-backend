import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleInsituUnitSettingDefaults,
  moduleHasInsituUnitSettingDefaults,
} from "../../../shared/constants/insituTestTypeDefaults"
import {
  parseInsituUnitSettingDTO,
  parseInsituUnitSettingDTOList,
  type InsituUnitSettingDTO,
} from "../../../shared/constants/insituTestTypeTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import * as insituUnitSettingRepo from "./config-module.insituUnitSetting.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasInsituUnitSettingDefaults(slug.trim())
}

function createOptionKey(name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || "insitu-unit-setting"}-${Date.now().toString(36)}-${index}`
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureInsituUnitSettingTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const existing = await insituUnitSettingRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleInsituUnitSettingDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await insituUnitSettingRepo.upsertTemplate(moduleSlug, option, index)
  }

  return insituUnitSettingRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getInsituUnitSettingTemplates(
  moduleSlug: string
): Promise<InsituUnitSettingDTO[]> {
  const templates = await ensureInsituUnitSettingTemplates(moduleSlug)
  return templates.map(insituUnitSettingRepo.toInsituUnitSettingDTO)
}

/** Copy common templates into the config-scoped collection when they have none yet. */
export async function ensureUserInsituUnitSettings(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await insituUnitSettingRepo.countUserInsituUnitSettings(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return insituUnitSettingRepo.listUserInsituUnitSettings(ownerUserId, configId, moduleSlug)
  }

  const templates = await ensureInsituUnitSettingTemplates(moduleSlug)
  return insituUnitSettingRepo.createUserInsituUnitSettingsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<InsituUnitSettingDTO[]> {
  const rows = await ensureUserInsituUnitSettings(userId, logConfigurationId, moduleSlug)
  return rows.map(insituUnitSettingRepo.toInsituUnitSettingDTO)
}

export async function saveUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: InsituUnitSettingDTO[]
): Promise<InsituUnitSettingDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const parsed = parseInsituUnitSettingDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid Insitu unit settings provided")
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

  await ensureUserInsituUnitSettings(userId, configId, moduleSlug)
  const rows = await insituUnitSettingRepo.replaceUserInsituUnitSettings(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(insituUnitSettingRepo.toInsituUnitSettingDTO)
}

export async function createUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: InsituUnitSettingDTO
): Promise<InsituUnitSettingDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const parsed = parseInsituUnitSettingDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid Insitu unit setting")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserInsituUnitSettings(userId, configId, moduleSlug)
  const existing = await insituUnitSettingRepo.listUserInsituUnitSettings(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key = parsed.id.trim() || createOptionKey(parsed.name, existing.length)

  if (
    await insituUnitSettingRepo.findUserInsituUnitSetting(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("An Insitu unit setting with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An Insitu unit setting with this name already exists")
  }

  const row = await insituUnitSettingRepo.createUserInsituUnitSetting(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return insituUnitSettingRepo.toInsituUnitSettingDTO(row)
}

export async function updateUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: InsituUnitSettingDTO
): Promise<InsituUnitSettingDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await insituUnitSettingRepo.findUserInsituUnitSetting(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Insitu unit setting not found")

  const parsed = parseInsituUnitSettingDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid Insitu unit setting")

  const siblings = await insituUnitSettingRepo.listUserInsituUnitSettings(
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
    throw new ValidationError("An Insitu unit setting with this name already exists")
  }

  const row = await insituUnitSettingRepo.updateUserInsituUnitSetting(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return insituUnitSettingRepo.toInsituUnitSettingDTO(row)
}

export async function deleteUserInsituUnitSetting(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await insituUnitSettingRepo.findUserInsituUnitSetting(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Insitu unit setting not found")

  await insituUnitSettingRepo.deleteUserInsituUnitSetting(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserInsituUnitSettings(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<InsituUnitSettingDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module Insitu unit settings not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureInsituUnitSettingTemplates(moduleSlug)
  await insituUnitSettingRepo.deleteUserInsituUnitSettings(ownerUserId, configId, moduleSlug)
  const rows = await insituUnitSettingRepo.createUserInsituUnitSettingsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(insituUnitSettingRepo.toInsituUnitSettingDTO)
}
