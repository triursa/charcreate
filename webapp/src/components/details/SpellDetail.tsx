"use client"

import { formatDuration, formatRange, formatSpellLevel, getSchoolName, extractPlainText } from "@/lib/textParser"

interface SpellDetailProps {
  spell: any
}

const labelClass = "text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"

export function SpellDetail({ spell }: SpellDetailProps) {
  const components: string[] = []
  if (spell.components?.v) components.push("Verbal")
  if (spell.components?.s) components.push("Somatic")
  if (spell.components?.m) components.push("Material")

  const materialComponent = spell.components?.m ? spell.components.m.text || spell.material?.text : null

  const classes = spell.classes?.fromClassList?.map((klass: any) => klass.name) ?? []
  const subclasses = spell.classes?.fromSubclass?.map((sub: any) => `${sub.subclass?.name} (${sub.class?.name})`) ?? []

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className={labelClass}>Spell Level</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatSpellLevel(spell.level ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className={labelClass}>School</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{getSchoolName(spell.school ?? "")}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className={labelClass}>Casting Time</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{spell.time?.[0]?.number && spell.time?.[0]?.unit ? `${spell.time[0].number} ${spell.time[0].unit}${spell.time[0].number > 1 ? "s" : ""}` : "Varies"}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className={labelClass}>Range</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatRange(spell.range)}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className={labelClass}>Duration</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatDuration(spell.duration)}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className={labelClass}>Components</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{components.length ? components.join(", ") : "None"}</p>
          {materialComponent && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Material: {materialComponent}</p>}
        </div>
      </section>

      {(classes.length > 0 || subclasses.length > 0) && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Available To</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {classes.map((className: string) => (
              <span key={className} className="inline-flex items-center rounded-full bg-primary-100/70 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                {className}
              </span>
            ))}
            {subclasses.map((subName: string) => (
              <span key={subName} className="inline-flex items-center rounded-full bg-amber-100/70 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                {subName}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">
            {extractPlainText(spell.entries)}
          </p>
        </div>

        {spell.higherLevel && spell.higherLevel.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">At Higher Levels</h4>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">
              {extractPlainText(spell.higherLevel)}
            </p>
          </div>
        )}

        {spell.damageInflict?.length && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Damage Types</h4>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-200">{spell.damageInflict.join(", ")}</p>
          </div>
        )}

        {spell.savingThrow?.length && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Saving Throw</h4>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-200">{spell.savingThrow.join(", ")}</p>
          </div>
        )}
      </section>

      <section className="pt-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</h3>
        <p className="mt-2 text-base text-gray-700 dark:text-gray-200">
          {spell.source}
          {spell.page && ` • Page ${spell.page}`}
        </p>
      </section>
    </div>
  )
}

