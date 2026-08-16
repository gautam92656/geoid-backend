import {
  parseApertureColorDTOList,
  parseApertureMineralDTOList,
  parseCoreDefectTypeDTOList,
  parseInfillMaterialDTOList,
  parseSurfaceShapeDTOList,
  parseSurfaceRoughnessDTOList,
  parseDefectOpennessDTOList,
  parseDefectCoatingDTOList,
  type ApertureColorDTO,
  type ApertureMineralDTO,
  type CoreDefectTypeDTO,
  type InfillMaterialDTO,
  type SurfaceShapeDTO,
  type SurfaceRoughnessDTO,
  type DefectOpennessDTO,
  type DefectCoatingDTO,
} from "./coreLoggingOptionTypes"
import coreDefectTypeOptionsDefaults from "../data/coreDefectTypeOptionsDefaults.json"
import apertureColorOptionsDefaults from "../data/apertureColorOptionsDefaults.json"
import apertureMineralOptionsDefaults from "../data/apertureMineralOptionsDefaults.json"
import infillMaterialOptionsDefaults from "../data/infillMaterialOptionsDefaults.json"
import surfaceShapeOptionsDefaults from "../data/surfaceShapeOptionsDefaults.json"
import surfaceRoughnessOptionsDefaults from "../data/surfaceRoughnessOptionsDefaults.json"
import defectOpennessOptionsDefaults from "../data/defectOpennessOptionsDefaults.json"
import defectCoatingOptionsDefaults from "../data/defectCoatingOptionsDefaults.json"

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

const SURFACE_SHAPE_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": surfaceShapeOptionsDefaults,
}

const SURFACE_ROUGHNESS_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": surfaceRoughnessOptionsDefaults,
}

const DEFECT_OPENNESS_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": defectOpennessOptionsDefaults,
}

const DEFECT_COATING_DEFAULTS_BY_MODULE: Record<string, unknown> = {
  "core-logging": defectCoatingOptionsDefaults,
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

export function getModuleSurfaceShapeDefaults(moduleSlug: string): SurfaceShapeDTO[] {
  const raw = SURFACE_SHAPE_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseSurfaceShapeDTOList(raw)
}

export function moduleHasSurfaceShapeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in SURFACE_SHAPE_DEFAULTS_BY_MODULE
}

export function getModuleSurfaceRoughnessDefaults(moduleSlug: string): SurfaceRoughnessDTO[] {
  const raw = SURFACE_ROUGHNESS_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseSurfaceRoughnessDTOList(raw)
}

export function moduleHasSurfaceRoughnessDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in SURFACE_ROUGHNESS_DEFAULTS_BY_MODULE
}

export function getModuleDefectOpennessDefaults(moduleSlug: string): DefectOpennessDTO[] {
  const raw = DEFECT_OPENNESS_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseDefectOpennessDTOList(raw)
}

export function moduleHasDefectOpennessDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in DEFECT_OPENNESS_DEFAULTS_BY_MODULE
}

export function getModuleDefectCoatingDefaults(moduleSlug: string): DefectCoatingDTO[] {
  const raw = DEFECT_COATING_DEFAULTS_BY_MODULE[moduleSlug.trim()]
  if (!raw) return []
  return parseDefectCoatingDTOList(raw)
}

export function moduleHasDefectCoatingDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in DEFECT_COATING_DEFAULTS_BY_MODULE
}
