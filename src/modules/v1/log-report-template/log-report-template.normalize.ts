import type { Prisma } from "../../../generated/prisma/client"
import {
  cloneDcpGraphChartSeries,
  DCP_GRAPH_COLUMN_CODE,
  DCP_TEST_SOURCE_GROUP,
  DCP_TEST_SOURCE_VALUE,
} from "../../../shared/data/logReportCatalogDefaults"
import type { LogReportChartDefaultSeed } from "../../../shared/data/logReportCatalogDefaults"

type JsonRecord = Record<string, unknown>

export type LogReportNormalizeOptions = {
  dcpGraph?: LogReportChartDefaultSeed
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function columnLabel(column: JsonRecord): string {
  return `${String(column.text ?? "")} ${String(column.code ?? "")}`.toLowerCase()
}

function isDcpGraphColumn(column: JsonRecord): boolean {
  const label = columnLabel(column)
  if (label.includes("dcp graph") || label.includes("dcp")) return true
  if (column.column_type === "chart" && label.includes("dcp")) return true
  return false
}

function isNamedColumn(column: JsonRecord, code: string, text: string): boolean {
  const columnCode = String(column.code ?? "").trim().toLowerCase()
  const columnText = String(column.text ?? "").trim().toLowerCase()
  return columnCode === code || columnText === text
}

function chartDefaults(options?: LogReportNormalizeOptions): LogReportChartDefaultSeed {
  return (
    options?.dcpGraph ?? {
      chartKey: "dcp_graph",
      columnCode: DCP_GRAPH_COLUMN_CODE,
      columnText: "DCP Graph",
      dataSourceGroup: DCP_TEST_SOURCE_GROUP,
      dataSourceValue: DCP_TEST_SOURCE_VALUE,
      config: cloneDcpGraphChartSeries(undefined, DCP_GRAPH_COLUMN_CODE),
    }
  )
}

function createSeries(defaults: LogReportChartDefaultSeed, columnCode?: string) {
  const code = columnCode?.trim() || defaults.columnCode
  return cloneDcpGraphChartSeries(defaults.config, code)
}

function hasCompleteDcpSeries(column: JsonRecord, defaults: LogReportChartDefaultSeed): boolean {
  const series = Array.isArray(column.chart_data) ? column.chart_data : []
  return series.some((entry) => {
    if (!isRecord(entry)) return false
    const multi = Array.isArray(entry.selectedMultiChartOptions)
      ? entry.selectedMultiChartOptions
      : []
    return multi.some(
      (option) =>
        isRecord(option) &&
        String(option.name ?? "").toUpperCase() === defaults.dataSourceValue.toUpperCase() &&
        String(option.symbol_type ?? "") === "symbol_01" &&
        isRecord(option.column_data_source) &&
        String(option.column_data_source.value ?? "").toUpperCase() ===
          defaults.dataSourceValue.toUpperCase()
    )
  })
}

function patchDcpGraphColumn(
  column: JsonRecord,
  defaults: LogReportChartDefaultSeed
): JsonRecord {
  if (hasCompleteDcpSeries(column, defaults)) return column
  const code = String(column.code ?? "").trim() || defaults.columnCode
  const series = createSeries(defaults, code)
  const existing = Array.isArray(column.chart_data) ? column.chart_data : []

  if (existing.length > 0) {
    const nextSeries = existing.map((entry) => {
      if (!isRecord(entry)) return entry
      const source = entry.column_data_source
      const isDcp =
        (isRecord(source) &&
          String(source.value ?? "").toUpperCase() === defaults.dataSourceValue.toUpperCase()) ||
        (Array.isArray(entry.selectedMultiChartOptions) &&
          entry.selectedMultiChartOptions.some(
            (option) =>
              isRecord(option) &&
              String(option.name ?? "").toUpperCase() === defaults.dataSourceValue.toUpperCase()
          ))
      if (!isDcp) return entry
      return {
        ...series,
        ...entry,
        column_data_source: {
          group: defaults.dataSourceGroup,
          value: defaults.dataSourceValue,
        },
        selectedMultiChartOptions: series.selectedMultiChartOptions,
        symbol_visibility: true,
        line_visibility: true,
        axis_bounds_min: entry.axis_bounds_min ?? 0,
        axis_bounds_max: "25",
        axis_units_minor: entry.axis_units_minor ?? "5",
      }
    })
    const hasDcp = nextSeries.some(
      (entry) =>
        isRecord(entry) &&
        isRecord(entry.column_data_source) &&
        String(entry.column_data_source.value ?? "").toUpperCase() ===
          defaults.dataSourceValue.toUpperCase()
    )
    return {
      ...column,
      column_type: "chart",
      displayType: "Chart",
      chart_data: hasDcp ? nextSeries : [...nextSeries, series],
    }
  }

  return {
    ...column,
    column_type: "chart",
    displayType: "Chart",
    chart_data: [series],
  }
}

function subsurfaceTextColumn(text: string, code: string, sourceValue: string): JsonRecord {
  return {
    text,
    code,
    hidden: false,
    visibility: true,
    width: 5,
    column_type: "text",
    column_data_source: {
      group: "all_subsurface_profiles",
      value: sourceValue,
    },
    default_column: true,
    fontSize: 8,
    name_vertical: true,
    vertical_text: false,
    name_repeat: false,
  }
}

function insertAfter(
  columns: JsonRecord[],
  matcher: (column: JsonRecord) => boolean,
  column: JsonRecord
): JsonRecord[] {
  const index = columns.findIndex(matcher)
  if (index < 0) return [...columns, column]
  return [...columns.slice(0, index + 1), column, ...columns.slice(index + 1)]
}

export function normalizeLogReportTemplateConfig(
  value: unknown,
  logType: "borelog" | "corelog",
  options?: LogReportNormalizeOptions
): { config: Prisma.InputJsonValue; changed: boolean } {
  if (!isRecord(value)) {
    return { config: (value as Prisma.InputJsonValue) ?? {}, changed: false }
  }

  const columns = Array.isArray(value.columnData)
    ? value.columnData.filter(isRecord).map((column) => ({ ...column }))
    : []

  if (columns.length === 0) {
    return { config: value as Prisma.InputJsonValue, changed: false }
  }

  const dcpGraph = chartDefaults(options)
  let changed = false
  let nextColumns = columns.map((column) => {
    if (!isDcpGraphColumn(column)) return column
    const patched = patchDcpGraphColumn(column, dcpGraph)
    if (JSON.stringify(patched) !== JSON.stringify(column)) changed = true
    return patched
  })

  if (logType === "borelog" && !nextColumns.some(isDcpGraphColumn)) {
    const series = createSeries(dcpGraph)
    const dcpColumn: JsonRecord = {
      text: dcpGraph.columnText,
      code: dcpGraph.columnCode,
      hidden: false,
      visibility: true,
      width: "12",
      column_type: "chart",
      default_column: false,
      name_vertical: false,
      fontSize: 8,
      column_data_source: { group: "", value: "" },
      displayType: "Chart",
      chart_data: [series],
    }
    nextColumns = insertAfter(
      nextColumns,
      (column) => isNamedColumn(column, "drilling method", "drilling method"),
      dcpColumn
    )
    changed = true
  }

  const ensureSubsurfaceColumn = (text: string, code: string, sourceValue: string) => {
    const index = nextColumns.findIndex((column) => isNamedColumn(column, code, text.toLowerCase()))
    if (index >= 0) {
      const current = nextColumns[index]
      const source = isRecord(current.column_data_source) ? current.column_data_source : {}
      if (String(source.value ?? "") !== sourceValue) {
        nextColumns[index] = {
          ...current,
          column_data_source: {
            group: "all_subsurface_profiles",
            value: sourceValue,
          },
        }
        changed = true
      }
      return
    }
    const created = subsurfaceTextColumn(text, code, sourceValue)
    const descriptionIndex = nextColumns.findIndex((column) =>
      isNamedColumn(column, "material description", "material description")
    )
    if (descriptionIndex >= 0) {
      nextColumns.splice(descriptionIndex + 1, 0, created)
    } else {
      nextColumns.push(created)
    }
    changed = true
  }

  if (logType === "borelog") {
    ensureSubsurfaceColumn("Consistency", "consistency", "consistency")
    ensureSubsurfaceColumn("Moisture", "moisture", "moisture")

    const remarksIndex = nextColumns.findIndex((column) =>
      isNamedColumn(column, "remarks", "remarks")
    )
    if (remarksIndex >= 0) {
      const remarksWidth = Number(nextColumns[remarksIndex].width)
      if (!Number.isFinite(remarksWidth) || remarksWidth !== 10) {
        nextColumns[remarksIndex] = { ...nextColumns[remarksIndex], width: 10 }
        changed = true
      }
    }
  }

  if (!changed) {
    return { config: value as Prisma.InputJsonValue, changed: false }
  }

  return {
    config: {
      ...value,
      columnData: nextColumns,
    } as Prisma.InputJsonValue,
    changed: true,
  }
}
