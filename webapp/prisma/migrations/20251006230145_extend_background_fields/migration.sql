-- AlterTable
ALTER TABLE "Background" ADD COLUMN "basicRules" BOOLEAN;
ALTER TABLE "Background" ADD COLUMN "entries" JSONB;
ALTER TABLE "Background" ADD COLUMN "hasFluff" BOOLEAN;
ALTER TABLE "Background" ADD COLUMN "reprintedAs" JSONB;
ALTER TABLE "Background" ADD COLUMN "srd" BOOLEAN;
