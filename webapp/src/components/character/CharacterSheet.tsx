'use client'

import { useMemo } from 'react'

import { abilityList, abilityMod, formatModifier } from '@/lib/abilities'
import { classMap } from '@/data/classes'
import { useCharacterBuilder } from '@/state/character-builder'

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300 print:bg-white print:p-4 print:shadow-none">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300 print:text-slate-900">{children}</div>
    </section>
  )
}

function formatList(values: string[] | undefined): string {
  if (!values || values.length === 0) {
    return '—'
  }
  return values.join(', ')
}

function extractEquipment(backgroundData: any, classData: any): string[] {
  const items: string[] = []

  const pushValue = (value: unknown) => {
    if (!value) return
    if (typeof value === 'string') {
      items.push(value)
      return
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => pushValue(entry))
      return
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (typeof record.text === 'string') items.push(record.text)
      if (typeof record.entry === 'string') items.push(record.entry)
      if (typeof record.name === 'string') items.push(record.name)
      if (record.choose && typeof record.choose === 'object') {
        const choose = record.choose as Record<string, unknown>
        const count = choose.count ?? choose.amount
        const from = Array.isArray(choose.from)
          ? (choose.from as unknown[])
              .map((entry) => (typeof entry === 'string' ? entry : 'Option'))
              .filter(Boolean)
          : undefined
        if (count && from && from.length > 0) {
          items.push(`Choose ${count as string | number} from: ${from.join(', ')}`)
        }
      }
      if (Array.isArray(record.entries)) {
        record.entries.forEach((entry) => pushValue(entry))
      }
      if (Array.isArray(record._)) {
        record._.forEach((entry) => pushValue(entry))
      }
    }
  }

  pushValue(backgroundData?.startingEquipment)
  pushValue(backgroundData?.equipment)
  pushValue(classData?.startingEquipment)

  return Array.from(new Set(items)).filter(Boolean)
}

export function CharacterSheet() {
  const { character, state, pendingDecisions } = useCharacterBuilder()

  const primaryClassId = character.classes[0]?.classId
  const primaryClass = state.classData ?? (primaryClassId ? classMap[primaryClassId] : undefined)
  const primarySubclass = useMemo(() => {
    if (!primaryClass) return undefined
    const selectedSubclassId = character.classes[0]?.subclassId
    if (!selectedSubclassId) return undefined
    return primaryClass.subclasses?.find((entry) => entry.id === selectedSubclassId)
  }, [character.classes, primaryClass])

  const spellcastingAbility = primarySubclass?.spellcastingAbility ?? primaryClass?.spellcastingAbility
  const equipment = useMemo(() => extractEquipment(state.backgroundData, state.classData), [state.backgroundData, state.classData])

  const abilityBreakdown = abilityList.map((ability) => {
    const total = character.abilities.total[ability]
    const base = character.abilities.base[ability]
    const racial = character.abilities.racial[ability]
    const asi = character.abilities.asi[ability]
    return { ability, total, base, racial, asi, modifier: formatModifier(abilityMod(total)) }
  })

  return (
    <div className="space-y-6 text-slate-900 print:space-y-4 print:text-slate-900">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300 print:bg-white print:p-4 print:shadow-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">{character.name || 'Unnamed Character'}</h1>
            {character.descriptor && (
              <p className="text-sm text-slate-600 dark:text-slate-400 print:text-slate-700">{character.descriptor}</p>
            )}
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400 print:text-slate-700 sm:grid-cols-3">
              <div>
                <dt className="uppercase tracking-wide">Class</dt>
                <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100 print:text-slate-900">
                  {primaryClass ? primaryClass.name : primaryClassId ? primaryClassId : '—'}
                  {primarySubclass ? ` (${primarySubclass.name})` : ''}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Background</dt>
                <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100 print:text-slate-900">
                  {state.backgroundData?.name ?? state.backgroundId ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Ancestry</dt>
                <dd className="mt-0.5 text-sm text-slate-900 dark:text-slate-100 print:text-slate-900">
                  {state.ancestryData?.name ?? state.ancestryId ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm text-slate-600 dark:text-slate-400 print:text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50 print:border-slate-300 print:bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide">Level</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">{character.level}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50 print:border-slate-300 print:bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide">Proficiency Bonus</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">+{character.profBonus}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50 print:border-slate-300 print:bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide">Armor Class</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">{character.ac ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/50 print:border-slate-300 print:bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide">Hit Points</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">{character.hp}</p>
            </div>
          </div>
        </div>
      </section>

      <Panel title="Ability Scores">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {abilityBreakdown.map((entry) => (
            <div key={entry.ability} className="rounded-xl border border-slate-200 bg-white/70 p-4 text-center dark:border-slate-700 dark:bg-slate-950/60 print:border-slate-300 print:bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">
                {entry.ability}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">{entry.total}</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 print:text-blue-700">{entry.modifier}</p>
              <dl className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                <div className="flex items-center justify-between">
                  <dt>Base</dt>
                  <dd>{entry.base}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Ancestry</dt>
                  <dd>{entry.racial}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>ASI</dt>
                  <dd>{entry.asi}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Languages & Proficiencies">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Languages</h3>
            <p className="mt-1 text-sm">{formatList(character.languages)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Saving Throws</h3>
            <p className="mt-1 text-sm">{formatList(character.saves.proficient)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Skill Proficiencies</h3>
            <p className="mt-1 text-sm">{formatList(character.skills.proficient)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Armor</h3>
            <p className="mt-1 text-sm">{formatList(character.proficiencies.armor)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Weapons</h3>
            <p className="mt-1 text-sm">{formatList(character.proficiencies.weapons)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Tools & Other</h3>
            <p className="mt-1 text-sm">
              {formatList([...(character.proficiencies.tools ?? []), ...(character.proficiencies.other ?? [])])}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Equipment">
        {equipment.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {equipment.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No starting equipment has been recorded for this character yet.</p>
        )}
      </Panel>

      <Panel title="Features">
        {character.features.length === 0 ? (
          <p>No class or ancestry features have been recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {character.features.map((feature) => (
              <div key={feature.id} className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/40 print:border-slate-300 print:bg-white">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">{feature.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">Sources: {feature.source.join(', ')}</p>
                  </div>
                  {feature.payload?.range && (
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-300 print:text-blue-700">Range: {feature.payload.range}</p>
                  )}
                </div>
                {feature.description && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 print:text-slate-900">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Spellcasting">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Spellcasting Ability</h3>
            <p className="mt-1 text-sm">{spellcastingAbility ?? '—'}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Spell Save DC</h3>
            <p className="mt-1 text-sm">
              {spellcastingAbility
                ? 8 + character.profBonus + abilityMod(character.abilities.total[spellcastingAbility])
                : '—'}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Spell Attack Bonus</h3>
            <p className="mt-1 text-sm">
              {spellcastingAbility
                ? `+${character.profBonus + abilityMod(character.abilities.total[spellcastingAbility])}`
                : '—'}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 print:text-slate-600">Notes</h3>
            <p className="mt-1 text-sm">
              {spellcastingAbility
                ? 'Use your class features or prepared list to track spells known.'
                : 'No spellcasting ability has been configured for this build.'}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Pending Decisions">
        {pendingDecisions.length === 0 ? (
          <p>All build decisions are resolved.</p>
        ) : (
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {pendingDecisions.map((decision) => (
              <li key={decision.id}>
                <p className="font-semibold text-slate-900 dark:text-slate-100 print:text-slate-900">{decision.label ?? decision.type}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                  Requires selecting {decision.min === decision.max ? decision.min : `${decision.min}-${decision.max}`} option(s).
                </p>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  )
}
