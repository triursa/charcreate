'use client'

import { useCharacterBuilder } from '@/state/character-builder'

export function LevelTimeline() {
  const { character } = useCharacterBuilder()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Level Timeline</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Review class features, hit point gains, and decision prompts encountered on each level.
      </p>

      <div className="mt-6 space-y-4">
        {character.history.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">No levels processed yet. Set a class and increase level to begin.</p>
        )}
        {character.history.map((snapshot) => (
          <div key={snapshot.level} className="relative pl-6">
            <span className="absolute left-0 top-2 flex h-4 w-4 items-center justify-center">
              <span className="h-3 w-3 rounded-full border-2 border-blue-500 bg-blue-500" />
            </span>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Level {snapshot.level} · {character.classes[0]?.classId.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">HP gained: {snapshot.hpGained}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Features</p>
                  <ul className="mt-1 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {snapshot.featuresGained.length === 0 && <li>—</li>}
                    {snapshot.featuresGained.map((feature) => (
                      <li key={feature.id}>{feature.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Decisions</p>
                  <ul className="mt-1 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {snapshot.decisionsRaised.length === 0 && <li>—</li>}
                    {snapshot.decisionsRaised.map((decision) => (
                      <li key={decision.id}>{decision.label ?? decision.id}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
