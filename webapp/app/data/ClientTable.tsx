"use client"

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { EntryModal } from './EntryModal'

type ClientTableProps = {
  rows: any[]
  columns: string[]
  renderActions?: (entry: any, helpers: { closeEntry: () => void }) => ReactNode
}

const SUMMARY_FIELD_NAMES = new Set([
  'ability',
  'abilityBoosts',
  'abilityBonus',
  'abilityBonuses',
  'speed',
  'movement',
  'languageProficiencies',
  'languages',
  'source',
])

const HIDDEN_FIELD_NAMES = new Set(['id', 'name', 'entries'])

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return value
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    } catch (error) {
      return value
    }
  }
  return value
}

function truncateText(text: string, max = 120): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function describeAbilityValue(value: unknown): string | null {
  const parsed = parseJsonValue(value)
  if (parsed == null) return null

  if (typeof parsed === 'string') return parsed
  if (typeof parsed === 'number') return `${parsed >= 0 ? '+' : ''}${parsed}`

  if (Array.isArray(parsed)) {
    const parts = parsed
      .map(describeAbilityValue)
      .filter((part): part is string => Boolean(part))
    if (parts.length === 0) return null
    return parts.join(', ')
  }

  if (typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>
    const keys = Object.keys(record)
    if (keys.length === 0) return null

    if ('choose' in record && record.choose && typeof record.choose === 'object') {
      const choose = record.choose as Record<string, unknown>
      const from = Array.isArray(choose.from) ? choose.from.join(', ') : undefined
      const countValue = choose.count ?? choose.amount ?? choose.num
      const count = typeof countValue === 'number' ? countValue : undefined
      if (from) {
        return count ? `Choose ${count} from ${from}` : `Choose from ${from}`
      }
    }

    if (
      'abilities' in record &&
      Array.isArray(record.abilities) &&
      'amount' in record &&
      typeof record.amount === 'number'
    ) {
      const abilityList = record.abilities.map(String).join('/')
      const amount = record.amount as number
      return `${abilityList} ${amount >= 0 ? '+' : ''}${amount}`
    }

    if ('entries' in record) {
      const result = describeAbilityValue(record.entries)
      if (result) return result
    }

    if ('text' in record && typeof record.text === 'string') return record.text

    const numericEntries = Object.entries(record).flatMap(([ability, entryValue]) => {
      if (typeof entryValue !== 'number') return []
      const formatted = `${ability.toUpperCase()} ${entryValue >= 0 ? '+' : ''}${entryValue}`
      return [formatted]
    })

    if (numericEntries.length > 0) {
      return numericEntries.join(', ')
    }

    return JSON.stringify(record)
  }

  return null
}

function describeSpeedValue(value: unknown): string | null {
  const parsed = parseJsonValue(value)
  if (parsed == null) return null

  if (typeof parsed === 'string') return parsed
  if (typeof parsed === 'number') return `${parsed} ft.`

  if (Array.isArray(parsed)) {
    const parts = parsed
      .map(describeSpeedValue)
      .filter((part): part is string => Boolean(part))
    if (parts.length === 0) return null
    return parts.join(', ')
  }

  if (typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>
    if (Object.keys(record).length === 0) return null

    const parts = Object.entries(record)
      .map(([mode, entry]) => {
        if (entry == null) return null

        if (typeof entry === 'number') {
          return `${capitalize(mode)} ${entry} ft.`
        }

        if (typeof entry === 'string') {
          return `${capitalize(mode)} ${entry}`
        }

        if (typeof entry === 'object') {
          const nested = entry as Record<string, unknown>
          const amount = nested.amount ?? nested.value ?? nested.number
          const unit = typeof nested.unit === 'string' ? nested.unit : 'ft.'
          if (typeof amount === 'number') {
            return `${capitalize(mode)} ${amount} ${unit}`
          }
        }

        return null
      })
      .filter((entry): entry is string => Boolean(entry))

    if (parts.length > 0) return parts.join(', ')

    if ('entries' in record) {
      const nested = describeSpeedValue(record.entries)
      if (nested) return nested
    }

    return JSON.stringify(record)
  }

  return null
}

