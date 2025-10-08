'use client'

import clsx from 'clsx'
import { Check, Lock } from 'lucide-react'

import type { StepStatus, StepDefinition } from '@/hooks/useStepper'

interface StepperProps {
  steps: Array<Pick<StepDefinition, 'id' | 'title' | 'description'>>
  statuses: StepStatus[]
  activeStepIndex: number
  onStepSelect: (index: number) => void
  isStepUnlocked: (index: number) => boolean
}

export function Stepper({
  steps,
  statuses,
  activeStepIndex,
  onStepSelect,
  isStepUnlocked
}: StepperProps) {
  const completedCount = statuses.reduce((count, status, index) => {
    if (index < activeStepIndex && status?.complete) {
      return count + 1
    }
    if (index === activeStepIndex && status?.complete) {
      return count + 1
    }
    return count
  }, 0)

  const progressPercentage = Math.max(4, Math.round((completedCount / steps.length) * 100))

  return (
    <nav
      aria-label="Guided builder steps"
      className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span className="font-semibold">Step overview</span>
        <span className="font-medium text-slate-600 dark:text-slate-300">{progressPercentage}%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => {
          const status = statuses[index]
          const isActive = index === activeStepIndex
          const isComplete = status?.complete && index !== activeStepIndex
          const unlocked = isStepUnlocked(index)
          const stepNumber = index + 1

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onStepSelect(index)}
                disabled={!unlocked}
                className={clsx(
                  'group flex w-full items-start gap-4 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
                  isActive
                    ? 'border-sky-400/70 bg-sky-500/5 text-slate-900 shadow-sm dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-slate-100'
                    : isComplete
                      ? 'border-emerald-300/60 bg-emerald-400/5 text-slate-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-slate-200'
                      : 'border-transparent bg-white/70 text-slate-600 hover:border-slate-300/60 hover:bg-white dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-600/60',
                  !unlocked && 'cursor-not-allowed opacity-60'
                )}
              >
                <span
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition',
                    isComplete
                      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-600 dark:border-emerald-300/70 dark:text-emerald-200'
                      : isActive
                        ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:border-sky-400 dark:text-sky-200'
                        : 'border-slate-300 bg-white/70 text-slate-500 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : unlocked ? (
                    stepNumber
                  ) : (
                    <Lock className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-current">{step.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
