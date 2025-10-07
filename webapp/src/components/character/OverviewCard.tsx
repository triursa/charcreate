'use client'

import { useCharacterBuilder } from '@/state/character-builder'

export function OverviewCard() {
  const {
    state: { basics },
    actions
  } = useCharacterBuilder()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Overview</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Set the tone for your hero before diving into the details.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
          Character Name
          <input
            value={basics.name}
            onChange={(event) => actions.setBasics({ name: event.target.value })}
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
          Descriptor / Tagline
          <input
            value={basics.descriptor ?? ''}
            onChange={(event) => actions.setBasics({ descriptor: event.target.value })}
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="e.g. Silver-tongued Investigator"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
          Alignment
          <input
            value={basics.alignment ?? ''}
            onChange={(event) => actions.setBasics({ alignment: event.target.value })}
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="e.g. Chaotic Good"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700 dark:text-slate-300">
          Occupation or Background
          <input
            value={basics.occupation ?? ''}
            onChange={(event) => actions.setBasics({ occupation: event.target.value })}
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="e.g. City Watch Investigator"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Campaign Notes
        <textarea
          value={basics.campaignNotes ?? ''}
          onChange={(event) => actions.setBasics({ campaignNotes: event.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="Session zero hooks, allies, faction ties..."
        />
      </label>
    </section>
  )
}
