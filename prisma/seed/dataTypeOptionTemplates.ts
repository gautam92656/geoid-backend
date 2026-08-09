import type { PrismaClient } from "../../src/generated/prisma/client"
import {
  getModuleDataTypeOptionDefaults,
  listSeededDataTypeIdsForModule,
} from "../../src/shared/constants/dataTypeOptionDefaults"

const MODULE_SLUGS = ["subsurfaces"] as const

export async function seedDataTypeOptionTemplates(prisma: PrismaClient) {
  for (const moduleSlug of MODULE_SLUGS) {
    for (const dataTypeId of listSeededDataTypeIdsForModule(moduleSlug)) {
      const defaults = getModuleDataTypeOptionDefaults(moduleSlug, dataTypeId)
      if (defaults.length === 0) continue

      for (const [index, option] of defaults.entries()) {
        await prisma.dataTypeOptionTemplate.upsert({
          where: {
            moduleSlug_dataTypeId_optionKey: {
              moduleSlug,
              dataTypeId,
              optionKey: option.id,
            },
          },
          update: {
            name: option.name,
            code: option.code ?? null,
            graphic: option.graphic ?? null,
            rockGroup: option.rockGroup ?? null,
            color: option.color ?? null,
            overlayColor: option.overlayColor ?? null,
            textColor: option.textColor ?? null,
            showAutoScale: option.showAutoScale ?? true,
            sortOrder: index,
          },
          create: {
            moduleSlug,
            dataTypeId,
            optionKey: option.id,
            name: option.name,
            code: option.code ?? null,
            graphic: option.graphic ?? null,
            rockGroup: option.rockGroup ?? null,
            color: option.color ?? null,
            overlayColor: option.overlayColor ?? null,
            textColor: option.textColor ?? null,
            showAutoScale: option.showAutoScale ?? true,
            sortOrder: index,
          },
        })
      }

      console.log(
        `  Seeded ${defaults.length} ${dataTypeId} option templates for module "${moduleSlug}"`
      )
    }
  }
}
