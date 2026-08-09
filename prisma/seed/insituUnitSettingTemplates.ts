import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleInsituUnitSettingDefaults } from "../../src/shared/constants/insituTestTypeDefaults"
import { INSITU_TESTS_MODULE_SLUG } from "../../src/shared/constants/insituTestTypeTypes"

const MODULE_SLUGS_WITH_INSITU_UNIT_SETTINGS = [INSITU_TESTS_MODULE_SLUG] as const

export async function seedInsituUnitSettingTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS_WITH_INSITU_UNIT_SETTINGS) {
    const defaults = getModuleInsituUnitSettingDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.insituUnitSettingTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          sortOrder: index,
        },
      })
    }

    console.log(
      `  Seeded ${defaults.length} Insitu unit setting templates for module "${moduleSlug}"`
    )
  }
}
