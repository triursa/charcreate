'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { getContentByCategory } from '@/lib/clientDataLoader'
import { DataTable } from '@/components/DataTable'

interface ClassesPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function ClassesPage({ searchQuery, onSearch }: ClassesPageProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClassesData()
  }, [])

  const loadClassesData = async () => {
    try {
      const classData = await getContentByCategory('classes')
      setClasses(classData)
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      width: 'w-48',
      render: (value: string, item: any) => (
        <div className={`font-medium ${item.isSubclass ? 'text-red-400 dark:text-red-300 pl-4' : 'text-red-600 dark:text-red-400'}`}>
          {item.isSubclass && '↳ '}
          {value}
        </div>
      )
    },
    {
      key: 'isSubclass',
      title: 'Type',
      width: 'w-24',
      filterable: true,
      render: (value: boolean) => value ? 'Subclass' : 'Class'
    },
    {
      key: 'parentClass',
      title: 'Parent Class',
      width: 'w-32',
      filterable: true,
      render: (value: string, item: any) => item.isSubclass ? value : ''
    },
    {
      key: 'hd',
      title: 'Hit Die',
      width: 'w-24',
      render: (value: any) => {
        if (value?.faces) {
          return `d${value.faces}`
        }
        return ''
      }
    },
    {
      key: 'proficiency',
      title: 'Proficiencies',
      width: 'w-64',
      render: (value: any) => {
        if (!value) return ''
        const profs = []
        if (value.armor) profs.push(`Armor: ${value.armor.join(', ')}`)
        if (value.weapons) profs.push(`Weapons: ${value.weapons.join(', ')}`)
        if (value.tools) profs.push(`Tools: ${value.tools.join(', ')}`)
        if (value.savingThrows) profs.push(`Saves: ${value.savingThrows.join(', ')}`)
        return profs.join('; ')
      }
    },
    {
      key: 'spellcastingAbility',
      title: 'Spellcasting',
      width: 'w-32',
      filterable: true,
      render: (value: string) => value ? value.toUpperCase() : 'None'
    },
    {
      key: 'casterProgression',
      title: 'Caster Type',
      width: 'w-32',
      filterable: true,
      render: (value: string) => {
        if (!value) return 'Non-caster'
        return value === 'full' ? 'Full Caster' : 
               value === 'half' ? 'Half Caster' :
               value === 'artificer' ? 'Artificer' :
               value === '1/3' ? 'Third Caster' : value
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes & Subclasses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {classes.length} character classes and subclasses
          </p>
        </div>
      </div>

      <DataTable 
        data={classes} 
        columns={columns}
        searchQuery={searchQuery}
        onSearch={onSearch}
        defaultSortColumn="name"
      />
    </div>
  )
}