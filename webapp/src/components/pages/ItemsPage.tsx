'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Package, Shield, Sword, Star, Gem } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { searchAllContent, filterContent, getFilterOptions } from '@/lib/search'
import { ItemCard } from '@/components/cards/ItemCard'
import { FilterPanel } from '@/components/FilterPanel'

interface ItemsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function ItemsPage({ searchQuery, onSearch }: ItemsPageProps) {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
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
    loadItems()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, sortBy, items])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory('items')
      setItems(data)
      
      const options = getFilterOptions(data, 'items')
      setFilterOptions(options)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...items]

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ items }, searchQuery, 100)
      result = searchResults.map(r => r.item)
    }

    // Apply filters
    result = filterContent(result, 'items', filters)

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'source':
          return (a.source || '').localeCompare(b.source || '')
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']
          const aRarity = rarityOrder.indexOf(a.rarity?.toLowerCase() || 'common')
          const bRarity = rarityOrder.indexOf(b.rarity?.toLowerCase() || 'common')
          return bRarity - aRarity
        case 'type':
          return (a.type || '').localeCompare(b.type || '')
        default:
          return 0
      }
    })

    setFilteredItems(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const getItemStats = () => {
    const rarities = new Set(items.map(i => i.rarity).filter(Boolean))
    const types = new Set(items.map(i => i.type).filter(Boolean))
    const sources = new Set(items.map(i => i.source))
    const magicItems = items.filter(i => i.rarity && i.rarity !== 'None').length
    const weapons = items.filter(i => i.type?.toLowerCase().includes('weapon')).length

    return {
      total: items.length,
      rarities: rarities.size,
      types: types.size,
      sources: sources.size,
      magicItems,
      weapons
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading items...</p>
        </div>
      </div>
    )
  }

  const stats = getItemStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-dark-900 dark:to-dark-800">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="container-fluid py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Package size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 font-fantasy">
            Magic Items & Equipment
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8 opacity-90">
            Discover legendary artifacts, enchanted weapons, and mystical treasures. 
            From humble trinkets to world-shaping relics, find the perfect gear for your adventures.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="text-sm opacity-80">Total Items</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.magicItems.toLocaleString()}</div>
              <div className="text-sm opacity-80">Magic Items</div>
            </div>
            <div className="text-center bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.weapons.toLocaleString()}</div>
              <div className="text-sm opacity-80">Weapons</div>
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
                  placeholder="Search items by name, description, or properties..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="source">Source</option>
                <option value="rarity">Rarity (Legendary First)</option>
                <option value="type">Type</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  showFilters 
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredItems.length.toLocaleString()} of {items.length.toLocaleString()} items
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
            category="items"
          />
        )}

        {/* Items Grid */}
        <div className="flex-1 p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <ItemCard
                  key={`${item.name}-${item.source}-${index}`}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}