function describeLanguagesValue(value: unknown): string | null {
  const parsed = parseJsonValue(value)
  if (parsed == null) return null

  if (typeof parsed === 'string') return parsed
  if (typeof parsed === 'number') return String(parsed)

  if (Array.isArray(parsed)) {
    const parts = parsed
      .map(describeLanguagesValue)
      .filter((part): part is string => Boolean(part))
    if (parts.length === 0) return null
    return parts.join(', ')
  }

  if (typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>
    const keys = Object.keys(record)
    if (keys.length === 0) return null

    if ('choose' in record && record.choose && typeof record.choose === 'object') {
      const choose = record.choose as Record<string, unknown>
      const from = Array.isArray(choose.from) ? choose.from.join(', ') : undefined
      const countValue = choose.count ?? choose.amount ?? choose.num
      const count = typeof countValue === 'number' ? countValue : undefined
      if (from) {
        return count ? `Choose ${count} from ${from}` : `Choose from ${from}`
      }
    }

    if ('languages' in record) {
      const result = describeLanguagesValue(record.languages)
      if (result) return result
    }

    if ('entries' in record) {
      const result = describeLanguagesValue(record.entries)
      if (result) return result
    }

    if ('text' in record && typeof record.text === 'string') return record.text

    const stringValues = Object.values(record)
      .map(entry => (typeof entry === 'string' ? entry : null))
      .filter((entry): entry is string => Boolean(entry))

    if (stringValues.length > 0) {
      return stringValues.join(', ')
    }

    return JSON.stringify(record)
  }

  return null
}

function formatAbilitySummary(value: unknown): string | null {
  const description = describeAbilityValue(value)
  if (!description) return null
  return truncateText(description)
}

function formatSpeedSummary(value: unknown): string | null {
  const description = describeSpeedValue(value)
  if (!description) return null
  return truncateText(description)
}

function formatLanguageSummary(value: unknown): string | null {
  const description = describeLanguagesValue(value)
  if (!description) return null
  return truncateText(description)
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value == null) return false
  const parsed = parseJsonValue(value)

  if (typeof parsed === 'string') return parsed.trim().length > 0
  if (typeof parsed === 'number' || typeof parsed === 'boolean') return true
  if (Array.isArray(parsed)) return parsed.length > 0
  if (typeof parsed === 'object') return Object.keys(parsed as Record<string, unknown>).length > 0
  return false
}

function isEmptyValue(value: ReactNode): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

function formatLabel(label: string): string {
  return label
    .replace(/[_-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, character => character.toUpperCase())
}

function formatDetailValue(value: unknown): ReactNode {
  const parsed = parseJsonValue(value)
  if (parsed == null) return <span className="text-slate-500">—</span>

  if (typeof parsed === 'string' || typeof parsed === 'number' || typeof parsed === 'boolean') {
    return String(parsed)
  }

  if (Array.isArray(parsed)) {
    const simple = parsed.every(
      entry => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean',
    )

    if (simple) {
      return parsed.map(entry => String(entry)).join(', ')
    }

    return (
      <ul className="ml-4 list-disc space-y-1">
        {parsed.map((entry, index) => (
          <li key={index}>{formatDetailValue(entry)}</li>
        ))}
      </ul>
    )
  }

  if (typeof parsed === 'object') {
    return (
      <pre className="whitespace-pre-wrap rounded bg-white/70 p-2 text-xs text-slate-700">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    )
  }

  return String(parsed)
}

function extractSourceLabel(value: unknown): string | null {
  if (value == null) return null
  const parsed = parseJsonValue(value)
  if (typeof parsed === 'string') return parsed
  if (Array.isArray(parsed)) {
    const parts = parsed
      .map(entry => {
        if (typeof entry === 'string') return entry
        if (typeof entry === 'number') return String(entry)
        return null
      })
      .filter((entry): entry is string => Boolean(entry))
    if (parts.length === 0) return null
    return parts.join(', ')
  }
  return null
}

type InfoItemProps = {
  label: string
  value: ReactNode
}

function InfoItem({ label, value }: InfoItemProps) {
  if (isEmptyValue(value)) return null
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  )
}

function SpellDetail({ entry, contentKey }: { entry: any; contentKey: string | number }) {
  const components: string[] = []
  const rawComponents = entry?.components

  if (rawComponents) {
    if (rawComponents.v) components.push('Verbal')
    if (rawComponents.s) components.push('Somatic')
    if (rawComponents.m) components.push(`Material (${rawComponents.m})`)
  }

  const castingTime = Array.isArray(entry?.time) && entry.time.length > 0
    ? `${entry.time[0].number} ${entry.time[0].unit}`
    : ''

  const rangeValue = entry?.range
  let range = ''
  if (rangeValue?.distance?.amount) {
    range = `${rangeValue.distance.amount} ${capitalize(rangeValue.distance.type ?? '')}`
  } else if (typeof rangeValue === 'string') {
    range = rangeValue
  }

  const duration = Array.isArray(entry?.duration) && entry.duration.length > 0
    ? entry.duration
        .map((item: any) => (typeof item.type === 'string' ? capitalize(item.type) : null))
        .filter((item: string | null): item is string => Boolean(item))
        .join(', ')
    : ''

  const entries = renderSpellEntries(entry?.entries, `spell-${contentKey}`)

  return (
    <div className="space-y-3">
      <dl className="grid gap-3 sm:grid-cols-2">
        <InfoItem label="Level" value={typeof entry?.level === 'number' ? entry.level : entry?.level ?? '—'} />
        <InfoItem label="School" value={entry?.school ?? '—'} />
        <InfoItem label="Components" value={components.length ? components.join(', ') : '—'} />
        <InfoItem label="Casting Time" value={castingTime || '—'} />
        <InfoItem label="Range" value={range || '—'} />
        <InfoItem label="Duration" value={duration || '—'} />
      </dl>
      {entries.length > 0 && <div className="space-y-2 text-slate-900">{entries}</div>}
    </div>
  )
}

