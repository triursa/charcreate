'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { AncestrySelector, getAncestrySummary } from '@/components/character/AncestrySelector'
import {
  BackgroundSelector,
  extractBackgroundValues,
  getBackgroundSummary
} from '@/components/character/BackgroundSelector'
import {
  AbilityScoresStep,
  AncestryStep,
  BackgroundStep,
  BasicsStep,
  ClassLevelsStep,
  DecisionResolutionStep,
  SummaryStep
} from '@/components/character/steps'
import { Stepper } from '@/components/character/Stepper'
import { useAncestries } from '@/hooks/useAncestries'
import { useBackgrounds } from '@/hooks/useBackgrounds'
import { type StepDefinition, useStepper } from '@/hooks/useStepper'
import { useCharacterBuilder } from '@/state/character-builder'
import {
  SelectionModal,
  type SelectionModalFilterConfig
} from '@/components/character/SelectionModal'

import type { ComponentType } from 'react'
import type { AncestryRecord, BackgroundRecord } from '@/types/character-builder'

interface GuidedCharacterStepDefinition extends StepDefinition {
  component: ComponentType<any>
  getProps: () => Record<string, unknown>
}

export function GuidedCharacterLayout() {
  const { state, pendingDecisions, actions } = useCharacterBuilder()

  const [targetLevel, setTargetLevel] = useState(() => Math.max(1, state.level))
  const [isAncestryModalOpen, setIsAncestryModalOpen] = useState(false)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)
  const {
    ancestries,
    ancestryIds,
    loading: ancestryLoading,
    error: ancestryError,
    refresh: refreshAncestries
  } = useAncestries({ enabled: isAncestryModalOpen })
  const {
    backgrounds,
    backgroundIds,
    loading: backgroundLoading,
    error: backgroundError,
    refresh: refreshBackgrounds
  } = useBackgrounds({ enabled: isBackgroundModalOpen })
  const [pendingAncestryId, setPendingAncestryId] = useState<string | null>(null)
  const [pendingBackgroundId, setPendingBackgroundId] = useState<string | null>(null)

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

  const ancestryById = useMemo(() => {
    return new Map(ancestries.map((ancestry) => [ancestry.id, ancestry] as const))
  }, [ancestries])
  const selectedAncestry: AncestryRecord | undefined = useMemo(() => {
    if (state.ancestryData) {
      return state.ancestryData
    }
    if (!state.ancestryId) {
      return undefined
    }
    return ancestryById.get(state.ancestryId)
  }, [ancestryById, state.ancestryData, state.ancestryId])

  const backgroundById = useMemo(() => {
    return new Map(backgrounds.map((background) => [background.id, background] as const))
  }, [backgrounds])
  const selectedBackground: BackgroundRecord | undefined = useMemo(() => {
    if (state.backgroundData) {
      return state.backgroundData
    }
    if (!state.backgroundId) {
      return undefined
    }
    return backgroundById.get(state.backgroundId)
  }, [backgroundById, state.backgroundData, state.backgroundId])

  const ancestrySummary = selectedAncestry ? getAncestrySummary(selectedAncestry) : undefined
  const ancestryPlaceholderSummary =
    'Browse the ancestry catalog to discover cultural traits, ability boosts, and story hooks.'

  const backgroundSummary = selectedBackground ? getBackgroundSummary(selectedBackground) : undefined
  const backgroundPlaceholderSummary =
    'Open the background library to find the experiences, skills, and connections that shaped your hero.'

  const isPendingAncestryValid = pendingAncestryId ? ancestryIds.includes(pendingAncestryId) : false
  const isPendingBackgroundValid = pendingBackgroundId ? backgroundIds.includes(pendingBackgroundId) : false

  const handleTargetLevelChange = useCallback(
    (level: number) => {
      setTargetLevel(level)
    },
    [setTargetLevel]
  )

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
    if (!pendingAncestryId || !ancestryIds.includes(pendingAncestryId)) {
      return
    }

    const selection = ancestryById.get(pendingAncestryId)
    if (selection) {
      actions.setAncestry(selection)
    } else {
      actions.setAncestry(pendingAncestryId)
    }
    setIsAncestryModalOpen(false)
  }

  const handleConfirmBackground = () => {
    if (!pendingBackgroundId || !backgroundIds.includes(pendingBackgroundId)) {
      return
    }

    const selection = backgroundById.get(pendingBackgroundId)
    if (selection) {
      actions.setBackground(selection)
    } else {
      actions.setBackground(pendingBackgroundId)
    }
    setIsBackgroundModalOpen(false)
  }

  const steps: GuidedCharacterStepDefinition[] = useMemo(
    () => [
      {
        id: 'basics',
        title: 'Basics',
        description: 'Name, descriptor, and campaign notes for your character.',
        component: BasicsStep,
        getProps: () => ({}),
        getStatus: () => ({
          complete: Boolean(state.basics.name?.trim()),
          message: 'Add a character name to continue.'
        })
      },
      {
        id: 'ancestry',
        title: 'Ancestry',
        description: "Choose the lineage that shapes your hero's culture and traits.",
        component: AncestryStep,
        getProps: () => ({
          selectedName: selectedAncestry?.name,
          summary: ancestrySummary,
          placeholderSummary: ancestryPlaceholderSummary,
          error: ancestryError,
          onBrowse: () => setIsAncestryModalOpen(true),
          onClear: selectedAncestry
            ? () => {
                actions.setAncestry(undefined)
                setPendingAncestryId(null)
              }
            : undefined
        }),
        getStatus: () => ({
          complete: Boolean(state.ancestryId),
          message: 'Select an ancestry to continue.'
        })
      },
      {
        id: 'background',
        title: 'Background',
        description: 'Determine the experiences that shaped your adventurer before the campaign.',
        component: BackgroundStep,
        getProps: () => ({
          selectedName: selectedBackground?.name,
          summary: backgroundSummary,
          placeholderSummary: backgroundPlaceholderSummary,
          error: backgroundError,
          onBrowse: () => setIsBackgroundModalOpen(true),
          onClear: selectedBackground
            ? () => {
                actions.setBackground(undefined)
                setPendingBackgroundId(null)
              }
            : undefined
        }),
        getStatus: () => ({
          complete: Boolean(state.backgroundId),
          message: 'Select a background to continue.'
        })
      },
      {
        id: 'ability-scores',
        title: 'Ability Scores',
        description: 'Assign starting ability scores using your preferred method.',
        component: AbilityScoresStep,
        getProps: () => ({}),
        getStatus: () => ({
          complete: true
        })
      },
      {
        id: 'class-levels',
        title: 'Class & Levels',
        description: 'Pick a class, set a target level, and walk through each level gain.',
        component: ClassLevelsStep,
        getProps: () => ({
          targetLevel,
          currentLevel: state.level,
          onTargetLevelChange: handleTargetLevelChange,
          pendingDecisionCount: pendingDecisions.length
        }),
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
        component: DecisionResolutionStep,
        getProps: () => ({}),
        getStatus: () => ({
          complete: pendingDecisions.length === 0,
          message: pendingDecisions.length > 0 ? 'Work through each queued decision to proceed.' : undefined
        })
      },
      {
        id: 'summary',
        title: 'Summary',
        description: 'Review your full printable character sheet before exporting.',
        component: SummaryStep,
        getProps: () => ({}),
        getStatus: () => ({ complete: true })
      }
    ],
    [
      actions,
      ancestryError,
      ancestryPlaceholderSummary,
      ancestrySummary,
      backgroundError,
      backgroundPlaceholderSummary,
      backgroundSummary,
      pendingDecisions.length,
      selectedAncestry,
      selectedBackground,
      setIsAncestryModalOpen,
      setIsBackgroundModalOpen,
      setPendingAncestryId,
      setPendingBackgroundId,
      state.ancestryId,
      state.backgroundId,
      state.basics.name,
      state.level,
      targetLevel,
      handleTargetLevelChange
    ]
  )

  const {
    activeStepIndex,
    activeStep,
    statuses,
    currentStatus,
    isLastStep,
    goTo,
    next,
    previous,
    isStepUnlocked
  } = useStepper({ steps })

  const nextLabel = isLastStep ? 'Complete' : 'Next'
  const ActiveStepComponent = activeStep?.component
  const activeStepProps = activeStep?.getProps() ?? {}

  return (
    <>
      <div className="mt-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <Stepper
            steps={steps}
            statuses={statuses}
            activeStepIndex={activeStepIndex}
            onStepSelect={goTo}
            isStepUnlocked={isStepUnlocked}
          />

        <div className="space-y-6">
          {ActiveStepComponent ? <ActiveStepComponent {...activeStepProps} /> : null}

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <button
              type="button"
              onClick={previous}
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
                onClick={next}
                disabled={isLastStep || !currentStatus.complete}
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
              >
                {nextLabel}
              </button>
            </div>
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
              <div className="space-y-3">
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                  {ancestryError}
                </div>
                <button
                  type="button"
                  onClick={refreshAncestries}
                  className="text-sm font-medium text-blue-600 underline-offset-2 transition hover:underline dark:text-blue-400"
                >
                  Try again
                </button>
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
                  disabled={!isPendingAncestryValid}
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
              <div className="space-y-3">
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                  {backgroundError}
                </div>
                <button
                  type="button"
                  onClick={refreshBackgrounds}
                  className="text-sm font-medium text-indigo-600 underline-offset-2 transition hover:underline dark:text-indigo-400"
                >
                  Try again
                </button>
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
                  disabled={!isPendingBackgroundValid}
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
