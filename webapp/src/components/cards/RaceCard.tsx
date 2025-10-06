'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Users, Shield, Eye, Zap, MapPin, Book, Star } from 'lucide-react'

interface RaceCardProps {
  race: any
}

export function RaceCard({ race }: RaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getSizeDisplay = (size: string | string[]) => {
    if (Array.isArray(size)) {
      return size.join(', ')
    }
    return size || 'Medium'
  }

  const getSpeedDisplay = (speed: any) => {
    if (!speed) return '30 ft.'
    
    const speeds = []
    if (speed.walk !== undefined) speeds.push(`${speed.walk} ft.`)
    if (speed.fly) speeds.push(`fly ${speed.fly} ft.`)
    if (speed.swim) speeds.push(`swim ${speed.swim} ft.`)
    if (speed.climb) speeds.push(`climb ${speed.climb} ft.`)
    if (speed.burrow) speeds.push(`burrow ${speed.burrow} ft.`)
    
    return speeds.join(', ') || '30 ft.'
  }

  const getAbilityScoreIncrease = () => {
    if (!race.ability) return null
    
    const increases: string[] = []
    race.ability.forEach((abilityObj: any) => {
      Object.entries(abilityObj).forEach(([ability, value]) => {
        if (ability !== 'choose') {
          const abilityName = ability.charAt(0).toUpperCase() + ability.slice(1)
          increases.push(`${abilityName} +${value}`)
        }
      })
    })
    
    return increases.join(', ')
  }

  const parseEntryText = (entry: any): string => {
    if (typeof entry === 'string') {
      return entry
    }
    if (entry && typeof entry === 'object') {
      if (entry.type === 'entries' && entry.entries) {
        return entry.entries.map(parseEntryText).join(' ')
      }
      if (entry.type === 'list' && entry.items) {
        return entry.items.map(parseEntryText).join(', ')
      }
      if (entry.name && entry.entries) {
        return `${entry.name}: ${entry.entries.map(parseEntryText).join(' ')}`
      }
      return entry.text || ''
    }
    return ''
  }

  const getDescription = () => {
    if (!race.entries) return 'No description available.'
    
    const description = race.entries
      .slice(0, 2)
      .map(parseEntryText)
      .join(' ')
      .substring(0, 200)
    
    return description + (description.length >= 200 ? '...' : '')
  }

  const getLanguages = () => {
    if (!race.languageProficiencies) return null
    
    const languages = race.languageProficiencies.flatMap((prof: any) => {
      if (prof.common) return ['Common']
      if (prof.anyStandard) return [`Any ${prof.anyStandard} standard`]
      if (prof.choose) return prof.choose.from || []
      return Object.keys(prof).filter(key => prof[key] === true)
    })
    
    return languages.length > 0 ? languages.join(', ') : null
  }

  const getSkillProficiencies = () => {
    if (!race.skillProficiencies) return null
    
    const skills = race.skillProficiencies.flatMap((prof: any) => {
      if (prof.choose) {
        return prof.choose.from ? [`Choose ${prof.choose.count || 1} from ${prof.choose.from.join(', ')}`] : []
      }
      return Object.keys(prof).filter(key => prof[key] === true)
    })
    
    return skills.length > 0 ? skills.join(', ') : null
  }

  const hasSpecialTraits = () => {
    return race.darkvision || 
           race.resist || 
           race.immune || 
           race.conditionImmune ||
           (race.speed && (race.speed.fly || race.speed.swim || race.speed.climb || race.speed.burrow)) ||
           race.spellcasting
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-dark-700 overflow-hidden group">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-dark-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
            {race.name}
          </h3>
          {hasSpecialTraits() && (
            <div className="flex space-x-1">
              {race.darkvision && (
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-full" title="Darkvision">
                  <Eye size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
              )}
              {race.speed?.fly && (
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full" title="Flight">
                  <Zap size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
              )}
              {(race.resist || race.immune) && (
                <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-full" title="Resistances/Immunities">
                  <Shield size={14} className="text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded-full text-xs">
            {race.source}
          </span>
          <span className="flex items-center">
            <Users size={14} className="mr-1" />
            {getSizeDisplay(race.size)}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {getDescription()}
        </p>
      </div>

      {/* Basic Info */}
      <div className="p-6 space-y-4">
        {/* Ability Score Increase */}
        {getAbilityScoreIncrease() && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
              <Star size={16} className="mr-2 text-yellow-500" />
              Ability Score Increase
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getAbilityScoreIncrease()}</p>
          </div>
        )}

        {/* Speed */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
            <MapPin size={16} className="mr-2 text-blue-500" />
            Speed
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getSpeedDisplay(race.speed)}</p>
        </div>

        {/* Languages */}
        {getLanguages() && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
              <Book size={16} className="mr-2 text-purple-500" />
              Languages
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getLanguages()}</p>
          </div>
        )}

        {/* Skill Proficiencies */}
        {getSkillProficiencies() && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
              <Shield size={16} className="mr-2 text-green-500" />
              Skill Proficiencies
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getSkillProficiencies()}</p>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 px-4 bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} className="mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} className="mr-1" />
              Show More
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-dark-700">
          <div className="pt-4 space-y-4">
            {/* Special Traits */}
            {race.darkvision && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
                  <Eye size={16} className="mr-2 text-purple-500" />
                  Darkvision
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {race.darkvision} feet
                </p>
              </div>
            )}

            {/* Resistances */}
            {(race.resist || race.immune) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
                  <Shield size={16} className="mr-2 text-red-500" />
                  Resistances & Immunities
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {race.resist && (
                    <p><strong>Resistance:</strong> {Array.isArray(race.resist) ? race.resist.join(', ') : race.resist}</p>
                  )}
                  {race.immune && (
                    <p><strong>Immunity:</strong> {Array.isArray(race.immune) ? race.immune.join(', ') : race.immune}</p>
                  )}
                  {race.conditionImmune && (
                    <p><strong>Condition Immunity:</strong> {Array.isArray(race.conditionImmune) ? race.conditionImmune.join(', ') : race.conditionImmune}</p>
                  )}
                </div>
              </div>
            )}

            {/* Full Description */}
            {race.entries && race.entries.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Full Description</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 max-h-60 overflow-y-auto">
                  {race.entries.map((entry: any, index: number) => (
                    <div key={index}>
                      {parseEntryText(entry)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subraces */}
            {race.subraces && race.subraces.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Subraces</h4>
                <div className="space-y-2">
                  {race.subraces.map((subrace: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white">{subrace.name}</h5>
                      {subrace.entries && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {parseEntryText(subrace.entries[0]).substring(0, 150)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}