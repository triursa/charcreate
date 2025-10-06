import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Cache for loaded data
const dataCache = new Map<string, any>()

async function loadDataFile(filePath: string) {
  try {
    // Use cache if available
    if (dataCache.has(filePath)) {
      return dataCache.get(filePath)
    }

    const fullPath = path.join(process.cwd(), '..', 'data', filePath)
    const fileContent = await fs.readFile(fullPath, 'utf8')
    const data = JSON.parse(fileContent)
    
    // Cache the result
    dataCache.set(filePath, data)
    return data
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Load all content types
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
      'spells/spells-xphb.json',
      'spells/spells-aitfr-avt.json'
    ]

    // Load spells
    const allSpells = []
    for (const file of spellFiles) {
      const data = await loadDataFile(file)
      if (data?.spell) {
        allSpells.push(...data.spell)
      }
    }

    // Load other content types
    const [racesData, itemsData, backgroundsData, featsData] = await Promise.all([
      loadDataFile('races.json'),
      loadDataFile('items.json'),
      loadDataFile('backgrounds.json'),
      loadDataFile('feats.json')
    ])

    // Load classes
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

    const allClasses = []
    for (const file of classFiles) {
      const data = await loadDataFile(file)
      if (data?.class) {
        allClasses.push(...data.class)
      }
      if (data?.subclass) {
        // Add subclasses as separate entries
        data.subclass.forEach((subclass: any) => {
          allClasses.push({
            ...subclass,
            isSubclass: true,
            parentClass: data.class?.[0]?.name
          })
        })
      }
    }

    const content = {
      spells: allSpells,
      races: racesData?.race || [],
      classes: allClasses,
      items: itemsData?.item || [],
      backgrounds: backgroundsData?.background || [],
      feats: featsData?.feat || []
    }

    // Calculate stats
    const stats = {
      spells: content.spells.length,
      races: content.races.length,
      classes: content.classes.filter((c: any) => !c.isSubclass).length,
      subclasses: content.classes.filter((c: any) => c.isSubclass).length,
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