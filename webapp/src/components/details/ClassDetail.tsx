"use client"

import { extractPlainText } from "@/lib/textParser"

interface ClassDetailProps {
  klass: any
}

export function ClassDetail({ klass }: ClassDetailProps) {
  const hitDie = klass.hd?.number ?? 8
  const primaryAbilities = klass.primaryAbility?.map((ability: string) => ability.toUpperCase()).join(", ")

  const savingThrows = klass.proficiency?.filter((prof: string) => prof.startsWith("saving throw"))

  const equipmentText = Array.isArray(klass.startingEquipment)
    ? klass.startingEquipment.map((entry: any) => extractPlainText(entry)).join("\n")
    : ""

  const features = klass.classFeatures?.slice(0, 10) ?? []

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Hit Die</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">d{hitDie}</p>
        </div>
        {primaryAbilities && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Primary Abilities</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{primaryAbilities}</p>
          </div>
        )}
        {savingThrows && savingThrows.length > 0 && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Saving Throws</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {savingThrows.map((prof: string) => prof.replace("saving throw:", "").trim()).join(", ")}
            </p>
          </div>
        )}
      </section>

      {klass.description && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">{extractPlainText(klass.description)}</p>
        </section>
      )}

      {klass.spellcastingAbility && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Spellcasting Ability</h3>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-200">{klass.spellcastingAbility.toUpperCase()}</p>
        </section>
      )}

      {equipmentText && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Starting Equipment</h3>
          <p className="mt-2 whitespace-pre-wrap text-base text-gray-700 dark:text-gray-200">{equipmentText}</p>
        </section>
      )}

      {features.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Notable Features</h3>
          <ul className="space-y-2 text-base text-gray-700 dark:text-gray-200">
            {features.map((feature: any) => (
              <li key={`${feature.classFeature}--${feature.source}`}>{feature.classFeature}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</h3>
        <p className="mt-2 text-base text-gray-700 dark:text-gray-200">
          {klass.source}
          {klass.page && ` • Page ${klass.page}`}
        </p>
      </section>
    </div>
  )
}

