'use client'

import { useCallback, useMemo, useState } from 'react'

import { getAncestrySummary } from '@/components/character/AncestrySelector'
import { getBackgroundSummary } from '@/components/character/BackgroundSelector'
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
import type { BuilderHydrationStatus } from '@/hooks/useBuilderDataHydration'
import { type StepDefinition, useStepper } from '@/hooks/useStepper'
import { useCharacterBuilder } from '@/state/character-builder'
import { AncestryModal, BackgroundModal } from '@/components/character/modals'

import type { ComponentType } from 'react'
import type { AncestryRecord, BackgroundRecord } from '@/types/character-builder'

interface GuidedCharacterStepDefinition extends StepDefinition {
  component: ComponentType<any>
  getProps: () => Record<string, unknown>
}

interface GuidedCharacterLayoutProps {
  hydration: BuilderHydrationStatus
}

export function GuidedCharacterLayout({ hydration }: GuidedCharacterLayoutProps) {
  const { state, pendingDecisions, actions } = useCharacterBuilder()

  const [targetLevel, setTargetLevel] = useState(() => Math.max(1, state.level))
  const [isAncestryModalOpen, setIsAncestryModalOpen] = useState(false)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)
  const selectedAncestry: AncestryRecord | undefined = state.ancestryData
  const selectedBackground: BackgroundRecord | undefined = state.backgroundData

  const ancestrySummary = selectedAncestry ? getAncestrySummary(selectedAncestry) : undefined
  const ancestryPlaceholderSummary =
    'Browse the ancestry catalog to discover cultural traits, ability boosts, and story hooks.'

  const backgroundSummary = selectedBackground ? getBackgroundSummary(selectedBackground) : undefined
  const backgroundPlaceholderSummary =
    'Open the background library to find the experiences, skills, and connections that shaped your hero.'

  const handleTargetLevelChange = useCallback(
    (level: number) => {
      setTargetLevel(level)
    },
    [setTargetLevel]
  )

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
          error: hydration.ancestry.error,
          onBrowse: () => setIsAncestryModalOpen(true),
          onClear: selectedAncestry
            ? () => {
                actions.setAncestry(undefined)
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
          error: hydration.background.error,
          onBrowse: () => setIsBackgroundModalOpen(true),
          onClear: selectedBackground
            ? () => {
                actions.setBackground(undefined)
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
      ancestryPlaceholderSummary,
      ancestrySummary,
      backgroundPlaceholderSummary,
      backgroundSummary,
      hydration.ancestry.error,
      hydration.background.error,
      pendingDecisions.length,
      selectedAncestry,
      selectedBackground,
      setIsAncestryModalOpen,
      setIsBackgroundModalOpen,
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

  const completedSteps = useMemo(() => {
    return statuses.reduce((count, status, index) => {
      if (index < activeStepIndex) {
        return count + 1
      }
      if (index === activeStepIndex && status?.complete) {
        return count + 1
      }
      return count
    }, 0)
  }, [activeStepIndex, statuses])

  const progressPercentage = Math.max(4, Math.round((completedSteps / steps.length) * 100))
  const nextStepTitle = steps[activeStepIndex + 1]?.title
  const ancestryMeta = hydration.ancestry.error
    ? hydration.ancestry.error
    : selectedAncestry
      ? selectedAncestry.source
        ? `Source: ${selectedAncestry.source}`
        : 'Loaded from the compendium.'
      : 'Browse the ancestry library to get started.'
  const backgroundMeta = hydration.background.error
    ? hydration.background.error
    : selectedBackground
      ? selectedBackground.feature?.name ?? 'Background data loaded from the database.'
      : 'Use the catalogue to link a background history.'

  return (
    <>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-sky-400/10 via-transparent to-fuchsia-500/10 blur-3xl dark:from-sky-500/10 dark:via-transparent dark:to-fuchsia-500/10" />
        <div className="relative grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Guided progress</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Step {activeStepIndex + 1} of {steps.length}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-100">
                  {progressPercentage}%
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <dl className="mt-6 grid gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active step</dt>
                  <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{activeStep?.title}</dd>
                  <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {nextStepTitle ? `Next: ${nextStepTitle}` : 'Review the summary to finish.'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ancestry</dt>
                  <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                    {selectedAncestry?.name ?? 'Not selected'}
                  </dd>
                  <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ancestryMeta}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Background</dt>
                  <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                    {selectedBackground?.name ?? 'Not selected'}
                  </dd>
                  <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{backgroundMeta}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Target level</dt>
                  <dd className="mt-1 font-semibold text-slate-900 dark:text-slate-100">Level {targetLevel}</dd>
                  <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {pendingDecisions.length > 0
                      ? `${pendingDecisions.length} decision${pendingDecisions.length === 1 ? '' : 's'} waiting in the queue.`
                      : 'All current decisions resolved.'}
                  </dd>
                </div>
              </dl>
            </div>

            <Stepper
              steps={steps}
              statuses={statuses}
              activeStepIndex={activeStepIndex}
              onStepSelect={goTo}
              isStepUnlocked={isStepUnlocked}
            />
          </aside>

          <section className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-white/80 via-transparent to-slate-200/40 blur-2xl dark:from-slate-900/40 dark:via-transparent dark:to-slate-800/40" />
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60 sm:p-8">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Step {activeStepIndex + 1} of {steps.length}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{activeStep?.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{activeStep?.description}</p>
              </header>

              <div className="mt-6 space-y-6">
                {ActiveStepComponent ? <ActiveStepComponent {...activeStepProps} /> : null}

                <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/70">
                  <button
                    type="button"
                    onClick={previous}
                    disabled={activeStepIndex === 0}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-500"
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
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
                    >
                      {nextLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AncestryModal
        open={isAncestryModalOpen}
        selectedId={state.ancestryId}
        onClose={() => setIsAncestryModalOpen(false)}
        onConfirmSelection={(selection) => actions.setAncestry(selection)}
      />

      <BackgroundModal
        open={isBackgroundModalOpen}
        selectedId={state.backgroundId}
        onClose={() => setIsBackgroundModalOpen(false)}
        onConfirmSelection={(selection) => actions.setBackground(selection)}
      />
    </>
  )
}
