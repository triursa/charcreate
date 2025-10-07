'use client'

import { abilityMod, formatModifier } from '@/lib/abilities'
import { useCharacterBuilder } from '@/state/character-builder'

export function StatsPanel() {
  const { character } = useCharacterBuilder()

  const stats = [
    { label: 'Level', value: character.level },
    { label: 'Proficiency Bonus', value: `+${character.profBonus}` },
    { label: 'Hit Points', value: character.hp },
    { label: 'Armor Class', value: character.ac ?? '—' },
    { label: 'Speed', value: character.speed ? `${character.speed} ft.` : '—' },
    { label: 'Passive Perception', value: character.passivePerception ?? 10 }
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Derived Stats</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white/60 p-4 text-sm dark:border-slate-700 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ability Modifiers</p>
        <dl className="mt-2 grid grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
          {Object.entries(character.abilities.total).map(([ability, score]) => (
            <div key={ability} className="rounded-lg bg-white/60 p-3 text-center shadow-sm dark:bg-slate-900/60">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{ability}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{score}</dd>
              <dd className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {formatModifier(abilityMod(score))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
