import {
  parseDataTypeOptionDTOList,
  type DataTypeOptionDTO,
  type UserManagedDataTypeId,
} from "./dataTypeOptionTypes"
import subsurfacesRockTypeOptionsDefaults from "../data/subsurfacesRockTypeOptionsDefaults.json"
import subsurfacesNonSoilTypeOptionsDefaults from "../data/subsurfacesNonSoilTypeOptionsDefaults.json"
import subsurfacesRockTextureOptionsDefaults from "../data/subsurfacesRockTextureOptionsDefaults.json"
import subsurfacesFinishingReasonOptionsDefaults from "../data/subsurfacesFinishingReasonOptionsDefaults.json"
import subsurfacesFinishTextOptionsDefaults from "../data/subsurfacesFinishTextOptionsDefaults.json"
import subsurfacesGeomodalLayerOptionsDefaults from "../data/subsurfacesGeomodalLayerOptionsDefaults.json"
import subsurfacesColorOptionsDefaults from "../data/subsurfacesColorOptionsDefaults.json"

const DEFAULTS_BY_MODULE_AND_TYPE: Record<
  string,
  Partial<Record<UserManagedDataTypeId, unknown>>
> = {
  subsurfaces: {
    rock_type: subsurfacesRockTypeOptionsDefaults,
    non_soil_type: subsurfacesNonSoilTypeOptionsDefaults,
    rock_texture: subsurfacesRockTextureOptionsDefaults,
    "finish-reasons": subsurfacesFinishingReasonOptionsDefaults,
    "finish-texts": subsurfacesFinishTextOptionsDefaults,
    geomodal_layer: subsurfacesGeomodalLayerOptionsDefaults,
    colors: subsurfacesColorOptionsDefaults,
  },
}

export function getModuleDataTypeOptionDefaults(
  moduleSlug: string,
  dataTypeId: UserManagedDataTypeId
): DataTypeOptionDTO[] {
  const raw = DEFAULTS_BY_MODULE_AND_TYPE[moduleSlug.trim()]?.[dataTypeId]
  if (!raw) return []
  return parseDataTypeOptionDTOList(raw)
}

export function moduleHasDataTypeOptionDefaults(
  moduleSlug: string,
  dataTypeId: string
): boolean {
  const byModule = DEFAULTS_BY_MODULE_AND_TYPE[moduleSlug.trim()]
  if (!byModule) return false
  return dataTypeId in byModule
}

export function listSeededDataTypeIdsForModule(
  moduleSlug: string
): UserManagedDataTypeId[] {
  const byModule = DEFAULTS_BY_MODULE_AND_TYPE[moduleSlug.trim()]
  if (!byModule) return []
  return Object.keys(byModule) as UserManagedDataTypeId[]
}
