/*
  Warnings:

  - You are about to alter the column `srd` on the `Spell` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spell" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT,
    "time" JSONB,
    "range" JSONB,
    "components" JSONB,
    "duration" JSONB,
    "classes" JSONB,
    "page" INTEGER,
    "srd" JSONB,
    "basicRules" BOOLEAN,
    "reprintedAs" JSONB,
    "scalingLevelDice" JSONB,
    "damageInflict" JSONB,
    "savingThrow" JSONB,
    "miscTags" JSONB,
    "areaTags" JSONB,
    "entries" JSONB,
    "entriesHigherLevel" JSONB,
    "otherSources" JSONB,
    "source" TEXT,
    "meta" JSONB,
    "conditionInflict" JSONB,
    "affectsCreatureType" JSONB,
    "damageResist" JSONB,
    "hasFluffImages" BOOLEAN
);
INSERT INTO "new_Spell" ("affectsCreatureType", "areaTags", "basicRules", "classes", "components", "conditionInflict", "damageInflict", "damageResist", "duration", "entries", "entriesHigherLevel", "hasFluffImages", "id", "level", "meta", "miscTags", "name", "otherSources", "page", "range", "reprintedAs", "savingThrow", "scalingLevelDice", "school", "source", "srd", "time") SELECT "affectsCreatureType", "areaTags", "basicRules", "classes", "components", "conditionInflict", "damageInflict", "damageResist", "duration", "entries", "entriesHigherLevel", "hasFluffImages", "id", "level", "meta", "miscTags", "name", "otherSources", "page", "range", "reprintedAs", "savingThrow", "scalingLevelDice", "school", "source", "srd", "time" FROM "Spell";
DROP TABLE "Spell";
ALTER TABLE "new_Spell" RENAME TO "Spell";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
