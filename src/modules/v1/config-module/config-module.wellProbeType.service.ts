import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleWellProbeTypeDefaults,
  moduleHasWellProbeTypeDefaults,
} from "../../../shared/constants/wellLogsOptionDefaults"
import {
  WELL_PROBE_TYPES_DATA_TYPE_ID,
  createWellLogsOptionKey,
  parseWellProbeTypeDTO,
  parseWellProbeTypeDTOList,
  type WellProbeTypeDTO,
} from "../../../shared/constants/wellLogsOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as wellProbeTypeRepo from "./config-module.wellProbeType.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasWellProbeTypeDefaults(slug.trim())
}

/** Ensure common templates exist (seed from built-in defaults when empty). */
export async function ensureWellProbeTypeTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const existing = await wellProbeTypeRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleWellProbeTypeDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await wellProbeTypeRepo.upsertTemplate(moduleSlug, option, index)
  }

  return wellProbeTypeRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getWellProbeTypeTemplates(
  moduleSlug: string
): Promise<WellProbeTypeDTO[]> {
  const templates = await ensureWellProbeTypeTemplates(moduleSlug)
  return templates.map(wellProbeTypeRepo.toWellProbeTypeDTO)
}

/** Copy legacy settings or common templates into the config-scoped collection when empty. */
export async function ensureUserWellProbeTypes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await wellProbeTypeRepo.countUserWellProbeTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return wellProbeTypeRepo.listUserWellProbeTypes(
      ownerUserId,
      configId,
      moduleSlug
    )
  }

  const legacy = parseWellProbeTypeDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      WELL_PROBE_TYPES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return wellProbeTypeRepo.replaceUserWellProbeTypes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureWellProbeTypeTemplates(moduleSlug)
  return wellProbeTypeRepo.createUserWellProbeTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserWellProbeTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellProbeTypeDTO[]> {
  const rows = await ensureUserWellProbeTypes(userId, logConfigurationId, moduleSlug)
  return rows.map(wellProbeTypeRepo.toWellProbeTypeDTO)
}

export async function saveUserWellProbeTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: WellProbeTypeDTO[]
): Promise<WellProbeTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const parsed = parseWellProbeTypeDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid well probe types provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createWellLogsOptionKey("well-probe-type", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellProbeTypes(userId, configId, moduleSlug)
  const rows = await wellProbeTypeRepo.replaceUserWellProbeTypes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(wellProbeTypeRepo.toWellProbeTypeDTO)
}

export async function createUserWellProbeType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: WellProbeTypeDTO
): Promise<WellProbeTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const parsed = parseWellProbeTypeDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid well probe type")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserWellProbeTypes(userId, configId, moduleSlug)
  const existing = await wellProbeTypeRepo.listUserWellProbeTypes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createWellLogsOptionKey("well-probe-type", parsed.name, existing.length)

  if (
    await wellProbeTypeRepo.findUserWellProbeType(
      ownerUserId,
      configId,
      moduleSlug,
      key
    )
  ) {
    throw new ValidationError("A well probe type with this id already exists")
  }

  const duplicateName = existing.some(
    (row) => row.name.trim().toLowerCase() === parsed.name.trim().toLowerCase()
  )
  if (duplicateName) {
    throw new ValidationError("A well probe type with this name already exists")
  }

  const row = await wellProbeTypeRepo.createUserWellProbeType(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return wellProbeTypeRepo.toWellProbeTypeDTO(row)
}

export async function updateUserWellProbeType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: WellProbeTypeDTO
): Promise<WellProbeTypeDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellProbeTypeRepo.findUserWellProbeType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Probe Type not found")

  const parsed = parseWellProbeTypeDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid well probe type")

  const siblings = await wellProbeTypeRepo.listUserWellProbeTypes(
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
    throw new ValidationError("A well probe type with this name already exists")
  }

  const row = await wellProbeTypeRepo.updateUserWellProbeType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return wellProbeTypeRepo.toWellProbeTypeDTO(row)
}

export async function deleteUserWellProbeType(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await wellProbeTypeRepo.findUserWellProbeType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Well Probe Type not found")

  await wellProbeTypeRepo.deleteUserWellProbeType(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserWellProbeTypes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<WellProbeTypeDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module well probe types not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureWellProbeTypeTemplates(moduleSlug)
  await wellProbeTypeRepo.deleteUserWellProbeTypes(ownerUserId, configId, moduleSlug)
  const rows = await wellProbeTypeRepo.createUserWellProbeTypesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(wellProbeTypeRepo.toWellProbeTypeDTO)
}
