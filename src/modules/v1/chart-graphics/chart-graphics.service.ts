import fs from "fs/promises"
import path from "path"

export const CHART_GRAPHICS_DIR = "chart"

export type ChartGraphicCatalogEntry = {
  filename: string
  label: string
  url: string
}

function publicRoot(): string {
  return path.resolve(process.cwd(), "public")
}

function graphicDir(): string {
  return path.join(publicRoot(), CHART_GRAPHICS_DIR)
}

function fileUrl(filename: string): string {
  return `/api/v1/chart-graphics/files/${encodeURIComponent(filename)}`
}

function isSafeFilename(filename: string): boolean {
  return (
    Boolean(filename) &&
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\")
  )
}

export function resolveGraphicFilePath(filename: string): string | null {
  if (!isSafeFilename(filename)) return null
  if (!/\.(jpe?g|png|svg)$/i.test(filename)) return null
  return path.join(graphicDir(), filename)
}

export async function listChartGraphics(): Promise<ChartGraphicCatalogEntry[]> {
  const dir = graphicDir()
  let names: string[] = []
  try {
    names = await fs.readdir(dir)
  } catch {
    return []
  }

  return names
    .filter((name) => /\.(jpe?g|png|svg)$/i.test(name) && isSafeFilename(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((filename) => ({
      filename,
      label: filename.replace(/\.(jpe?g|png|svg)$/i, ""),
      url: fileUrl(filename),
    }))
}
