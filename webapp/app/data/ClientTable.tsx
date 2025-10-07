"use client"
import { useState } from 'react'

function DataTable({ rows, columns, onRowClick }: { rows: any[], columns: string[], onRowClick: (row: any) => void }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full divide-y">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(col => (
              <th key={col} className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, idx: number) => (
            <tr key={row.id ?? idx} className="odd:bg-white even:bg-slate-50 cursor-pointer" onClick={() => onRowClick(row)}>
              {columns.map(col => {
                const val = row[col]
                let display = val
                if (val === null || typeof val === 'undefined') display = ''
                if (typeof val === 'object') display = JSON.stringify(val)
                return <td key={col} className="px-4 py-2 text-sm">{String(display)}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatDamageTags(text: string) {
  // Replace {@damage 12d8} with <b>12d8</b>
  return text.replace(/\{@damage ([^}]+)}/g, (_, dmg) => `<b>${dmg}</b>`)
}

function formatSpell(entry: any) {
  // Components
  let components = []
  if (entry.components) {
    if (entry.components.v) components.push('Verbal')
    if (entry.components.s) components.push('Somatic')
    if (entry.components.m) components.push(`Material (${entry.components.m})`)
  }
  // School
  let school = entry.school ? entry.school : ''
  // Level
  let level = entry.level !== undefined ? entry.level : ''
  // Casting Time
  let castingTime = Array.isArray(entry.time) && entry.time.length > 0
    ? `${entry.time[0].number} ${entry.time[0].unit}`
    : ''
  // Range
  let range = entry.range && entry.range.distance && entry.range.distance.amount
    ? `${entry.range.distance.amount} ${entry.range.distance.type.charAt(0).toUpperCase() + entry.range.distance.type.slice(1)}`
    : ''
  // Duration
  let duration = Array.isArray(entry.duration) && entry.duration.length > 0
    ? entry.duration.map((d: any) => d.type.charAt(0).toUpperCase() + d.type.slice(1)).join(', ')
    : ''
  // Entries
  let entries = Array.isArray(entry.entries)
    ? entry.entries.map((e: string, i: number) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: formatDamageTags(e) }} />
      ))
    : null

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold">{entry.name}</h2>
      <div className="mb-1 text-slate-700">{components.join(', ')}</div>
      <div className="mb-1 text-slate-700">School of {school}, {level} level spell.</div>
      <div className="mb-1 text-slate-700">Casting Time: {castingTime}</div>
      <div className="mb-1 text-slate-700">Range: {range}</div>
      <div className="mb-1 text-slate-700">Duration: {duration}</div>
      <div className="mt-3 text-slate-900">{entries}</div>
    </div>
  )
}

function EntryModal({ entry, onClose }: { entry: any, onClose: () => void }) {
  if (!entry) return null
  // Only format spells for now, fallback to generic for others
  const isSpell = entry.level !== undefined && entry.school !== undefined
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="max-w-lg w-full rounded bg-white p-6 shadow-lg relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-slate-500 hover:text-slate-900" onClick={onClose}>&times;</button>
        {isSpell ? (
          formatSpell(entry)
        ) : (
          <div className="space-y-2">
            {Object.entries(entry).map(([key, val]) => (
              <div key={key}>
                <span className="font-semibold text-slate-700">{key}:</span>{' '}
                <span className="text-slate-900">{typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClientTable({ rows, columns }: { rows: any[], columns: string[] }) {
  const [modal, setModal] = useState<any>(null)
  return <>
    <DataTable rows={rows} columns={columns} onRowClick={setModal} />
    {modal && <EntryModal entry={modal} onClose={() => setModal(null)} />}
  </>
}
