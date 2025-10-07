import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

const categoryHandlers: Record<string, () => Promise<any[]>> = {
  spells: () => prisma.spell.findMany(),
  races: () => prisma.race.findMany(),
  classes: async () => {
    const rawClasses = await prisma.class.findMany()
    return rawClasses.map((cls) => ({
      ...cls,
      isSubclass: false
    }))
  },
  items: () => prisma.item.findMany(),
  backgrounds: () => prisma.background.findMany(),
  feats: () => prisma.feat.findMany()
}

async function buildStats() {
  const [spellsCount, racesCount, classesCount, itemsCount, backgroundsCount, featsCount] = await prisma.$transaction([
    prisma.spell.count(),
    prisma.race.count(),
    prisma.class.count(),
    prisma.item.count(),
    prisma.background.count(),
    prisma.feat.count()
  ])

  return {
    spells: spellsCount,
    races: racesCount,
    classes: classesCount,
    subclasses: 0,
    items: itemsCount,
    backgrounds: backgroundsCount,
    feats: featsCount
  }
}

async function fetchCategories(categories: string[]) {
  const uniqueCategories = Array.from(new Set(categories))
  const entries = await Promise.all(
    uniqueCategories.map(async (category) => {
      const handler = categoryHandlers[category]
      if (!handler) {
        return [category, []]
      }

      const data = await handler()
      return [category, data]
    })
  )

  return Object.fromEntries(entries)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const categoryParam = searchParams.get('category')
  const includeStats = searchParams.get('includeStats') === 'true'
  const statsOnly = searchParams.get('statsOnly') === 'true'

  try {
    if (statsOnly) {
      const stats = await buildStats()
      return NextResponse.json({ stats })
    }

    if (categoryParam) {
      const categories = categoryParam
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean)

      if (categories.length === 0) {
        return NextResponse.json(
          { error: 'No valid categories supplied' },
          { status: 400 }
        )
      }

      const content = await fetchCategories(categories)
      const response: Record<string, unknown> = { content }

      if (includeStats) {
        response.stats = await buildStats()
      }

      return NextResponse.json(response)
    }

    const content = await fetchCategories(Object.keys(categoryHandlers))
    const stats = await buildStats()

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