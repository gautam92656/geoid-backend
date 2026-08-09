import type { Prisma } from "../../../generated/prisma/client"

function equalColumns(cols: number): number[] {
  return Array.from({ length: cols }, () => 1 / cols)
}

function buildCell(row: number, col: number) {
  return {
    row,
    col,
    rowSpan: 1,
    colSpan: 1,
    type: "empty",
    content: "",
    imageSrc: "",
    imageFit: "contain",
    backgroundColor: "transparent",
    fontColor: "#000000",
    fontFamily: "Inter, sans-serif",
    fontSize: "12pt",
    fontBold: false,
    fontItalic: false,
    fontUnderline: false,
    textAlign: "left",
    verticalAlign: "top",
    padding: 5,
    borderTop: false,
    borderRight: false,
    borderBottom: false,
    borderLeft: false,
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

function buildGrid(rows: number, cols: number, heightMm: number, enabled: boolean) {
  const cells = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push(buildCell(row, col))
    }
  }

  return {
    enabled,
    heightMm,
    rows,
    cols,
    columnWidths: equalColumns(cols),
    cells,
  }
}

export function createDefaultHeaderFooterContent(): Prisma.InputJsonValue {
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
      header: buildGrid(1, 3, 40, true),
      footer: buildGrid(1, 3, 26, true),
      leftFrame: { enabled: false, widthMm: 20, cell: buildCell(0, 0) },
      rightFrame: { enabled: false, widthMm: 20, cell: buildCell(0, 0) },
      content: { enabled: true, cell: buildCell(0, 0) },
    },
    ui: {
      zoom: 100,
      showGrid: true,
      previewMode: "debug",
    },
  }
}

export function isEmptyContent(content: unknown): boolean {
  if (content == null) return true
  if (typeof content !== "object" || Array.isArray(content)) return false
  return Object.keys(content as Record<string, unknown>).length === 0
}
