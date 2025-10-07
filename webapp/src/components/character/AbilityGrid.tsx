'use client'

import { abilityList, abilityMod, formatModifier } from '@/lib/abilities'
import { useCharacterBuilder } from '@/state/character-builder'

export function AbilityGrid() {
  const {
    state: { abilityMethod, baseAbilities },
    character,
    actions
  } = useCharacterBuilder()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ability Scores</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track base input, lineage bonuses, ASI increments, and total scores. Adjust manually or apply the Dice Boss Array.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => actions.applyBossArray()}
            className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            Apply Boss Array
          </button>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={abilityMethod === 'boss-array'}
              onChange={() =>
                actions.setAbilityMethod(abilityMethod === 'boss-array' ? 'manual' : 'boss-array')
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
            />
            Track as Boss Array
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-3 py-2">Ability</th>
              <th className="px-3 py-2">Base</th>
              <th className="px-3 py-2">Lineage</th>
              <th className="px-3 py-2">ASI</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Modifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {abilityList.map((ability) => {
              const base = baseAbilities[ability] ?? 10
              const racial = character.abilities.racial[ability] ?? 0
              const asi = character.abilities.asi[ability] ?? 0
              const total = character.abilities.total[ability] ?? base + racial + asi
              return (
                <tr key={ability} className="text-slate-900 dark:text-slate-100">
                  <td className="px-3 py-3 text-sm font-semibold">{ability}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={base}
                      min={1}
                      max={30}
                      onChange={(event) =>
                        actions.setBaseAbility(ability, Number.parseInt(event.target.value || '0', 10))
                      }
                      className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400">{racial}</td>
                  <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400">{asi}</td>
                  <td className="px-3 py-3 text-sm font-semibold">{total}</td>
                  <td className="px-3 py-3 text-sm font-semibold">{formatModifier(abilityMod(total))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
