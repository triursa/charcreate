/*
  Warnings:

  - You are about to alter the column `size` on the `Race` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `speed` on the `Race` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Race" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "page" INTEGER,
    "size" JSONB,
    "speed" JSONB,
    "ability" JSONB,
    "traitTags" JSONB,
    "languageProficiencies" JSONB,
    "soundClip" JSONB,
    "entries" JSONB,
    "darkvision" INTEGER
);
INSERT INTO "new_Race" ("ability", "darkvision", "id", "languageProficiencies", "name", "size", "source", "speed", "traitTags") SELECT "ability", "darkvision", "id", "languageProficiencies", "name", "size", "source", "speed", "traitTags" FROM "Race";
DROP TABLE "Race";
ALTER TABLE "new_Race" RENAME TO "Race";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
