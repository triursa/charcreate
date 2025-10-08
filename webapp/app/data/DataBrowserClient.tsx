"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import clsx from 'clsx'

import ClientTable, { type RenderActionHelpers } from './ClientTable'

type FilterKey = 'trait' | 'origin' | 'source' | 'tag'

type FilterState = Record<FilterKey, string[]>

type FilterOptions = FilterState

export type DataBrowserClientProps = {
  model: string
  rows: any[]
  columns: string[]
  searchTerm: string
  total: number
  page: number
  totalPages: number
  filterOptions: FilterOptions
  selectedFilters: FilterState
  sort: string
  renderActions?: (entry: any, helpers: RenderActionHelpers) => ReactNode
  isRowSelected?: (entry: any) => boolean
  statusMessage?: string | null
}

const DEFAULT_SORT = 'name:asc'

const FILTER_LABELS: Record<FilterKey, string> = {
  trait: 'Trait Tags',
  origin: 'Origin',
  source: 'Source',
  tag: 'Tags',
}

function mergeOptions(options: string[], selected: string[]): string[] {
  const merged = new Set<string>(options)
  selected.forEach(value => {
    if (value) merged.add(value)
  })
  return Array.from(merged).sort((a, b) => a.localeCompare(b))
}

function pickFuseKeys(columns: string[]): string[] {
  const keys = new Set<string>(['name'])
  if (columns.includes('source')) keys.add('source')
  if (columns.includes('origin')) keys.add('origin')
  if (columns.includes('traitTags')) keys.add('traitTags')
  if (columns.includes('tags')) keys.add('tags')
  if (columns.includes('miscTags')) keys.add('miscTags')
  if (columns.includes('areaTags')) keys.add('areaTags')
  if (columns.includes('featureType')) keys.add('featureType')
  return Array.from(keys)
}

function getSortOptions(columns: string[]) {
  const hasSource = columns.includes('source')
  const hasOrigin = columns.includes('origin')
  const hasPopularity = columns.includes('popularity')

  const options = [
    { value: 'name:asc', label: 'Name (A → Z)' },
    { value: 'name:desc', label: 'Name (Z → A)' },
  ]

  if (hasSource) {
    options.push({ value: 'source:asc', label: 'Source (A → Z)' })
    options.push({ value: 'source:desc', label: 'Source (Z → A)' })
  } else if (hasOrigin) {
    options.push({ value: 'origin:asc', label: 'Origin (A → Z)' })
    options.push({ value: 'origin:desc', label: 'Origin (Z → A)' })
  }

  if (hasPopularity) {
    options.push({ value: 'popularity:desc', label: 'Popularity (High → Low)' })
    options.push({ value: 'popularity:asc', label: 'Popularity (Low → High)' })
  }

  return options
}

