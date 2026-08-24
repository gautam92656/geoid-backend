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
  padding?: number
  borderTop?: boolean
  borderRight?: boolean
  borderBottom?: boolean
  borderLeft?: boolean
  legendTypes?: string[]
  legendVisibility?: "all" | "used-only" | "custom"
  legendColumnDefs?: Array<{ content: string; widthPct: number }>
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
    fontFamily: input.fontFamily ?? "Arial, Helvetica, sans-serif",
    fontSize: input.fontSize ?? "8pt",
    fontBold: Boolean(input.fontBold),
    fontItalic: false,
    fontUnderline: false,
    textAlign: input.textAlign ?? "left",
    verticalAlign: input.verticalAlign ?? "top",
    padding: input.padding ?? 4,
    borderTop: input.borderTop ?? true,
    borderRight: input.borderRight ?? true,
    borderBottom: input.borderBottom ?? true,
    borderLeft: input.borderLeft ?? true,
    borderColor: "#000000",
    borderWidth: 1,
    borderStyle: "solid",
    legendTypes: input.legendTypes ?? [],
    legendVisibility: input.legendVisibility ?? "all",
    legendSort: "default",
    legendColumnDefs: input.legendColumnDefs ?? [
      { content: "graphic", widthPct: 30 },
      { content: "label", widthPct: 70 },
    ],
    legendImageHeightPx: null,
    legendMaxRows: null,
    legendTextAlign: "left" as const,
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

function emptyFrameCell() {
  return cell({
    row: 0,
    col: 0,
    type: "empty",
    borderTop: false,
    borderRight: false,
    borderBottom: false,
    borderLeft: false,
  })
}

/** Bump when default Borelog header/footer layout changes so existing seeds can be upgraded. */
export const BORELOG_TEMPLATE_SEED_VERSION = 13

const NO_CELL_BORDER = {
  borderTop: false,
  borderRight: false,
  borderBottom: false,
  borderLeft: false,
} as const

/** Same stack as the log report sheet — keep header rows visually consistent. */
const REPORT_FONT_FAMILY = "Arial, Helvetica, sans-serif"

/** Label/value line for header meta row (colon alignment rendered by report sheet CSS). */
function metaLine(label: string, value: string, _labelWidth?: number): string {
  return `${label} : ${value}`
}

/**
 * Borelog Header Template 1 — matches sample Geotechnical Log PDF header:
 *
 * | Logo | Company name + Phone     | Geotechnical Log - Borehole + BH |
 * | UTM / Easting / … | Drill Rig / Logged By / … | Job / Client / Project / … |
 */
