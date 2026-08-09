import type { LogReportTemplate } from "../../../generated/prisma/client"

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => String(entry)).filter(Boolean)
}

function asConfigObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

/** Frontend-facing DTO (id as string for route compatibility). */
export function toLogReportTemplateDTO(template: LogReportTemplate) {
  return {
    id: String(template.id),
    name: template.name,
    logType: template.logType,
    isDefault: template.isDefault,
    createdAt: template.createdAt.toISOString().slice(0, 10),
    updatedAt: template.updatedAt.toISOString(),
    logConfigurationIds: asStringArray(template.logConfigurationIds),
    config: asConfigObject(template.config),
    templateVersion: template.templateVersion,
    sortOrder: template.sortOrder,
  }
}

export function toGroupedList(templates: LogReportTemplate[]) {
  const mapped = templates.map(toLogReportTemplateDTO)
  return {
    borelog: mapped.filter((template) => template.logType === "borelog"),
    corelog: mapped.filter((template) => template.logType === "corelog"),
  }
}
