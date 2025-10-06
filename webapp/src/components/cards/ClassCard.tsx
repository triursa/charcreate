'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sword, Shield, Heart, Zap, Star, Dices, Target, Book } from 'lucide-react'

interface ClassCardProps {
  classData: any
}

export function ClassCard({ classData }: ClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getHitDie = () => {
    return classData.hd?.number || 8
  }

  const getPrimaryAbility = () => {
    if (!classData.ability) return 'Various'
    
    const abilities = classData.ability.map((ab: string) => {
      const abilityMap: { [key: string]: string } = {
        str: 'Strength',
        dex: 'Dexterity', 
        con: 'Constitution',
        int: 'Intelligence',
        wis: 'Wisdom',
        cha: 'Charisma'
      }
      return abilityMap[ab.toLowerCase()] || ab
    })
    
    return abilities.join(' or ')
  }

  const getSavingThrows = () => {
    if (!classData.proficiency) return 'None listed'
    
    const savingThrows = classData.proficiency
      .filter((prof: string) => prof.includes('saving'))
      .map((prof: string) => prof.replace('saving throws ', '').replace('saving throw ', ''))
    
    return savingThrows.length > 0 ? savingThrows.join(', ') : 'None listed'
  }

  const getArmorProficiencies = () => {
    if (!classData.startingProficiencies?.armor) return 'None'
    
    return classData.startingProficiencies.armor.join(', ')
  }

  const getWeaponProficiencies = () => {
    if (!classData.startingProficiencies?.weapons) return 'None'
    
    return classData.startingProficiencies.weapons.slice(0, 3).join(', ') + 
           (classData.startingProficiencies.weapons.length > 3 ? '...' : '')
  }

  const getSpellcastingInfo = () => {
    if (!classData.spellcastingAbility) return null
    
    const abilityMap: { [key: string]: string } = {
      str: 'Strength',
      dex: 'Dexterity', 
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    }
    
    return abilityMap[classData.spellcastingAbility.toLowerCase()] || classData.spellcastingAbility
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
    if (!classData.classFeatures || classData.classFeatures.length === 0) {
      return 'No description available.'
    }
    
    // Look for the first feature that contains a description
    const firstFeature = classData.classFeatures[0]
    if (firstFeature && firstFeature.entries) {
      const description = firstFeature.entries
        .slice(0, 2)
        .map(parseEntryText)
        .join(' ')
        .substring(0, 200)
      
      return description + (description.length >= 200 ? '...' : '')
    }
    
    return 'Powerful adventurer with unique abilities.'
  }

  const getClassIcon = () => {
    const className = classData.name?.toLowerCase() || ''
    
    if (className.includes('fighter') || className.includes('paladin') || className.includes('barbarian')) {
      return <Sword size={20} className="text-red-500" />
    }
    if (className.includes('wizard') || className.includes('sorcerer') || className.includes('warlock')) {
      return <Zap size={20} className="text-purple-500" />
    }
    if (className.includes('cleric') || className.includes('druid')) {
      return <Star size={20} className="text-yellow-500" />
    }
    if (className.includes('rogue') || className.includes('ranger')) {
      return <Target size={20} className="text-green-500" />
    }
    if (className.includes('bard')) {
      return <Book size={20} className="text-pink-500" />
    }
    
    return <Dices size={20} className="text-blue-500" />
  }

  const getHitDieColor = () => {
    const hitDie = getHitDie()
    if (hitDie >= 12) return 'text-red-600 dark:text-red-400'
    if (hitDie >= 10) return 'text-orange-600 dark:text-orange-400'
    if (hitDie >= 8) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-dark-700 overflow-hidden group">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-dark-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getClassIcon()}
            <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
              {classData.name}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <Heart size={16} className={getHitDieColor()} />
              <span className={`font-bold ${getHitDieColor()}`}>d{getHitDie()}</span>
            </div>
            {getSpellcastingInfo() && (
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-full" title="Spellcaster">
                <Zap size={14} className="text-purple-600 dark:text-purple-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded-full text-xs">
            {classData.source}
          </span>
          <span className="text-xs">
            Primary: {getPrimaryAbility()}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {getDescription()}
        </p>
      </div>

      {/* Basic Info */}
      <div className="p-6 space-y-4">
        {/* Hit Die and Primary Ability */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
              <Heart size={16} className="mr-2 text-red-500" />
              Hit Die
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">d{getHitDie()}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
              <Star size={16} className="mr-2 text-yellow-500" />
              Primary
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getPrimaryAbility()}</p>
          </div>
        </div>

        {/* Saving Throws */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
            <Shield size={16} className="mr-2 text-blue-500" />
            Saving Throws
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getSavingThrows()}</p>
        </div>

        {/* Spellcasting */}
        {getSpellcastingInfo() && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
              <Zap size={16} className="mr-2 text-purple-500" />
              Spellcasting Ability
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getSpellcastingInfo()}</p>
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
            {/* Proficiencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
                  <Shield size={16} className="mr-2 text-gray-500" />
                  Armor
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{getArmorProficiencies()}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
                  <Sword size={16} className="mr-2 text-gray-500" />
                  Weapons
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{getWeaponProficiencies()}</p>
              </div>
            </div>

            {/* Class Features */}
            {classData.classFeatures && classData.classFeatures.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Features</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {classData.classFeatures.slice(0, 5).map((feature: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        {feature.name}
                        {feature.level && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (Level {feature.level})
                          </span>
                        )}
                      </h5>
                      {feature.entries && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {parseEntryText(feature.entries[0]).substring(0, 120)}...
                        </p>
                      )}
                    </div>
                  ))}
                  {classData.classFeatures.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                      And {classData.classFeatures.length - 5} more features...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Subclasses */}
            {classData.subclasses && classData.subclasses.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Available Subclasses</h4>
                <div className="flex flex-wrap gap-2">
                  {classData.subclasses.slice(0, 6).map((subclass: any, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {subclass.name}
                    </span>
                  ))}
                  {classData.subclasses.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{classData.subclasses.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}