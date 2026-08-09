import {
  parseWaterObservationTypeDTOList,
  type WaterObservationTypeDTO,
} from "./waterObservationsOptionTypes"
import waterObservationTypeOptionsDefaults from "../data/waterObservationTypeOptionsDefaults.json"

const MODULE_SLUG = "water-observations"

export function getModuleWaterObservationTypeDefaults(
  moduleSlug: string
): WaterObservationTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseWaterObservationTypeDTOList(waterObservationTypeOptionsDefaults)
}

export function moduleHasWaterObservationTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}
