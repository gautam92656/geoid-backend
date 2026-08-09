import type { PrismaClient } from "../../src/generated/prisma/client"
import {
  DEFAULT_EQUIPMENT_TYPES,
  EQUIPMENT_FIELD_DEFINITIONS,
} from "../../src/shared/constants/equipmentType"

export async function seedEquipmentFieldDefinitions(prisma: PrismaClient) {
  for (const field of EQUIPMENT_FIELD_DEFINITIONS) {
    await prisma.equipmentFieldDefinition.upsert({
      where: { key: field.key },
      update: { label: field.label, sortOrder: field.sortOrder },
      create: field,
    })
  }

  console.log(`Seeded ${EQUIPMENT_FIELD_DEFINITIONS.length} equipment field definition(s)`)
}

export async function ensureDefaultEquipmentTypesForUser(prisma: PrismaClient, userId: number) {
  const existingCount = await prisma.equipmentType.count({
    where: { userId, deletedAt: null },
  })

  if (existingCount > 0) return

  for (const type of DEFAULT_EQUIPMENT_TYPES) {
    await prisma.equipmentType.create({
      data: {
        userId,
        name: type.name,
        isDefault: true,
        fieldConfig: type.fieldConfig,
      },
    })
  }
}

export async function seedEquipmentTypesForSeedUser(prisma: PrismaClient) {
  const user = await prisma.user.findFirst({
    where: { email: "geo@geoid.com", deletedAt: null },
  })

  if (!user) return

  await ensureDefaultEquipmentTypesForUser(prisma, user.id)
  console.log("Seeded default equipment types for seed user")
}
