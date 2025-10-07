'use client'

import { abilityList, abilityMod, formatModifier } from '@/lib/abilities'
import { useCharacterBuilder } from '@/state/character-builder'

export function SavesList() {
  const { character } = useCharacterBuilder()
  const proficient = new Set(character.saves.proficient)
  const proficiencyBonus = character.profBonus

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Saving Throws</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {abilityList.map((ability) => {
          const abilityScore = character.abilities.total[ability]
          const baseMod = abilityMod(abilityScore)
          const total = baseMod + (proficient.has(ability) ? proficiencyBonus : 0)
          return (
            <li
              key={ability}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ability}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {proficient.has(ability) ? 'Proficient' : 'Not proficient'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">{formatModifier(total)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Base {formatModifier(baseMod)}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
