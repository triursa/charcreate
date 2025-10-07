
import { useEffect, useState } from 'react'
import { useCharacterBuilder } from '@/state/character-builder'

type Race = {
  id: string
  name: string
  source: string
  description: string
  abilityBonuses?: Record<string, number>
  languages?: string[]
}

export function AncestrySelector() {
  const {
    state: { ancestryId },
    actions
  } = useCharacterBuilder()
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRaces() {
      try {
        const res = await fetch('/api/races')
        if (!res.ok) throw new Error('Failed to fetch races')
        const data = await res.json()
        setRaces(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRaces()
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ancestry &amp; Heritage</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Apply lineage bonuses, innate abilities, and cultural proficiencies.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {loading ? (
          <div>Loading races...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          races.map((race) => (
            <div
              key={race.id}
              className={`border rounded-lg p-4 cursor-pointer ${ancestryId === race.id ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950' : 'border-slate-300 bg-transparent dark:border-slate-600'}`}
              onClick={() => actions.setAncestry(race.id)}
            >
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{race.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{race.source}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">{race.description}</p>
              <div className="mt-2">
                <span className="font-semibold">Ability Bonuses:</span>
                <ul className="ml-2">
                  {race.abilityBonuses && Object.entries(race.abilityBonuses).map(([ability, value]) => (
                    <li key={ability}>{ability}: +{value}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Languages:</span>
                <ul className="ml-2">
                  {race.languages && race.languages.map((lang) => (
                    <li key={lang}>{lang}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
