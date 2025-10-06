'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Users, Shield, Zap, MapPin } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { searchAllContent, filterContent, getFilterOptions } from '@/lib/search'
import { RaceCard } from '@/components/cards/RaceCard'
import { FilterPanel } from '@/components/FilterPanel'

interface RacesPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function RacesPage({ searchQuery, onSearch }: RacesPageProps) {
  const [races, setRaces] = useState<any[]>([])
  const [filteredRaces, setFilteredRaces] = useState<any[]>([])
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
    loadRaces()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, sortBy, races])

  const loadRaces = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory('races')
      setRaces(data)
      
      const options = getFilterOptions(data, 'races')
      setFilterOptions(options)
    } catch (error) {
      console.error('Error loading races:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...races]

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ races }, searchQuery, 100)
      result = searchResults.map(r => r.item)
    }

    // Apply filters
    result = filterContent(result, 'races', filters)

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'source':
          return (a.source || '').localeCompare(b.source || '')
        default:
          return 0
      }
    })

    setFilteredRaces(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const getRaceStats = () => {
    const sizes = new Set(races.flatMap(r => r.size || []))
    const sources = new Set(races.map(r => r.source))
    const withFlight = races.filter(r => r.speed?.fly).length
    const withDarkvision = races.filter(r => 
      r.entries?.some((e: any) => 
        e.entries?.some((entry: any) => 
          typeof entry === 'string' && entry.toLowerCase().includes('darkvision')
        )
      )
    ).length

    return {
      total: races.length,
      sizes: sizes.size,
      sources: sources.size,
      withFlight,
      withDarkvision
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading races...</p>
        </div>
      </div>
    )
  }

  const stats = getRaceStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-dark-900 dark:to-dark-800">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container-fluid py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Users size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 font-fantasy">
            Character Races
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8 opacity-90">
            Discover the diverse peoples of the D&D multiverse. From noble elves to hardy dwarves, 
            each race brings unique traits and rich lore to your adventures.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="text-sm opacity-80">Total Races</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.withFlight.toLocaleString()}</div>
              <div className="text-sm opacity-80">With Flight</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.withDarkvision.toLocaleString()}</div>
              <div className="text-sm opacity-80">With Darkvision</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.sources}</div>
              <div className="text-sm opacity-80">Source Books</div>
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
                  placeholder="Search races by name, traits, or abilities..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="source">Source</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRaces.length.toLocaleString()} of {races.length.toLocaleString()} races
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
            category="races"
          />
        )}

        {/* Races Grid */}
        <div className="flex-1 p-6">
          {filteredRaces.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No races found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRaces.map((race, index) => (
                <RaceCard
                  key={`${race.name}-${race.source}-${index}`}
                  race={race}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}