import fs from "fs/promises"
import path from "path"

export const WATER_OBS_GRAPHICS_DIR = "water-obs"

export type WaterObsGraphicCatalogEntry = {
  filename: string
  label: string
  url: string
}

function publicRoot(): string {
  return path.resolve(process.cwd(), "public")
}

function graphicDir(): string {
  return path.join(publicRoot(), WATER_OBS_GRAPHICS_DIR)
}

function labelFromFilename(filename: string): string {
  const base = filename.replace(/\.(jpe?g|png|svg)$/i, "")
  if (/^no_graphic/i.test(base)) return "No graphic"
  const match = base.match(/^water_symbol_?0*(\d+)$/i)
  if (match) return `Water Symbol ${match[1]}`
  return base
}

function fileUrl(filename: string): string {
  return `/api/v1/water-obs-graphics/files/${encodeURIComponent(filename)}`
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

export async function listWaterObsGraphics(): Promise<WaterObsGraphicCatalogEntry[]> {
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
