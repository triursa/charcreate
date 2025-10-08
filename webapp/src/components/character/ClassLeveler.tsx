'use client'

import { useEffect, useMemo } from 'react'

import { useClassCatalogue } from '@/hooks/useClassCatalogue'
import { useCharacterBuilder } from '@/state/character-builder'

export function ClassLeveler() {
  const {
    state: { classId, level, classData, resolvedDecisions },
    character,
    actions
  } = useCharacterBuilder()

  const { classes, isLoading } = useClassCatalogue()

  const availableClasses = useMemo(() => classes, [classes])

  const selectedClass = useMemo(() => {
    if (classData) return classData
    const match = availableClasses.find((entry) => entry.id === classId)
    return match ?? availableClasses[0]
  }, [availableClasses, classData, classId])

  useEffect(() => {
    if (!classData && classes.length > 0 && Object.keys(resolvedDecisions).length === 0) {
      const targetId = classId ?? classes[0]?.id
      const matching = targetId ? classes.find((entry) => entry.id === targetId) : undefined
      if (matching) {
        actions.setClass(matching)
      }
    }
  }, [actions, classData, classId, classes, resolvedDecisions])

  const classLevelEntries = character.history

  const subclassDecisionId = selectedClass ? `${selectedClass.id}-subclass-choice` : undefined
  const subclassDecision = subclassDecisionId ? resolvedDecisions[subclassDecisionId] : undefined
  const selectedSubclass =
    subclassDecision && subclassDecision.type === 'choose-subclass' ? subclassDecision.choice : undefined

  if (!selectedClass) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Class &amp; Level Progression</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Loading class data…
            </p>
          </div>
        </div>
      </section>
    )
  }

  const primaryAbilities = Array.isArray(selectedClass.primaryAbility)
    ? selectedClass.primaryAbility
    : selectedClass.primaryAbility
      ? [selectedClass.primaryAbility]
      : []

  const handleClassChange = (nextId: string) => {
    const nextClass = availableClasses.find((entry) => entry.id === nextId)
    if (nextClass) {
      actions.setClass(nextClass)
    } else {
      actions.setClass(nextId)
    }
  }

  const handleSubclassChange = (nextSubclassId: string) => {
    if (!subclassDecisionId) return
    if (!nextSubclassId) {
      actions.clearDecision(subclassDecisionId)
      return
    }
    actions.resolveDecision(subclassDecisionId, { type: 'choose-subclass', choice: nextSubclassId })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Class &amp; Level Progression</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Set your class and walk through levels to unlock features, proficiencies, and ASI/feat prompts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Class
            <select
              value={selectedClass?.id ?? classId ?? ''}
              onChange={(event) => handleClassChange(event.target.value)}
              disabled={isLoading && availableClasses.length === 0}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {isLoading && availableClasses.length === 0 && <option value="">Loading classes…</option>}
              {availableClasses.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Level {level}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={level}
          onChange={(event) => actions.setLevel(Number.parseInt(event.target.value, 10))}
          className="w-full accent-blue-500"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hit Die</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">d{selectedClass.hitDie}</p>
          {primaryAbilities.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Primary Abilities</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{primaryAbilities.join(', ')}</p>
            </div>
          )}
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Saving Throws</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedClass.savingThrows.join(', ')}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Armor &amp; Weapons</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {[...selectedClass.armorProficiencies, ...selectedClass.weaponProficiencies].join(', ')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Skill Picks</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            Choose {selectedClass.skillChoices.count} from {selectedClass.skillChoices.options.join(', ')}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Proficiency Bonus</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">+{character.profBonus}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total HP</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{character.hp}</p>
          {selectedClass.spellcastingAbility && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Spellcasting Ability</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedClass.spellcastingAbility}</p>
            </div>
          )}
          {selectedClass.otherProficiencies && selectedClass.otherProficiencies.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Other Proficiencies</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedClass.otherProficiencies.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {selectedClass.subclasses &&
        selectedClass.subclasses.length > 0 &&
        level >= (selectedClass.subclassLevel ?? Number.POSITIVE_INFINITY) && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Subclass Selection
              </span>
              <select
                value={selectedSubclass ?? ''}
                onChange={(event) => handleSubclassChange(event.target.value)}
                disabled={isLoading && availableClasses.length === 0}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">Choose a subclass…</option>
                {selectedClass.subclasses.map((subclass) => (
                  <option key={subclass.id} value={subclass.id}>
                    {subclass.name}
                  </option>
                ))}
              </select>
              {selectedSubclass && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedClass.subclasses.find((entry) => entry.id === selectedSubclass)?.description ?? ''}
                </p>
              )}
            </label>
          </div>
        )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Level breakdown</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {classLevelEntries.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Add levels to see per-level HP gains and features.</p>
          )}
          {classLevelEntries.map((snapshot) => (
            <div key={snapshot.level} className="rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Level {snapshot.level}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">HP +{snapshot.hpGained}</p>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {snapshot.featuresGained.length === 0 && <li>No new features</li>}
                {snapshot.featuresGained.map((feature) => (
                  <li key={feature.id}>{feature.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
