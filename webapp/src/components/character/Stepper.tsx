'use client'

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
  return (
    <ol className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {steps.map((step, index) => {
        const status = statuses[index]
        const isActive = index === activeStepIndex
        const isComplete = status?.complete && index !== activeStepIndex
        const stepNumber = index + 1
        const unlocked = isStepUnlocked(index)

        return (
          <li
            key={step.id}
            className={`border-b border-slate-200 last:border-b-0 dark:border-slate-800 ${
              isActive ? 'bg-slate-100/60 dark:bg-slate-900/60' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => onStepSelect(index)}
              disabled={!unlocked}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/60'
              } ${!unlocked ? 'cursor-not-allowed opacity-50' : ''}`}
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
  )
}
