-- AlterTable
ALTER TABLE "Class" ADD COLUMN "cantripProgression" JSONB;
ALTER TABLE "Class" ADD COLUMN "classFeatures" JSONB;
ALTER TABLE "Class" ADD COLUMN "classTableGroups" JSONB;
ALTER TABLE "Class" ADD COLUMN "edition" TEXT;
ALTER TABLE "Class" ADD COLUMN "hasFluff" BOOLEAN;
ALTER TABLE "Class" ADD COLUMN "hasFluffImages" BOOLEAN;
ALTER TABLE "Class" ADD COLUMN "multiclassing" JSONB;
ALTER TABLE "Class" ADD COLUMN "optionalfeatureProgression" JSONB;
ALTER TABLE "Class" ADD COLUMN "otherSources" JSONB;
ALTER TABLE "Class" ADD COLUMN "page" INTEGER;
ALTER TABLE "Class" ADD COLUMN "preparedSpells" TEXT;
ALTER TABLE "Class" ADD COLUMN "preparedSpellsChange" TEXT;
ALTER TABLE "Class" ADD COLUMN "startingEquipment" JSONB;
ALTER TABLE "Class" ADD COLUMN "startingProficiencies" JSONB;
ALTER TABLE "Class" ADD COLUMN "subclassTitle" TEXT;
