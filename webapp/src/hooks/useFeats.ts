'use client'

import { useEffect, useMemo, useState } from 'react'

import { FEAT_METADATA } from '../lib/featMetadata'
import { getContentByCategory } from '../lib/clientDataLoader'
import type { FeatDefinition } from '../types/catalogue'

interface UseFeatsResult {
  feats: FeatDefinition[]
  isLoading: boolean
  error?: Error
}

function slugify(value?: string | null): string {
  if (!value) return ''
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractText(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value
      .map((entry) => extractText(entry))
      .filter(Boolean)
      .join('\n')
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.entry === 'string') return record.entry
    if (Array.isArray(record.entries)) return extractText(record.entries)
    if (typeof record.text === 'string') return record.text
    if (typeof record.name === 'string' && Array.isArray(record.entries)) {
      const nested = extractText(record.entries)
      return nested ? `${record.name}: ${nested}` : record.name
    }
  }
  return undefined
}

function normalizePrerequisites(raw: unknown): string[] | undefined {
  if (!raw) return undefined
  if (typeof raw === 'string') return [raw]
  if (Array.isArray(raw)) {
    const flattened = raw
      .map((entry) => normalizePrerequisites(entry))
      .flat()
      .filter(Boolean) as string[]
    return flattened.length > 0 ? flattened : undefined
  }
  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if (typeof record.text === 'string') return [record.text]
    if (typeof record.name === 'string') return [record.name]
    if (Array.isArray(record.entries)) {
      const flattened = record.entries
        .map((entry) => normalizePrerequisites(entry))
        .flat()
        .filter(Boolean) as string[]
      return flattened.length > 0 ? flattened : undefined
    }
  }
  return undefined
}

function buildDefaultFeature(featId: string, name: string, description?: string) {
  if (!description) return undefined
  return {
    id: `feat-${featId}`,
    name,
    source: [`Feat: ${name}`],
    description,
    mergeStrategy: 'set' as const
  }
}

function normalizeFeat(raw: any): FeatDefinition {
  const id = slugify(raw?.name) || (typeof raw?.id === 'string' ? slugify(raw.id) : 'feat')
  const name = typeof raw?.name === 'string' ? raw.name : 'Unknown Feat'
  const metadata = FEAT_METADATA[id]

  const description = metadata?.description ?? extractText(raw?.description ?? raw?.entries)
  const features = metadata?.features ?? [buildDefaultFeature(id, name, description)].filter(Boolean)

  const prerequisites = normalizePrerequisites(raw?.prerequisite)

  return {
    id,
    name,
    description,
    abilityIncreases: metadata?.abilityIncreases,
    features: features as FeatDefinition['features'],
    prerequisites,
    source: raw?.source,
    raw
  }
}

function buildFeatList(rawFeats: any[]): FeatDefinition[] {
  if (!Array.isArray(rawFeats) || rawFeats.length === 0) {
    return []
  }
  return rawFeats.map((entry) => normalizeFeat(entry))
}

export function useFeats(): UseFeatsResult {
  const [feats, setFeats] = useState<FeatDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const data = await getContentByCategory('feats')
        if (!active) return
        const normalized = buildFeatList(data)
        setFeats(normalized)
        setError(undefined)
      } catch (err) {
        if (!active) return
        setError(err as Error)
        setFeats([])
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const sorted = useMemo(() => {
    if (!feats || feats.length === 0) {
      return []
    }
    return [...feats].sort((a, b) => a.name.localeCompare(b.name))
  }, [feats])

  return { feats: sorted, isLoading, error }
}

export const __testUtils = {
  buildFeatList,
  normalizeFeat
}