export default function DataBrowserClient(props: DataBrowserClientProps) {
  const {
    model,
    rows,
    columns,
    searchTerm,
    total,
    page,
    totalPages,
    filterOptions,
    selectedFilters,
    sort,
    renderActions,
    isRowSelected,
    statusMessage,
  } = props

  const router = useRouter()
  const [inputValue, setInputValue] = useState(searchTerm)

  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  const fuseKeys = useMemo(() => pickFuseKeys(columns), [columns])

  const fuse = useMemo(() => {
    if (fuseKeys.length === 0) return null
    return new Fuse(rows, {
      keys: fuseKeys,
      threshold: 0.35,
      includeScore: true,
      ignoreLocation: true,
    })
  }, [rows, fuseKeys])

  const filteredRows = useMemo(() => {
    if (!searchTerm || !fuse) return rows
    return fuse.search(searchTerm).map(result => result.item)
  }, [rows, searchTerm, fuse])

  const sortOptions = useMemo(() => getSortOptions(columns), [columns])

  const mergedFilterOptions = useMemo(() => {
    return {
      trait: mergeOptions(filterOptions.trait, selectedFilters.trait),
      origin: mergeOptions(filterOptions.origin, selectedFilters.origin),
      source: mergeOptions(filterOptions.source, selectedFilters.source),
      tag: mergeOptions(filterOptions.tag, selectedFilters.tag),
    }
  }, [filterOptions, selectedFilters])

  const composeParams = useCallback(
    (overrides: Partial<{ q: string; sort: string; filters: Partial<FilterState>; page: number }>) => {
      const params = new URLSearchParams()
      params.set('model', model)

      const nextFilters: FilterState = {
        trait: [...selectedFilters.trait],
        origin: [...selectedFilters.origin],
        source: [...selectedFilters.source],
        tag: [...selectedFilters.tag],
      }

      if (overrides.filters) {
        for (const key of Object.keys(overrides.filters) as FilterKey[]) {
          const values = overrides.filters[key] ?? []
          nextFilters[key] = Array.from(new Set(values))
        }
      }

      const nextSearch = overrides.q !== undefined ? overrides.q : searchTerm
      const normalizedSearch = nextSearch?.trim() ?? ''
      if (normalizedSearch) {
        params.set('q', normalizedSearch)
      }

      const nextSort = overrides.sort ?? sort ?? DEFAULT_SORT
      if (nextSort && nextSort !== DEFAULT_SORT) {
        params.set('sort', nextSort)
      }

      const nextPage = overrides.page ?? page
      params.set('page', String(Math.max(1, nextPage)))

      for (const key of Object.keys(nextFilters) as FilterKey[]) {
        const values = nextFilters[key]
        values.forEach(value => {
          if (value) params.append(key, value)
        })
      }

      return params
    },
    [model, page, searchTerm, selectedFilters, sort],
  )

  const applyUpdates = useCallback(
    (overrides: Partial<{ q: string; sort: string; filters: Partial<FilterState>; page: number }>) => {
      const params = composeParams({ ...overrides, page: overrides.page ?? 1 })
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [composeParams, router],
  )

  const buildPageHref = useCallback(
    (nextPage: number) => {
      const params = composeParams({ page: nextPage })
      return `?${params.toString()}`
    },
    [composeParams],
  )

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      applyUpdates({ q: inputValue.trim() })
    },
    [applyUpdates, inputValue],
  )

  const handleClearSearch = useCallback(() => {
    setInputValue('')
    applyUpdates({ q: '' })
  }, [applyUpdates])

  const handleFilterChange = useCallback(
    (key: FilterKey) => (event: ChangeEvent<HTMLSelectElement>) => {
      const values = Array.from(event.target.selectedOptions).map(option => option.value)
      applyUpdates({ filters: { [key]: values } as Partial<FilterState> })
    },
    [applyUpdates],
  )

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      applyUpdates({ sort: event.target.value })
    },
    [applyUpdates],
  )

  const activeSort = sort || DEFAULT_SORT
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  const filterKeys: FilterKey[] = ['trait', 'origin', 'source', 'tag']

  return (
    <div>
      <div className="mb-6 space-y-4">
        {statusMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {statusMessage}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex w-full flex-wrap gap-2 md:max-w-2xl">
            <input
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              placeholder="Search by name, source, or tags..."
              className="flex-1 rounded border px-3 py-2"
              name="search"
              aria-label="Search entries"
            />
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
                Search
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded border px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-1">
            <label htmlFor="sort" className="text-sm font-medium text-slate-700">
              Sort by
            </label>
            <select
              id="sort"
              value={activeSort}
              onChange={handleSortChange}
              className="w-48 rounded border px-3 py-2 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filterKeys.map(key => {
            const options = mergedFilterOptions[key]
            if (options.length === 0) return null
            return (
              <div key={key} className="flex flex-col gap-1">
                <label htmlFor={`filter-${key}`} className="text-sm font-medium text-slate-700">
                  {FILTER_LABELS[key]}
                </label>
                <select
                  id={`filter-${key}`}
                  multiple
                  value={selectedFilters[key]}
                  onChange={handleFilterChange(key)}
                  className="h-32 rounded border px-2 py-1 text-sm"
                >
                  {options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </div>

      <ClientTable
        rows={filteredRows}
        columns={columns}
        renderActions={renderActions}
        isRowSelected={isRowSelected}
      />

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          Showing {filteredRows.length} of {rows.length} entries on this page · Total records: {total}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevDisabled ? '#' : buildPageHref(page - 1)}
            aria-disabled={prevDisabled}
            className={clsx(
              'rounded border px-3 py-1 text-sm transition',
              prevDisabled ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100',
            )}
          >
            Prev
          </Link>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Link
            href={nextDisabled ? '#' : buildPageHref(page + 1)}
            aria-disabled={nextDisabled}
            className={clsx(
              'rounded border px-3 py-1 text-sm transition',
              nextDisabled ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100',
            )}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  )
}
