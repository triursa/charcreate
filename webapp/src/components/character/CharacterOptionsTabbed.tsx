'use client'

import { useState } from 'react'
import { AncestrySelector } from '@/components/character/AncestrySelector'
import { BackgroundSelector } from '@/components/character/BackgroundSelector'

type Tab = 'ancestry' | 'background'

export function CharacterOptionsTabbed() {
  const [activeTab, setActiveTab] = useState<Tab>('ancestry')

  const tabs: { id: Tab; label: string; description: string }[] = [
    {
      id: 'ancestry',
      label: 'Ancestry & Heritage',
      description: 'Choose your race and apply lineage bonuses'
    },
    {
      id: 'background',
      label: 'Background',
      description: 'Select your background for skills and features'
    }
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mt-4 mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'ancestry' && (
          <div>
            <AncestrySelector />
          </div>
        )}
        {activeTab === 'background' && (
          <div>
            <BackgroundSelector />
          </div>
        )}
      </div>
    </section>
  )
}