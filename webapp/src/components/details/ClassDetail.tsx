"use client"

import { extractPlainText } from "@/lib/textParser"
import { normalizeClassForDisplay } from "@/hooks/useClassCatalogue"

interface ClassDetailProps {
  klass: any
}

export function ClassDetail({ klass }: ClassDetailProps) {
  const normalized = normalizeClassForDisplay(klass)

  const hitDie = normalized.hitDie ?? klass.hd?.number ?? 8
  const primaryAbilities = Array.isArray(normalized.primaryAbility)
    ? normalized.primaryAbility
    : normalized.primaryAbility
      ? [normalized.primaryAbility]
      : []

  const savingThrows = normalized.savingThrows
  const armorProficiencies = normalized.armorProficiencies ?? []
  const weaponProficiencies = normalized.weaponProficiencies ?? []
  const toolProficiencies = normalized.toolProficiencies ?? []
  const otherProficiencies = normalized.otherProficiencies ?? []
  const spellcastingAbility = normalized.spellcastingAbility
  const subclasses = normalized.subclasses ?? []
  const skillChoiceSummary =
    normalized.skillChoices && normalized.skillChoices.count > 0
      ? `Choose ${normalized.skillChoices.count} from ${normalized.skillChoices.options.join(', ')}`
      : undefined

  const equipmentText = Array.isArray(klass.startingEquipment)
    ? klass.startingEquipment.map((entry: any) => extractPlainText(entry)).join("\n")
    : ""

  const features = klass.classFeatures?.slice(0, 10) ?? []
  const overviewText =
    normalized.description ?? (klass.description ? extractPlainText(klass.description) : undefined)

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Hit Die</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">d{hitDie}</p>
        </div>
        {primaryAbilities.length > 0 && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Primary Abilities</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{primaryAbilities.join(', ')}</p>
          </div>
        )}
        {spellcastingAbility && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Spellcasting Ability</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{spellcastingAbility}</p>
          </div>
        )}
        {savingThrows.length > 0 && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Saving Throws</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {savingThrows.join(', ')}
            </p>
          </div>
        )}
      </section>

      {(armorProficiencies.length > 0 || weaponProficiencies.length > 0 || toolProficiencies.length > 0 || otherProficiencies.length > 0 || skillChoiceSummary) && (
        <section className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 dark:border-dark-700/70 dark:bg-dark-900/50">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Proficiencies</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
            {armorProficiencies.length > 0 && <p><span className="font-semibold">Armor:</span> {armorProficiencies.join(', ')}</p>}
            {weaponProficiencies.length > 0 && <p><span className="font-semibold">Weapons:</span> {weaponProficiencies.join(', ')}</p>}
            {toolProficiencies.length > 0 && <p><span className="font-semibold">Tools:</span> {toolProficiencies.join(', ')}</p>}
            {otherProficiencies.length > 0 && <p><span className="font-semibold">Other:</span> {otherProficiencies.join(', ')}</p>}
            {skillChoiceSummary && <p><span className="font-semibold">Skills:</span> {skillChoiceSummary}</p>}
          </div>
        </section>
      )}

      {overviewText && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">{overviewText}</p>
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

      {subclasses.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Subclass Options</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {subclasses.map((subclass) => (
              <li key={subclass.id} className="rounded-xl border border-gray-200/70 bg-white/70 p-4 dark:border-dark-700/70 dark:bg-dark-900/50">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subclass.name}</h4>
                {subclass.spellcastingAbility && (
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Spellcasting: {subclass.spellcastingAbility}</p>
                )}
                {subclass.description && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{subclass.description}</p>
                )}
              </li>
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

