// Client-side data loading utilities

export interface ContentStats {
  spells: number
  races: number
  classes: number
  subclasses: number
  items: number
  backgrounds: number
  feats: number
  optionalfeatures: number
}

export interface AllContent {
  spells: any[]
  races: any[]
  classes: any[]
  items: any[]
  backgrounds: any[]
  feats: any[]
  optionalfeatures: any[]
  [key: string]: any[]
}

export type ContentCategory =
  | 'spells'
  | 'races'
  | 'classes'
  | 'items'
  | 'backgrounds'
  | 'feats'
  | 'optionalfeatures'

export const CONTENT_CATEGORIES: ContentCategory[] = [
  'spells',
  'races',
  'classes',
  'items',
  'backgrounds',
  'feats',
  'optionalfeatures'
]

interface CategoryResponse {
  content?: Record<string, any[]>
  stats?: ContentStats
}

const categoryDataCache = new Map<string, any[]>()
const categoryPromiseCache = new Map<string, Promise<any[]>>()

let statsCache: ContentStats | null = null
let statsPromise: Promise<ContentStats> | null = null

let allContentCache: AllContent | null = null
let allContentPromise: Promise<AllContent> | null = null

function mergeIntoAllContentCache(partial: Record<string, any[]>) {
  if (!allContentCache) {
    allContentCache = { ...partial } as AllContent
    CONTENT_CATEGORIES.forEach((category) => {
      if (!allContentCache![category]) {
        allContentCache![category] = []
      }
    })
    return
  }

  let changed = false
  const next = { ...allContentCache }

  Object.entries(partial).forEach(([category, data]) => {
    if (next[category] !== data) {
      next[category] = data
      changed = true
    }
  })

  if (changed) {
    allContentCache = next
  }
}

async function fetchCategories(categories: string[]): Promise<Record<string, any[]>> {
  const params = new URLSearchParams()
  params.set('category', categories.join(','))

  const response = await fetch(`/api/data?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: CategoryResponse = await response.json()
  const content = data.content ?? {}

  categories.forEach((category) => {
    if (!content[category]) {
      content[category] = []
    }
  })

  return content
}

function normalizeCategory(category: string): string {
  return category.trim()
}

async function requestCategory(category: string): Promise<any[]> {
  const normalizedCategory = normalizeCategory(category)

  if (allContentPromise) {
    return allContentPromise.then((content) => content[normalizedCategory] ?? [])
  }

  const fetchPromise = (async () => {
    try {
      const content = await fetchCategories([normalizedCategory])
      const data = content[normalizedCategory] ?? []

      categoryDataCache.set(normalizedCategory, data)
      mergeIntoAllContentCache({ [normalizedCategory]: data })

      return data
    } finally {
      categoryPromiseCache.delete(normalizedCategory)
    }
  })()

  categoryPromiseCache.set(normalizedCategory, fetchPromise)
  return fetchPromise
}

export interface DataResponse {
  content: AllContent
  stats: ContentStats
}

/**
 * Load all content from the API
 */
export async function loadAllContent(): Promise<AllContent> {
  if (allContentCache) {
    return allContentCache
  }

  if (allContentPromise) {
    return allContentPromise
  }

  const fetchPromise = (async () => {
    try {
      const content = await fetchCategories(CONTENT_CATEGORIES)

      CONTENT_CATEGORIES.forEach((category) => {
        const data = content[category] ?? []
        categoryDataCache.set(category, data)
      })

      mergeIntoAllContentCache(content)
      const cached = allContentCache
      if (!cached) {
        throw new Error('Failed to populate content cache')
      }
      return cached
    } catch (error) {
      allContentCache = null
      throw error
    } finally {
      allContentPromise = null
    }
  })()

  allContentPromise = fetchPromise
  return fetchPromise
}

/**
 * Get content statistics
 */
export async function getContentStats(): Promise<ContentStats> {
  if (statsCache) {
    return statsCache
  }

  if (statsPromise) {
    return statsPromise
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch('/api/data?statsOnly=true')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: { stats?: ContentStats } = await response.json()
      statsCache = data.stats ?? {
        spells: 0,
        races: 0,
        classes: 0,
        subclasses: 0,
        items: 0,
        backgrounds: 0,
        feats: 0,
        optionalfeatures: 0
      }
      return statsCache
    } finally {
      statsPromise = null
    }
  })()

  statsPromise = fetchPromise
  return fetchPromise
}

/**
 * Get specific content type by category
 */
export async function getContentByCategory(category: string): Promise<any[]> {
  const normalizedCategory = normalizeCategory(category)

  if (categoryDataCache.has(normalizedCategory)) {
    return categoryDataCache.get(normalizedCategory) as any[]
  }

  if (categoryPromiseCache.has(normalizedCategory)) {
    return categoryPromiseCache.get(normalizedCategory) as Promise<any[]>
  }

  return requestCategory(normalizedCategory)
}