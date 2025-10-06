'use client'

import { useState } from 'react'
import { Eye, ExternalLink, BookOpen, Zap, Users, Shield, Scroll } from 'lucide-react'
import { formatSpellLevel, getSchoolName, formatDuration, formatRange, extractPlainText } from '@/lib/textParser'

interface ContentCardProps {
  content: any
  type: string
  onSelect?: (content: any, type: string) => void
}

const typeIcons = {
  spells: Zap,
  races: Users,
  classes: Shield,
  items: Scroll,
  backgrounds: BookOpen,
  adventures: BookOpen,
  feats: BookOpen
}

export function ContentCard({ content, type, onSelect }: ContentCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const Icon = typeIcons[type as keyof typeof typeIcons] || BookOpen

  const getCardHeader = () => {
    switch (type) {
      case 'spells':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`spell-level spell-level-${content.level || 0}`}>
                {formatSpellLevel(content.level || 0)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getSchoolName(content.school || '')}
              </span>
            </div>
            <Zap size={16} className="text-blue-500" />
          </div>
        )
      
      case 'items':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {content.rarity && (
                <span className={`rarity-${content.rarity?.toLowerCase().replace(' ', '-')} px-2 py-1 rounded text-xs font-medium`}>
                  {content.rarity}
                </span>
              )}
              {content.type && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {content.type}
                </span>
              )}
            </div>
            <Scroll size={16} className="text-yellow-500" />
          </div>
        )
      
      case 'races':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {content.size && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Size: {Array.isArray(content.size) ? content.size.join(', ') : content.size}
                </span>
              )}
            </div>
            <Users size={16} className="text-green-500" />
          </div>
        )
      
      case 'classes':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {content.isSubclass && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {content.parentClass} Subclass
                </span>
              )}
              {content.hd && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Hit Die: d{content.hd.faces}
                </span>
              )}
            </div>
            <Shield size={16} className="text-red-500" />
          </div>
        )
      
      default:
        return (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {type.slice(0, -1)}
            </span>
            <Icon size={16} className="text-gray-500" />
          </div>
        )
    }
  }

  const getDescription = () => {
    if (content.entries) {
      const text = extractPlainText(content.entries)
      return text.slice(0, 150) + (text.length > 150 ? '...' : '')
    }
    return 'No description available.'
  }

  const getDetailedInfo = () => {
    switch (type) {
      case 'spells':
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Range:</span> {formatRange(content.range)}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {formatDuration(content.duration)}
              </div>
              <div>
                <span className="font-medium">Components:</span>{' '}
                {[
                  content.components?.v && 'V',
                  content.components?.s && 'S',
                  content.components?.m && 'M'
                ].filter(Boolean).join(', ') || 'None'}
              </div>
              <div>
                <span className="font-medium">Source:</span> {content.source}
              </div>
            </div>
            {content.classes?.fromClassList && (
              <div>
                <span className="font-medium">Classes:</span>{' '}
                {content.classes.fromClassList.map((c: any) => c.name).join(', ')}
              </div>
            )}
          </div>
        )
      
      case 'items':
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {content.weight && (
                <div>
                  <span className="font-medium">Weight:</span> {content.weight} lbs
                </div>
              )}
              {content.value && (
                <div>
                  <span className="font-medium">Value:</span> {content.value} cp
                </div>
              )}
              {content.reqAttune && (
                <div>
                  <span className="font-medium">Attunement:</span> {content.reqAttune === true ? 'Required' : content.reqAttune}
                </div>
              )}
              <div>
                <span className="font-medium">Source:</span> {content.source}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Source:</span> {content.source}
              {content.page && `, page ${content.page}`}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="card p-4 group hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      {getCardHeader()}
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
        {content.name}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
        {getDescription()}
      </p>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-dark-700">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
        >
          <Eye size={14} />
          <span>{showDetails ? 'Hide' : 'View'} Details</span>
        </button>
        
        {onSelect && (
          <button
            onClick={() => onSelect(content, type)}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <ExternalLink size={14} />
            <span>Open</span>
          </button>
        )}
      </div>
      
      {/* Detailed Info */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
          {getDetailedInfo()}
          
          {/* Full description */}
          <div className="mt-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Description:</h4>
            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {extractPlainText(content.entries)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}