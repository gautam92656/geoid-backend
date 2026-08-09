import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellCasingTopDefaults,
  moduleHasWellCasingTopDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  WELL_CASING_TOPS_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellCasingTopDTO,
  parseWellCasingTopDTOList,
  type WellCasingTopDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellCasingTopRepo from "./config-module.wellCasingTop.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellCasingTopDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellCasingTopTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const existing = await wellCasingTopRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellCasingTopDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellCasingTopRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellCasingTopRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellCasingTopTemplates(
  moduleSlug: string
): Promise<WellCasingTopDTO[]> {
  const templates = await ensureWellCasingTopTemplates(moduleSlug)
  return templates.map(wellCasingTopRepo.toWellCasingTopDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellCasingTops(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellCasingTopRepo.countUserWellCasingTops(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellCasingTopRepo.listUserWellCasingTops(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellCasingTopDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WELL_CASING_TOPS_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellCasingTopRepo.replaceUserWellCasingTops(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellCasingTopTemplates(moduleSlug)
  return wellCasingTopRepo.createUserWellCasingTopsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellCasingTopDTO[]> {
  const rows = await ensureUserWellCasingTops(userId, logConfigurationId, moduleSlug)
  return rows.map(wellCasingTopRepo.toWellCasingTopDTO)
}

export async function saveUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellCasingTopDTO[]
): Promise<WellCasingTopDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const parsed = parseWellCasingTopDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid well casing tops provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("well-casing-top", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellCasingTops(userId, configId, moduleSlug)
  const rows = await wellCasingTopRepo.replaceUserWellCasingTops(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellCasingTopRepo.toWellCasingTopDTO)
}

export async function createUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellCasingTopDTO
): Promise<WellCasingTopDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const parsed = parseWellCasingTopDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid well casing top")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellCasingTops(userId, configId, moduleSlug)
  const existing = await wellCasingTopRepo.listUserWellCasingTops(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("well-casing-top", parsed.name, existing.length)

  if (
    await wellCasingTopRepo.findUserWellCasingTop(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A well casing top with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well casing top with this name already exists")
  }

  const row = await wellCasingTopRepo.createUserWellCasingTop(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellCasingTopRepo.toWellCasingTopDTO(row)
}

export async function updateUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellCasingTopDTO
): Promise<WellCasingTopDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellCasingTopRepo.findUserWellCasingTop(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Casing Top not found")

  const parsed = parseWellCasingTopDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid well casing top")

  const siblings = await wellCasingTopRepo.listUserWellCasingTops(
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
    throw new ValidationError("A well casing top with this name already exists")
  }

  const row = await wellCasingTopRepo.updateUserWellCasingTop(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellCasingTopRepo.toWellCasingTopDTO(row)
}

export async function deleteUserWellCasingTop(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellCasingTopRepo.findUserWellCasingTop(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Casing Top not found")

  await wellCasingTopRepo.deleteUserWellCasingTop(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellCasingTops(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellCasingTopDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well casing tops not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellCasingTopTemplates(moduleSlug)
  await wellCasingTopRepo.deleteUserWellCasingTops(ownerUserId, configId, moduleSlug)
  const rows = await wellCasingTopRepo.createUserWellCasingTopsFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellCasingTopRepo.toWellCasingTopDTO)
}
