import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client"
import { env } from "../../config/env"
import { PG_CONNECTION_TIMEOUT_MS } from "../../shared/constants"

/** Client without global `omit` so TS does not widen `OmitOpts` to `GlobalOmitConfig | undefined` and drop model delegates. */
export type AppPrismaClient = PrismaClient<never, undefined>

const connectionString = env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables")
}

const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: PG_CONNECTION_TIMEOUT_MS,
})
export const prisma: AppPrismaClient = new PrismaClient({ adapter })
