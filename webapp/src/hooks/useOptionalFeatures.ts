'use client'

import { useEffect, useMemo, useState } from 'react'

import { getContentByCategory } from '../lib/clientDataLoader'

export interface OptionalFeatureRecord {
  id?: string
  name?: string
  source?: string
  [key: string]: unknown
}

interface UseOptionalFeaturesResult {
  optionalFeatures: OptionalFeatureRecord[]
  isLoading: boolean
  error?: Error
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
          setOptionalFeatures(data as OptionalFeatureRecord[])
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

  const sorted = useMemo(() => {
    if (!optionalFeatures || optionalFeatures.length === 0) {
      return []
    }

    return [...optionalFeatures].sort((a, b) => {
      const aName = typeof a.name === 'string' ? a.name : ''
      const bName = typeof b.name === 'string' ? b.name : ''
      return aName.localeCompare(bName)
    })
  }, [optionalFeatures])

  return { optionalFeatures: sorted, isLoading, error }
}
