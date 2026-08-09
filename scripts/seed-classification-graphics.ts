import fs from "fs/promises"
import path from "path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import classificationGraphicsData from "../src/data/classificationGraphicsData.json"
import { env } from "../src/config/env"
import { seedClassificationGraphics } from "../prisma/seed/classificationGraphics"

const SOURCE_BASE_URL =
  "https://web.tablogs.com/assets/img/graphics/big_soil_or_rock_type"
const BACKEND_GRAPHICS_DIR = path.join(env.UPLOADS_DIR, "classification-graphics")
const PUBLIC_GRAPHICS_DIR = path.resolve(
  __dirname,
  "../../geoid_frontend/public/classification-graphics"
)

async function downloadGraphic(filename: string, targetDir: string): Promise<boolean> {
  const targetPath = path.join(targetDir, filename)
  try {
    await fs.access(targetPath)
    return false
  } catch {
    // continue
  }

  const response = await fetch(`${SOURCE_BASE_URL}/${encodeURIComponent(filename)}`)
  if (!response.ok) {
    console.warn(`Failed to download ${filename}: ${response.status}`)
    return false
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(targetPath, buffer)
  return true
}

async function ensureGraphicFile(filename: string): Promise<void> {
  const publicPath = path.join(PUBLIC_GRAPHICS_DIR, filename)
  const backendPath = path.join(BACKEND_GRAPHICS_DIR, filename)

  try {
    await fs.access(publicPath)
    return
  } catch {
    // continue
  }

  try {
    await fs.access(backendPath)
    await fs.copyFile(backendPath, publicPath)
    return
  } catch {
    // continue
  }

  await downloadGraphic(filename, PUBLIC_GRAPHICS_DIR)
}

async function main(): Promise<void> {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables")
  }

  await fs.mkdir(BACKEND_GRAPHICS_DIR, { recursive: true })
  await fs.mkdir(PUBLIC_GRAPHICS_DIR, { recursive: true })

  const items = classificationGraphicsData as Array<{ path: string }>
  let synced = 0

  for (const item of items) {
    await ensureGraphicFile(item.path)
    synced += 1
  }

  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  try {
    await seedClassificationGraphics(prisma)
  } finally {
    await prisma.$disconnect()
  }

  console.log(`Classification graphics seed complete. synced=${synced}`)
}

void main()
