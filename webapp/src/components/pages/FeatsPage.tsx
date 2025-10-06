'use client'

import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { DataTable } from '@/components/DataTable'

interface FeatsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function FeatsPage({ searchQuery, onSearch }: FeatsPageProps) {
  const [feats, setFeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatsData()
  }, [])

  const loadFeatsData = async () => {
    try {
      const featData = await getContentByCategory('feats')
      setFeats(featData)
    } catch (error) {
      console.error('Error loading feats:', error)
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
        <div className="font-medium text-pink-600 dark:text-pink-400">
          {value}
        </div>
      )
    },
    {
      key: 'prerequisite',
      title: 'Prerequisite',
      width: 'w-48',
      filterable: true,
      render: (value: any) => {
        if (!value) return 'None'
        if (Array.isArray(value)) {
          return value.map(prereq => {
            if (prereq.ability) {
              return Object.entries(prereq.ability)
                .map(([ability, score]) => `${ability.toUpperCase()} ${score}+`)
                .join(', ')
            }
            if (prereq.race) {
              return `Race: ${prereq.race.map((r: any) => r.name).join(', ')}`
            }
            if (prereq.spellcasting) {
              return 'Spellcasting ability'
            }
            return String(prereq)
          }).join('; ')
        }
        return String(value)
      }
    },
    {
      key: 'ability',
      title: 'Ability Score Increase',
      width: 'w-48',
      render: (value: any) => {
        if (!value) return ''
        if (Array.isArray(value)) {
          return value.map(ability => {
            if (ability.choose) {
              return `Choose ${ability.choose.count} from ${ability.choose.from.join(', ')}`
            }
            return Object.entries(ability)
              .filter(([key]) => key !== 'choose')
              .map(([ability, bonus]) => `${ability.toUpperCase()} +${bonus}`)
              .join(', ')
          }).join('; ')
        }
        return ''
      }
    },
    {
      key: 'entries',
      title: 'Description',
      width: 'w-96',
      sortable: false,
      render: (value: any) => {
        if (!value) return ''
        if (Array.isArray(value)) {
          const text = value.map(entry => {
            if (typeof entry === 'string') return entry
            if (entry.type === 'list') return entry.items?.join('; ') || ''
            return String(entry)
          }).join(' ')
          return text.length > 200 ? text.substring(0, 200) + '...' : text
        }
        return String(value).substring(0, 200) + (String(value).length > 200 ? '...' : '')
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feats</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {feats.length} character feats and special abilities
          </p>
        </div>
      </div>

      <DataTable 
        data={feats} 
        columns={columns}
        searchQuery={searchQuery}
        onSearch={onSearch}
        defaultSortColumn="name"
      />
    </div>
  )
}