export function createBorelogHeaderTemplateContent(): Prisma.InputJsonValue {
  const headerCells = [
    cell({
      row: 0,
      col: 0,
      type: "image",
      imageSrc: "{{company.logo}}",
      imageFit: "contain",
      textAlign: "center",
      verticalAlign: "middle",
      padding: 6,
      ...NO_CELL_BORDER,
    }),
    cell({
      row: 0,
      col: 1,
      type: "text",
      content: "{{company.name}}\n\nPhone: {{company.phone}}",
      fontSize: "10pt",
      fontBold: true,
      fontFamily: REPORT_FONT_FAMILY,
      textAlign: "left",
      verticalAlign: "middle",
      padding: 6,
      ...NO_CELL_BORDER,
    }),
    cell({
      row: 0,
      col: 2,
      type: "text",
      content: "Geotechnical Log - Borehole\n\n{{log.bh_no}}",
      fontSize: "11pt",
      fontBold: true,
      fontFamily: REPORT_FONT_FAMILY,
      textAlign: "left",
      verticalAlign: "middle",
      padding: 6,
      ...NO_CELL_BORDER,
    }),
    cell({
      row: 1,
      col: 0,
      type: "text",
      content: [
        metaLine("UTM", "{{location.utm}}", 17),
        metaLine("Easting (m)", "{{location.easting}}", 17),
        metaLine("Northing (m)", "{{location.northing}}", 17),
        metaLine("Ground Elevation", "{{location.elevation}}", 17),
        metaLine("Total Depth", "{{log.total_depth}}", 17),
      ].join("\n"),
      fontSize: "5.5pt",
      fontBold: true,
      fontFamily: REPORT_FONT_FAMILY,
      textAlign: "left",
      verticalAlign: "top",
      padding: 4,
      ...NO_CELL_BORDER,
    }),
    cell({
      row: 1,
      col: 1,
      type: "text",
      content: [
        metaLine("Drill Rig", "{{log.equipment}}", 16),
        metaLine("Driller Supplier", "{{log.driller}}", 16),
        metaLine("Logged By", "{{log.logged_by}}", 16),
        metaLine("Reviewed By", "{{log.reviewed_by}}", 16),
        metaLine("Date", "{{log.date_drilled}}", 16),
      ].join("\n"),
      fontSize: "5.5pt",
      fontBold: true,
      fontFamily: REPORT_FONT_FAMILY,
      textAlign: "left",
      verticalAlign: "top",
      padding: 4,
      ...NO_CELL_BORDER,
    }),
    cell({
      row: 1,
      col: 2,
      type: "text",
      content: [
        metaLine("Job Number", "{{project.number}}", 11),
        metaLine("Client", "{{project.client}}", 11),
        metaLine("Project", "{{project.name}}", 11),
        metaLine("Location", "{{project.location}}", 11),
        metaLine("Loc Comment", "{{log.location_comment}}", 11),
      ].join("\n"),
      fontSize: "5.5pt",
      fontBold: true,
      fontFamily: REPORT_FONT_FAMILY,
      textAlign: "left",
      verticalAlign: "top",
      padding: 4,
      ...NO_CELL_BORDER,
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
      orientation: "portrait",
    },
    sections: {
      header: {
        enabled: true,
        heightMm: 44,
        rows: 2,
        cols: 3,
        columnWidths: [0.22, 0.33, 0.45],
        cells: headerCells,
      },
      footer: emptyGrid(1, 3, 26, false),
      leftFrame: { enabled: false, widthMm: 20, cell: emptyFrameCell() },
      rightFrame: { enabled: false, widthMm: 20, cell: emptyFrameCell() },
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
      name: "Borelog Header Template 1",
      tablogsType: "header",
      reportType: "borelog",
      templateType: "frame",
      seedVersion: BORELOG_TEMPLATE_SEED_VERSION,
    },
  }
}

/**
 * Borelog Footer Template 1 — legend columns only (no page number row).
 *
 * | Water | Weathering | Altering | Consistency/Moisture | Density | Rock Strength | Tests&Results |
 */
export function createBorelogFooterTemplateContent(): Prisma.InputJsonValue {
  const footerCells = [
    cell({
      row: 0,
      col: 0,
      type: "text",
      content: "Water",
      fontSize: "5.5pt",
      fontBold: true,
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
    }),
    cell({
      row: 0,
      col: 1,
      type: "text",
      content: [
        "Weathering",
        "XW : Extremely weathered",
        "DW : Distinctly weathered",
        "HW : Highly weathered",
        "MW : Moderately weathered",
        "SW : Slightly weathered",
        "FR : Fresh",
      ].join("\n"),
      fontSize: "5.5pt",
      fontBold: false,
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
    }),
    cell({
      row: 0,
      col: 2,
      type: "text",
      content: [
        "Altering",
        "XA : Extremely altered",
        "DA : Distinctly altered",
        "HA : Highly altered",
        "MA : Moderately altered",
        "SA : Slightly altered",
      ].join("\n"),
      fontSize: "5.5pt",
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
    }),
    cell({
      row: 0,
      col: 3,
      type: "text",
      content: [
        "Consistency",
        "VS : Very soft",
        "S : Soft",
        "F : Firm",
        "St : Stiff",
        "VSt : Very stiff",
        "H : Hard",
        "FR : Friable",
        "Moisture",
        "D : Dry",
        "M : Moist",
        "W : Wet",
      ].join("\n"),
      fontSize: "5.5pt",
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
    }),
    cell({
      row: 0,
      col: 4,
      type: "text",
      content: [
        "Density",
        "VL : Very loose",
        "L : Loose",
        "MD : Medium dense",
        "D : Dense",
        "VD : Very dense",
      ].join("\n"),
      fontSize: "5.5pt",
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
    }),
    cell({
      row: 0,
      col: 5,
      type: "text",
      content: [
        "Rock Strength",
        "VLS : Very low",
        "LS : Low",
        "MS : Medium",
        "HS : High",
        "VH : Very high",
        "XH : Extremely high",
      ].join("\n"),
      fontSize: "5.5pt",
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
    }),
    cell({
      row: 0,
      col: 6,
      type: "text",
      content: [
        "Tests&Results",
        "U50 : Undisturbed 50mm diam tube.",
        "D : Disturbed sample.",
        "SPT : Standard Penetration Test, N = number of blows to drive 50mm sampler 300mm with a 63.5kg hammer falling 762mm.",
        "PP : Hand penetrometer estimate of unconfined compressive strength, kPa.",
        "S : Vane shear value kPa.",
        "DCP : Dynamic Cone Penetrometer test.",
      ].join("\n"),
      fontSize: "5.5pt",
      fontFamily: REPORT_FONT_FAMILY,
      padding: 3,
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
      orientation: "portrait",
    },
    sections: {
      header: emptyGrid(1, 3, 40, false),
      footer: {
        enabled: true,
        heightMm: 48,
        rows: 1,
        cols: 7,
        // Tablogs widths: 11+11+11+11+11+12+33 = 100
        columnWidths: [0.11, 0.11, 0.11, 0.11, 0.11, 0.12, 0.33],
        cells: footerCells,
      },
      leftFrame: { enabled: false, widthMm: 20, cell: emptyFrameCell() },
      rightFrame: { enabled: false, widthMm: 20, cell: emptyFrameCell() },
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
      name: "Borelog Footer Template 1",
      tablogsType: "footer",
      reportType: "borelog",
      templateType: "frame",
      seedVersion: BORELOG_TEMPLATE_SEED_VERSION,
    },
  }
}

export const BORELOG_HEADER_TEMPLATE_SEED = {
  name: "Borelog Header Template 1",
  kind: "header" as const,
  reportType: "borelog" as const,
}

export const BORELOG_FOOTER_TEMPLATE_SEED = {
  name: "Borelog Footer Template 1",
  kind: "footer" as const,
  reportType: "borelog" as const,
}

function withCorelogSource(
  content: Prisma.InputJsonValue,
  seed: { name: string; tablogsType: "header" | "footer" }
): Prisma.InputJsonValue {
  const record = content as Record<string, unknown>
  const source = (record.source as Record<string, unknown>) ?? {}
  return {
    ...record,
    source: {
      ...source,
      name: seed.name,
      tablogsType: seed.tablogsType,
      reportType: "corelog",
      seedVersion: BORELOG_TEMPLATE_SEED_VERSION,
    },
  }
}

/** Same layout as Borelog Header Template 1 — used as the default corelog header. */
export function createCorelogHeaderTemplateContent(): Prisma.InputJsonValue {
  return withCorelogSource(createBorelogHeaderTemplateContent(), {
    name: "Corelog Header Template 1",
    tablogsType: "header",
  })
}

/** Same layout as Borelog Footer Template 1 — used as the default corelog footer. */
export function createCorelogFooterTemplateContent(): Prisma.InputJsonValue {
  return withCorelogSource(createBorelogFooterTemplateContent(), {
    name: "Corelog Footer Template 1",
    tablogsType: "footer",
  })
}

export const CORELOG_HEADER_TEMPLATE_SEED = {
  name: "Corelog Header Template 1",
  kind: "header" as const,
  reportType: "corelog" as const,
}

export const CORELOG_FOOTER_TEMPLATE_SEED = {
  name: "Corelog Footer Template 1",
  kind: "footer" as const,
  reportType: "corelog" as const,
}

export function getBorelogSeedVersion(content: unknown): number {
  if (!content || typeof content !== "object" || Array.isArray(content)) return 0
  const source = (content as Record<string, unknown>).source
  if (!source || typeof source !== "object" || Array.isArray(source)) return 0
  const version = (source as Record<string, unknown>).seedVersion
  return typeof version === "number" && Number.isFinite(version) ? version : 0
}
