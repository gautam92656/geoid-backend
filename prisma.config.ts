import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";
import { env } from "./src/config/env";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env.NODE_ENV}`) });

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed/index.ts",
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
