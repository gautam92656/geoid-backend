import { NotFoundError } from "../../../shared/errors/NotFoundError"
import { ValidationError } from "../../../shared/errors/ValidationError"
import {
  getModuleRemarksQuickNoteDefaults,
  moduleHasRemarksQuickNoteDefaults,
} from "../../../shared/constants/logRemarksOptionDefaults"
import {
  REMARKS_QUICK_NOTES_DATA_TYPE_ID,
  createLogRemarksOptionKey,
  parseRemarksQuickNoteDTO,
  parseRemarksQuickNoteDTOList,
  type RemarksQuickNoteDTO,
} from "../../../shared/constants/logRemarksOptionTypes"
import { assertAccessibleLogConfiguration } from "./config-module.configAccess"
import { readLegacyModuleDataTypeOptions } from "./config-module.legacySettings"
import * as remarksQuickNoteRepo from "./config-module.remarksQuickNote.repository"

function isValidModuleSlug(slug: string): boolean {
  return moduleHasRemarksQuickNoteDefaults(slug.trim())
}

function duplicateQuickNoteKey(remarkTypeId: string, name: string): string {
  return `${remarkTypeId.trim()}::${name.trim().toLowerCase()}`
}

export async function ensureRemarksQuickNoteTemplates(moduleSlug: string) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const existing = await remarksQuickNoteRepo.listTemplatesByModuleSlug(moduleSlug)
  if (existing.length > 0) return existing

  const defaults = getModuleRemarksQuickNoteDefaults(moduleSlug)
  if (defaults.length === 0) return []

  for (const [index, option] of defaults.entries()) {
    await remarksQuickNoteRepo.upsertTemplate(moduleSlug, option, index)
  }

  return remarksQuickNoteRepo.listTemplatesByModuleSlug(moduleSlug)
}

export async function getRemarksQuickNoteTemplates(
  moduleSlug: string
): Promise<RemarksQuickNoteDTO[]> {
  const templates = await ensureRemarksQuickNoteTemplates(moduleSlug)
  return templates.map(remarksQuickNoteRepo.toRemarksQuickNoteDTO)
}

export async function ensureUserRemarksQuickNotes(
  actorUserId: number,
  logConfigurationId: number,
  moduleSlug: string
) {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    actorUserId,
    logConfigurationId
  )

  const count = await remarksQuickNoteRepo.countUserRemarksQuickNotes(
    ownerUserId,
    configId,
    moduleSlug
  )
  if (count > 0) {
    return remarksQuickNoteRepo.listUserRemarksQuickNotes(ownerUserId, configId, moduleSlug)
  }

  const legacy = parseRemarksQuickNoteDTOList(
    await readLegacyModuleDataTypeOptions(
      ownerUserId,
      configId,
      moduleSlug,
      REMARKS_QUICK_NOTES_DATA_TYPE_ID
    )
  )
  if (legacy.length > 0) {
    return remarksQuickNoteRepo.replaceUserRemarksQuickNotes(
      ownerUserId,
      configId,
      moduleSlug,
      legacy
    )
  }

  const templates = await ensureRemarksQuickNoteTemplates(moduleSlug)
  return remarksQuickNoteRepo.createUserRemarksQuickNotesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
}

export async function getUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<RemarksQuickNoteDTO[]> {
  const rows = await ensureUserRemarksQuickNotes(userId, logConfigurationId, moduleSlug)
  return rows.map(remarksQuickNoteRepo.toRemarksQuickNoteDTO)
}

export async function saveUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  options: RemarksQuickNoteDTO[]
): Promise<RemarksQuickNoteDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const parsed = parseRemarksQuickNoteDTOList(options)
  if (parsed.length === 0 && options.length > 0) {
    throw new ValidationError("No valid remarks quick notes provided")
  }

  const seenKeys = new Set<string>()
  const normalized = parsed.map((option, index) => {
    let key = option.id.trim()
    if (!key || seenKeys.has(key)) {
      key = createLogRemarksOptionKey("remarks-quick-note", option.name, index)
    }
    seenKeys.add(key)
    return { ...option, id: key }
  })

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserRemarksQuickNotes(userId, configId, moduleSlug)
  const rows = await remarksQuickNoteRepo.replaceUserRemarksQuickNotes(
    ownerUserId,
    configId,
    moduleSlug,
    normalized
  )
  return rows.map(remarksQuickNoteRepo.toRemarksQuickNoteDTO)
}

