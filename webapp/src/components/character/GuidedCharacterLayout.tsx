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
import { type StepDefinition, useStepper } from '@/hooks/useStepper'
import { useCharacterBuilder } from '@/state/character-builder'
import { AncestryModal, BackgroundModal } from '@/components/character/modals'

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