function EntryDetails({ entry, columns, rowKey }: { entry: any; columns: string[]; rowKey: string | number }) {
  const isSpell = typeof entry?.level === 'number' && entry?.school !== undefined

  const detailFields = columns.filter(
    field => !HIDDEN_FIELD_NAMES.has(field) && !SUMMARY_FIELD_NAMES.has(field),
  )

  const genericEntries = !isSpell ? renderSpellEntries(entry?.entries, `entry-${rowKey}`) : []

  return (
    <div className="space-y-4">
      {isSpell ? (
        <SpellDetail entry={entry} contentKey={rowKey} />
      ) : (
        genericEntries.length > 0 && <div className="space-y-2 text-slate-900">{genericEntries}</div>
      )}

      {detailFields.length > 0 && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {detailFields.map(field => {
            const value = entry?.[field]
            if (!hasMeaningfulValue(value)) return null

            const formatted = formatDetailValue(value)
            if (isEmptyValue(formatted)) return null

            return (
              <div key={field} className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formatLabel(field)}
                </dt>
                <dd className="text-sm text-slate-800">{formatted}</dd>
              </div>
            )
          })}
        </dl>
      )}
    </div>
  )
}

function getRowKey(row: any, index: number): string | number {
  const rawKey = row?.id
  if (typeof rawKey === 'number' || typeof rawKey === 'string') return rawKey
  const name = typeof row?.name === 'string' ? row.name : 'entry'
  return `${name}-${index}`
}

