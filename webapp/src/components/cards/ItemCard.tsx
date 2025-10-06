'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Package, Sword, Shield, Star, Crown, Gem, Zap, Target } from 'lucide-react'

interface ItemCardProps {
  item: any
}

export function ItemCard({ item }: ItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRarityColor = (rarity: string) => {
    const rarityLower = rarity?.toLowerCase() || 'common'
    
    switch (rarityLower) {
      case 'legendary':
        return 'from-orange-400 to-red-600 text-white'
      case 'very rare':
        return 'from-purple-400 to-purple-600 text-white'
      case 'rare':
        return 'from-blue-400 to-blue-600 text-white'
      case 'uncommon':
        return 'from-green-400 to-green-600 text-white'
      case 'artifact':
        return 'from-yellow-400 to-orange-600 text-white'
      default:
        return 'from-gray-400 to-gray-600 text-white'
    }
  }

  const getRarityIcon = (rarity: string) => {
    const rarityLower = rarity?.toLowerCase() || 'common'
    
    switch (rarityLower) {
      case 'legendary':
        return <Crown size={16} />
      case 'very rare':
        return <Gem size={16} />
      case 'rare':
        return <Star size={16} />
      case 'artifact':
        return <Zap size={16} />
      default:
        return <Package size={16} />
    }
  }

  const getTypeIcon = (type: string) => {
    const typeLower = type?.toLowerCase() || ''
    
    if (typeLower.includes('weapon')) {
      return <Sword size={20} className="text-red-500" />
    }
    if (typeLower.includes('armor') || typeLower.includes('shield')) {
      return <Shield size={20} className="text-blue-500" />
    }
    if (typeLower.includes('ring') || typeLower.includes('amulet') || typeLower.includes('necklace')) {
      return <Gem size={20} className="text-purple-500" />
    }
    if (typeLower.includes('wand') || typeLower.includes('staff') || typeLower.includes('rod')) {
      return <Zap size={20} className="text-yellow-500" />
    }
    
    return <Package size={20} className="text-gray-500" />
  }

  const getAttunement = () => {
    if (item.reqAttune) {
      if (typeof item.reqAttune === 'string') {
        return item.reqAttune
      }
      if (typeof item.reqAttune === 'boolean') {
        return 'Requires Attunement'
      }
    }
    return null
  }

  const getWeight = () => {
    return item.weight ? `${item.weight} lb.` : null
  }

  const getValue = () => {
    if (item.value) {
      return `${item.value / 100} gp`
    }
    return null
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
    if (!item.entries || item.entries.length === 0) {
      return 'No description available.'
    }
    
    const description = item.entries
      .slice(0, 2)
      .map(parseEntryText)
      .join(' ')
      .substring(0, 200)
    
    return description + (description.length >= 200 ? '...' : '')
  }

  const getProperties = () => {
    const properties: string[] = []
    
    if (item.property) {
      item.property.forEach((prop: any) => {
        if (typeof prop === 'string') {
          properties.push(prop)
        } else if (prop && typeof prop === 'object') {
          properties.push(prop.name || prop.abbreviation || 'Unknown')
        }
      })
    }
    
    if (item.dmg1) {
      properties.push(`${item.dmg1} damage`)
    }
    
    if (item.ac) {
      properties.push(`AC ${item.ac}`)
    }
    
    return properties
  }

  const hasSpecialProperties = () => {
    return item.reqAttune || 
           item.curse || 
           item.charges || 
           (item.property && item.property.length > 0) ||
           item.resist ||
           item.immune
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-dark-700 overflow-hidden group">
      {/* Header with Rarity Gradient */}
      <div className={`bg-gradient-to-r ${getRarityColor(item.rarity)} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getRarityIcon(item.rarity)}
            <h3 className="font-bold text-lg truncate">
              {item.name}
            </h3>
          </div>
          {hasSpecialProperties() && (
            <div className="flex space-x-1">
              {item.reqAttune && (
                <div className="p-1 bg-white bg-opacity-20 rounded-full" title="Requires Attunement">
                  <Target size={12} />
                </div>
              )}
              {item.curse && (
                <div className="p-1 bg-red-500 bg-opacity-40 rounded-full" title="Cursed">
                  <Zap size={12} />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm opacity-90">
          <span className="capitalize">
            {item.rarity || 'Common'}
          </span>
          <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
            {item.source}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Type and Icon */}
        <div className="flex items-center space-x-3 mb-4">
          {getTypeIcon(item.type)}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {item.type || 'Miscellaneous'}
            </h4>
            {item.weaponCategory && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.weaponCategory}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
          {getDescription()}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {getAttunement() && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                Attunement
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getAttunement()}
              </p>
            </div>
          )}
          
          {getWeight() && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                Weight
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getWeight()}
              </p>
            </div>
          )}
          
          {getValue() && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                Value
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getValue()}
              </p>
            </div>
          )}
          
          {item.range && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                Range
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {item.range} ft.
              </p>
            </div>
          )}
        </div>

        {/* Properties */}
        {getProperties().length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-2">
              Properties
            </h5>
            <div className="flex flex-wrap gap-1">
              {getProperties().slice(0, 4).map((prop, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {prop}
                </span>
              ))}
              {getProperties().length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{getProperties().length - 4}
                </span>
              )}
            </div>
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
            {/* Full Description */}
            {item.entries && item.entries.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Full Description</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 max-h-60 overflow-y-auto">
                  {item.entries.map((entry: any, index: number) => (
                    <div key={index}>
                      {parseEntryText(entry)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4">
              {item.dmg1 && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Damage
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.dmg1} {item.dmgType || ''}
                  </p>
                </div>
              )}
              
              {item.ac !== undefined && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Armor Class
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.ac}
                  </p>
                </div>
              )}
              
              {item.charges && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Charges
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.charges} charges
                  </p>
                </div>
              )}
              
              {item.stealth && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    Stealth
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Disadvantage
                  </p>
                </div>
              )}
            </div>

            {/* All Properties */}
            {getProperties().length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  All Properties
                </h5>
                <div className="flex flex-wrap gap-1">
                  {getProperties().map((prop, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Properties */}
            {(item.resist || item.immune || item.vulnerable) && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  Resistances & Immunities
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {item.resist && (
                    <p><strong>Resistance:</strong> {Array.isArray(item.resist) ? item.resist.join(', ') : item.resist}</p>
                  )}
                  {item.immune && (
                    <p><strong>Immunity:</strong> {Array.isArray(item.immune) ? item.immune.join(', ') : item.immune}</p>
                  )}
                  {item.vulnerable && (
                    <p><strong>Vulnerability:</strong> {Array.isArray(item.vulnerable) ? item.vulnerable.join(', ') : item.vulnerable}</p>
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