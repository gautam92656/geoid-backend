import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellDefaultWellIdDefaults,
  moduleHasWellDefaultWellIdDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  DEFAULT_WELL_IDS_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellDefaultWellIdDTO,
  parseWellDefaultWellIdDTOList,
  type WellDefaultWellIdDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellDefaultWellIdRepo from "./config-module.wellDefaultWellId.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellDefaultWellIdDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellDefaultWellIdTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const existing = await wellDefaultWellIdRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellDefaultWellIdDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellDefaultWellIdRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellDefaultWellIdRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellDefaultWellIdTemplates(
  moduleSlug: string
): Promise<WellDefaultWellIdDTO[]> {
  const templates = await ensureWellDefaultWellIdTemplates(moduleSlug)
  return templates.map(wellDefaultWellIdRepo.toWellDefaultWellIdDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellDefaultWellIds(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellDefaultWellIdRepo.countUserWellDefaultWellIds(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellDefaultWellIdRepo.listUserWellDefaultWellIds(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellDefaultWellIdDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      DEFAULT_WELL_IDS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellDefaultWellIdRepo.replaceUserWellDefaultWellIds(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellDefaultWellIdTemplates(moduleSlug)
  return wellDefaultWellIdRepo.createUserWellDefaultWellIdsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellDefaultWellIdDTO[]> {
  const rows = await ensureUserWellDefaultWellIds(userId, logConfigurationId, moduleSlug)
  return rows.map(wellDefaultWellIdRepo.toWellDefaultWellIdDTO)
}

export async function saveUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellDefaultWellIdDTO[]
): Promise<WellDefaultWellIdDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const parsed = parseWellDefaultWellIdDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid default well ids provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("default-well-id", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellDefaultWellIds(userId, configId, moduleSlug)
  const rows = await wellDefaultWellIdRepo.replaceUserWellDefaultWellIds(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellDefaultWellIdRepo.toWellDefaultWellIdDTO)
}

export async function createUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellDefaultWellIdDTO
): Promise<WellDefaultWellIdDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const parsed = parseWellDefaultWellIdDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid default well id")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellDefaultWellIds(userId, configId, moduleSlug)
  const existing = await wellDefaultWellIdRepo.listUserWellDefaultWellIds(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("default-well-id", parsed.name, existing.length)

  if (
    await wellDefaultWellIdRepo.findUserWellDefaultWellId(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A default well id with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A default well id with this name already exists")
  }

  const row = await wellDefaultWellIdRepo.createUserWellDefaultWellId(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellDefaultWellIdRepo.toWellDefaultWellIdDTO(row)
}

export async function updateUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellDefaultWellIdDTO
): Promise<WellDefaultWellIdDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellDefaultWellIdRepo.findUserWellDefaultWellId(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Default Well Id not found")

  const parsed = parseWellDefaultWellIdDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid default well id")

  const siblings = await wellDefaultWellIdRepo.listUserWellDefaultWellIds(
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
    throw new ValidationError("A default well id with this name already exists")
  }

  const row = await wellDefaultWellIdRepo.updateUserWellDefaultWellId(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellDefaultWellIdRepo.toWellDefaultWellIdDTO(row)
}

export async function deleteUserWellDefaultWellId(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellDefaultWellIdRepo.findUserWellDefaultWellId(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Default Well Id not found")

  await wellDefaultWellIdRepo.deleteUserWellDefaultWellId(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellDefaultWellIds(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellDefaultWellIdDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module default well ids not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellDefaultWellIdTemplates(moduleSlug)
  await wellDefaultWellIdRepo.deleteUserWellDefaultWellIds(ownerUserId, configId, moduleSlug)
  const rows = await wellDefaultWellIdRepo.createUserWellDefaultWellIdsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellDefaultWellIdRepo.toWellDefaultWellIdDTO)
}
