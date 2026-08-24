import {
  cloneDcpGraphChartSeries,
  DCP_GRAPH_COLUMN_CODE,
  DCP_TEST_SOURCE_GROUP,
  DCP_TEST_SOURCE_VALUE,
  LOG_REPORT_FIELD_CODE_SEEDS,
  type LogReportFieldCodeGroup,
  type LogReportFieldCodeSeed,
} from "../data/logReportCatalogDefaults"

export type { LogReportFieldCodeGroup, LogReportFieldCodeSeed }
export { cloneDcpGraphChartSeries, DCP_GRAPH_COLUMN_CODE, DCP_TEST_SOURCE_GROUP, DCP_TEST_SOURCE_VALUE }

type CodeEntry = {
  code: string
  aliases: string[]
}

function entriesByGroup(
  catalog: readonly LogReportFieldCodeSeed[],
  group: LogReportFieldCodeGroup
): CodeEntry[] {
  return catalog
    .filter((row) => row.group === group)
    .map((row) => ({ code: row.code, aliases: row.aliases }))
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/≈/g, "=")
    .replace(/\s+/g, " ")
}

function lookupInEntries(token: string, entries: readonly CodeEntry[]): string | null {
  const normalized = normalizeToken(token)
  if (!normalized) return null

  for (const entry of entries) {
    if (normalizeToken(entry.code) === normalized) return entry.code
  }

  const ranked = entries
    .flatMap((entry) =>
      entry.aliases.map((alias) => ({ code: entry.code, alias: normalizeToken(alias) }))
    )
    .sort((a, b) => b.alias.length - a.alias.length)

  for (const entry of ranked) {
    if (entry.alias === normalized) return entry.code
  }
  return null
}

export function groupForWorkflowStep(step: {
  name?: string
  fieldName?: string
  databaseField?: string
}): LogReportFieldCodeGroup | null {
  const blob = `${step.fieldName ?? ""} ${step.name ?? ""} ${step.databaseField ?? ""}`.toLowerCase()
  if (blob.includes("moist")) return "moisture"
  if (blob.includes("densit")) return "density"
  if (blob.includes("consist") || blob.includes("stiff")) return "consistency"
  return null
}

export function resolveLogReportFieldCode(
  raw: string,
  group?: LogReportFieldCodeGroup | null,
  catalog: readonly LogReportFieldCodeSeed[] = LOG_REPORT_FIELD_CODE_SEEDS
): string {
  const token = raw.trim()
  if (!token) return ""

  const groups: LogReportFieldCodeGroup[] = group
    ? [group]
    : ["consistency", "density", "moisture"]

  for (const next of groups) {
    const code = lookupInEntries(token, entriesByGroup(catalog, next))
    if (code) return code
  }
  return token
}

export type WorkflowOptionLike = {
  name?: string
  value?: string
  abbreviation?: string
}

export type WorkflowStepLike = {
  name?: string
  fieldName?: string
  databaseField?: string
  options?: WorkflowOptionLike[]
}

function isKnownCode(
  token: string,
  group: LogReportFieldCodeGroup,
  catalog: readonly LogReportFieldCodeSeed[]
): boolean {
  return resolveLogReportFieldCode(token, group, catalog) === token.trim()
}

export function applyLogReportFieldCodesToSteps<T extends WorkflowStepLike>(
  steps: T[],
  catalog: readonly LogReportFieldCodeSeed[] = LOG_REPORT_FIELD_CODE_SEEDS
): { steps: T[]; changed: boolean } {
  let changed = false
  const next = steps.map((step) => {
    const group = groupForWorkflowStep(step)
    if (!group || !Array.isArray(step.options) || step.options.length === 0) return step

    const options = step.options.map((option) => {
      const fromName = resolveLogReportFieldCode(option.name || "", group, catalog)
      const fromValue = resolveLogReportFieldCode(option.value || "", group, catalog)
      const known = fromName !== (option.name || "").trim() ? fromName : fromValue
      if (!known || known === (option.name || "").trim()) {
        const existing = (option.abbreviation || "").trim()
        if (existing && isKnownCode(existing, group, catalog)) return option
        return option
      }
      if ((option.abbreviation || "").trim() === known) return option
      changed = true
      return { ...option, abbreviation: known }
    })

    return { ...step, options }
  })

  return { steps: next, changed }
}

export function createDcpGraphChartSeries(columnCode = DCP_GRAPH_COLUMN_CODE) {
  return cloneDcpGraphChartSeries(undefined, columnCode)
}
