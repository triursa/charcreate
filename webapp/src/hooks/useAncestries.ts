'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { AncestryRecord } from '@/types/character-builder'

interface UseAncestriesOptions {
  enabled?: boolean
  fetcher?: typeof fetch
}

interface UseAncestriesResult {
  ancestries: AncestryRecord[]
  ancestryIds: string[]
  loading: boolean
  error: string | null
  refresh: () => void
}

interface AncestryCache {
  data: AncestryRecord[]
}

let ancestryCache: AncestryCache | null = null

export function __resetAncestryCacheForTests() {
  ancestryCache = null
}

export function useAncestries({ enabled = true, fetcher }: UseAncestriesOptions = {}): UseAncestriesResult {
  const fetchRef = useRef(fetcher ?? fetch)
  const requestIdRef = useRef(0)
  const isMountedRef = useRef(true)
  useEffect(() => {
    fetchRef.current = fetcher ?? fetch
  }, [fetcher])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const [ancestries, setAncestries] = useState<AncestryRecord[]>(ancestryCache?.data ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (ancestries.length > 0 && reloadToken === 0) {
      return
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
    const requestId = ++requestIdRef.current

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchRef.current('/api/races', {
          signal: controller?.signal
        })

        if (!response.ok) {
          throw new Error('Unable to load ancestries')
        }

        const payload = (await response.json()) as AncestryRecord[]
        if (requestIdRef.current !== requestId || !isMountedRef.current) {
          return
        }
        ancestryCache = { data: payload }
        setAncestries(payload)
      } catch (err) {
        if ((err as any)?.name === 'AbortError') {
          return
        }

        const message = err instanceof Error ? err.message : 'Failed to load ancestries'
        setError(message)
      } finally {
        if (requestIdRef.current === requestId && isMountedRef.current) {
          setLoading(false)
          if (reloadToken > 0) {
            setReloadToken(0)
          }
        }
      }
    }

    void run()

    return () => {
      controller?.abort()
    }
  }, [ancestries.length, enabled, reloadToken])

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const ancestryIds = useMemo(() => ancestries.map((ancestry) => ancestry.id), [ancestries])

  return {
    ancestries,
    ancestryIds,
    loading,
    error,
    refresh
  }
}
