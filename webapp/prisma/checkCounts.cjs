const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const out = {};
    out.race = await prisma.race.count();
    out.item = await prisma.item.count();
    out.background = await prisma.background.count();
    out.feat = await prisma.feat.count();
    out.class = await prisma.class.count();
    out.spell = await prisma.spell.count();
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
