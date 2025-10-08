'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import { AdvancedCharacterLayout } from '@/components/character/AdvancedCharacterLayout'
import { ExportPanel } from '@/components/character/ExportPanel'
import { GuidedCharacterLayout } from '@/components/character/GuidedCharacterLayout'
import { useBuilderDataHydration } from '@/hooks/useBuilderDataHydration'
import type { CharacterBuilderState } from '@/state/character-builder'
import { useCharacterBuilder } from '@/state/character-builder'
import { listSavedBuilds, loadSavedBuild, saveBuild, type SavedBuildRecord } from '@/state/character-storage'

type ViewMode = 'guided' | 'advanced'

const VIEW_MODE_STORAGE_KEY = 'character-planner:view-mode'

export function CharacterLayout() {
  const {
    warnings,
    state,
    pendingDecisions,
    actions: { loadState }
  } = useCharacterBuilder()
  const [viewMode, setViewMode] = useState<ViewMode>('advanced')
  const [savedBuildName, setSavedBuildName] = useState('')
  const [savedBuilds, setSavedBuilds] = useState<SavedBuildRecord<CharacterBuilderState>[]>([])

  const hydration = useBuilderDataHydration()

  const refreshSavedBuilds = useCallback(() => {
    setSavedBuilds(listSavedBuilds<CharacterBuilderState>())
  }, [])

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
    refreshSavedBuilds()
  }, [refreshSavedBuilds])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

  const handleSaveBuild = () => {
    const defaultName = state.basics.name?.trim() || 'Unnamed Build'
    const name = window.prompt('Save build as', defaultName)
    if (!name) {
      return
    }

    saveBuild<CharacterBuilderState>(name, state)
    refreshSavedBuilds()
  }

  const handleLoadBuild = (name: string) => {
    if (!name) {
      return
    }

    const saved = loadSavedBuild<CharacterBuilderState>(name)
    if (!saved) {
      return
    }

    loadState(saved.state)
    setSavedBuildName('')
  }

  const savedBuildOptions = useMemo(
    () =>
      savedBuilds.map((build) => {
        const savedDate = new Date(build.savedAt)
        const isValidDate = !Number.isNaN(savedDate.getTime())

        return {
          name: build.name,
          label: isValidDate ? `${build.name} (${savedDate.toLocaleString()})` : build.name
        }
      }),
    [savedBuilds]
  )

  const isAdvancedView = viewMode === 'advanced'

  const connectionStatus = useMemo(() => {
    if (hydration.ancestry.error || hydration.background.error) {
      return {
        label: 'Sync needed',
        description: 'Some catalogue requests failed. Refresh the page to retry the database connection.',
        badgeClass:
          'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200 border border-amber-200/60 dark:border-amber-500/30'
      }
    }

    if (hydration.ancestry.loading || hydration.background.loading) {
      return {
        label: 'Syncing compendium…',
        description: 'Fetching ancestries and backgrounds directly from the Prisma-backed database.',
        badgeClass:
          'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200 border border-sky-200/60 dark:border-sky-500/30'
      }
    }

    return {
      label: 'Connected to compendium',
      description: 'Every ancestry and background in the builder is sourced live from your stored dataset.',
      badgeClass:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-500/30'
    }
  }, [hydration])

  const ancestryLabel = state.ancestryData?.name
    ? state.ancestryData.name
    : hydration.ancestry.loading
      ? 'Syncing ancestries…'
      : 'Select an ancestry'

  const backgroundLabel = state.backgroundData?.name
    ? state.backgroundData.name
    : hydration.background.loading
      ? 'Syncing backgrounds…'
      : 'Select a background'

  const descriptor = state.basics.descriptor?.trim()
  const activeModeDescription = isAdvancedView
    ? 'Advanced mode unlocks every panel for free-form planning.'
    : 'Guided mode walks you through each stage with curated prompts.'

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-0 -z-10 h-48 rounded-full bg-gradient-to-r from-sky-400/30 via-indigo-400/20 to-fuchsia-400/20 blur-3xl dark:from-sky-500/20 dark:via-indigo-500/10 dark:to-fuchsia-500/10"
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <span
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm',
                connectionStatus.badgeClass
              )}
            >
              {connectionStatus.label}
            </span>
            <div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                Interactive Character Planner
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {connectionStatus.description}
              </p>
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:max-w-xl">
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hero</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {state.basics.name?.trim() || 'New Character'}
                </dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{descriptor || 'Define a tagline to personalise the sheet.'}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ancestry</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{ancestryLabel}</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {state.ancestryData?.source ? `Source: ${state.ancestryData.source}` : 'Choose a lineage to unlock cultural traits.'}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Background</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{backgroundLabel}</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {state.backgroundData?.feature?.name
                    ? state.backgroundData.feature.name
                    : 'Pick a background to load proficiencies and hooks.'}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Progress</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  Level {state.level} · {pendingDecisions.length} pending choice{pendingDecisions.length === 1 ? '' : 's'}
                </dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activeModeDescription}</dd>
              </div>
            </dl>

            <div
              role="group"
              aria-label="Character planner view mode"
              className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/70 p-1 text-sm shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60"
            >
              {(['guided', 'advanced'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={clsx(
                    'rounded-full px-4 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
                    viewMode === mode
                      ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  )}
                >
                  {mode === 'guided' ? 'Guided' : 'Advanced'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm space-y-4 lg:w-auto">
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Session tools</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Save snapshots locally and reload them as you iterate.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveBuild}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
                >
                  Save Build
                </button>
                <label className="sr-only" htmlFor="saved-build-select">
                  Load saved build
                </label>
                <select
                  id="saved-build-select"
                  value={savedBuildName}
                  onChange={(event) => {
                    const name = event.target.value
                    setSavedBuildName(name)
                    handleLoadBuild(name)
                  }}
                  className="rounded-full border border-slate-300/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200"
                >
                  <option value="">Load saved build…</option>
                  {savedBuildOptions.length === 0 && <option value="" disabled>No saved builds yet</option>}
                  {savedBuildOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
              <ExportPanel />
            </div>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-8 rounded-3xl border border-amber-300/70 bg-amber-50/80 p-6 text-amber-900 shadow-sm dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-200">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        {isAdvancedView ? (
          <AdvancedCharacterLayout />
        ) : (
          <GuidedCharacterLayout hydration={hydration} />
        )}
      </div>
    </div>
  )
}
