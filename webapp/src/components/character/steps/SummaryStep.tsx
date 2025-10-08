'use client'

import { CharacterSheet } from '@/components/character/CharacterSheet'
import { FeatureList } from '@/components/character/FeatureList'
import { StatsPanel } from '@/components/character/StatsPanel'

export interface SummaryStepProps {}

export function SummaryStep(_: SummaryStepProps) {
  return (
    <div className="space-y-6">
      <StatsPanel />
      <FeatureList />
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Printable Character Sheet</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          This consolidated sheet displays the information that will be exported or printed.
        </p>
        <div className="mt-6">
          <CharacterSheet />
        </div>
      </div>
    </div>
  )
}
