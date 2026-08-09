import {
  DEFAULT_COMMON_CONFIG_MODULES,
  REMOVED_CONFIG_MODULE_SLUGS,
} from "./configModuleCatalog"

export const CONFIG_MODULE_IDS = [
  ...DEFAULT_COMMON_CONFIG_MODULES.map((module) => module.slug),
] as const

export type ConfigModuleId = (typeof CONFIG_MODULE_IDS)[number]

const VALID_MODULE_IDS = new Set<string>(CONFIG_MODULE_IDS)
const REMOVED_MODULE_IDS = new Set<string>(REMOVED_CONFIG_MODULE_SLUGS)

const MODULE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Accept known common modules and custom user-module slugs.
 * Always strips retired modules (CPT, MWD, Ground Water Monitoring).
 */
export function parseEnabledModuleIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()

  return value.filter((entry): entry is string => {
    if (typeof entry !== "string") return false
    const slug = entry.trim()
    if (!slug || seen.has(slug) || REMOVED_MODULE_IDS.has(slug)) return false
    if (!MODULE_SLUG_PATTERN.test(slug)) return false
    // Known common modules or any valid kebab slug (user modules).
    if (!VALID_MODULE_IDS.has(slug) && slug.length > 100) return false
    seen.add(slug)
    return true
  })
}

export function serializeEnabledModuleIds(moduleIds: unknown): string[] {
  return parseEnabledModuleIds(moduleIds)
}

export function isKnownConfigModuleId(id: string): id is ConfigModuleId {
  return VALID_MODULE_IDS.has(id)
}
