'use client'

import { useEffect, useState } from 'react'
import { Filter, SortAsc, Search, Loader2 } from 'lucide-react'
import { loadAllContent } from '@/lib/clientDataLoader'
import { searchAllContent, filterContent, getFilterOptions } from '@/lib/search'
import { ContentCard } from '@/components/ContentCard'
import { FilterPanel } from '@/components/FilterPanel'

interface ContentViewProps {
  category: string
  searchQuery: string
  onSearch: (query: string) => void
}

interface FilterState {
  source: string[]
  level: number[]
  rarity: string[]
  school: string[]
}

export function ContentView({ category, searchQuery, onSearch }: ContentViewProps) {
  const [content, setContent] = useState<any[]>([])
  const [filteredContent, setFilteredContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [sortBy, setSortBy] = useState('name')
  const [allContent, setAllContent] = useState<Record<string, any[]>>({})

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [category, searchQuery, filters, sortBy, content, allContent])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await loadAllContent()
      const contentRecord: Record<string, any[]> = {
        spells: data.spells,
        races: data.races,
        classes: data.classes,
        items: data.items,
        backgrounds: data.backgrounds,
        adventures: data.adventures,
        feats: data.feats
      }
      setAllContent(contentRecord)
      
      // Set initial content based on category
      if (category !== 'search' && category !== 'home') {
        const categoryContent = contentRecord[category] || []
        setContent(categoryContent)
        
        // Get filter options for this category
        const options = getFilterOptions(categoryContent, category)
        setFilterOptions(options)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...content]

    // Handle search across all content types
    if (searchQuery.trim()) {
      if (category === 'search' || category === 'home') {
        const searchResults = searchAllContent(allContent, searchQuery, 100)
        result = searchResults.map(r => ({ ...r.item, _type: r.type, _score: r.score }))
      } else {
        // Search within current category
        const categoryContent = allContent[category] || []
        const searchResults = searchAllContent({ [category]: categoryContent }, searchQuery, 100)
        result = searchResults.map(r => ({ ...r.item, _type: r.type, _score: r.score }))
      }
    } else if (category === 'search') {
      // No search query in search mode, show nothing
      result = []
    }

    // Apply filters
    if (category !== 'search' && category !== 'home') {
      result = filterContent(result, category, filters)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'source':
          return (a.source || '').localeCompare(b.source || '')
        case 'level':
          if (category === 'spells') {
            return (a.level || 0) - (b.level || 0)
          }
          return (a.name || '').localeCompare(b.name || '')
        case 'relevance':
          if (searchQuery.trim()) {
            return (a._score || 0) - (b._score || 0)
          }
          return (a.name || '').localeCompare(b.name || '')
        default:
          return 0
      }
    })

    setFilteredContent(result)
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const getCategoryTitle = () => {
    if (category === 'search') {
      return searchQuery ? `Search Results for "${searchQuery}"` : 'Search'
    }
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getSortOptions = () => {
    const options = [
      { value: 'name', label: 'Name (A-Z)' },
      { value: 'source', label: 'Source' }
    ]

    if (searchQuery.trim()) {
      options.unshift({ value: 'relevance', label: 'Relevance' })
    }

    if (category === 'spells') {
      options.push({ value: 'level', label: 'Spell Level' })
    }

    return options
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getCategoryTitle()}
          </h1>
          <div className="flex items-center space-x-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {getSortOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter toggle */}
            {category !== 'search' && category !== 'home' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Filter size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Search bar for category views */}
        {category !== 'search' && category !== 'home' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={`Search ${category}...`}
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filter panel */}
        {showFilters && category !== 'search' && category !== 'home' && (
          <FilterPanel
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            category={category}
          />
        )}

        {/* Content grid */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No results found' : 'No content available'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Content will appear here when available'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredContent.length.toLocaleString()} results
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredContent.map((item, index) => (
                    <ContentCard
                      key={`${item.name}-${item.source}-${index}`}
                      content={item}
                      type={item._type || category}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}