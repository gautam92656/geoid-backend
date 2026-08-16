import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleSurfaceRoughnessDefaults } from "../../src/shared/constants/coreLoggingOptionDefaults"
import { CORE_LOGGING_MODULE_SLUG } from "../../src/shared/constants/coreLoggingOptionTypes"

const MODULE_SLUGS = [CORE_LOGGING_MODULE_SLUG] as const

export async function seedSurfaceRoughnessTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleSurfaceRoughnessDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.surfaceRoughnessTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          code: option.code ?? null,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          code: option.code ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} surface roughness templates for module "${moduleSlug}"`
    )
  }
}
