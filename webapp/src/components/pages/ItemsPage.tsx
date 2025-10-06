'use client'

import { useEffect, useState } from 'react'
import { Scroll } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { DataTable } from '@/components/DataTable'

interface ItemsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function ItemsPage({ searchQuery, onSearch }: ItemsPageProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItemsData()
  }, [])

  const loadItemsData = async () => {
    try {
      const itemData = await getContentByCategory('items')
      setItems(itemData)
    } catch (error) {
      console.error('Error loading items:', error)
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
        <div className="font-medium text-yellow-600 dark:text-yellow-400">
          {value}
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      width: 'w-32',
      filterable: true
    },
    {
      key: 'rarity',
      title: 'Rarity',
      width: 'w-24',
      filterable: true,
      render: (value: string) => {
        const colors = {
          'common': 'text-gray-600',
          'uncommon': 'text-green-600',
          'rare': 'text-blue-600',
          'very rare': 'text-purple-600',
          'legendary': 'text-orange-600',
          'artifact': 'text-red-600'
        }
        return (
          <span className={colors[value as keyof typeof colors] || 'text-gray-600'}>
            {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Common'}
          </span>
        )
      }
    },
    {
      key: 'weight',
      title: 'Weight',
      width: 'w-24',
      render: (value: number) => value ? `${value} lb.` : ''
    },
    {
      key: 'value',
      title: 'Value',
      width: 'w-32',
      render: (value: number) => {
        if (!value) return ''
        if (value >= 100) {
          return `${Math.floor(value / 100)} gp`
        }
        if (value >= 10) {
          return `${Math.floor(value / 10)} sp`
        }
        return `${value} cp`
      }
    },
    {
      key: 'dmgType',
      title: 'Damage Type',
      width: 'w-32',
      filterable: true
    },
    {
      key: 'ac',
      title: 'AC',
      width: 'w-16',
      render: (value: number) => value || ''
    },
    {
      key: 'property',
      title: 'Properties',
      width: 'w-48',
      filterable: true,
      render: (value: any) => {
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return String(value || '')
      }
    },
    {
      key: 'reqAttune',
      title: 'Attunement',
      width: 'w-24',
      filterable: true,
      render: (value: any) => {
        if (value === true) return 'Yes'
        if (typeof value === 'string') return value
        return 'No'
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
          <Scroll className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Items</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {items.length} equipment, weapons, and magic items
          </p>
        </div>
      </div>

      <DataTable 
        data={items} 
        columns={columns}
        searchQuery={searchQuery}
        onSearch={onSearch}
        defaultSortColumn="name"
      />
    </div>
  )
}