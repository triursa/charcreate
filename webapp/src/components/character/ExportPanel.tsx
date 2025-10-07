'use client'

import { useState } from 'react'

import { useCharacterBuilder } from '@/state/character-builder'

export function ExportPanel() {
  const { character, warnings } = useCharacterBuilder()
  const [justCopied, setJustCopied] = useState(false)
  const hasBlockingWarnings = warnings.length > 0

  const handleExportJson = () => {
    if (hasBlockingWarnings) {
      return
    }

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
    if (hasBlockingWarnings) {
      return
    }

    window.print()
  }

  return (
    <div className="flex flex-col items-stretch gap-2 text-left print:hidden sm:flex-row sm:items-center sm:gap-3">
      <button
        onClick={handleExportJson}
        disabled={hasBlockingWarnings}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
      >
        {justCopied ? 'JSON ready!' : 'Export JSON'}
      </button>
      <button
        onClick={handlePrint}
        disabled={hasBlockingWarnings}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200"
      >
        Print / PDF
      </button>
      {hasBlockingWarnings && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Resolve all build warnings before exporting to ensure the sheet is complete.
        </p>
      )}
    </div>
  )
}
