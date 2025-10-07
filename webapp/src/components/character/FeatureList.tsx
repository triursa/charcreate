'use client'

import { useCharacterBuilder } from '@/state/character-builder'

export function FeatureList() {
  const { character } = useCharacterBuilder()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Feature Ledger</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Stacking features are merged with the most potent values while preserving their sources.
      </p>

      <div className="mt-4 space-y-3 text-sm">
        {character.features.length === 0 && <p className="text-slate-600 dark:text-slate-400">No features recorded yet.</p>}
        {character.features.map((feature) => (
          <div key={feature.id} className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{feature.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sources: {feature.source.join(', ')}
                </p>
              </div>
            </div>
            {feature.description && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{feature.description}</p>}
            {feature.payload?.range && (
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">Range: {feature.payload.range} ft.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