export async function createUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  option: RemarksQuickNoteDTO
): Promise<RemarksQuickNoteDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const parsed = parseRemarksQuickNoteDTO(option, 0)
  if (!parsed) throw new ValidationError("Invalid remarks quick note")

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  await ensureUserRemarksQuickNotes(userId, configId, moduleSlug)
  const existing = await remarksQuickNoteRepo.listUserRemarksQuickNotes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const key =
    parsed.id.trim() ||
    createLogRemarksOptionKey("remarks-quick-note", parsed.name, existing.length)

  if (
    await remarksQuickNoteRepo.findUserRemarksQuickNote(ownerUserId, configId, moduleSlug, key)
  ) {
    throw new ValidationError("A remarks quick note with this id already exists")
  }

  const duplicateKey = duplicateQuickNoteKey(parsed.remarkTypeId, parsed.name)
  const duplicate = existing.some(
    (row) => duplicateQuickNoteKey(row.remarkTypeId, row.name) === duplicateKey
  )
  if (duplicate) {
    throw new ValidationError(
      "A remarks quick note with this name already exists for this remark type"
    )
  }

  const row = await remarksQuickNoteRepo.createUserRemarksQuickNote(
    ownerUserId,
    configId,
    moduleSlug,
    { ...parsed, id: key },
    existing.length
  )
  return remarksQuickNoteRepo.toRemarksQuickNoteDTO(row)
}

export async function updateUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string,
  option: RemarksQuickNoteDTO
): Promise<RemarksQuickNoteDTO> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await remarksQuickNoteRepo.findUserRemarksQuickNote(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Remarks quick note not found")

  const parsed = parseRemarksQuickNoteDTO({ ...option, id: option.id || optionKey }, 0)
  if (!parsed) throw new ValidationError("Invalid remarks quick note")

  const siblings = await remarksQuickNoteRepo.listUserRemarksQuickNotes(
    ownerUserId,
    configId,
    moduleSlug
  )
  const duplicateKey = duplicateQuickNoteKey(parsed.remarkTypeId, parsed.name)
  const duplicate = siblings.some(
    (row) =>
      row.optionKey !== optionKey &&
      duplicateQuickNoteKey(row.remarkTypeId, row.name) === duplicateKey
  )
  if (duplicate) {
    throw new ValidationError(
      "A remarks quick note with this name already exists for this remark type"
    )
  }

  const row = await remarksQuickNoteRepo.updateUserRemarksQuickNote(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey,
    { ...parsed, id: optionKey },
    existing.sortOrder
  )
  return remarksQuickNoteRepo.toRemarksQuickNoteDTO(row)
}

export async function deleteUserRemarksQuickNote(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string,
  optionKey: string
): Promise<void> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const existing = await remarksQuickNoteRepo.findUserRemarksQuickNote(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
  if (!existing) throw new NotFoundError("Remarks quick note not found")

  await remarksQuickNoteRepo.deleteUserRemarksQuickNote(
    ownerUserId,
    configId,
    moduleSlug,
    optionKey
  )
}

export async function resetUserRemarksQuickNotes(
  userId: number,
  logConfigurationId: number,
  moduleSlug: string
): Promise<RemarksQuickNoteDTO[]> {
  if (!isValidModuleSlug(moduleSlug)) {
    throw new NotFoundError("Module remarks quick notes not found")
  }

  const { ownerUserId, logConfigurationId: configId } = await assertAccessibleLogConfiguration(
    userId,
    logConfigurationId
  )

  const templates = await ensureRemarksQuickNoteTemplates(moduleSlug)
  await remarksQuickNoteRepo.deleteUserRemarksQuickNotes(ownerUserId, configId, moduleSlug)
  const rows = await remarksQuickNoteRepo.createUserRemarksQuickNotesFromTemplates(
    ownerUserId,
    configId,
    moduleSlug,
    templates
  )
  return rows.map(remarksQuickNoteRepo.toRemarksQuickNoteDTO)
}
