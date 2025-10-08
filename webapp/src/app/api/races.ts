import { NextResponse } from 'next/server'
import { ancestries } from '@/data/ancestries'
import { prisma } from '@/lib/prisma'
import type { AncestryRecord } from '@/types/character-builder'

const ancestryFallbackByName = new Map(ancestries.map((ancestry) => [ancestry.name, ancestry]))

export async function GET() {
  try {
    const records = await prisma.race.findMany()
    const ancestries: AncestryRecord[] = records.map(({
      id,
      name,
      source,
      size,
      speed,
      ability,
      traitTags,
      languageProficiencies,
      entries,
    }) => {
      const fallback = ancestryFallbackByName.get(name)

      return {
        id: (fallback?.id ?? id).toString(),
        name,
        source: source ?? undefined,
        size: (size as AncestryRecord['size']) ?? undefined,
        traitTags: (traitTags as AncestryRecord['traitTags']) ?? undefined,
        ability: (ability as AncestryRecord['ability']) ?? undefined,
        abilityBonuses: fallback?.abilityBonuses,
        speed: (speed as AncestryRecord['speed']) ?? fallback?.speed,
        languageProficiencies: (languageProficiencies as AncestryRecord['languageProficiencies']) ?? undefined,
        languages: fallback?.languages,
        entries: (entries as AncestryRecord['entries']) ?? undefined,
        features: fallback?.features,
        skillProficiencies: fallback?.skillProficiencies,
      }
    })

    return NextResponse.json(ancestries)
  } catch (error) {
    console.error('Failed to fetch ancestries', error)
    return NextResponse.json({ error: 'Failed to fetch ancestries' }, { status: 500 })
  }
}
