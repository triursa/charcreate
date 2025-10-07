import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');

async function importJson(file: string) {
  const filePath = path.join(dataDir, file)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function main() {
  // Races
  const racesJson = await importJson('races.json')
  for (const race of racesJson.race || []) {
    const {
      name,
      source,
      size,
      speed,
      ability,
      traitTags,
      languageProficiencies,
      entries
    } = race;
    await prisma.race.create({ data: { name, source, size, speed, ability, traitTags, languageProficiencies, entries } });
  }

  // Items
  const itemsJson = await importJson('items.json')
  for (const item of itemsJson.item || []) {
    const {
      name,
      type,
      entries,
      rarity,
      value,
      weight
    } = item;
    await prisma.item.create({ data: { name, type, entries, rarity, value, weight } });
  }

  // Backgrounds
  const backgroundsJson = await importJson('backgrounds.json')
  for (const bg of backgroundsJson.background || []) {
    const {
      name,
      entries,
      skillProficiencies,
      toolProficiencies,
      languages,
      feature
    } = bg;
    await prisma.background.create({ data: { name, entries, skillProficiencies, toolProficiencies, languages, feature } });
  }

  // Feats
  const featsJson = await importJson('feats.json')
  for (const feat of featsJson.feat || []) {
    const {
      name,
      entries,
      prerequisite
    } = feat;
    await prisma.feat.create({ data: { name, entries, prerequisite } });
  }

  // Classes
  const classFiles = [
    'class/class-artificer.json',
    'class/class-barbarian.json',
    'class/class-bard.json',
    'class/class-cleric.json',
    'class/class-druid.json',
    'class/class-fighter.json',
    'class/class-monk.json',
    'class/class-mystic.json',
    'class/class-paladin.json',
    'class/class-ranger.json',
    'class/class-rogue.json',
    'class/class-sorcerer.json',
    'class/class-warlock.json',
    'class/class-wizard.json'
  ]
  for (const file of classFiles) {
    const classJson = await importJson(file)
    for (const cls of classJson.class || []) {
      const {
        name,
        primaryAbility,
        hitDice,
        proficiencies,
        classFeatures,
        subclassFeatures,
        spellcasting
      } = cls;
      await prisma.class.create({ data: { name, primaryAbility, hitDice, proficiencies, classFeatures, subclassFeatures, spellcasting } });
    }
  }

  // Spells
  const spellFiles = [
    'spells/spells-phb.json',
    'spells/spells-xge.json',
    'spells/spells-tce.json',
    'spells/spells-ftd.json',
    'spells/spells-ggr.json',
    'spells/spells-aag.json',
    'spells/spells-egw.json',
    'spells/spells-idrotf.json',
    'spells/spells-scc.json',
    'spells/spells-sato.json',
    'spells/spells-tdcsr.json',
    'spells/spells-ai.json',
    'spells/spells-bmt.json',
    'spells/spells-llk.json',
    'spells/spells-xphb.json'
  ]
  for (const file of spellFiles) {
    const spellJson = await importJson(file)
    for (const spell of spellJson.spell || []) {
      const {
        name,
        level,
        school,
        time,
        range,
        components,
        duration,
        entries,
        areaTags,
        miscTags,
        damageInflict,
        damageResist,
        damageImmune,
        damageVulnerable,
        savingThrow
      } = spell;
      await prisma.spell.create({ data: { name, level, school, time, range, components, duration, entries, areaTags, miscTags, damageInflict, damageResist, damageImmune, damageVulnerable, savingThrow } });
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
