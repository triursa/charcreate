'use client'

import { Navigation } from '@/components/Navigation'
import { HomePage } from '@/components/HomePage'
import { ContentView } from '@/components/ContentView'
import { useState } from 'react'

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategorySelect = (category: string | null) => {
    setCurrentCategory(category)
    if (category !== null) {
      setSearchQuery('') // Clear search when switching categories
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleHomeSelect = () => {
    setCurrentCategory(null)
    setSearchQuery('')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <Navigation 
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
        onHomeSelect={handleHomeSelect}
        currentCategory={currentCategory}
        searchQuery={searchQuery}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        <div className="flex-1 overflow-auto">
          <HomePage 
            selectedCategory={currentCategory}
            onCategorySelect={handleCategorySelect}
            searchQuery={searchQuery}
            onSearch={handleSearch}
          />
        </div>
      </main>
    </div>
  )
}