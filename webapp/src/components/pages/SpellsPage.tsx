'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, BookOpen, Zap, Clock, Target } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { searchAllContent, filterContent, getFilterOptions } from '@/lib/search'
import { SpellCard } from '@/components/cards/SpellCard'
import { FilterPanel } from '@/components/FilterPanel'

interface SpellsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function SpellsPage({ searchQuery, onSearch }: SpellsPageProps) {
  const [spells, setSpells] = useState<any[]>([])
  const [filteredSpells, setFilteredSpells] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    loadSpells()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, sortBy, spells])

  const loadSpells = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory('spells')
      setSpells(data)
      
      const options = getFilterOptions(data, 'spells')
      setFilterOptions(options)
    } catch (error) {
      console.error('Error loading spells:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...spells]

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ spells }, searchQuery, 100)
      result = searchResults.map(r => r.item)
    }

    // Apply filters
    result = filterContent(result, 'spells', filters)

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'level':
          return (a.level || 0) - (b.level || 0)
        case 'school':
          return (a.school || '').localeCompare(b.school || '')
        case 'source':
          return (a.source || '').localeCompare(b.source || '')
        default:
          return 0
      }
    })

    setFilteredSpells(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const getSpellStats = () => {
    const stats = {
      total: spells.length,
      cantrips: spells.filter(s => s.level === 0).length,
      highLevel: spells.filter(s => s.level >= 6).length,
      schools: new Set(spells.map(s => s.school)).size
    }
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading spells...</p>
        </div>
      </div>
    )
  }

  const stats = getSpellStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-dark-900 dark:to-dark-800">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container-fluid py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Zap size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 font-fantasy">
            Spells Compendium
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8 opacity-90">
            Master the arcane arts with our complete collection of D&D 5e spells. 
            From simple cantrips to reality-bending 9th level magic.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="text-sm opacity-80">Total Spells</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.cantrips.toLocaleString()}</div>
              <div className="text-sm opacity-80">Cantrips</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.highLevel.toLocaleString()}</div>
              <div className="text-sm opacity-80">High Level (6+)</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.schools}</div>
              <div className="text-sm opacity-80">Schools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10">
        <div className="container-fluid py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search spells by name, description, or effect..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="level">Spell Level</option>
                <option value="school">School</option>
                <option value="source">Source</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredSpells.length.toLocaleString()} of {spells.length.toLocaleString()} spells
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex">
        {/* Filter Sidebar */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            category="spells"
          />
        )}

        {/* Spells Grid */}
        <div className="flex-1 p-6">
          {filteredSpells.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No spells found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSpells.map((spell, index) => (
                <SpellCard
                  key={`${spell.name}-${spell.source}-${index}`}
                  spell={spell}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}