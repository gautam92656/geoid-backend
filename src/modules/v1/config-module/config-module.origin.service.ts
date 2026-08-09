import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import { REMOVED_CONFIG_MODULE_SLUGS } from "../../../shared/constants/configModuleCatalog"
import {
  getModuleOriginOptionDefaults,
  moduleHasOriginOptionDefaults,
} from "../../../shared/constants/originOptionDefaults"
import {
  parseOriginOptionDTO,
  parseOriginOptionDTOList,
  type OriginOptionDTO,
} from "../../../shared/constants/originOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import * as originRepo from "./config-module.origin.repository"

function isValidModuleSlug(slug: string): boolean {
  const trimmed = slug.trim()
  return (
    trimmed.length > 0 &&
    !(REMOVED_CONFIG_MODULE_SLUGS as readonly string[]).includes(trimmed)
  )
}

function createOptionKey(name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${slug || "origin"}-${Date.now().toString(36)}-${index}`
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureOriginOptionTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const existing = await originRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleOriginOptionDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await originRepo.upsertTemplate(moduleSlug, option, index)
  }

  return originRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getOriginOptionTemplates(moduleSlug: string): Promise<OriginOptionDTO[]> {
  const templates = await ensureOriginOptionTemplates(moduleSlug)
  return templates.map(originRepo.toOriginOptionDTO)
}

/** Copy common templates into the config-scoped collection when they have none yet. */
export async function ensureUserOriginOptions(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await originRepo.countUserOrigins(ownerUserId, configId, moduleSlug)
  if (count > 0) {
    return originRepo.listUserOrigins(ownerUserId, configId, moduleSlug)
  }

  const templates = await ensureOriginOptionTemplates(moduleSlug)
  return originRepo.createUserOriginsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserOriginOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<OriginOptionDTO[]> {
  const rows = await ensureUserOriginOptions(userId, logConfigurationId, moduleSlug)
  return rows.map(originRepo.toOriginOptionDTO)
}

export async function saveUserOriginOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: OriginOptionDTO[]
): Promise<OriginOptionDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const parsed = parseOriginOptionDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid origin options provided")
  }

  // Ensure unique option keys for any blank/duplicate ids.
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

  await ensureUserOriginOptions(userId, configId, moduleSlug)
  const rows = await originRepo.replaceUserOrigins(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(originRepo.toOriginOptionDTO)
}

export async function createUserOriginOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: OriginOptionDTO
): Promise<OriginOptionDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const parsed = parseOriginOptionDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid origin option")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserOriginOptions(userId, configId, moduleSlug)
  const existing = await originRepo.listUserOrigins(ownerUserId, configId, moduleSlug)
  const key = parsed.id.trim() || createOptionKey(parsed.name, existing.length)

  if (await originRepo.findUserOrigin(ownerUserId, configId, moduleSlug, key)) {
    throw new ValidationError("An origin option with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An origin option with this name already exists")
  }

  const row = await originRepo.createUserOrigin(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return originRepo.toOriginOptionDTO(row)
}

export async function updateUserOriginOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: OriginOptionDTO
): Promise<OriginOptionDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await originRepo.findUserOrigin(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Origin option not found")

  const parsed = parseOriginOptionDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid origin option")

  const siblings = await originRepo.listUserOrigins(ownerUserId, configId, moduleSlug)
  const duplicateName = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("An origin option with this name already exists")
  }

  const row = await originRepo.updateUserOrigin(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return originRepo.toOriginOptionDTO(row)
}

export async function deleteUserOriginOption(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await originRepo.findUserOrigin(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Origin option not found")

  await originRepo.deleteUserOrigin(ownerUserId, configId, moduleSlug, optionKey)
}

export async function resetUserOriginOptions(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<OriginOptionDTO[]> {
  if (!isValidModuleSlug(moduleSlug) || !moduleHasOriginOptionDefaults(moduleSlug)) {
    throw new NotFoundError("Module origin options not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureOriginOptionTemplates(moduleSlug)
  await originRepo.deleteUserOrigins(ownerUserId, configId, moduleSlug)
  const rows = await originRepo.createUserOriginsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(originRepo.toOriginOptionDTO)
}
