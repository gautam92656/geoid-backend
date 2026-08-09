import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleApertureColorDefaults } from "../../src/shared/constants/coreLoggingOptionDefaults"
import { CORE_LOGGING_MODULE_SLUG } from "../../src/shared/constants/coreLoggingOptionTypes"

const MODULE_SLUGS = [CORE_LOGGING_MODULE_SLUG] as const

export async function seedApertureColorTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleApertureColorDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.apertureColorTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          color: option.color ?? null,
          textColor: option.textColor ?? null,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          color: option.color ?? null,
          textColor: option.textColor ?? null,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} aperture color templates for module "${moduleSlug}"`
    )
  }
}
