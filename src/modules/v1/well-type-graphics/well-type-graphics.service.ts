import fs from "fs/promises"
import path from "path"

export const WELL_TYPE_GRAPHICS_DIR = "well-type"

export type WellTypeGraphicCatalogEntry = {
  filename: string
  label: string
  url: string
}

const KNOWN_LABELS: Record<string, string> = {
  solid: "SolidPipe",
  solidblack: "SolidPipe",
  slotted: "Slotted",
  perforatedwellpipe: "PerforatedWellPipe",
  smallperforatedwellpipe: "SmallPerforatedWellPipe",
}

function publicRoot(): string {
  return path.resolve(process.cwd(), "public")
}

function graphicDir(): string {
  return path.join(publicRoot(), WELL_TYPE_GRAPHICS_DIR)
}

function labelFromFilename(filename: string): string {
  const base = filename.replace(/\.(jpe?g|png|svg)$/i, "")
  const known = KNOWN_LABELS[base.toLowerCase()]
  if (known) return known
  return base
}

function fileUrl(filename: string): string {
  return `/api/v1/well-type-graphics/files/${encodeURIComponent(filename)}`
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

export async function listWellTypeGraphics(): Promise<WellTypeGraphicCatalogEntry[]> {
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
