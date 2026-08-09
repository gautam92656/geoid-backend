import {
  parseLabTestPresetDTOList,
  type LabTestPresetDTO,
} from "./labTestPresetOptionTypes"
import labTestPresetOptionsDefaults from "../data/labTestPresetOptionsDefaults.json"

const MODULE_SLUG = "lab-tests"

export function getModuleLabTestPresetDefaults(moduleSlug: string): LabTestPresetDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseLabTestPresetDTOList(labTestPresetOptionsDefaults)
}

export function moduleHasLabTestPresetDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}
