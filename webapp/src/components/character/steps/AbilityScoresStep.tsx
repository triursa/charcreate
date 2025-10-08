'use client'

import { AbilityGrid } from '@/components/character/AbilityGrid'

export interface AbilityScoresStepProps {}

export function AbilityScoresStep(_: AbilityScoresStepProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Tune Ability Scores</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Use manual entry or the boss array to assign values before racial adjustments are applied.
        </p>
        <div className="mt-6">
          <AbilityGrid />
        </div>
      </section>
    </div>
  )
}
