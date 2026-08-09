import * as classificationGraphicsRepository from "./classification-graphics.repository"

export const CLASSIFICATION_GRAPHICS_PUBLIC_BASE = "/classification-graphics"

export type ClassificationGraphic = {
  code: string
  path: string
  url: string
  full_path: string
}

function buildGraphicPaths(filename: string): Pick<ClassificationGraphic, "path" | "url" | "full_path"> {
  return {
    path: filename,
    url: `${CLASSIFICATION_GRAPHICS_PUBLIC_BASE}/`,
    full_path: `${CLASSIFICATION_GRAPHICS_PUBLIC_BASE}/${encodeURIComponent(filename)}`,
  }
}

export async function listClassificationGraphics(): Promise<ClassificationGraphic[]> {
  const records = await classificationGraphicsRepository.findAllActive()
  return records.map((record) => ({
    code: record.code,
    ...buildGraphicPaths(record.filename),
  }))
}

export async function findClassificationGraphicByPath(
  filename: string
): Promise<ClassificationGraphic | null> {
  const record = await classificationGraphicsRepository.findActiveByFilename(filename)
  if (!record) return null

  return {
    code: record.code,
    ...buildGraphicPaths(record.filename),
  }
}
