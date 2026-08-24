import type { LogReportTemplateLogType } from "../../../generated/prisma/client"
import type { Prisma } from "../../../generated/prisma/client"
import builderConfiguration from "./data/builder-configuration.json"

type CatalogColumn = Record<string, unknown>

type BuilderConfigurationCatalog = {
  columns: CatalogColumn[]
  corelogColumns: CatalogColumn[]
  defaultCopyColumns: CatalogColumn[]
  defaultCopyCorelogColumns: CatalogColumn[]
  [key: string]: unknown
}

const catalog = builderConfiguration as BuilderConfigurationCatalog

export function readBuilderConfigurationCatalog() {
  return {
    columns: catalog.columns ?? [],
    corelogColumns: catalog.corelogColumns ?? [],
    defaultCopyColumns: catalog.defaultCopyColumns ?? [],
    defaultCopyCorelogColumns: catalog.defaultCopyCorelogColumns ?? [],
    footerTemplate01: catalog.footerTemplate01 ?? [],
    footerTemplate02: catalog.footerTemplate02 ?? [],
    footerTemplate03: catalog.footerTemplate03 ?? [],
    footerTemplate03Bottom: catalog.footerTemplate03Bottom ?? [],
    footerTemplate04: catalog.footerTemplate04 ?? [],
    footerTemplate06: catalog.footerTemplate06 ?? [],
    footerTemplate06Bottom: catalog.footerTemplate06Bottom ?? [],
    footerTemplate08: catalog.footerTemplate08 ?? [],
    footerTemplate09: catalog.footerTemplate09 ?? [],
    footerTemplate10: catalog.footerTemplate10 ?? [],
  }
}

export function createDefaultConfig(logType: LogReportTemplateLogType): Prisma.InputJsonValue {
  const columns =
    logType === "corelog"
      ? structuredClone(catalog.corelogColumns ?? [])
      : structuredClone(catalog.columns ?? [])

  return {
    columnData: columns,
    name_config: {
      fontSize: 8,
      fontFamily: "sans-serif",
      name_text_font_bold: true,
      name_text_font_italic: false,
      name_text_wrap: true,
      name_text_align_type: "text_align_center",
      name_text_vertical_align: "middle",
    },
    depth_per_page: logType === "corelog" ? 1 : 2,
    text_config: { fontFamily: "sans-serif" },
    templatePageSizeId: "A4",
    template_page_size: "A4",
    template_orientation: null,
    hide_all_column_headings: false,
    header_position: "top",
    finish_log_target_column_id: "material description",
    finish_log_wrap_at_column_boundary: true,
    finish_text_from: "log_configuration",
    extend_column_boundaries_type: "bottom",
    hide_watermark: false,
    fence_stick_width: 80,
  } as Prisma.InputJsonValue
}

export function isEmptyConfig(value: unknown): boolean {
  if (!value || typeof value !== "object") return true
  const record = value as Record<string, unknown>
  if (Object.keys(record).length === 0) return true
  return !Array.isArray(record.columnData) || record.columnData.length === 0
}
