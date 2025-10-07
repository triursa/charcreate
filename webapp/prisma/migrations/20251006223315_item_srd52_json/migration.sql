/*
  Warnings:

  - You are about to alter the column `srd52` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "page" INTEGER,
    "type" TEXT,
    "rarity" TEXT,
    "reqAttuneTags" JSONB,
    "wondrous" BOOLEAN,
    "bonusSpellAttack" TEXT,
    "bonusSpellSaveDc" TEXT,
    "focus" JSONB,
    "entries" JSONB,
    "hasFluffImages" BOOLEAN,
    "baseItem" TEXT,
    "weaponCategory" TEXT,
    "dmg1" TEXT,
    "dmg2" TEXT,
    "grantsProficiency" BOOLEAN,
    "additionalSources" JSONB,
    "additionalEntries" JSONB,
    "light" JSONB,
    "modifySpeed" JSONB,
    "group" JSONB,
    "scfType" TEXT,
    "curse" BOOLEAN,
    "ability" JSONB,
    "age" TEXT,
    "seeAlsoVehicle" JSONB,
    "bonusWeapon" TEXT,
    "reprintedAs" JSONB,
    "tier" TEXT,
    "lootTables" JSONB,
    "srd" JSONB,
    "srd52" JSONB,
    "basicRules2024" BOOLEAN,
    "_copy" JSONB,
    "bonusAc" TEXT,
    "bonusSavingThrow" TEXT,
    "optionalfeatures" JSONB,
    "resist" JSONB,
    "basicRules" BOOLEAN,
    "recharge" TEXT,
    "rechargeAmount" TEXT,
    "charges" INTEGER,
    "miscTags" JSONB,
    "detail1" TEXT,
    "tattoo" BOOLEAN,
    "hasRefs" BOOLEAN,
    "attachedSpells" JSONB,
    "crew" INTEGER,
    "vehAc" INTEGER,
    "vehHp" INTEGER,
    "vehSpeed" INTEGER,
    "capPassenger" INTEGER,
    "capCargo" INTEGER,
    "conditionImmune" JSONB,
    "weight" REAL,
    "value" INTEGER,
    "dmgType" TEXT,
    "ac" INTEGER,
    "property" JSONB,
    "reqAttune" TEXT,
    "source" TEXT
);
INSERT INTO "new_Item" ("_copy", "ability", "ac", "additionalEntries", "additionalSources", "age", "attachedSpells", "baseItem", "basicRules", "basicRules2024", "bonusAc", "bonusSavingThrow", "bonusSpellAttack", "bonusSpellSaveDc", "bonusWeapon", "capCargo", "capPassenger", "charges", "conditionImmune", "crew", "curse", "detail1", "dmg1", "dmg2", "dmgType", "entries", "focus", "grantsProficiency", "group", "hasFluffImages", "hasRefs", "id", "light", "lootTables", "miscTags", "modifySpeed", "name", "optionalfeatures", "page", "property", "rarity", "recharge", "rechargeAmount", "reprintedAs", "reqAttune", "reqAttuneTags", "resist", "scfType", "seeAlsoVehicle", "source", "srd", "srd52", "tattoo", "tier", "type", "value", "vehAc", "vehHp", "vehSpeed", "weaponCategory", "weight", "wondrous") SELECT "_copy", "ability", "ac", "additionalEntries", "additionalSources", "age", "attachedSpells", "baseItem", "basicRules", "basicRules2024", "bonusAc", "bonusSavingThrow", "bonusSpellAttack", "bonusSpellSaveDc", "bonusWeapon", "capCargo", "capPassenger", "charges", "conditionImmune", "crew", "curse", "detail1", "dmg1", "dmg2", "dmgType", "entries", "focus", "grantsProficiency", "group", "hasFluffImages", "hasRefs", "id", "light", "lootTables", "miscTags", "modifySpeed", "name", "optionalfeatures", "page", "property", "rarity", "recharge", "rechargeAmount", "reprintedAs", "reqAttune", "reqAttuneTags", "resist", "scfType", "seeAlsoVehicle", "source", "srd", "srd52", "tattoo", "tier", "type", "value", "vehAc", "vehHp", "vehSpeed", "weaponCategory", "weight", "wondrous" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
