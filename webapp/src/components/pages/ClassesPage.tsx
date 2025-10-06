'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Sword, Shield, Zap, Heart, Dices } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { searchAllContent, filterContent, getFilterOptions } from '@/lib/search'
import { ClassCard } from '@/components/cards/ClassCard'
import { FilterPanel } from '@/components/FilterPanel'

interface ClassesPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function ClassesPage({ searchQuery, onSearch }: ClassesPageProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
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
    loadClasses()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, sortBy, classes])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory('classes')
      setClasses(data)
      
      const options = getFilterOptions(data, 'classes')
      setFilterOptions(options)
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...classes]

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ classes }, searchQuery, 100)
      result = searchResults.map(r => r.item)
    }

    // Apply filters
    result = filterContent(result, 'classes', filters)

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'source':
          return (a.source || '').localeCompare(b.source || '')
        case 'hitDie':
          return (b.hd?.number || 8) - (a.hd?.number || 8)
        default:
          return 0
      }
    })

    setFilteredClasses(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const getClassStats = () => {
    const hitDies = new Set(classes.map(c => c.hd?.number || 8))
    const sources = new Set(classes.map(c => c.source))
    const withSpellcasting = classes.filter(c => c.spellcastingAbility).length
    const martialClasses = classes.filter(c => {
      const name = c.name?.toLowerCase() || ''
      return name.includes('fighter') || name.includes('ranger') || name.includes('paladin') || 
             name.includes('barbarian') || name.includes('monk')
    }).length

    return {
      total: classes.length,
      hitDies: hitDies.size,
      sources: sources.size,
      withSpellcasting,
      martialClasses
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
        </div>
      </div>
    )
  }

  const stats = getClassStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-dark-900 dark:to-dark-800">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-700 text-white">
        <div className="container-fluid py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Sword size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 font-fantasy">
            Character Classes
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8 opacity-90">
            Choose your path to adventure. From mighty warriors to cunning rogues, 
            each class offers unique abilities and playstyles to shape your destiny.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="text-sm opacity-80">Total Classes</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.withSpellcasting.toLocaleString()}</div>
              <div className="text-sm opacity-80">Spellcasters</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.martialClasses.toLocaleString()}</div>
              <div className="text-sm opacity-80">Martial Classes</div>
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
                  placeholder="Search classes by name, features, or abilities..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="source">Source</option>
                <option value="hitDie">Hit Die (High to Low)</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredClasses.length.toLocaleString()} of {classes.length.toLocaleString()} classes
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
            category="classes"
          />
        )}

        {/* Classes Grid */}
        <div className="flex-1 p-6">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-16">
              <Sword className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No classes found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClasses.map((classData, index) => (
                <ClassCard
                  key={`${classData.name}-${classData.source}-${index}`}
                  classData={classData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}