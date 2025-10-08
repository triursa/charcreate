'use client'

import { useState, useEffect } from 'react'
import { Search, Menu, X, Moon, Sun, Home, Scroll, Users, Shield, Book, Map, Zap, Award, Sparkles } from 'lucide-react'
import { useTheme } from '@/app/providers'

interface NavigationProps {
  onCategorySelect: (category: string | null) => void
  onSearch: (query: string) => void
  onHomeSelect: () => void
  currentCategory: string | null
  searchQuery: string
}

const categories = [
  { id: 'home', label: 'Home', icon: Home, description: 'Overview and statistics' },
  { id: 'spells', label: 'Spells', icon: Zap, description: 'Magical spells and cantrips' },
  { id: 'races', label: 'Races', icon: Users, description: 'Player character races' },
  { id: 'classes', label: 'Classes', icon: Shield, description: 'Character classes and subclasses' },
  { id: 'items', label: 'Items', icon: Scroll, description: 'Equipment, weapons, and magic items' },
  { id: 'backgrounds', label: 'Backgrounds', icon: Book, description: 'Character backgrounds' },
  { id: 'adventures', label: 'Adventures', icon: Map, description: 'Published adventures' },
  { id: 'feats', label: 'Feats', icon: Award, description: 'Character feats and abilities' },
  { id: 'optionalfeatures', label: 'Optional Features', icon: Sparkles, description: 'Class variant features and options' }
]

export function Navigation({ onCategorySelect, onSearch, onHomeSelect, currentCategory, searchQuery }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocalSearchQuery(query)
    onSearch(query)
  }

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'home') {
      onHomeSelect()
    } else {
      onCategorySelect(categoryId)
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-fantasy">
                D&D 5e Compendium
              </h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search all content..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation Categories */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      w-full flex items-center px-3 py-2 mb-1 text-left rounded-md transition-colors duration-200
                      ${(category.id === 'home' && currentCategory === null) || currentCategory === category.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }
                    `}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {category.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors duration-200"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={20} className="mr-3" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={20} className="mr-3" />
                  Light Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top bar for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white font-fantasy">
            D&D 5e Compendium
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </>
  )
}