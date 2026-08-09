import {
  parseDrillingCasingDTOList,
  parseDrillingObservationDTOList,
  parseDrillingResistanceDTOList,
  parseDrillingTypeDTOList,
  type DrillingCasingDTO,
  type DrillingObservationDTO,
  type DrillingResistanceDTO,
  type DrillingTypeDTO,
} from "./drillingObservationsOptionTypes"
import drillingTypeOptionsDefaults from "../data/drillingTypeOptionsDefaults.json"
import drillingResistanceOptionsDefaults from "../data/drillingResistanceOptionsDefaults.json"
import drillingObservationOptionsDefaults from "../data/drillingObservationOptionsDefaults.json"
import drillingCasingOptionsDefaults from "../data/drillingCasingOptionsDefaults.json"

const MODULE_SLUG = "drilling-observations"

export function getModuleDrillingTypeDefaults(moduleSlug: string): DrillingTypeDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseDrillingTypeDTOList(drillingTypeOptionsDefaults)
}

export function moduleHasDrillingTypeDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleDrillingResistanceDefaults(
  moduleSlug: string
): DrillingResistanceDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseDrillingResistanceDTOList(drillingResistanceOptionsDefaults)
}

export function moduleHasDrillingResistanceDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleDrillingObservationDefaults(
  moduleSlug: string
): DrillingObservationDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseDrillingObservationDTOList(drillingObservationOptionsDefaults)
}

export function moduleHasDrillingObservationDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}

export function getModuleDrillingCasingDefaults(moduleSlug: string): DrillingCasingDTO[] {
  if (moduleSlug.trim() !== MODULE_SLUG) return []
  return parseDrillingCasingDTOList(drillingCasingOptionsDefaults)
}

export function moduleHasDrillingCasingDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() === MODULE_SLUG
}
