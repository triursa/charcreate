import Fuse from 'fuse.js'

/**
 * Search configuration for different content types
 */
const searchConfigs = {
  spells: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'entries', weight: 1 },
      { name: 'school', weight: 1.5 },
      { name: 'source', weight: 0.5 }
    ],
    threshold: 0.3
  },
  races: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'entries.name', weight: 1.5 },
      { name: 'entries.entries', weight: 1 },
      { name: 'source', weight: 0.5 }
    ],
    threshold: 0.3
  },
  classes: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'source', weight: 0.5 },
      { name: 'parentClass', weight: 1.5 }
    ],
    threshold: 0.3
  },
  items: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'entries', weight: 1 },
      { name: 'type', weight: 1.5 },
      { name: 'rarity', weight: 1 },
      { name: 'source', weight: 0.5 }
    ],
    threshold: 0.3
  },
  backgrounds: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'entries.name', weight: 1.5 },
      { name: 'entries.entries', weight: 1 },
      { name: 'source', weight: 0.5 }
    ],
    threshold: 0.3
  },
  adventures: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'storyline', weight: 1.5 },
      { name: 'source', weight: 0.5 }
    ],
    threshold: 0.3
  },
  feats: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'entries', weight: 1 },
      { name: 'source', weight: 0.5 }
    ],
    threshold: 0.3
  }
}

const fuseCache = new Map<string, WeakMap<any[], Fuse<any>>>()

/**
 * Create (or reuse) a search index for the given content type
 */
export function createSearchIndex(content: any[], type: string) {
  const config = searchConfigs[type as keyof typeof searchConfigs]
  if (!config) {
    throw new Error(`No search configuration found for type: ${type}`)
  }

  let typeCache = fuseCache.get(type)
  if (!typeCache) {
    typeCache = new WeakMap<any[], Fuse<any>>()
    fuseCache.set(type, typeCache)
  }

  const cached = typeCache.get(content)
  if (cached) {
    return cached
  }

  const fuse = new Fuse(content, config)
  typeCache.set(content, fuse)
  return fuse
}

/**
 * Search across all content types
 */
export function searchAllContent(
  allContent: Record<string, any[]>, 
  query: string,
  maxResults: number = 50
) {
  const results: Array<{ item: any; type: string; score: number }> = []
  
  Object.entries(allContent).forEach(([type, content]) => {
    if (content && content.length > 0) {
      const fuse = createSearchIndex(content, type)
      const searchResults = fuse.search(query, { limit: Math.ceil(maxResults / Object.keys(allContent).length) })
      
      searchResults.forEach(result => {
        results.push({
          item: result.item,
          type,
          score: result.score || 0
        })
      })
    }
  })
  
  // Sort by relevance score (lower is better in Fuse.js)
  return results.sort((a, b) => a.score - b.score).slice(0, maxResults)
}

/**
 * Filter content based on criteria
 */
export function filterContent(
  content: any[],
  type: string,
  filters: {
    source?: string[]
    level?: number[]
    rarity?: string[]
    school?: string[]
  }
) {
  return content.filter(item => {
    // Source filter
    if (filters.source && filters.source.length > 0) {
      if (!filters.source.includes(item.source)) {
        return false
      }
    }
    
    // Level filter (for spells)
    if (filters.level && filters.level.length > 0 && type === 'spells') {
      if (!filters.level.includes(item.level)) {
        return false
      }
    }
    
    // Rarity filter (for items)
    if (filters.rarity && filters.rarity.length > 0 && type === 'items') {
      if (!filters.rarity.includes(item.rarity)) {
        return false
      }
    }
    
    // School filter (for spells)
    if (filters.school && filters.school.length > 0 && type === 'spells') {
      if (!filters.school.includes(item.school)) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Get unique values for filter options
 */
export function getFilterOptions(content: any[], type: string) {
  const sources = new Set<string>()
  const levels = new Set<number>()
  const rarities = new Set<string>()
  const schools = new Set<string>()
  
  content.forEach(item => {
    if (item.source) sources.add(item.source)
    if (typeof item.level === 'number') levels.add(item.level)
    if (item.rarity) rarities.add(item.rarity)
    if (item.school) schools.add(item.school)
  })
  
  return {
    sources: Array.from(sources).sort(),
    levels: Array.from(levels).sort((a, b) => a - b),
    rarities: Array.from(rarities).sort(),
    schools: Array.from(schools).sort()
  }
}