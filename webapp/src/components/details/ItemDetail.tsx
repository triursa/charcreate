"use client"

import { extractPlainText } from "@/lib/textParser"

interface ItemDetailProps {
  item: any
}

export function ItemDetail({ item }: ItemDetailProps) {
  const rarity = item.rarity ? item.rarity.replace(/\b\w/g, (char: string) => char.toUpperCase()) : "Unknown"
  const type = item.type ? item.type.replace(/\b\w/g, (char: string) => char.toUpperCase()) : "Item"

  const properties = [
    item.reqAttune && `Requires Attunement${typeof item.reqAttune === "string" ? ` (${item.reqAttune})` : ""}`,
    item.value && `${item.value} gp`,
    item.weight && `${item.weight} lb.`
  ].filter(Boolean)

  const description = extractPlainText(item.entries)
  const additionalEntries = item.additionalEntries ? extractPlainText(item.additionalEntries) : null

  const damage = item.dmg1 ? `${item.dmg1}${item.dmgType ? ` ${item.dmgType}` : ""}` : null
  const damageTwoHanded = item.dmg2 ? `${item.dmg2}${item.dmgType ? ` ${item.dmgType}` : ""}` : null

  const range = item.range?.normal ? `${item.range.normal} ft.${item.range.long ? ` / ${item.range.long} ft.` : ""}` : null

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{type}</p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Rarity</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{rarity}</p>
        </div>
        {properties.length > 0 && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Properties</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{properties.join(" • ")}</p>
          </div>
        )}
      </section>

      {damage && (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Damage</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{damage}</p>
          </div>
          {damageTwoHanded && (
            <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Two-Handed Damage</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{damageTwoHanded}</p>
            </div>
          )}
          {range && (
            <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Range</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{range}</p>
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">{description}</p>

        {additionalEntries && (
          <div className="rounded-xl border border-primary-200/70 dark:border-primary-900/40 bg-primary-50/50 dark:bg-primary-900/10 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">Additional Properties</h3>
            <p className="mt-2 whitespace-pre-wrap text-base text-primary-900 dark:text-primary-100">{additionalEntries}</p>
          </div>
        )}
      </section>

      {item.entriesAttune && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Attunement Details</h3>
          <p className="mt-2 whitespace-pre-wrap text-base text-gray-700 dark:text-gray-200">{extractPlainText(item.entriesAttune)}</p>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</h3>
        <p className="mt-2 text-base text-gray-700 dark:text-gray-200">
          {item.source}
          {item.page && ` • Page ${item.page}`}
        </p>
      </section>
    </div>
  )
}

