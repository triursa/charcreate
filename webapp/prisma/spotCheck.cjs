const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const names = ["Bigby's Hand", "Acid Splash", "Animal Friendship", "Hallow", "Fire Bolt"];
    const spells = await prisma.spell.findMany({ where: { name: { in: names } }, take: 10 });
    for (const s of spells) {
      console.log(`\nSpell: ${s.name}`);
      console.log({
        source: s.source,
        page: s.page,
        level: s.level,
        school: s.school,
        srd: s.srd,
        srd52: s.srd52,
        basicRules: s.basicRules,
        basicRules2024: s.basicRules2024,
        reprintedAs: s.reprintedAs,
        time: s.time,
        range: s.range,
        components: s.components,
        duration: s.duration,
        entries: Array.isArray(s.entries) ? s.entries.length : (s.entries ? 1 : 0),
        entriesHigherLevel: s.entriesHigherLevel,
        otherSources: s.otherSources,
        meta: s.meta,
        conditionInflict: s.conditionInflict,
        affectsCreatureType: s.affectsCreatureType,
        damageResist: s.damageResist,
        damageImmune: s.damageImmune,
        damageVulnerable: s.damageVulnerable,
        spellAttack: s.spellAttack,
        abilityCheck: s.abilityCheck,
        hasFluffImages: s.hasFluffImages,
        hasFluff: s.hasFluff,
        alias: s.alias,
        additionalSources: s.additionalSources,
        areaTags: s.areaTags,
        miscTags: s.miscTags,
        savingThrow: s.savingThrow,
        scalingLevelDice: s.scalingLevelDice,
        damageInflict: s.damageInflict,
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