export default function ClientTable({ rows, columns, renderActions }: ClientTableProps) {
  const [activeEntry, setActiveEntry] = useState<any | null>(null)
  const [activeEntryKey, setActiveEntryKey] = useState<string | number | null>(null)

  const openEntry = useCallback((entry: any, key: string | number) => {
    setActiveEntry(entry)
    setActiveEntryKey(key)
  }, [])

  const closeEntry = useCallback(() => {
    setActiveEntry(null)
    setActiveEntryKey(null)
  }, [])

  const activeModalId = useMemo(() => {
    if (activeEntryKey == null) return undefined
    const normalized = String(activeEntryKey).toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'details'
    return `entry-modal-${normalized}`
  }, [activeEntryKey])

  const activeSourceLabel = useMemo(() => extractSourceLabel(activeEntry?.source), [activeEntry])
  const activeFooter = useMemo(() => {
    if (!renderActions || !activeEntry) return undefined
    return renderActions(activeEntry, { closeEntry })
  }, [activeEntry, closeEntry, renderActions])

  return (
    <>
      <div className="grid gap-6 p-1 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row, index) => {
          const rowKey = getRowKey(row, index)
          const entryName = typeof row?.name === 'string' ? row.name : `Entry ${index + 1}`
          const normalizedKey = String(rowKey ?? index).toLowerCase().replace(/[^a-z0-9]+/g, '-') || `entry-${index}`
          const headingId = `entry-${normalizedKey}-title`
          const summaryId = `entry-${normalizedKey}-summary`
          const modalId = `entry-modal-${normalizedKey}`

          const abilitySummary = formatAbilitySummary(
            row?.ability ?? row?.abilityBoosts ?? row?.abilityBonuses ?? row?.abilityBonus,
          )
          const speedSummary = formatSpeedSummary(row?.speed ?? row?.movement)
          const languagesSummary = formatLanguageSummary(row?.languageProficiencies ?? row?.languages)
          const sourceLabel = extractSourceLabel(row?.source)

          const summaryItems = [
            { label: 'Ability Boosts', value: abilitySummary },
            { label: 'Speed', value: speedSummary },
            { label: 'Languages', value: languagesSummary },
          ].filter(item => item.value)

          const descriptionSummary = [summaryItems.length > 0 ? `${summaryItems.length} summary items` : null, sourceLabel]
            .filter(Boolean)
            .join('. ')

          return (
            <article
              key={rowKey}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500"
              aria-labelledby={headingId}
              aria-describedby={summaryId}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id={headingId} className="truncate text-lg font-semibold text-slate-900">
                      {entryName}
                    </h2>
                    {sourceLabel && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {sourceLabel}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openEntry(row, rowKey)}
                    className="shrink-0 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-haspopup="dialog"
                    aria-controls={modalId}
                    aria-label={`View detailed information for ${entryName}`}
                  >
                    View Details
                  </button>
                </div>

                <div id={summaryId} className="space-y-3 text-sm text-slate-700">
                  {summaryItems.length > 0 ? (
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {summaryItems.map(item => (
                        <div key={item.label} className="space-y-1">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {item.label}
                          </dt>
                          <dd className="text-sm font-medium text-slate-800">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-slate-600">No quick summary available.</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">{descriptionSummary || 'Detailed information available in modal view.'}</p>
            </article>
          )
        })}
      </div>

      <EntryModal
        id={activeModalId}
        open={Boolean(activeEntry)}
        onClose={closeEntry}
        title={
          typeof activeEntry?.name === 'string'
            ? activeEntry.name
            : activeEntryKey != null
              ? `Entry ${String(activeEntryKey)}`
              : 'Entry Details'
        }
        description={activeSourceLabel ?? undefined}
        footer={activeFooter}
      >
        {activeEntry ? (
          <EntryDetails entry={activeEntry} columns={columns} rowKey={activeEntryKey ?? 'active'} />
        ) : null}
      </EntryModal>
    </>
  )
}

function formatDamageTags(text: string) {
  return text.replace(/\{@damage ([^}]+)}/g, (_, damage) => `<b>${damage}</b>`)
}

function renderSpellEntries(entry: any, keyPrefix = 'entry'): ReactNode[] {
  if (entry == null) return []

  if (typeof entry === 'string') {
    return [<p key={keyPrefix} dangerouslySetInnerHTML={{ __html: formatDamageTags(entry) }} />]
  }

  if (Array.isArray(entry)) {
    return entry.flatMap((subEntry, index) => renderSpellEntries(subEntry, `${keyPrefix}-${index}`))
  }

  if (typeof entry === 'object') {
    if (Array.isArray(entry.entries)) {
      const nested = renderSpellEntries(entry.entries, `${keyPrefix}-entries`)

      return [
        <div key={keyPrefix} className="space-y-2">
          {entry.name && <h3 className="font-semibold text-slate-800">{entry.name}</h3>}
          {nested}
        </div>,
      ]
    }

    if (entry.type === 'list' && Array.isArray(entry.items)) {
      return [
        <ul key={keyPrefix} className="ml-5 list-disc space-y-1">
          {entry.items.map((item: any, itemIndex: number) => (
            <li key={`${keyPrefix}-item-${itemIndex}`} className="space-y-1">
              {renderSpellEntries(item, `${keyPrefix}-item-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      ]
    }

    if (entry.type === 'table' && Array.isArray(entry.rows)) {
      const columnLabels = Array.isArray(entry.colLabels) ? entry.colLabels : undefined
      const caption = typeof entry.caption === 'string' ? entry.caption : undefined

      const rows = entry.rows.map((rowEntry: any, rowIndex: number) => {
        const cells = Array.isArray(rowEntry)
          ? rowEntry
          : Array.isArray(rowEntry?.cells)
            ? rowEntry.cells
            : Array.isArray(rowEntry?.entries)
              ? rowEntry.entries
              : [rowEntry]

        return (
          <tr key={`${keyPrefix}-row-${rowIndex}`} className="border-t">
            {cells.map((cell: any, cellIndex: number) => (
              <td key={`${keyPrefix}-row-${rowIndex}-cell-${cellIndex}`} className="px-2 py-1 align-top">
                {renderSpellEntries(cell, `${keyPrefix}-row-${rowIndex}-cell-${cellIndex}`)}
              </td>
            ))}
          </tr>
        )
      })

      return [
        <table key={keyPrefix} className="my-3 w-full border border-slate-200 text-sm">
          {caption && <caption className="pb-2 font-semibold text-slate-800">{caption}</caption>}
          {columnLabels && (
            <thead className="bg-slate-50 text-left">
              <tr>
                {columnLabels.map((label: string, labelIndex: number) => (
                  <th key={`${keyPrefix}-header-${labelIndex}`} className="px-2 py-1 font-semibold text-slate-700">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>{rows}</tbody>
        </table>,
      ]
    }

    return [
      <pre key={keyPrefix} className="overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-700">
        {JSON.stringify(entry, null, 2)}
      </pre>,
    ]
  }

  return []
}

export { formatDamageTags, renderSpellEntries }
