"use client"

import { type ReactNode } from "react"
import { extractPlainText } from "@/lib/textParser"

interface RaceDetailProps {
  race: any
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h3>
    <div className="mt-2 text-base text-gray-700 dark:text-gray-200">{children}</div>
  </div>
)

export function RaceDetail({ race }: RaceDetailProps) {
  const abilityBonuses: string[] = []
  race.ability?.forEach((abilityObj: any) => {
    Object.entries(abilityObj).forEach(([ability, value]) => {
      if (ability !== "choose") {
        abilityBonuses.push(`${ability.toUpperCase()} +${value}`)
      }
    })
  })

  const entriesText = Array.isArray(race.entries)
    ? race.entries.map((entry: any) => extractPlainText(entry)).join("\n\n")
    : ""

  const languages = race.languageProficiencies?.flatMap((prof: any) => {
    if (prof.common) return ["Common"]
    if (prof.anyStandard) return [`Any ${prof.anyStandard} standard languages`]
    if (prof.choose?.from) return prof.choose.from
    return Object.keys(prof).filter((key) => prof[key] === true)
  })

  const speeds: string[] = []
  if (race.speed?.walk) speeds.push(`${race.speed.walk} ft.`)
  if (race.speed?.fly) speeds.push(`Fly ${race.speed.fly} ft.`)
  if (race.speed?.swim) speeds.push(`Swim ${race.speed.swim} ft.`)
  if (race.speed?.climb) speeds.push(`Climb ${race.speed.climb} ft.`)
  if (race.speed?.burrow) speeds.push(`Burrow ${race.speed.burrow} ft.`)

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Size</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {Array.isArray(race.size) ? race.size.join(", ") : race.size || "Medium"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Speed</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{speeds.length ? speeds.join(", ") : "30 ft."}</p>
        </div>
        {abilityBonuses.length > 0 && (
          <div className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Ability Score Increase</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{abilityBonuses.join(", ")}</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">{entriesText}</p>
      </section>

      {languages && languages.length > 0 && (
        <Section title="Languages">{languages.join(", ")}</Section>
      )}

      {race.skillProficiencies && (
        <Section title="Skill Proficiencies">
          {race.skillProficiencies
            .flatMap((prof: any) => {
              if (prof.choose?.from) {
                return [`Choose ${prof.choose.count ?? 1} from ${prof.choose.from.join(", ")}`]
              }
              return Object.keys(prof).filter((key) => prof[key] === true)
            })
            .join(", ")}
        </Section>
      )}

      {(race.traitTags?.length || race.abilityTags?.length) && (
        <Section title="Traits">
          <div className="flex flex-wrap gap-2">
            {race.traitTags?.map((tag: string) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-emerald-100/70 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                {tag}
              </span>
            ))}
            {race.abilityTags?.map((tag: string) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-sky-100/70 px-3 py-1 text-sm font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Source">
        {race.source}
        {race.page && ` • Page ${race.page}`}
      </Section>
    </div>
  )
}

