import type { PrismaClient } from "../../src/generated/prisma/client"
import {
  DEFAULT_COMMON_CONFIG_MODULES,
  REMOVED_CONFIG_MODULE_SLUGS,
} from "../../src/shared/constants/configModuleCatalog"

export async function seedConfigModules(prisma: PrismaClient) {
  for (const module of DEFAULT_COMMON_CONFIG_MODULES) {
    await prisma.configModule.upsert({
      where: { slug: module.slug },
      update: {
        title: module.title,
        description: module.description,
        tags: module.tags.map((tag) => ({ label: tag.label, tone: tag.tone })),
        filterCategories: [...module.filterCategories],
        isAvailable: module.isAvailable,
        sortOrder: module.sortOrder,
        deletedAt: null,
      },
      create: {
        slug: module.slug,
        title: module.title,
        description: module.description,
        tags: module.tags.map((tag) => ({ label: tag.label, tone: tag.tone })),
        filterCategories: [...module.filterCategories],
        isAvailable: module.isAvailable,
        sortOrder: module.sortOrder,
      },
    })
  }

  await prisma.configModule.updateMany({
    where: {
      slug: { in: [...REMOVED_CONFIG_MODULE_SLUGS] },
      deletedAt: null,
    },
    data: {
      isAvailable: false,
      deletedAt: new Date(),
    },
  })

  console.log(
    `Seeded ${DEFAULT_COMMON_CONFIG_MODULES.length} common log configuration module(s)`
  )
}
