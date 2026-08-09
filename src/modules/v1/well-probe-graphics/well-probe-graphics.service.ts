import fs from "fs/promises"
import path from "path"

export const WELL_PROBE_GRAPHICS_DIR = "well-probe"

export type WellProbeGraphicCatalogEntry = {
  filename: string
  label: string
  url: string
}

function publicRoot(): string {
  return path.resolve(process.cwd(), "public")
}

function graphicDir(): string {
  return path.join(publicRoot(), WELL_PROBE_GRAPHICS_DIR)
}

function labelFromFilename(filename: string): string {
  const base = filename.replace(/\.(jpe?g|png|svg)$/i, "")
  const match = base.match(/^probe_graphic_0*(\d+)$/i)
  if (match) return `ProbeGraphic${String(match[1]).padStart(2, "0")}`
  return base
}

function fileUrl(filename: string): string {
  return `/api/v1/well-probe-graphics/files/${encodeURIComponent(filename)}`
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

export async function listWellProbeGraphics(): Promise<WellProbeGraphicCatalogEntry[]> {
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
      label: labelFromFilename(filename),
      url: fileUrl(filename),
    }))
}
