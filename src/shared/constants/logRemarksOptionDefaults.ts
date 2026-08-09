import {
  parseRemarkTypeDTOList,
  parseRemarksQuickNoteDTOList,
  type RemarkTypeDTO,
  type RemarksQuickNoteDTO,
} from "./logRemarksOptionTypes"
import remarkTypeOptionsDefaults from "../data/remarkTypeOptionsDefaults.json"
import remarksQuickNoteOptionsDefaults from "../data/remarksQuickNoteOptionsDefaults.json"

const REMARK_TYPE_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "log-remarks": remarkTypeOptionsDefaults,
}

const REMARKS_QUICK_NOTE_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "log-remarks": remarksQuickNoteOptionsDefaults,
}

export function getModuleRemarkTypeDefaults(moduleSlug: string): RemarkTypeDTO[] {
  const raw = REMARK_TYPE_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseRemarkTypeDTOList(raw)
}

export function moduleHasRemarkTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in REMARK_TYPE_DEFAULTS_BY_MODULE
}

export function getModuleRemarksQuickNoteDefaults(moduleSlug: string): RemarksQuickNoteDTO[] {
  const raw = REMARKS_QUICK_NOTE_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseRemarksQuickNoteDTOList(raw)
}

export function moduleHasRemarksQuickNoteDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in REMARKS_QUICK_NOTE_DEFAULTS_BY_MODULE
}
