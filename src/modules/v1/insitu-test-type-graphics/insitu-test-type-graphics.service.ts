import fs from "fs/promises"
import path from "path"

export const INSITU_TEST_GRAPHICS_DIR = "insitu-test-type-pngs"
export const INSITU_TOP_BOTTOM_GRAPHICS_DIR = "insitu-test-type-top-bottom-graphics"

export type InsituGraphicKind = "test" | "top-bottom"

export type InsituGraphicCatalogEntry = {
  filename: string
  label: string
  kind: InsituGraphicKind
  url: string
}

function publicRoot(): string {
  return path.resolve(process.cwd(), "public")
}

function graphicDir(kind: InsituGraphicKind): string {
  const folder = kind === "test" ? INSITU_TEST_GRAPHICS_DIR : INSITU_TOP_BOTTOM_GRAPHICS_DIR
  return path.join(publicRoot(), folder)
}

function labelFromFilename(filename: string, kind: InsituGraphicKind): string {
  const base = filename.replace(/\.(png|svg)$/i, "")
  const match = base.match(/^graphic_(\d+)$/i)
  const index = match?.[1] ?? base
  if (kind === "test") return `testing_graphic_${index}`
  // Match Tablogs top/bottom picker labels (graphic_00 → "no graphic").
  if (match && match[1] === "00") return "no graphic"
  return match ? `graphic_${match[1]}` : base
}

function fileUrl(kind: InsituGraphicKind, filename: string): string {
  return `/api/v1/insitu-test-type-graphics/files/${kind}/${encodeURIComponent(filename)}`
}

function isSafeFilename(filename: string): boolean {
  return Boolean(filename) && !filename.includes("..") && !filename.includes("/") && !filename.includes("\\")
}

export function resolveGraphicFilePath(kind: InsituGraphicKind, filename: string): string | null {
  if (!isSafeFilename(filename)) return null
  const allowedExt = kind === "test" ? /\.png$/i : /\.svg$/i
  if (!allowedExt.test(filename)) return null
  return path.join(graphicDir(kind), filename)
}

async function listDirGraphics(kind: InsituGraphicKind): Promise<InsituGraphicCatalogEntry[]> {
  const dir = graphicDir(kind)
  let names: string[] = []
  try {
    names = await fs.readdir(dir)
  } catch {
    return []
  }

  const allowedExt = kind === "test" ? /\.png$/i : /\.svg$/i
  return names
    .filter((name) => allowedExt.test(name) && isSafeFilename(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((filename) => ({
      filename,
      label: labelFromFilename(filename, kind),
      kind,
      url: fileUrl(kind, filename),
    }))
}

export async function listInsituTestTypeGraphics(): Promise<{
  testGraphics: InsituGraphicCatalogEntry[]
  topBottomGraphics: InsituGraphicCatalogEntry[]
}> {
  const [testGraphics, topBottomGraphics] = await Promise.all([
    listDirGraphics("test"),
    listDirGraphics("top-bottom"),
  ])
  return { testGraphics, topBottomGraphics }
}
