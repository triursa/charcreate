-- CreateTable
CREATE TABLE "Race" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "size" TEXT,
    "speed" TEXT,
    "ability" JSONB,
    "darkvision" INTEGER,
    "traitTags" JSONB,
    "languageProficiencies" JSONB,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "rarity" TEXT,
    "weight" REAL,
    "value" INTEGER,
    "dmgType" TEXT,
    "ac" INTEGER,
    "property" JSONB,
    "reqAttune" TEXT,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "Background" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "skillProficiencies" JSONB,
    "languageProficiencies" JSONB,
    "toolProficiencies" JSONB,
    "startingEquipment" JSONB,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "Feat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "prerequisite" JSONB,
    "ability" JSONB,
    "entries" JSONB,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isSubclass" BOOLEAN NOT NULL DEFAULT false,
    "parentClass" TEXT,
    "hd" JSONB,
    "proficiency" JSONB,
    "spellcastingAbility" TEXT,
    "casterProgression" TEXT,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT,
    "time" JSONB,
    "range" JSONB,
    "components" JSONB,
    "duration" JSONB,
    "classes" JSONB,
    "source" TEXT
);
