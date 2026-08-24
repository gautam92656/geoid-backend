import {
  cloneDcpGraphChartSeries,
  DCP_GRAPH_CHART_KEY,
  LOG_REPORT_CHART_DEFAULT_SEEDS,
  LOG_REPORT_FIELD_CODE_SEEDS,
  type LogReportChartDefaultSeed,
  type LogReportFieldCodeGroup,
  type LogReportFieldCodeSeed,
} from "../../../shared/data/logReportCatalogDefaults"
import * as catalogRepo from "./log-report-template.catalog.repository"

export type LogReportFieldCodeRow = LogReportFieldCodeSeed

export type LogReportCatalog = {
  fieldCodes: LogReportFieldCodeRow[]
  chartDefaults: LogReportChartDefaultSeed[]
  dcpGraph: LogReportChartDefaultSeed
}

const CACHE_TTL_MS = 60_000
let cache: { value: LogReportCatalog; expiresAt: number } | null = null

function isFieldCodeGroup(value: string): value is LogReportFieldCodeGroup {
  return value === "density" || value === "consistency" || value === "moisture"
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === "string")
}

function catalogFromSeeds(): LogReportCatalog {
  const dcpGraph = LOG_REPORT_CHART_DEFAULT_SEEDS.find(
    (row) => row.chartKey === DCP_GRAPH_CHART_KEY
  )
  if (!dcpGraph) {
    throw new Error("Log report catalog seed is missing the DCP graph default")
  }
  return {
    fieldCodes: LOG_REPORT_FIELD_CODE_SEEDS.map((row) => ({ ...row })),
    chartDefaults: LOG_REPORT_CHART_DEFAULT_SEEDS.map((row) => ({
      ...row,
      config: cloneDcpGraphChartSeries(row.config, row.columnCode),
    })),
    dcpGraph: {
      ...dcpGraph,
      config: cloneDcpGraphChartSeries(dcpGraph.config, dcpGraph.columnCode),
    },
  }
}

function toCatalogDto(
  fieldRows: Awaited<ReturnType<typeof catalogRepo.findActiveFieldCodes>>,
  chartRows: Awaited<ReturnType<typeof catalogRepo.findActiveChartDefaults>>
): LogReportCatalog | null {
  const fieldCodes = fieldRows
    .filter((row) => isFieldCodeGroup(row.group))
    .map((row) => ({
      group: row.group as LogReportFieldCodeGroup,
      code: row.code,
      name: row.name,
      aliases: asStringArray(row.aliases),
    }))

  const chartDefaults = chartRows.map((row) => ({
    chartKey: row.chartKey,
    columnCode: row.columnCode,
    columnText: row.columnText,
    dataSourceGroup: row.dataSourceGroup,
    dataSourceValue: row.dataSourceValue,
    config: cloneDcpGraphChartSeries(row.config, row.columnCode),
  }))

  const dcpGraph =
    chartDefaults.find((row) => row.chartKey === DCP_GRAPH_CHART_KEY) ??
    catalogFromSeeds().dcpGraph

  if (fieldCodes.length === 0) return null

  return { fieldCodes, chartDefaults, dcpGraph }
}

export async function getLogReportCatalog(): Promise<LogReportCatalog> {
  if (cache && cache.expiresAt > Date.now()) return cache.value

  try {
    const [fieldRows, chartRows] = await Promise.all([
      catalogRepo.findActiveFieldCodes(),
      catalogRepo.findActiveChartDefaults(),
    ])
    const fromDb = toCatalogDto(fieldRows, chartRows)
    const value = fromDb ?? catalogFromSeeds()
    cache = { value, expiresAt: Date.now() + CACHE_TTL_MS }
    return value
  } catch {
    const value = catalogFromSeeds()
    cache = { value, expiresAt: Date.now() + CACHE_TTL_MS }
    return value
  }
}

export function toLogReportCatalogPayload(catalog: LogReportCatalog) {
  return {
    fieldCodes: catalog.fieldCodes,
    chartDefaults: catalog.chartDefaults.map((row) => ({
      chartKey: row.chartKey,
      columnCode: row.columnCode,
      columnText: row.columnText,
      dataSourceGroup: row.dataSourceGroup,
      dataSourceValue: row.dataSourceValue,
      config: row.config,
    })),
  }
}
