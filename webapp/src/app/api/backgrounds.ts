import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { BackgroundRecord } from '@/types/character-builder'

export async function GET() {
  try {
    const records = await prisma.background.findMany()
    const backgrounds: BackgroundRecord[] = records.map(
      ({
        id,
        name,
        source,
        entries,
        skillProficiencies,
        toolProficiencies,
        languages,
        feature,
      }) => ({
        id: id.toString(),
        name,
        source: source ?? undefined,
        entries: entries as BackgroundRecord['entries'],
        skillProficiencies: skillProficiencies as BackgroundRecord['skillProficiencies'],
        toolProficiencies: toolProficiencies as BackgroundRecord['toolProficiencies'],
        languages: languages as BackgroundRecord['languages'],
        feature: feature as BackgroundRecord['feature'],
      })
    )

    return NextResponse.json(backgrounds)
  } catch (error) {
    console.error('Failed to fetch backgrounds', error)
    return NextResponse.json({ error: 'Failed to fetch backgrounds' }, { status: 500 })
  }
}
