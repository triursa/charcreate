'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BackgroundRecord } from '@/types/character-builder'

interface UseBackgroundsOptions {
  enabled?: boolean
  fetcher?: typeof fetch
}

interface UseBackgroundsResult {
  backgrounds: BackgroundRecord[]
  backgroundIds: string[]
  loading: boolean
  error: string | null
  refresh: () => void
}

interface BackgroundCache {
  data: BackgroundRecord[]
}

let backgroundCache: BackgroundCache | null = null

export function __resetBackgroundCacheForTests() {
  backgroundCache = null
}

export function useBackgrounds({ enabled = true, fetcher }: UseBackgroundsOptions = {}): UseBackgroundsResult {
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

  const [backgrounds, setBackgrounds] = useState<BackgroundRecord[]>(backgroundCache?.data ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (backgrounds.length > 0 && reloadToken === 0) {
      return
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
    const requestId = ++requestIdRef.current

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchRef.current('/api/backgrounds', {
          signal: controller?.signal
        })

        if (!response.ok) {
          throw new Error('Unable to load backgrounds')
        }

        const payload = (await response.json()) as BackgroundRecord[]
        if (requestIdRef.current !== requestId || !isMountedRef.current) {
          return
        }
        backgroundCache = { data: payload }
        setBackgrounds(payload)
      } catch (err) {
        if ((err as any)?.name === 'AbortError') {
          return
        }

        const message = err instanceof Error ? err.message : 'Failed to load backgrounds'
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
  }, [backgrounds.length, enabled, reloadToken])

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const backgroundIds = useMemo(() => backgrounds.map((background) => background.id), [backgrounds])

  return {
    backgrounds,
    backgroundIds,
    loading,
    error,
    refresh
  }
}
