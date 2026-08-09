import {
  parseLabTestTypeDTOList,
  type LabTestTypeDTO,
} from "./labTestsOptionTypes"
import labTestTypeOptionsDefaults from "../data/labTestTypeOptionsDefaults.json"

const MODULE_SLUG = "lab-tests"

export function getModuleLabTestTypeDefaults(moduleSlug: string): LabTestTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseLabTestTypeDTOList(labTestTypeOptionsDefaults)
}

export function moduleHasLabTestTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}
