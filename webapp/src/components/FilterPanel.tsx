'use client'

import { X } from 'lucide-react'

interface FilterPanelProps {
  filters: {
    source: string[]
    level: number[]
    rarity: string[]
    school: string[]
  }
  filterOptions: {
    sources: string[]
    levels: number[]
    rarities: string[]
    schools: string[]
  }
  onFilterChange: (filters: any) => void
  category: string
}

export function FilterPanel({ filters, filterOptions, onFilterChange, category }: FilterPanelProps) {
  const handleCheckboxChange = (filterType: string, value: string | number, checked: boolean) => {
    const newFilters = { ...filters }
    const filterArray = newFilters[filterType as keyof typeof newFilters] as any[]
    
    if (checked) {
      if (!filterArray.includes(value)) {
        filterArray.push(value)
      }
    } else {
      const index = filterArray.indexOf(value)
      if (index > -1) {
        filterArray.splice(index, 1)
      }
    }
    
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange({
      source: [],
      level: [],
      rarity: [],
      school: []
    })
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(filterArray => filterArray.length > 0)
  }

  return (
    <div className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Source Filter */}
      {filterOptions.sources && filterOptions.sources.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Source</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.sources.map(source => (
              <label key={source} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.source.includes(source)}
                  onChange={(e) => handleCheckboxChange('source', source, e.target.checked)}
                  className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{source}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Level Filter (Spells only) */}
      {category === 'spells' && filterOptions.levels && filterOptions.levels.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Spell Level</h4>
          <div className="space-y-2">
            {filterOptions.levels.map(level => (
              <label key={level} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.level.includes(level)}
                  onChange={(e) => handleCheckboxChange('level', level, e.target.checked)}
                  className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {level === 0 ? 'Cantrip' : `Level ${level}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* School Filter (Spells only) */}
      {category === 'spells' && filterOptions.schools && filterOptions.schools.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">School</h4>
          <div className="space-y-2">
            {filterOptions.schools.map(school => (
              <label key={school} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.school.includes(school)}
                  onChange={(e) => handleCheckboxChange('school', school, e.target.checked)}
                  className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{school}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rarity Filter (Items only) */}
      {category === 'items' && filterOptions.rarities && filterOptions.rarities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Rarity</h4>
          <div className="space-y-2">
            {filterOptions.rarities.map(rarity => (
              <label key={rarity} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.rarity.includes(rarity)}
                  onChange={(e) => handleCheckboxChange('rarity', rarity, e.target.checked)}
                  className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{rarity}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Active Filters</h4>
          <div className="space-y-1">
            {filters.source.map(source => (
              <div key={`source-${source}`} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-dark-700 rounded px-2 py-1">
                <span className="text-gray-700 dark:text-gray-300">{source}</span>
                <button
                  onClick={() => handleCheckboxChange('source', source, false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {filters.level.map(level => (
              <div key={`level-${level}`} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-dark-700 rounded px-2 py-1">
                <span className="text-gray-700 dark:text-gray-300">
                  {level === 0 ? 'Cantrip' : `Level ${level}`}
                </span>
                <button
                  onClick={() => handleCheckboxChange('level', level, false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {filters.school.map(school => (
              <div key={`school-${school}`} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-dark-700 rounded px-2 py-1">
                <span className="text-gray-700 dark:text-gray-300">{school}</span>
                <button
                  onClick={() => handleCheckboxChange('school', school, false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {filters.rarity.map(rarity => (
              <div key={`rarity-${rarity}`} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-dark-700 rounded px-2 py-1">
                <span className="text-gray-700 dark:text-gray-300">{rarity}</span>
                <button
                  onClick={() => handleCheckboxChange('rarity', rarity, false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}