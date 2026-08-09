-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'super_admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "user_role" NOT NULL DEFAULT 'user';
