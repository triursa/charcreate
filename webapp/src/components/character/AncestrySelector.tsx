
import { useEffect, useState } from 'react'
import { useCharacterBuilder } from '@/state/character-builder'

type Race = {
  id: string
  name: string
  source?: string
  size?: any
  speed?: any
  ability?: any
  traitTags?: any
  languageProficiencies?: any
  entries?: any
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
    <div className="grid gap-4 md:grid-cols-2">
      {loading ? (
        <div>Loading races...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        races.map((race) => (
            <div
              key={race.id}
              className={`border rounded-lg p-4 cursor-pointer ${ancestryId === race.id ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950' : 'border-slate-300 bg-transparent dark:border-slate-600'}`}
              onClick={() => actions.setAncestry(race)}
            >
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{race.name}</h3>
              {race.source && <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{race.source}</p>}
              
              {/* Display ability score increases */}
              {race.ability && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Ability Bonuses:</span>
                  <div className="ml-2 text-sm">
                    {Array.isArray(race.ability) ? (
                      race.ability.map((abilityItem: any, i: number) => {
                        if (typeof abilityItem === 'object' && abilityItem !== null) {
                          return Object.entries(abilityItem).map(([ability, value]: [string, any]) => {
                            // Only render if value is a number
                            if (typeof value === 'number') {
                              return (
                                <span key={`${i}-${ability}`} className="mr-3">
                                  {ability.toUpperCase()}: +{value}
                                </span>
                              );
                            }
                            return null;
                          });
                        } else if (typeof abilityItem === 'string') {
                          return <span key={i} className="mr-3">{abilityItem}</span>;
                        }
                        return null;
                      }).flat().filter(Boolean)
                    ) : (
                      <span>Unable to parse ability data</span>
                    )}
                  </div>
                </div>
              )}

              {/* Display speed */}
              {race.speed && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Speed:</span>
                  <span className="ml-2 text-sm">
                    {(() => {
                      if (typeof race.speed === 'object' && race.speed !== null) {
                        if (race.speed.walk) {
                          return `${race.speed.walk} ft`;
                        } else if (typeof race.speed === 'number') {
                          return `${race.speed} ft`;
                        } else {
                          // Handle other speed types
                          const speedEntries = Object.entries(race.speed)
                            .map(([type, value]) => `${type}: ${value} ft`)
                            .join(', ');
                          return speedEntries || 'Unknown speed';
                        }
                      } else if (typeof race.speed === 'number') {
                        return `${race.speed} ft`;
                      } else {
                        return 'Unknown speed';
                      }
                    })()}
                  </span>
                </div>
              )}

              {/* Display size */}
              {race.size && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Size:</span>
                  <span className="ml-2 text-sm">
                    {(() => {
                      if (Array.isArray(race.size)) {
                        return race.size.join(', ');
                      } else if (typeof race.size === 'string') {
                        return race.size;
                      } else if (typeof race.size === 'object' && race.size !== null) {
                        // Handle size objects - look for common properties
                        if (race.size.size) return race.size.size;
                        if (race.size.name) return race.size.name;
                        return Object.values(race.size).join(', ');
                      } else {
                        return 'Unknown size';
                      }
                    })()}
                  </span>
                </div>
              )}

              {/* Display language proficiencies */}
              {race.languageProficiencies && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Languages:</span>
                  <div className="ml-2 text-sm">
                    {Array.isArray(race.languageProficiencies) ? (
                      race.languageProficiencies.map((langItem: any, i: number) => (
                        <div key={i}>
                          {(() => {
                            if (typeof langItem === 'string') {
                              return langItem;
                            } else if (typeof langItem === 'object' && langItem !== null) {
                              // Handle language objects - look for common properties
                              if (langItem.language) return langItem.language;
                              if (langItem.name) return langItem.name;
                              if (langItem.choose) {
                                return `Choose ${langItem.choose.count || 'any'} from ${JSON.stringify(langItem.choose.from || 'any languages')}`;
                              }
                              return 'Custom language choice';
                            }
                            return 'Unknown language';
                          })()}
                        </div>
                      ))
                    ) : (
                      <div>No languages specified</div>
                    )}
                  </div>
                </div>
              )}

              {/* Display trait tags as features */}
              {race.traitTags && Array.isArray(race.traitTags) && race.traitTags.length > 0 && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Traits:</span>
                  <div className="ml-2 text-sm">
                    {race.traitTags.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
    </div>
  )
}
