import fs from "fs/promises"
import path from "path"

export const WELL_COVER_GRAPHICS_DIR = "well-cover"

export type WellCoverGraphicCatalogEntry = {
  filename: string
  label: string
  url: string
}

const KNOWN_LABELS: Record<string, string> = {
  well_cover_1: "WellCover1",
  new_well_cover_2: "WellCover2",
  new_well_cover_3: "WellCover3",
  well_cover_4: "WellCover4",
  well_cover_5: "WellCover5",
  well_cover_6: "WellCover6",
}

function publicRoot(): string {
  return path.resolve(process.cwd(), "public")
}

function graphicDir(): string {
  return path.join(publicRoot(), WELL_COVER_GRAPHICS_DIR)
}

function labelFromFilename(filename: string): string {
  const base = filename.replace(/\.(jpe?g|png|svg)$/i, "")
  const known = KNOWN_LABELS[base.toLowerCase()]
  if (known) return known
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, "")
}

function fileUrl(filename: string): string {
  return `/api/v1/well-cover-graphics/files/${encodeURIComponent(filename)}`
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

export async function listWellCoverGraphics(): Promise<WellCoverGraphicCatalogEntry[]> {
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
