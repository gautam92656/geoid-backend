import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleApertureMineralDefaults } from "../../src/shared/constants/coreLoggingOptionDefaults"
import { CORE_LOGGING_MODULE_SLUG } from "../../src/shared/constants/coreLoggingOptionTypes"

const MODULE_SLUGS = [CORE_LOGGING_MODULE_SLUG] as const

export async function seedApertureMineralTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleApertureMineralDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.apertureMineralTemplate.upsert({
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
      `  Seeded ${defaults.length} aperture mineral templates for module "${moduleSlug}"`
    )
  }
}
