import {
  parseApertureColorDTOList,
  parseApertureMineralDTOList,
  parseCoreDefectTypeDTOList,
  parseInfillMaterialDTOList,
  type ApertureColorDTO,
  type ApertureMineralDTO,
  type CoreDefectTypeDTO,
  type InfillMaterialDTO,
} from "./coreLoggingOptionTypes"
import coreDefectTypeOptionsDefaults from "../data/coreDefectTypeOptionsDefaults.json"
import apertureColorOptionsDefaults from "../data/apertureColorOptionsDefaults.json"
import apertureMineralOptionsDefaults from "../data/apertureMineralOptionsDefaults.json"
import infillMaterialOptionsDefaults from "../data/infillMaterialOptionsDefaults.json"

const CORE_DEFECT_TYPE_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": coreDefectTypeOptionsDefaults,
}

const APERTURE_COLOR_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": apertureColorOptionsDefaults,
}

const APERTURE_MINERAL_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": apertureMineralOptionsDefaults,
}

const INFILL_MATERIAL_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": infillMaterialOptionsDefaults,
}

export function getModuleCoreDefectTypeDefaults(moduleSlug: string): CoreDefectTypeDTO[] {
  const raw = CORE_DEFECT_TYPE_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseCoreDefectTypeDTOList(raw)
}

export function moduleHasCoreDefectTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in CORE_DEFECT_TYPE_DEFAULTS_BY_MODULE
}

export function getModuleApertureColorDefaults(moduleSlug: string): ApertureColorDTO[] {
  const raw = APERTURE_COLOR_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseApertureColorDTOList(raw)
}

export function moduleHasApertureColorDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in APERTURE_COLOR_DEFAULTS_BY_MODULE
}

export function getModuleApertureMineralDefaults(moduleSlug: string): ApertureMineralDTO[] {
  const raw = APERTURE_MINERAL_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseApertureMineralDTOList(raw)
}

export function moduleHasApertureMineralDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in APERTURE_MINERAL_DEFAULTS_BY_MODULE
}

export function getModuleInfillMaterialDefaults(moduleSlug: string): InfillMaterialDTO[] {
  const raw = INFILL_MATERIAL_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseInfillMaterialDTOList(raw)
}

export function moduleHasInfillMaterialDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in INFILL_MATERIAL_DEFAULTS_BY_MODULE
}
