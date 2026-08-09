import {
  parseInsituTestTypeDTOList,
  parseInsituUnitSettingDTOList,
  type InsituTestTypeDTO,
  type InsituUnitSettingDTO,
} from "./insituTestTypeTypes"
import insituTestTypeOptionsDefaults from "../data/insituTestTypeOptionsDefaults.json"
import insituUnitSettingOptionsDefaults from "../data/insituUnitSettingOptionsDefaults.json"

const TEST_TYPE_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "insitu-tests-usa": insituTestTypeOptionsDefaults,
}

const UNIT_SETTING_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "insitu-tests-usa": insituUnitSettingOptionsDefaults,
}

export function getModuleInsituTestTypeDefaults(moduleSlug: string): InsituTestTypeDTO[] {
  const raw = TEST_TYPE_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseInsituTestTypeDTOList(raw)
}

export function moduleHasInsituTestTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in TEST_TYPE_DEFAULTS_BY_MODULE
}

export function getModuleInsituUnitSettingDefaults(
  moduleSlug: string
): InsituUnitSettingDTO[] {
  const raw = UNIT_SETTING_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseInsituUnitSettingDTOList(raw)
}

export function moduleHasInsituUnitSettingDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in UNIT_SETTING_DEFAULTS_BY_MODULE
}
