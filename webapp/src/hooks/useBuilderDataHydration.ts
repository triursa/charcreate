'use client'

import { useEffect, useMemo } from 'react'

import { useCharacterBuilder } from '@/state/character-builder'
import { useAncestries } from '@/hooks/useAncestries'
import { useBackgrounds } from '@/hooks/useBackgrounds'

export interface BuilderHydrationStatus {
  ancestry: {
    loading: boolean
    error: string | null
  }
  background: {
    loading: boolean
    error: string | null
  }
}

export function useBuilderDataHydration(): BuilderHydrationStatus {
  const {
    state,
    actions: { setAncestry, setBackground }
  } = useCharacterBuilder()

  const shouldLoadAncestry = Boolean(
    state.ancestryId && (!state.ancestryData || state.ancestryData.id !== state.ancestryId)
  )
  const shouldLoadBackground = Boolean(
    state.backgroundId && (!state.backgroundData || state.backgroundData.id !== state.backgroundId)
  )

  const ancestryResult = useAncestries({ enabled: shouldLoadAncestry })
  const backgroundResult = useBackgrounds({ enabled: shouldLoadBackground })

  useEffect(() => {
    if (!shouldLoadAncestry) {
      return
    }

    const record = ancestryResult.ancestries.find((ancestry) => ancestry.id === state.ancestryId)
    if (record) {
      setAncestry(record)
    }
  }, [ancestryResult.ancestries, setAncestry, shouldLoadAncestry, state.ancestryId])

  useEffect(() => {
    if (!shouldLoadBackground) {
      return
    }

    const record = backgroundResult.backgrounds.find((background) => background.id === state.backgroundId)
    if (record) {
      setBackground(record)
    }
  }, [backgroundResult.backgrounds, setBackground, shouldLoadBackground, state.backgroundId])

  return useMemo(
    () => ({
      ancestry: {
        loading: ancestryResult.loading,
        error: ancestryResult.error
      },
      background: {
        loading: backgroundResult.loading,
        error: backgroundResult.error
      }
    }),
    [ancestryResult.error, ancestryResult.loading, backgroundResult.error, backgroundResult.loading]
  )
}
