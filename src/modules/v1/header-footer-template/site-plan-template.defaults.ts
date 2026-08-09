import type { Prisma } from "../../../generated/prisma/client"

type CellInput = {
  row: number
  col: number
  rowSpan?: number
  colSpan?: number
  type?: "empty" | "text" | "image" | "legend"
  content?: string
  imageSrc?: string
  imageFit?: "contain" | "cover" | "fill"
  fontSize?: string
  fontBold?: boolean
  textAlign?: "left" | "center" | "right"
  verticalAlign?: "top" | "middle" | "bottom"
  fontFamily?: string
  borderTop?: boolean
  borderRight?: boolean
  borderBottom?: boolean
  borderLeft?: boolean
}

function cell(input: CellInput) {
  return {
    row: input.row,
    col: input.col,
    rowSpan: input.rowSpan ?? 1,
    colSpan: input.colSpan ?? 1,
    type: input.type ?? "empty",
    content: input.content ?? "",
    imageSrc: input.imageSrc ?? "",
    imageFit: input.imageFit ?? "contain",
    backgroundColor: "transparent",
    fontColor: "#000000",
    fontFamily: input.fontFamily ?? "sans-serif",
    fontSize: input.fontSize ?? "9pt",
    fontBold: Boolean(input.fontBold),
    fontItalic: false,
    fontUnderline: false,
    textAlign: input.textAlign ?? "left",
    verticalAlign: input.verticalAlign ?? "top",
    padding: 5,
    borderTop: input.borderTop ?? true,
    borderRight: input.borderRight ?? true,
    borderBottom: input.borderBottom ?? true,
    borderLeft: input.borderLeft ?? true,
    borderColor: "#000000",
    borderWidth: 1,
    borderStyle: "solid",
    legendTypes: [],
    legendVisibility: "all",
    legendSort: "default",
    legendColumnDefs: [
      { content: "graphic", widthPct: 30 },
      { content: "label", widthPct: 70 },
    ],
    legendImageHeightPx: null,
    legendMaxRows: null,
    legendTextAlign: "left",
    legendCustomLabels: [],
    legendCustomItems: [],
  }
}

function emptyGrid(rows: number, cols: number, heightMm: number, enabled: boolean) {
  const cells = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push(
        cell({
          row,
          col,
          type: "empty",
          borderTop: false,
          borderRight: false,
          borderBottom: false,
          borderLeft: false,
        })
      )
    }
  }
  return {
    enabled,
    heightMm,
    rows,
    cols,
    columnWidths: Array.from({ length: cols }, () => 1 / cols),
    cells,
  }
}

/** Bump when default Site Plan layout changes so existing seeds can be upgraded. */
export const SITE_PLAN_TEMPLATE_SEED_VERSION = 2

/**
 * Site Plan Template 1 footer — matches Tablogs preview layout:
 *
 * | Date: …        | Drafted By: …   | Site Plan (title) | Company logo |
 * | Project ID: …  | Reviewed by: …  | (location)        |   (span)     |
 *
 * Logo uses {{company.logo}} resolved from the user's profile companyLogoUrl.
 */
export function createSitePlanTemplateContent(): Prisma.InputJsonValue {
  const footerCells = [
    cell({
      row: 0,
      col: 0,
      type: "text",
      content: "Date: {{date}}",
      fontSize: "9pt",
      textAlign: "left",
      verticalAlign: "top",
    }),
    cell({
      row: 0,
      col: 1,
      type: "text",
      content: "Drafted By: {{log.logged_by}}",
      fontSize: "9pt",
      textAlign: "left",
      verticalAlign: "top",
    }),
    cell({
      row: 0,
      col: 2,
      type: "text",
      content: "{{project.name}} Site Plan",
      fontSize: "15pt",
      fontBold: true,
      textAlign: "center",
      verticalAlign: "middle",
    }),
    cell({
      row: 0,
      col: 3,
      rowSpan: 2,
      type: "image",
      imageSrc: "{{company.logo}}",
      imageFit: "contain",
      textAlign: "center",
      verticalAlign: "middle",
    }),
    cell({
      row: 1,
      col: 0,
      type: "text",
      content: "Project ID: {{project.number}}",
      fontSize: "9pt",
      textAlign: "left",
      verticalAlign: "top",
    }),
    cell({
      row: 1,
      col: 1,
      type: "text",
      content: "Reviewed by: {{log.reviewed_by}}",
      fontSize: "9pt",
      textAlign: "left",
      verticalAlign: "top",
    }),
    cell({
      row: 1,
      col: 2,
      type: "text",
      content: "{{project.location}}",
      fontSize: "9pt",
      textAlign: "center",
      verticalAlign: "middle",
    }),
    // Covered by logo rowSpan — kept for schema completeness
    cell({
      row: 1,
      col: 3,
      type: "empty",
      borderTop: false,
      borderRight: false,
      borderBottom: false,
      borderLeft: false,
    }),
  ]

  return {
    version: 1,
    renderer: {
      version: "0.1.28",
      source: "cdn",
    },
    page: {
      size: "A4",
      orientation: "landscape",
    },
    sections: {
      header: emptyGrid(1, 3, 40, false),
      footer: {
        enabled: true,
        heightMm: 28,
        rows: 2,
        cols: 4,
        // ~equal quarters; logo column same width as title column feel
        columnWidths: [0.22, 0.22, 0.34, 0.22],
        cells: footerCells,
      },
      leftFrame: {
        enabled: false,
        widthMm: 20,
        cell: cell({
          row: 0,
          col: 0,
          type: "empty",
          borderTop: false,
          borderRight: false,
          borderBottom: false,
          borderLeft: false,
        }),
      },
      rightFrame: {
        enabled: false,
        widthMm: 20,
        cell: cell({
          row: 0,
          col: 0,
          type: "text",
          content: "{{page}} of {{pages}}",
          fontSize: "10pt",
          textAlign: "right",
          verticalAlign: "bottom",
        }),
      },
      content: {
        enabled: true,
        cell: cell({
          row: 0,
          col: 0,
          type: "empty",
          borderTop: true,
          borderRight: true,
          borderBottom: true,
          borderLeft: true,
        }),
      },
    },
    ui: {
      zoom: 100,
      showGrid: true,
      previewMode: "debug",
    },
    source: {
      name: "Site Plan Template 1",
      tablogsType: "footer",
      reportType: "Site Plan",
      templateType: "frame",
      seedVersion: SITE_PLAN_TEMPLATE_SEED_VERSION,
    },
  }
}

export const SITE_PLAN_TEMPLATE_SEED = {
  name: "Site Plan Template 1",
  kind: "footer" as const,
  reportType: null as null,
}

export function getSitePlanSeedVersion(content: unknown): number {
  if (!content || typeof content !== "object" || Array.isArray(content)) return 0
  const source = (content as Record<string, unknown>).source
  if (!source || typeof source !== "object" || Array.isArray(source)) return 0
  const version = (source as Record<string, unknown>).seedVersion
  return typeof version === "number" && Number.isFinite(version) ? version : 0
}
