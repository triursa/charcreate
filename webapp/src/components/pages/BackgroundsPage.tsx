'use client'

import { useEffect, useState } from 'react'
import { Book } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { DataTable } from '@/components/DataTable'

interface BackgroundsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function BackgroundsPage({ searchQuery, onSearch }: BackgroundsPageProps) {
  const [backgrounds, setBackgrounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBackgroundsData()
  }, [])

  const loadBackgroundsData = async () => {
    try {
      const backgroundData = await getContentByCategory('backgrounds')
      setBackgrounds(backgroundData)
    } catch (error) {
      console.error('Error loading backgrounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      width: 'w-48',
      render: (value: string) => (
        <div className="font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </div>
      )
    },
    {
      key: 'skillProficiencies',
      title: 'Skill Proficiencies',
      width: 'w-64',
      filterable: true,
      render: (value: any) => {
        if (!value) return ''
        if (Array.isArray(value)) {
          return value.map(skill => {
            if (skill.choose) {
              return `Choose ${skill.choose.count} from ${skill.choose.from.join(', ')}`
            }
            return Object.keys(skill).join(', ')
          }).join('; ')
        }
        return String(value)
      }
    },
    {
      key: 'languageProficiencies',
      title: 'Languages',
      width: 'w-48',
      render: (value: any) => {
        if (!value) return ''
        if (Array.isArray(value)) {
          return value.map(lang => {
            if (lang.choose) {
              return `Choose ${lang.choose.count} from ${lang.choose.from.join(', ')}`
            }
            return Object.keys(lang).join(', ')
          }).join('; ')
        }
        return String(value)
      }
    },
    {
      key: 'toolProficiencies',
      title: 'Tool Proficiencies',
      width: 'w-48',
      render: (value: any) => {
        if (!value) return ''
        if (Array.isArray(value)) {
          return value.map(tool => {
            if (tool.choose) {
              return `Choose ${tool.choose.count} from ${tool.choose.from.join(', ')}`
            }
            return Object.keys(tool).join(', ')
          }).join('; ')
        }
        return String(value)
      }
    },
    {
      key: 'startingEquipment',
      title: 'Starting Equipment',
      width: 'w-64',
      render: (value: any) => {
        if (!value) return ''
        if (Array.isArray(value)) {
          return value.map(eq => eq.item || eq).join(', ')
        }
        return String(value)
      }
    },
    {
      key: 'source',
      title: 'Source',
      width: 'w-24',
      filterable: true
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
          <Book className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backgrounds</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {backgrounds.length} character backgrounds and their features
          </p>
        </div>
      </div>

      <DataTable 
        data={backgrounds} 
        columns={columns}
        searchQuery={searchQuery}
        onSearch={onSearch}
        defaultSortColumn="name"
      />
    </div>
  )
}