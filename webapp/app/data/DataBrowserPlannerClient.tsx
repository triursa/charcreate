'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAncestries } from '@/hooks/useAncestries'
import { useBackgrounds } from '@/hooks/useBackgrounds'
import { useCharacterBuilder } from '@/state/character-builder'

import DataBrowserClient, { type DataBrowserClientProps } from './DataBrowserClient'
import type { RenderActionHelpers } from './ClientTable'

type PlannerConfig = {
  noun: string
  label: string
  selectedId?: string
  select: (id: string) => void
  resolveEntryId: (entry: any) => string | null
}

type LookupRecord = {
  id: string
  name?: string | null
  source?: string | null
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createPlannerLookup(records: LookupRecord[]): Map<string, string> {
  const lookup = new Map<string, string>()

  for (const record of records) {
    if (!record?.id) continue

    const keys = new Set<string>()
    const rawId = String(record.id)
    keys.add(rawId)
    keys.add(normalizeKey(rawId))

    const name = typeof record.name === 'string' ? record.name : null
    const source = typeof record.source === 'string' ? record.source : null
    const slugName = name ? slugify(name) : null
    const slugSource = source ? slugify(source) : null

    if (name) {
      keys.add(name)
      keys.add(normalizeKey(name))
    }
    if (slugName) {
      keys.add(slugName)
      keys.add(normalizeKey(slugName))
    }

    if (source) {
      keys.add(source)
      keys.add(normalizeKey(source))
      if (slugSource) {
        keys.add(slugSource)
        keys.add(normalizeKey(slugSource))
      }
    }

    if (name && source) {
      const combos = [
        `${name}::${source}`,
        `${name}::${slugSource ?? ''}`,
        `${slugName ?? ''}::${source}`,
        `${slugName ?? ''}::${slugSource ?? ''}`,
      ]

      for (const combo of combos) {
        if (!combo || combo === '::') continue
        keys.add(combo)
        keys.add(normalizeKey(combo))
      }
    }

    for (const key of keys) {
      const normalized = normalizeKey(key)
      if (!normalized) continue
      if (!lookup.has(normalized)) {
        lookup.set(normalized, rawId)
      }
    }
  }

  return lookup
}

function computePlannerEntryId(entry: any, lookup: Map<string, string>): string | null {
  if (!entry || lookup.size === 0) return null

  const candidates = new Set<string>()
  const rawId = entry?.id
  if (typeof rawId === 'string' || typeof rawId === 'number') {
    candidates.add(String(rawId))
  }

  const builderId = entry?.builderId
  if (typeof builderId === 'string') {
    candidates.add(builderId)
  }

  const slug = entry?.slug
  if (typeof slug === 'string') {
    candidates.add(slug)
  }

  const name = typeof entry?.name === 'string' ? entry.name : null
  const source =
    typeof entry?.source === 'string'
      ? entry.source
      : typeof entry?.origin === 'string'
        ? entry.origin
        : null

  if (name) {
    candidates.add(name)
    candidates.add(slugify(name))
  }

  if (source) {
    candidates.add(source)
    candidates.add(slugify(source))
  }

  if (name && source) {
    const combinations = [
      `${name}::${source}`,
      `${name}::${slugify(source)}`,
      `${slugify(name)}::${source}`,
      `${slugify(name)}::${slugify(source)}`,
    ]
    combinations.forEach(combo => candidates.add(combo))
  }

  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = normalizeKey(candidate)
    if (!normalized) continue
    const match = lookup.get(normalized)
    if (match) return match
  }

  return null
}

function getEntryName(entry: any): string {
  const rawName = entry?.name
  if (typeof rawName === 'string' && rawName.trim().length > 0) {
    return rawName
  }
  return 'Selection'
}

