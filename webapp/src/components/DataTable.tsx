'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'

interface Column {
  key: string
  title: string
  render?: (value: any, item: any) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  searchQuery?: string
  onSearch?: (query: string) => void
  className?: string
  defaultSortColumn?: string
  defaultSortDirection?: 'asc' | 'desc'
}

export function DataTable({ 
  data, 
  columns, 
  searchQuery = '', 
  onSearch,
  className = '',
  defaultSortColumn,
  defaultSortDirection = 'asc'
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState(defaultSortColumn || columns[0]?.key)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply search query filter
    if (searchQuery) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([columnKey, filterValue]) => {
      if (filterValue) {
        result = result.filter(item => {
          const itemValue = String(item[columnKey] || '').toLowerCase()
          return itemValue.includes(filterValue.toLowerCase())
        })
      }
    })

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        
        if (aValue === bValue) return 0
        
        let comparison = 0
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else {
          comparison = aValue < bValue ? -1 : 1
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchQuery, filters, sortColumn, sortDirection])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {columns.filter(col => col.filterable).map(column => (
          <div key={column.key} className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Filter ${column.title}`}
              value={filters[column.key] || ''}
              onChange={(e) => handleFilterChange(column.key, e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
                    ${column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}
                    ${column.width || ''}`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortColumn === column.key && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredAndSortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {column.render ? column.render(item[column.key], item) : String(item[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No data found
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {data.length} items
      </div>
    </div>
  )
}