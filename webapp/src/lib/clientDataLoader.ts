// Client-side data loading utilities

export interface ContentStats {
  spells: number
  races: number
  classes: number
  subclasses: number
  items: number
  backgrounds: number
  feats: number
}

export interface AllContent {
  spells: any[]
  races: any[]
  classes: any[]
  items: any[]
  backgrounds: any[]
  feats: any[]
}

export interface DataResponse {
  content: AllContent
  stats: ContentStats
}

/**
 * Load all content from the API
 */
export async function loadAllContent(): Promise<AllContent> {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: DataResponse = await response.json()
    return data.content
  } catch (error) {
    console.error('Error loading content:', error)
    // Return empty content structure on error
    return {
      spells: [],
      races: [],
      classes: [],
      items: [],
      backgrounds: [],
      feats: []
    }
  }
}

/**
 * Get content statistics
 */
export async function getContentStats(): Promise<ContentStats> {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: DataResponse = await response.json()
    return data.stats
  } catch (error) {
    console.error('Error loading stats:', error)
    // Return empty stats on error
    return {
      spells: 0,
      races: 0,
      classes: 0,
      subclasses: 0,
      items: 0,
      backgrounds: 0,
      feats: 0
    }
  }
}

/**
 * Get specific content type by category
 */
export async function getContentByCategory(category: string): Promise<any[]> {
  try {
    const allContent = await loadAllContent()
    return allContent[category as keyof AllContent] || []
  } catch (error) {
    console.error(`Error loading ${category}:`, error)
    return []
  }
}