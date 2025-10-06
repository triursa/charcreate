'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { DataTable } from '@/components/DataTable'
import { formatSpellLevel, getSchoolName } from '@/lib/textParser'

interface SpellsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function SpellsPage({ searchQuery, onSearch }: SpellsPageProps) {
  const [spells, setSpells] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSpellsData()
  }, [])

  const loadSpellsData = async () => {
    try {
      const spellData = await getContentByCategory('spells')
      setSpells(spellData)
    } catch (error) {
      console.error('Error loading spells:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      width: 'w-64',
      render: (value: string) => (
        <div className="font-medium text-blue-600 dark:text-blue-400">
          {value}
        </div>
      )
    },
    {
      key: 'level',
      title: 'Level',
      width: 'w-24',
      render: (value: number) => formatSpellLevel(value)
    },
    {
      key: 'school',
      title: 'School',
      width: 'w-32',
      filterable: true,
      render: (value: string) => getSchoolName(value)
    },
    {
      key: 'time',
      title: 'Casting Time',
      width: 'w-32',
      filterable: true,
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.map(t => `${t.number} ${t.unit}`).join(', ')
        }
        return String(value || '')
      }
    },
    {
      key: 'range',
      title: 'Range',
      width: 'w-24',
      filterable: true,
      render: (value: any) => {
        if (value?.distance) {
          return `${value.distance.amount} ${value.distance.type}`
        }
        return value?.type || String(value || '')
      }
    },
    {
      key: 'components',
      title: 'Components',
      width: 'w-24',
      render: (value: any) => {
        if (!value) return ''
        const parts = []
        if (value.v) parts.push('V')
        if (value.s) parts.push('S')
        if (value.m) parts.push('M')
        return parts.join(', ')
      }
    },
    {
      key: 'duration',
      title: 'Duration',
      width: 'w-32',
      filterable: true,
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.map(d => {
            if (d.type === 'instant') return 'Instantaneous'
            if (d.type === 'permanent') return 'Permanent'
            if (d.concentration) return `Concentration, up to ${d.duration?.amount} ${d.duration?.type}`
            return `${d.duration?.amount || ''} ${d.duration?.type || ''}`.trim()
          }).join(', ')
        }
        return String(value || '')
      }
    },
    {
      key: 'classes',
      title: 'Classes',
      width: 'w-48',
      filterable: true,
      render: (value: any) => {
        if (value?.fromClassList) {
          return value.fromClassList.map((c: any) => c.name).join(', ')
        }
        return ''
      }
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spells</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {spells.length} magical spells and their properties
          </p>
        </div>
      </div>

      <DataTable 
        data={spells} 
        columns={columns}
        searchQuery={searchQuery}
        onSearch={onSearch}
        defaultSortColumn="name"
      />
    </div>
  )
}