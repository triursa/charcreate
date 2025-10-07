'use client'

import { abilityMod, formatModifier, skillAbilityMap } from '@/lib/abilities'
import type { Skill } from '@/types/character'
import { useCharacterBuilder } from '@/state/character-builder'

const skillList: Skill[] = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival'
]

export function SkillsTable() {
  const { character } = useCharacterBuilder()
  const proficiencyBonus = character.profBonus
  const totalAbilities = character.abilities.total
  const proficientSkills = new Set(character.skills.proficient)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Skill</th>
              <th className="px-3 py-2 text-left">Ability</th>
              <th className="px-3 py-2 text-right">Modifier</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {skillList.map((skill) => {
              const ability = skillAbilityMap[skill]
              const abilityScore = totalAbilities[ability]
              const abilityModifier = abilityMod(abilityScore)
              const proficient = proficientSkills.has(skill)
              const total = abilityModifier + (proficient ? proficiencyBonus : 0)
              return (
                <tr key={skill} className="text-slate-900 dark:text-slate-100">
                  <td className="px-3 py-2 text-sm font-medium">
                    {skill}
                    {proficient && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">Proficient</span>}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">{ability}</td>
                  <td className="px-3 py-2 text-right text-sm font-semibold">{formatModifier(abilityModifier)}</td>
                  <td className="px-3 py-2 text-right text-sm font-semibold">{formatModifier(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
