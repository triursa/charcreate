'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { DataTable } from '@/components/DataTable'

interface RacesPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function RacesPage({ searchQuery, onSearch }: RacesPageProps) {
  const [races, setRaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRacesData()
  }, [])

  const loadRacesData = async () => {
    try {
      const raceData = await getContentByCategory('races')
      setRaces(raceData)
    } catch (error) {
      console.error('Error loading races:', error)
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
        <div className="font-medium text-green-600 dark:text-green-400">
          {value}
        </div>
      )
    },
    {
      key: 'size',
      title: 'Size',
      width: 'w-24',
      filterable: true,
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return String(value || '')
      }
    },
    {
      key: 'speed',
      title: 'Speed',
      width: 'w-32',
      render: (value: any) => {
        if (value?.walk) {
          return `${value.walk} ft.`
        }
        return String(value || '')
      }
    },
    {
      key: 'ability',
      title: 'Ability Score Increase',
      width: 'w-48',
      render: (value: any) => {
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
      key: 'darkvision',
      title: 'Darkvision',
      width: 'w-24',
      render: (value: number) => value ? `${value} ft.` : 'No'
    },
    {
      key: 'traitTags',
      title: 'Traits',
      width: 'w-64',
      filterable: true,
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return ''
      }
    },
    {
      key: 'languageProficiencies',
      title: 'Languages',
      width: 'w-48',
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.map(lang => {
            if (lang.choose) {
              return `Choose ${lang.choose.count} from ${lang.choose.from.join(', ')}`
            }
            return Object.keys(lang).join(', ')
          }).join('; ')
        }
        return ''
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Races</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {races.length} character races and their traits
          </p>
        </div>
      </div>

      <DataTable 
        data={races} 
        columns={columns}
        searchQuery={searchQuery}
        onSearch={onSearch}
        defaultSortColumn="name"
      />
    </div>
  )
}