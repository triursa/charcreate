'use client'

import { useEffect, useState } from 'react'

import { AdvancedCharacterLayout } from '@/components/character/AdvancedCharacterLayout'
import { ExportPanel } from '@/components/character/ExportPanel'
import { GuidedCharacterLayout } from '@/components/character/GuidedCharacterLayout'
import { useCharacterBuilder } from '@/state/character-builder'

type ViewMode = 'guided' | 'advanced'

const VIEW_MODE_STORAGE_KEY = 'character-planner:view-mode'

export function CharacterLayout() {
  const { warnings } = useCharacterBuilder()
  const [viewMode, setViewMode] = useState<ViewMode>('advanced')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)

    if (storedMode === 'guided' || storedMode === 'advanced') {
      setViewMode(storedMode)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

  const isAdvancedView = viewMode === 'advanced'

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Interactive Character Planner</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Build a 5e character from level 0 through 20 with guided choices, automatic rules calculations, and printable
            exports.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            role="group"
            aria-label="Character planner view mode"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setViewMode('guided')}
              className={`rounded-md px-3 py-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
                viewMode === 'guided'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              aria-pressed={viewMode === 'guided'}
            >
              Guided
            </button>
            <button
              type="button"
              onClick={() => setViewMode('advanced')}
              className={`rounded-md px-3 py-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
                isAdvancedView
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              aria-pressed={isAdvancedView}
            >
              Advanced
            </button>
          </div>
          <ExportPanel />
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {isAdvancedView ? <AdvancedCharacterLayout /> : <GuidedCharacterLayout />}
    </div>
  )
}
