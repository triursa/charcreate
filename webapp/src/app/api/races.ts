import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AncestryRecord } from '@/types/character-builder'

export async function GET() {
  try {
    const records = await prisma.race.findMany()
    const ancestries: AncestryRecord[] = records.map(({ id, name, source, ...jsonFields }) => ({
      id: id.toString(),
      name,
      source: source ?? undefined,
      ...(jsonFields as Partial<Omit<AncestryRecord, 'id' | 'name' | 'source'>>),
    }))

    return NextResponse.json(ancestries)
  } catch (error) {
    console.error('Failed to fetch ancestries', error)
    return NextResponse.json({ error: 'Failed to fetch ancestries' }, { status: 500 })
  }
}