export default function DataBrowserPlannerClient(props: DataBrowserClientProps) {
  const {
    model,
    renderActions: _ignoredRenderActions,
    isRowSelected: _ignoredIsRowSelected,
    statusMessage: _ignoredStatus,
    ...rest
  } = props

  const { state, actions } = useCharacterBuilder()
  const { setAncestry, setBackground } = actions
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const ancestryResult = useAncestries({ enabled: model === 'race' })
  const backgroundResult = useBackgrounds({ enabled: model === 'background' })

  const ancestryLookup = useMemo(
    () => createPlannerLookup(ancestryResult.ancestries),
    [ancestryResult.ancestries],
  )
  const backgroundLookup = useMemo(
    () => createPlannerLookup(backgroundResult.backgrounds),
    [backgroundResult.backgrounds],
  )

  useEffect(() => {
    if (!statusMessage) return
    const timeout = window.setTimeout(() => setStatusMessage(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const plannerConfig = useMemo<PlannerConfig | null>(() => {
    if (model === 'race') {
      return {
        noun: 'ancestry',
        label: 'Ancestry',
        selectedId: state.ancestryId ? String(state.ancestryId) : undefined,
        select: (id: string) => setAncestry(id),
        resolveEntryId: (entry: any) => computePlannerEntryId(entry, ancestryLookup),
      }
    }

    if (model === 'background') {
      return {
        noun: 'background',
        label: 'Background',
        selectedId: state.backgroundId ? String(state.backgroundId) : undefined,
        select: (id: string) => setBackground(id),
        resolveEntryId: (entry: any) => computePlannerEntryId(entry, backgroundLookup),
      }
    }

    return null
  }, [
    ancestryLookup,
    backgroundLookup,
    model,
    setAncestry,
    setBackground,
    state.ancestryId,
    state.backgroundId,
  ])

  const handleSelect = useCallback(
    (entry: any, helpers: RenderActionHelpers) => {
      if (!plannerConfig) return
      const id = plannerConfig.resolveEntryId(entry)
      if (!id) {
        setStatusMessage('Unable to select this entry. No matching planner record found.')
        return
      }

      const entryName = getEntryName(entry)

      if (plannerConfig.selectedId === id) {
        setStatusMessage(`${entryName} is already your ${plannerConfig.noun}.`)
        if (helpers.location === 'modal') {
          helpers.closeEntry()
        }
        return
      }

      plannerConfig.select(id)
      if (helpers.location === 'modal') {
        helpers.closeEntry()
      }
      setStatusMessage(`${entryName} selected as your ${plannerConfig.noun}.`)
    },
    [plannerConfig],
  )

  const plannerRenderActions = useCallback(
    (entry: any, helpers: RenderActionHelpers) => {
      if (!plannerConfig) {
        return helpers.location === 'card' ? null : null
      }

      const id = plannerConfig.resolveEntryId(entry)
      const isSelected = plannerConfig.selectedId != null && id === plannerConfig.selectedId
      const entryName = getEntryName(entry)

      const previewButton = (
        <button
          type="button"
          onClick={() => helpers.openEntry?.()}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-haspopup="dialog"
          aria-label={`Preview ${entryName}`}
        >
          Preview
        </button>
      )

      const selectButton = (
        <button
          type="button"
          onClick={() => handleSelect(entry, helpers)}
          disabled={!id || isSelected}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSelected ? `${plannerConfig.label} Selected` : `Select ${plannerConfig.label}`}
        </button>
      )

      if (helpers.location === 'card') {
        return (
          <>
            {previewButton}
            {selectButton}
          </>
        )
      }

      return (
        <div className="flex w-full flex-wrap items-center justify-end gap-3">
          {isSelected ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Current {plannerConfig.label}
            </span>
          ) : null}
          {selectButton}
        </div>
      )
    },
    [handleSelect, plannerConfig],
  )

  const plannerRowSelection = useCallback(
    (entry: any) => {
      if (!plannerConfig) return false
      const id = plannerConfig.resolveEntryId(entry)
      if (!id) return false
      return plannerConfig.selectedId === id
    },
    [plannerConfig],
  )

  return (
    <DataBrowserClient
      model={model}
      renderActions={plannerConfig ? plannerRenderActions : undefined}
      isRowSelected={plannerConfig ? plannerRowSelection : undefined}
      statusMessage={statusMessage}
      {...rest}
    />
  )
}
