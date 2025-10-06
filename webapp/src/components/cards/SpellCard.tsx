'use client'

import { useState } from 'react'
import { Eye, EyeOff, Zap, Clock, Target, Users } from 'lucide-react'
import { formatSpellLevel, getSchoolName, formatDuration, formatRange, extractPlainText } from '@/lib/textParser'

interface SpellCardProps {
  spell: any
}

const schoolColors = {
  'A': 'from-blue-500 to-blue-600',     // Abjuration
  'C': 'from-yellow-500 to-orange-600', // Conjuration
  'D': 'from-purple-500 to-indigo-600', // Divination
  'E': 'from-pink-500 to-rose-600',     // Enchantment
  'V': 'from-red-500 to-red-600',       // Evocation
  'I': 'from-gray-500 to-gray-600',     // Illusion
  'N': 'from-green-800 to-gray-900',    // Necromancy
  'T': 'from-green-500 to-emerald-600'  // Transmutation
}

export function SpellCard({ spell }: SpellCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const schoolColor = schoolColors[spell.school as keyof typeof schoolColors] || 'from-gray-500 to-gray-600'
  const schoolName = getSchoolName(spell.school || '')
  
  const getComponents = () => {
    const components = []
    if (spell.components?.v) components.push('V')
    if (spell.components?.s) components.push('S')
    if (spell.components?.m) components.push('M')
    return components.join(', ') || 'None'
  }

  const getCastingTime = () => {
    if (!spell.time || !spell.time[0]) return 'Unknown'
    const time = spell.time[0]
    return `${time.number} ${time.unit}${time.number > 1 ? 's' : ''}`
  }

  const getClasses = () => {
    if (!spell.classes?.fromClassList) return []
    return spell.classes.fromClassList.map((c: any) => c.name)
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-dark-700 overflow-hidden group">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${schoolColor} text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20`}>
                {formatSpellLevel(spell.level || 0)}
              </span>
              <span className="text-xs opacity-80">{schoolName}</span>
            </div>
            <h3 className="text-lg font-bold leading-tight group-hover:text-yellow-200 transition-colors duration-200">
              {spell.name}
            </h3>
          </div>
          <Zap size={24} className="opacity-80" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{getCastingTime()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target size={14} className="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{formatRange(spell.range)}</span>
          </div>
          <div className="flex items-center space-x-2 col-span-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Components:</span>
            <span className="text-gray-600 dark:text-gray-300">{getComponents()}</span>
          </div>
        </div>

        {/* Description Preview */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
            {extractPlainText(spell.entries).slice(0, 150)}
            {extractPlainText(spell.entries).length > 150 && '...'}
          </p>
        </div>

        {/* Classes */}
        {getClasses().length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-1 mb-2">
              <Users size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Available to:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {getClasses().slice(0, 4).map((className: string) => (
                <span 
                  key={className}
                  className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  {className}
                </span>
              ))}
              {getClasses().length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                  +{getClasses().length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {spell.source}
            {spell.page && ` • p.${spell.page}`}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
          >
            {showDetails ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showDetails ? 'Hide' : 'Details'}</span>
          </button>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Duration:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-300">{formatDuration(spell.duration)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">School:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-300">{schoolName}</span>
              </div>
              {spell.damageInflict && spell.damageInflict.length > 0 && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-900 dark:text-white">Damage Types:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {spell.damageInflict.join(', ')}
                  </span>
                </div>
              )}
              {spell.savingThrow && spell.savingThrow.length > 0 && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-900 dark:text-white">Saving Throw:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {spell.savingThrow.join(', ')}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Full Description:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {extractPlainText(spell.entries)}
              </div>
            </div>

            {getClasses().length > 4 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">All Available Classes:</h4>
                <div className="flex flex-wrap gap-1">
                  {getClasses().map((className: string) => (
                    <span 
                      key={className}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                    >
                      {className}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}