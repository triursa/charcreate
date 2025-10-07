'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import {
  type AllContent,
  type ContentStats,
  type ContentCategory,
  CONTENT_CATEGORIES,
  getContentByCategory,
  getContentStats,
  loadAllContent
} from '@/lib/clientDataLoader'

interface ContentDataContextValue {
  content: Record<string, any[] | undefined>
  stats: ContentStats | null
  getCategoryData: (category: ContentCategory) => Promise<any[]>
  getAllContent: () => Promise<AllContent>
  getStats: () => Promise<ContentStats>
}

const ContentDataContext = createContext<ContentDataContextValue | undefined>(undefined)

export function ContentDataProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Record<string, any[] | undefined>>({})
  const [stats, setStats] = useState<ContentStats | null>(null)

  const getCategoryData = useCallback(async (category: ContentCategory) => {
    const data = await getContentByCategory(category)

    setContent((previous) => {
      if (previous[category] === data) {
        return previous
      }

      return {
        ...previous,
        [category]: data
      }
    })

    return data
  }, [])

  const getAllContentData = useCallback(async () => {
    const data = await loadAllContent()

    setContent((previous) => {
      let changed = false
      const next: Record<string, any[] | undefined> = { ...previous }

      Object.entries(data).forEach(([category, value]) => {
        if (next[category] !== value) {
          next[category] = value
          changed = true
        }
      })

      if (!changed) {
        return previous
      }

      return next
    })

    return data
  }, [])

  const getStatsData = useCallback(async () => {
    if (stats) {
      return stats
    }

    const data = await getContentStats()
    setStats(data)
    return data
  }, [stats])

  const value = useMemo<ContentDataContextValue>(() => ({
    content,
    stats,
    getCategoryData,
    getAllContent: getAllContentData,
    getStats: getStatsData
  }), [content, getAllContentData, getCategoryData, getStatsData, stats])

  return (
    <ContentDataContext.Provider value={value}>
      {children}
    </ContentDataContext.Provider>
  )
}

export function useContentData() {
  const context = useContext(ContentDataContext)

  if (!context) {
    throw new Error('useContentData must be used within a ContentDataProvider')
  }

  return context
}

export function isContentCategory(value: string): value is ContentCategory {
  return (CONTENT_CATEGORIES as readonly string[]).includes(value)
}

export function hasAllCategories(content: Record<string, any[] | undefined>) {
  return CONTENT_CATEGORIES.every((category) => content[category] !== undefined)
}
