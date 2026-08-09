import {
  parseWorkflowSettings,
  type WorkflowSettings,
} from "./configModuleSettings"
import subsurfacesWorkflowDefaults from "../data/subsurfacesWorkflowDefaults.json"

const DEFAULTS_BY_MODULE_SLUG: Record<string, unknown> = {
  subsurfaces: subsurfacesWorkflowDefaults,
}

/** Built-in workflow + classification defaults for a module template slug. */
export function getModuleWorkflowDefaults(
  moduleSlug: string
): WorkflowSettings | null {
  const raw = DEFAULTS_BY_MODULE_SLUG[moduleSlug.trim()]
  if (!raw) return null
  return parseWorkflowSettings(raw)
}

export function moduleHasWorkflowDefaults(moduleSlug: string): boolean {
  return moduleSlug.trim() in DEFAULTS_BY_MODULE_SLUG
}
