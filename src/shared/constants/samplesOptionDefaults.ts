import {
  parseSampleTypeDTOList,
  type SampleTypeDTO,
} from "./samplesOptionTypes"
import sampleTypeOptionsDefaults from "../data/sampleTypeOptionsDefaults.json"

const MODULE_SLUG = "samples"

export function getModuleSampleTypeDefaults(moduleSlug: string): SampleTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseSampleTypeDTOList(sampleTypeOptionsDefaults)
}

export function moduleHasSampleTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}
