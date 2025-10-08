'use client'

import { AbilityGrid } from '@/components/character/AbilityGrid'

export interface AbilityScoresStepProps {}

export function AbilityScoresStep(_: AbilityScoresStepProps) {
  return (
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
  )
}
