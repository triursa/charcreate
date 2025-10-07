'use client'

import { useState } from 'react'

import { useCharacterBuilder } from '@/state/character-builder'

export function ExportPanel() {
  const { character } = useCharacterBuilder()
  const [justCopied, setJustCopied] = useState(false)

  const handleExportJson = () => {
    const data = JSON.stringify(character, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${character.name.replace(/\s+/g, '-').toLowerCase() || 'character'}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex items-center gap-3 print:hidden">
      <button
        onClick={handleExportJson}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
      >
        {justCopied ? 'JSON ready!' : 'Export JSON'}
      </button>
      <button
        onClick={handlePrint}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
      >
        Print / PDF
      </button>
    </div>
  )
}
