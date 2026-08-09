import {
  parseWellTypeDTOList,
  type WellTypeDTO,
  parseWellCasingTypeDTOList,
  type WellCasingTypeDTO,
  parseWellCasingTopDTOList,
  type WellCasingTopDTO,
  parseWellCoverTypeDTOList,
  type WellCoverTypeDTO,
  parseWellProbeTypeDTOList,
  type WellProbeTypeDTO,
  parseWellBackfillTypeDTOList,
  type WellBackfillTypeDTO,
  parseWellDefaultWellIdDTOList,
  type WellDefaultWellIdDTO,
} from "./wellLogsOptionTypes"
import wellTypeOptionsDefaults from "../data/wellTypeOptionsDefaults.json"
import wellCasingTypeOptionsDefaults from "../data/wellCasingTypeOptionsDefaults.json"
import wellCasingTopOptionsDefaults from "../data/wellCasingTopOptionsDefaults.json"
import wellCoverTypeOptionsDefaults from "../data/wellCoverTypeOptionsDefaults.json"
import wellProbeTypeOptionsDefaults from "../data/wellProbeTypeOptionsDefaults.json"
import wellBackfillTypeOptionsDefaults from "../data/wellBackfillTypeOptionsDefaults.json"
import wellDefaultWellIdOptionsDefaults from "../data/wellDefaultWellIdOptionsDefaults.json"

const MODULE_SLUG = "well-logs"

export function getModuleWellTypeDefaults(
  moduleSlug: string
): WellTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellTypeDTOList(wellTypeOptionsDefaults)
}

export function moduleHasWellTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleWellCasingTypeDefaults(
  moduleSlug: string
): WellCasingTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellCasingTypeDTOList(wellCasingTypeOptionsDefaults)
}

export function moduleHasWellCasingTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleWellCasingTopDefaults(
  moduleSlug: string
): WellCasingTopDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellCasingTopDTOList(wellCasingTopOptionsDefaults)
}

export function moduleHasWellCasingTopDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleWellCoverTypeDefaults(
  moduleSlug: string
): WellCoverTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellCoverTypeDTOList(wellCoverTypeOptionsDefaults)
}

export function moduleHasWellCoverTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleWellProbeTypeDefaults(
  moduleSlug: string
): WellProbeTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellProbeTypeDTOList(wellProbeTypeOptionsDefaults)
}

export function moduleHasWellProbeTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleWellBackfillTypeDefaults(
  moduleSlug: string
): WellBackfillTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellBackfillTypeDTOList(wellBackfillTypeOptionsDefaults)
}

export function moduleHasWellBackfillTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleWellDefaultWellIdDefaults(
  moduleSlug: string
): WellDefaultWellIdDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWellDefaultWellIdDTOList(wellDefaultWellIdOptionsDefaults)
}

export function moduleHasWellDefaultWellIdDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

