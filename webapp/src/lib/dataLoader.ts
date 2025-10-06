import { ContentFile } from '@/types/dnd'
import path from 'path'
import { promises as fs } from 'fs'

// Cache for loaded data
const dataCache = new Map<string, any>()

/**
 * Load and parse a JSON file from the data directory
 */
export async function loadDataFile<T>(filePath: string): Promise<ContentFile<T> | null> {
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

/**
 * Get all spells from various spell files
 */
export async function getAllSpells() {
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

  const allSpells = []
  
  for (const file of spellFiles) {
    const data = await loadDataFile(file)
    if (data?.spell) {
      allSpells.push(...data.spell)
    }
  }
  
  return allSpells
}

/**
 * Get all races
 */
export async function getAllRaces() {
  const data = await loadDataFile('races.json')
  return data?.race || []
}

/**
 * Get all classes
 */
export async function getAllClasses() {
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
  
  return allClasses
}

/**
 * Get all items
 */
export async function getAllItems() {
  const data = await loadDataFile('items.json')
  return data?.item || []
}

/**
 * Get all backgrounds
 */
export async function getAllBackgrounds() {
  const data = await loadDataFile('backgrounds.json')
  return data?.background || []
}

/**
 * Get all adventures
 */
export async function getAllAdventures() {
  const data = await loadDataFile('adventures.json')
  return data?.adventure || []
}

/**
 * Get all feats
 */
export async function getAllFeats() {
  const data = await loadDataFile('feats.json')
  return data?.feat || []
}

/**
 * Load all content types
 */
export async function loadAllContent() {
  const [spells, races, classes, items, backgrounds, adventures, feats] = await Promise.all([
    getAllSpells(),
    getAllRaces(),
    getAllClasses(),
    getAllItems(),
    getAllBackgrounds(),
    getAllAdventures(),
    getAllFeats()
  ])

  return {
    spells,
    races,
    classes,
    items,
    backgrounds,
    adventures,
    feats
  }
}

/**
 * Get content statistics
 */
export async function getContentStats() {
  const content = await loadAllContent()
  
  return {
    spells: content.spells.length,
    races: content.races.length,
    classes: content.classes.filter(c => !c.isSubclass).length,
    subclasses: content.classes.filter(c => c.isSubclass).length,
    items: content.items.length,
    backgrounds: content.backgrounds.length,
    adventures: content.adventures.length,
    feats: content.feats.length
  }
}