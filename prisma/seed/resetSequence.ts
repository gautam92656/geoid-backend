import type { PrismaClient } from "../../src/generated/prisma/client"

export async function resetAutoIncrementSequence(
  prisma: PrismaClient,
  table: string,
  column = "id"
) {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('${table}', '${column}'),
      COALESCE((SELECT MAX("${column}") FROM "${table}"), 1)
    )
  `)
}
