'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCharacterBuilder } from '@/state/character-builder'

import DataBrowserClient, { type DataBrowserClientProps } from './DataBrowserClient'
import type { RenderActionHelpers } from './ClientTable'

type PlannerConfig = {
  noun: string
  label: string
  selectedId?: string
  select: (id: string) => void
}

function normalizeId(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
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
      }
    }

    if (model === 'background') {
      return {
        noun: 'background',
        label: 'Background',
        selectedId: state.backgroundId ? String(state.backgroundId) : undefined,
        select: (id: string) => setBackground(id),
      }
    }

    return null
  }, [model, setAncestry, setBackground, state.ancestryId, state.backgroundId])

  const handleSelect = useCallback(
    (entry: any, helpers: RenderActionHelpers) => {
      if (!plannerConfig) return
      const id = normalizeId(entry?.id)
      if (!id) {
        setStatusMessage('Unable to select this entry. Missing identifier.')
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

      const id = normalizeId(entry?.id)
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
      const id = normalizeId(entry?.id)
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
