import type { PrismaClient } from "../../src/generated/prisma/client"
import { getModuleLabTestPresetDefaults } from "../../src/shared/constants/labTestPresetOptionDefaults"
import { LAB_TESTS_MODULE_SLUG } from "../../src/shared/constants/labTestsOptionTypes"

const MODULE_SLUGS = [LAB_TESTS_MODULE_SLUG] as const

export async function seedLabTestPresetTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    const defaults = getModuleLabTestPresetDefaults(moduleSlug)
    if (defaults.length === 0) continue

    for (const [index, option] of defaults.entries()) {
      await prisma.labTestPresetTemplate.upsert({
        where: {
          moduleSlug_optionKey: {
            moduleSlug,
            optionKey: option.id,
          },
        },
        update: {
          name: option.name,
          labTestTypeIds: option.labTestTypeIds ?? [],
          sortOrder: index,
        },
        create: {
          moduleSlug,
          optionKey: option.id,
          name: option.name,
          labTestTypeIds: option.labTestTypeIds ?? [],
          sortOrder: index,
        },
      })
    }

    console.log(`  Seeded ${defaults.length} lab test preset templates for module "${moduleSlug}"`)
  }
}
