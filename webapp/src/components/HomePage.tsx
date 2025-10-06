'use client'

import { useEffect, useState } from 'react'
import { Zap, Users, Shield, Scroll, Book, Map, Award, BarChart3, TrendingUp } from 'lucide-react'
import { getContentStats, ContentStats } from '@/lib/clientDataLoader'
import { SpellsPage } from '@/components/pages/SpellsPage'
import { RacesPage } from '@/components/pages/RacesPage'
import { ClassesPage } from '@/components/pages/ClassesPage'
import { ItemsPage } from '@/components/pages/ItemsPage'
import { ContentView } from '@/components/ContentView'

interface HomePageProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  searchQuery: string
  onSearch: (query: string) => void
}

const categoryCards = [
  {
    id: 'spells',
    title: 'Spells',
    description: 'Explore the vast collection of magical spells',
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'races',
    title: 'Races',
    description: 'Discover character races and their traits',
    icon: Users,
    color: 'from-green-500 to-teal-600',
    textColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'classes',
    title: 'Classes',
    description: 'Browse character classes and subclasses',
    icon: Shield,
    color: 'from-red-500 to-pink-600',
    textColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'items',
    title: 'Items',
    description: 'Find equipment, weapons, and magic items',
    icon: Scroll,
    color: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    id: 'backgrounds',
    title: 'Backgrounds',
    description: 'Learn about character backgrounds',
    icon: Book,
    color: 'from-indigo-500 to-blue-600',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'adventures',
    title: 'Adventures',
    description: 'Explore published adventure modules',
    icon: Map,
    color: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'feats',
    title: 'Feats',
    description: 'Discover character feats and abilities',
    icon: Award,
    color: 'from-pink-500 to-red-600',
    textColor: 'text-pink-600 dark:text-pink-400'
  }
]

export function HomePage({ selectedCategory, onCategorySelect, searchQuery, onSearch }: HomePageProps) {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const contentStats = await getContentStats()
      setStats(contentStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  // Render specific pages for main categories
  if (selectedCategory === 'spells') {
    return <SpellsPage searchQuery={searchQuery} onSearch={onSearch} />
  }
  
  if (selectedCategory === 'races') {
    return <RacesPage searchQuery={searchQuery} onSearch={onSearch} />
  }
  
  if (selectedCategory === 'classes') {
    return <ClassesPage searchQuery={searchQuery} onSearch={onSearch} />
  }
  
  if (selectedCategory === 'items') {
    return <ItemsPage searchQuery={searchQuery} onSearch={onSearch} />
  }
  
  // For other categories, use the generic ContentView
  if (selectedCategory) {
    return <ContentView category={selectedCategory} searchQuery={searchQuery} onSearch={onSearch} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-red-900 dark:via-red-800 dark:to-red-900">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container-fluid py-20 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-fantasy tracking-wider">
            D&D 5e Compendium
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
            Your ultimate digital companion for Dungeons & Dragons 5th Edition. 
            Explore the complete collection of spells, races, classes, items, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onCategorySelect('spells')}
              className="px-8 py-4 bg-white text-red-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
            >
              Browse Spells
            </button>
            <button
              onClick={() => onCategorySelect('races')}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-red-700 transition-colors duration-200 transform hover:scale-105"
            >
              Explore Races
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-16">
        {/* Quick Stats Section */}
        {stats && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Content at a Glance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="text-white" size={28} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(stats.spells)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Spells</div>
              </div>
              
              <div className="card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white" size={28} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(stats.races)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Races</div>
              </div>
              
              <div className="card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={28} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(stats.classes + stats.subclasses)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Classes & Subclasses</div>
              </div>
              
              <div className="card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-white" size={28} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatNumber(stats.items)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Items</div>
              </div>
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Explore by Category
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Dive deep into each aspect of D&D 5e. From magical spells to legendary items, 
            find everything you need for your adventures.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {categoryCards.map((category) => {
              const Icon = category.icon
              const statKey = category.id as keyof ContentStats
              const count = stats?.[statKey] || 0
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className="card p-8 text-left hover:scale-105 transform transition-all duration-300 group hover:shadow-xl border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${category.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                        {category.title}
                      </h3>
                      {!loading && (
                        <div className={`text-sm font-semibold mt-1 ${category.textColor}`}>
                          {category.id === 'classes' 
                            ? `${formatNumber(count + (stats?.subclasses || 0))} total` 
                            : `${formatNumber(count)} items`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 font-medium">
                    <span>Explore {category.title}</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-12 border border-gray-200 dark:border-dark-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Built for adventurers, by adventurers. Every feature designed to enhance your D&D experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Lightning Fast Search
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Find any spell, item, or rule instantly with our advanced search engine. 
                Fuzzy matching means you'll find what you need even with typos.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Book className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Smart Cross-References
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Navigate seamlessly between related content. Click on spell names in item descriptions 
                or jump from class features to their associated abilities.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Complete Collection
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Every official D&D 5e sourcebook in one place. From the Player's Handbook 
                to the latest releases, we've got you covered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}