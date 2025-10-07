import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [spells, races, rawClasses, items, backgrounds, feats] = await Promise.all([
      prisma.spell.findMany(),
      prisma.race.findMany(),
      prisma.class.findMany(),
      prisma.item.findMany(),
      prisma.background.findMany(),
      prisma.feat.findMany()
    ])

    const classes = rawClasses.map((cls) => ({
      ...cls,
      isSubclass: false
    }))

    const content = {
      spells,
      races,
      classes,
      items,
      backgrounds,
      feats
    }

    const stats = {
      spells: content.spells.length,
      races: content.races.length,
      classes: classes.filter((c) => !c.isSubclass).length,
      subclasses: classes.filter((c) => c.isSubclass).length,
      items: content.items.length,
      backgrounds: content.backgrounds.length,
      feats: content.feats.length
    }

    return NextResponse.json({
      content,
      stats
    })

  } catch (error) {
    console.error('Error in data API:', error)
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    )
  }
}