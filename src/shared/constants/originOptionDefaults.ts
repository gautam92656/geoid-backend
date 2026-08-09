import {
  parseOriginOptionDTOList,
  type OriginOptionDTO,
} from "./originOptionTypes"
import subsurfacesOriginOptionsDefaults from "../data/subsurfacesOriginOptionsDefaults.json"

const DEFAULTS_BY_MODULE_SLUG: Record<string, unknown> = {
  subsurfaces: subsurfacesOriginOptionsDefaults,
}

/** Built-in origin option defaults for a module template slug. */
export function getModuleOriginOptionDefaults(
  moduleSlug: string
): OriginOptionDTO[] {
  const raw = DEFAULTS_BY_MODULE_SLUG[moduleSlug.trim()]
  if (!raw) return []
  return parseOriginOptionDTOList(raw)
}

export function moduleHasOriginOptionDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in DEFAULTS_BY_MODULE_SLUG
}
