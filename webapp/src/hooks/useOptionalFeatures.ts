'use client'

import { useEffect, useMemo, useState } from 'react'

import { getContentByCategory } from '../lib/clientDataLoader'
import type { OptionalFeatureRecord } from '../types/optional-features'

interface UseOptionalFeaturesResult {
  optionalFeatures: OptionalFeatureRecord[]
  optionalFeaturesByType: Record<string, OptionalFeatureRecord[]>
  optionalFeaturesById: Record<string, OptionalFeatureRecord>
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
  if (typeof value === 'object' && value !== null) {
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

function normalizeOptionalFeature(raw: any, index: number): OptionalFeatureRecord | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const idValue = (raw as { id?: unknown }).id
  const nameValue = (raw as { name?: unknown }).name
  const sourceValue = (raw as { source?: unknown }).source
  const featureTypeValue = (raw as { featureType?: unknown }).featureType

  const name = typeof nameValue === 'string' && nameValue.trim().length > 0 ? nameValue : undefined
  const id =
    typeof idValue === 'string' && idValue.trim().length > 0
      ? idValue
      : slugify(name ?? '') || `optional-feature-${index + 1}`

  const featureTypes = Array.isArray(featureTypeValue)
    ? featureTypeValue.filter((entry: unknown): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : typeof featureTypeValue === 'string'
      ? [featureTypeValue]
      : []

  if (!id || featureTypes.length === 0) {
    return null
  }

  const description = extractText((raw as { entries?: unknown }).entries)
  const source = typeof sourceValue === 'string' ? sourceValue : undefined

  return {
    id,
    name: name ?? id,
    source,
    featureTypes,
    description: description ?? undefined,
    raw
  }
}

export function useOptionalFeatures(): UseOptionalFeaturesResult {
  const [optionalFeatures, setOptionalFeatures] = useState<OptionalFeatureRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const data = await getContentByCategory('optionalfeatures')
        if (!active) return

        if (Array.isArray(data)) {
          const normalized = data
            .map((entry, index) => normalizeOptionalFeature(entry, index))
            .filter((entry): entry is OptionalFeatureRecord => Boolean(entry))
          setOptionalFeatures(normalized)
        } else {
          setOptionalFeatures([])
        }
        setError(undefined)
      } catch (err) {
        if (!active) return
        setOptionalFeatures([])
        setError(err as Error)
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

  const { sorted, byType, byId } = useMemo(() => {
    if (!optionalFeatures || optionalFeatures.length === 0) {
      return {
        sorted: [] as OptionalFeatureRecord[],
        byType: {} as Record<string, OptionalFeatureRecord[]>,
        byId: {} as Record<string, OptionalFeatureRecord>
      }
    }

    const sortedFeatures = [...optionalFeatures].sort((a, b) => a.name.localeCompare(b.name))
    const byTypeMap: Record<string, OptionalFeatureRecord[]> = {}
    const byIdMap: Record<string, OptionalFeatureRecord> = {}

    sortedFeatures.forEach((feature) => {
      byIdMap[feature.id] = feature
      feature.featureTypes.forEach((type) => {
        if (!byTypeMap[type]) {
          byTypeMap[type] = []
        }
        byTypeMap[type].push(feature)
      })
    })

    return { sorted: sortedFeatures, byType: byTypeMap, byId: byIdMap }
  }, [optionalFeatures])

  return {
    optionalFeatures: sorted,
    optionalFeaturesByType: byType,
    optionalFeaturesById: byId,
    isLoading,
    error
  }
}
