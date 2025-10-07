'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { AbilityGrid } from '@/components/character/AbilityGrid'
import {
  AncestrySelector,
  type AncestryRecord,
  getAncestrySummary
} from '@/components/character/AncestrySelector'
import {
  BackgroundSelector,
  type BackgroundRecord,
  extractBackgroundValues,
  getBackgroundSummary
} from '@/components/character/BackgroundSelector'
import { ClassLeveler } from '@/components/character/ClassLeveler'
import { DecisionQueue } from '@/components/character/DecisionQueue'
import { FeatureList } from '@/components/character/FeatureList'
import { OverviewCard } from '@/components/character/OverviewCard'
import { StatsPanel } from '@/components/character/StatsPanel'
import { useCharacterBuilder } from '@/state/character-builder'
import { CharacterSheet } from '@/components/character/CharacterSheet'
import {
  SelectionModal,
  type SelectionModalFilterConfig
} from '@/components/character/SelectionModal'

interface StepStatus {
  complete: boolean
  message?: string
}

interface StepDefinition {
  id: string
  title: string
  description: string
  render: () => ReactNode
  getStatus: () => StepStatus
}

export function GuidedCharacterLayout() {
  const { state, pendingDecisions, actions } = useCharacterBuilder()

  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [targetLevel, setTargetLevel] = useState(() => Math.max(1, state.level))
  const [isAncestryModalOpen, setIsAncestryModalOpen] = useState(false)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)
  const [ancestries, setAncestries] = useState<AncestryRecord[]>([])
  const [backgrounds, setBackgrounds] = useState<BackgroundRecord[]>([])
  const [ancestryLoading, setAncestryLoading] = useState(false)
  const [backgroundLoading, setBackgroundLoading] = useState(false)
  const [ancestryError, setAncestryError] = useState<string | null>(null)
  const [backgroundError, setBackgroundError] = useState<string | null>(null)
  const [pendingAncestryId, setPendingAncestryId] = useState<string | null>(null)
  const [pendingBackgroundId, setPendingBackgroundId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAncestryModalOpen || ancestries.length > 0 || ancestryLoading) {
      return
    }

    let cancelled = false
    setAncestryLoading(true)
    setAncestryError(null)

    fetch('/api/races')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load ancestries')
        }
        return response.json()
      })
      .then((data: AncestryRecord[]) => {
        if (!cancelled) {
          setAncestries(data)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAncestryError(error instanceof Error ? error.message : 'Failed to load ancestries')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAncestryLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [ancestries.length, ancestryLoading, isAncestryModalOpen])

  useEffect(() => {
    if (!isBackgroundModalOpen || backgrounds.length > 0 || backgroundLoading) {
      return
    }

    let cancelled = false
    setBackgroundLoading(true)
    setBackgroundError(null)

    fetch('/api/backgrounds')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load backgrounds')
        }
        return response.json()
      })
      .then((data: BackgroundRecord[]) => {
        if (!cancelled) {
          setBackgrounds(data)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBackgroundError(error instanceof Error ? error.message : 'Failed to load backgrounds')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBackgroundLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [backgroundLoading, backgrounds.length, isBackgroundModalOpen])

  useEffect(() => {
    if (isAncestryModalOpen) {
      setPendingAncestryId(state.ancestryId ?? null)
    }
  }, [isAncestryModalOpen, state.ancestryId])

  useEffect(() => {
    if (isBackgroundModalOpen) {
      setPendingBackgroundId(state.backgroundId ?? null)
    }
  }, [isBackgroundModalOpen, state.backgroundId])

  const selectedAncestry: AncestryRecord | undefined = useMemo(() => {
    if (state.ancestryData) {
      return state.ancestryData as AncestryRecord
    }
    return ancestries.find((ancestry) => ancestry.id === state.ancestryId)
  }, [ancestries, state.ancestryData, state.ancestryId])

  const selectedBackground: BackgroundRecord | undefined = useMemo(() => {
    if (state.backgroundData) {
      return state.backgroundData as BackgroundRecord
    }
    return backgrounds.find((background) => background.id === state.backgroundId)
  }, [backgrounds, state.backgroundData, state.backgroundId])

  const ancestryFilters: SelectionModalFilterConfig[] = useMemo(() => {
    const traitOptions = Array.from(
      new Set(
        ancestries.flatMap((ancestry) => ancestry.traitTags?.filter(Boolean) ?? [])
      )
    ).sort((a, b) => a.localeCompare(b))

    const originOptions = Array.from(
      new Set(ancestries.map((ancestry) => ancestry.source).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    return [
      {
        id: 'trait',
        label: 'Trait Tag',
        options: [
          { value: 'all', label: 'All Traits' },
          ...traitOptions.map((tag) => ({ value: tag, label: tag }))
        ]
      },
      {
        id: 'origin',
        label: 'Origin',
        options: [
          { value: 'all', label: 'All Origins' },
          ...originOptions.map((origin) => ({ value: origin, label: origin }))
        ]
      }
    ]
  }, [ancestries])

  const backgroundFilters: SelectionModalFilterConfig[] = useMemo(() => {
    const skillOptions = Array.from(
      new Set(
        backgrounds
          .flatMap((background) => extractBackgroundValues(background.skillProficiencies))
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))

    const originOptions = Array.from(
      new Set(backgrounds.map((background) => background.source).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    return [
      {
        id: 'trait',
        label: 'Skills',
        options: [
          { value: 'all', label: 'All Skills' },
          ...skillOptions.map((skill) => ({ value: skill, label: skill }))
        ]
      },
      {
        id: 'origin',
        label: 'Origin',
        options: [
          { value: 'all', label: 'All Origins' },
          ...originOptions.map((origin) => ({ value: origin, label: origin }))
        ]
      }
    ]
  }, [backgrounds])

  const handleConfirmAncestry = () => {
    if (!pendingAncestryId) {
      setIsAncestryModalOpen(false)
      return
    }

    const selection = ancestries.find((ancestry) => ancestry.id === pendingAncestryId)
    actions.setAncestry(selection ?? pendingAncestryId)
    setIsAncestryModalOpen(false)
  }

  const handleConfirmBackground = () => {
    if (!pendingBackgroundId) {
      setIsBackgroundModalOpen(false)
      return
    }

    const selection = backgrounds.find((background) => background.id === pendingBackgroundId)
    actions.setBackground(selection ?? pendingBackgroundId)
    setIsBackgroundModalOpen(false)
  }

  const steps: StepDefinition[] = useMemo(
    () => [
      {
        id: 'basics',
        title: 'Basics',
        description: 'Name, descriptor, and campaign notes for your character.',
        render: () => (
          <div className="space-y-4">
            <OverviewCard />
          </div>
        ),
        getStatus: () => ({
          complete: Boolean(state.basics.name?.trim()),
          message: 'Add a character name to continue.'
        })
      },
      {
        id: 'ancestry',
        title: 'Ancestry',
        description: 'Choose the lineage that shapes your hero\'s culture and traits.',
        render: () => (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Select an Ancestry</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Filter through the compendium of available ancestries and pick the best thematic fit.
              </p>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Current Selection
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {selectedAncestry?.name ?? 'No ancestry selected yet'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {selectedAncestry
                      ? getAncestrySummary(selectedAncestry)
                      : 'Browse the ancestry catalog to discover cultural traits, ability boosts, and story hooks.'}
                  </p>
                </div>

                {ancestryError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                    {ancestryError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAncestryModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                  >
                    Browse ancestries
                  </button>
                  {selectedAncestry && (
                    <button
                      type="button"
                      onClick={() => {
                        actions.setAncestry(undefined)
                        setPendingAncestryId(null)
                      }}
                      className="text-sm font-medium text-slate-600 underline-offset-2 transition hover:underline dark:text-slate-300"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        ),
        getStatus: () => ({
          complete: Boolean(state.ancestryId),
          message: 'Select an ancestry to continue.'
        })
      },
      {
        id: 'background',
        title: 'Background',
        description: 'Determine the experiences that shaped your adventurer before the campaign.',
        render: () => (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Choose a Background</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Backgrounds grant proficiencies, gear, and roleplaying hooks that inform your hero\'s past.
              </p>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Current Selection
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {selectedBackground?.name ?? 'No background selected yet'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {selectedBackground
                      ? getBackgroundSummary(selectedBackground)
                      : 'Open the background library to find the experiences, skills, and connections that shaped your hero.'}
                  </p>
                </div>

                {backgroundError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                    {backgroundError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBackgroundModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                  >
                    Browse backgrounds
                  </button>
                  {selectedBackground && (
                    <button
                      type="button"
                      onClick={() => {
                        actions.setBackground(undefined)
                        setPendingBackgroundId(null)
                      }}
                      className="text-sm font-medium text-slate-600 underline-offset-2 transition hover:underline dark:text-slate-300"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        ),
        getStatus: () => ({
          complete: Boolean(state.backgroundId),
          message: 'Select a background to continue.'
        })
      },
      {
        id: 'ability-scores',
        title: 'Ability Scores',
        description: 'Assign starting ability scores using your preferred method.',
        render: () => (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tune Ability Scores</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Use manual entry or the boss array to assign values before racial adjustments are applied.
              </p>
              <div className="mt-4">
                <AbilityGrid />
              </div>
            </section>
          </div>
        ),
        getStatus: () => ({
          complete: true
        })
      },
      {
        id: 'class-levels',
        title: 'Class & Levels',
        description: 'Pick a class, set a target level, and walk through each level gain.',
        render: () => (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Set Your Goal Level</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Choose the level you want to build towards, then use the progression controls below to reach it.
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={targetLevel}
                    onChange={(event) => setTargetLevel(Number.parseInt(event.target.value, 10))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="w-20 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Level {targetLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current level: {state.level}. {state.level === targetLevel
                    ? 'Target reached. Confirm any choices unlocked below.'
                    : state.level < targetLevel
                      ? `Level up ${targetLevel - state.level} more time(s) to meet your goal.`
                      : `Reduce your level to ${targetLevel} if you overshot your target.`}
                </p>
              </div>
            </section>

            <ClassLeveler />

            {pendingDecisions.length > 0 && (
              <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-500/60 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Resolve Pending Decisions</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Leveling unlocked new class options. Finalize them here before moving on.
                </p>
                <div className="mt-4">
                  <DecisionQueue />
                </div>
              </section>
            )}
          </div>
        ),
        getStatus: () => {
          if (state.level !== targetLevel) {
            return {
              complete: false,
              message: `Use the level progression controls to match your target level of ${targetLevel}.`
            }
          }

          if (pendingDecisions.length > 0) {
            return {
              complete: false,
              message: 'Resolve all pending decisions before continuing.'
            }
          }

          return { complete: true }
        }
      },
      {
        id: 'decision-resolution',
        title: 'Decision Resolution',
        description: 'Confirm that all feat, ASI, and skill selections are locked in.',
        render: () => (
          <div className="space-y-4">
            <DecisionQueue />
          </div>
        ),
        getStatus: () => ({
          complete: pendingDecisions.length === 0,
          message: pendingDecisions.length > 0 ? 'Work through each queued decision to proceed.' : undefined
        })
      },
      {
        id: 'summary',
        title: 'Summary',
        description: 'Review your full printable character sheet before exporting.',
        render: () => (
          <div className="space-y-6">
            <StatsPanel />
            <FeatureList />
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Printable Character Sheet</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                This consolidated sheet displays the information that will be exported or printed.
              </p>
              <div className="mt-6">
                <CharacterSheet />
              </div>
            </div>
          </div>
        ),
        getStatus: () => ({ complete: true })
      }
    ],
    [
      pendingDecisions.length,
      state.ancestryId,
      state.backgroundId,
      state.basics.name,
      state.level,
      targetLevel,
      selectedAncestry,
      selectedBackground,
      ancestryError,
      backgroundError
    ]
  )

  const statuses = steps.map((step) => step.getStatus())
  const currentStatus = statuses[activeStepIndex]
  const isLastStep = activeStepIndex === steps.length - 1

  const isStepUnlocked = (index: number) => {
    if (index === activeStepIndex) return true
    return statuses.slice(0, index).every((status) => status.complete)
  }

  const handleStepChange = (index: number) => {
    if (index === activeStepIndex) return
    if (isStepUnlocked(index)) {
      setActiveStepIndex(index)
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      return
    }

    if (currentStatus.complete) {
      setActiveStepIndex((index) => Math.min(steps.length - 1, index + 1))
    }
  }

  const handleBack = () => {
    setActiveStepIndex((index) => Math.max(0, index - 1))
  }

  const nextLabel = isLastStep ? 'Complete' : 'Next'

  return (
    <>
      <div className="mt-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <ol className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {steps.map((step, index) => {
            const status = statuses[index]
            const isActive = index === activeStepIndex
            const isComplete = status.complete && index !== activeStepIndex
            const stepNumber = index + 1

            return (
              <li
                key={step.id}
                className={`border-b border-slate-200 last:border-b-0 dark:border-slate-800 ${
                  isActive ? 'bg-slate-100/60 dark:bg-slate-900/60' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleStepChange(index)}
                  disabled={!isStepUnlocked(index)}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
                    isActive
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/60'
                  } ${!isStepUnlocked(index) ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                      isComplete
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300'
                        : isActive
                          ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-300'
                          : 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {stepNumber}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="space-y-6">
          {steps[activeStepIndex]?.render()}

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStepIndex === 0}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Back
            </button>

            <div className="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              {currentStatus.message && !currentStatus.complete && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentStatus.message}</p>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isLastStep || !currentStatus.complete}
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
              >
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SelectionModal
        open={isAncestryModalOpen}
        onClose={() => setIsAncestryModalOpen(false)}
        title="Browse Ancestries"
        description="Search and filter the available ancestries to find the perfect cultural fit."
        searchPlaceholder="Search ancestries..."
        filters={ancestryFilters}
        renderContent={({ searchTerm, filters }) => {
          const traitFilter = filters.trait ?? 'all'
          const originFilter = filters.origin ?? 'all'

          if (ancestryLoading && ancestries.length === 0) {
            return <p className="text-sm text-slate-600 dark:text-slate-300">Loading ancestries...</p>
          }

          if (ancestryError && ancestries.length === 0) {
            return (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                {ancestryError}
              </div>
            )
          }

          return (
            <AncestrySelector
              ancestries={ancestries}
              searchTerm={searchTerm}
              traitFilter={traitFilter}
              originFilter={originFilter}
              selectedId={pendingAncestryId}
              onSelect={(ancestry) => setPendingAncestryId(ancestry.id)}
            />
          )
        }}
        renderFooter={({ filters }) => {
          const traitFilter = filters.trait ?? 'all'
          const originFilter = filters.origin ?? 'all'

          return (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing ancestries filtered by {traitFilter === 'all' ? 'all traits' : `trait: ${traitFilter}`} and{' '}
                {originFilter === 'all' ? 'all origins' : `origin: ${originFilter}`}.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAncestryModalOpen(false)}
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAncestry}
                  disabled={!pendingAncestryId}
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
                >
                  Confirm ancestry
                </button>
              </div>
            </div>
          )
        }}
      />

      <SelectionModal
        open={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        title="Browse Backgrounds"
        description="Explore backgrounds to uncover the skills and story hooks that shaped your hero."
        searchPlaceholder="Search backgrounds..."
        filters={backgroundFilters}
        renderContent={({ searchTerm, filters }) => {
          const traitFilter = filters.trait ?? 'all'
          const originFilter = filters.origin ?? 'all'

          if (backgroundLoading && backgrounds.length === 0) {
            return <p className="text-sm text-slate-600 dark:text-slate-300">Loading backgrounds...</p>
          }

          if (backgroundError && backgrounds.length === 0) {
            return (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                {backgroundError}
              </div>
            )
          }

          return (
            <BackgroundSelector
              backgrounds={backgrounds}
              searchTerm={searchTerm}
              traitFilter={traitFilter}
              originFilter={originFilter}
              selectedId={pendingBackgroundId}
              onSelect={(background) => setPendingBackgroundId(background.id)}
            />
          )
        }}
        renderFooter={({ filters }) => {
          const traitFilter = filters.trait ?? 'all'
          const originFilter = filters.origin ?? 'all'

          return (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing backgrounds filtered by {traitFilter === 'all' ? 'all skills' : `skill: ${traitFilter}`} and{' '}
                {originFilter === 'all' ? 'all origins' : `origin: ${originFilter}`}.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBackgroundModalOpen(false)}
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBackground}
                  disabled={!pendingBackgroundId}
                  className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
                >
                  Confirm background
                </button>
              </div>
            </div>
          )
        }}
      />
    </>
  )
}
