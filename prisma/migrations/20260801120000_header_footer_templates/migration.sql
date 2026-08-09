-- CreateEnum
CREATE TYPE "header_footer_template_kind" AS ENUM ('header', 'footer');

-- CreateEnum
CREATE TYPE "header_footer_report_type" AS ENUM ('borelog', 'corelog');

-- CreateTable
CREATE TABLE "header_footer_templates" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "kind" "header_footer_template_kind" NOT NULL,
    "report_type" "header_footer_report_type",
    "content" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "header_footer_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "header_footer_templates_user_id_deleted_at_idx" ON "header_footer_templates"("user_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "header_footer_templates" ADD CONSTRAINT "header_footer_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
