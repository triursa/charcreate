'use client'

import { ancestries } from '@/data/ancestries'
import { abilityList } from '@/lib/abilities'
import { useCharacterBuilder } from '@/state/character-builder'

export function AncestrySelector() {
  const {
    state: { ancestryId },
    actions
  } = useCharacterBuilder()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ancestry &amp; Heritage</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Apply lineage bonuses, innate abilities, and cultural proficiencies.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ancestries.map((ancestry) => {
          const isSelected = ancestryId === ancestry.id
          return (
            <button
              key={ancestry.id}
              onClick={() => actions.setAncestry(isSelected ? undefined : ancestry.id)}
              className={`rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/10'
                  : 'border-slate-200 bg-white dark:bg-slate-950'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{ancestry.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{ancestry.description}</p>
                </div>
                <div
                  className={`mt-1 h-5 w-5 rounded-full border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300 bg-transparent dark:border-slate-600'
                  }`}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Ability Boosts</p>
                  <ul className="mt-1 space-y-1">
                    {abilityList.map((ability) => {
                      const bonus = ancestry.abilityBonuses[ability]
                      if (!bonus) return null
                      return <li key={ability}>{ability}: +{bonus}</li>
                    })}
                    {Object.keys(ancestry.abilityBonuses).length === 0 && <li>Flexible choice</li>}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Languages</p>
                  <ul className="mt-1 space-y-1">
                    {ancestry.languages.map((language) => (
                      <li key={language}>{language}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
