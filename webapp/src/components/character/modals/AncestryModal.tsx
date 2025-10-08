"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { AncestrySelector } from "@/components/character/AncestrySelector"
import { SelectionModal, type SelectionModalFilterConfig } from "@/components/character/SelectionModal"
import { useAncestries } from "@/hooks/useAncestries"
import type { AncestryRecord } from "@/types/character-builder"

interface AncestryModalProps {
  open: boolean
  selectedId?: string | null
  onClose: () => void
  onConfirmSelection: (selection: AncestryRecord | string) => void
}

export function AncestryModal({ open, selectedId, onClose, onConfirmSelection }: AncestryModalProps) {
  const { ancestries, ancestryIds, loading, error, refresh } = useAncestries({ enabled: open })
  const [pendingAncestryId, setPendingAncestryId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPendingAncestryId(selectedId ?? null)
    }
  }, [open, selectedId])

  const filters: SelectionModalFilterConfig[] = useMemo(() => {
    const traitOptions = Array.from(
      new Set(ancestries.flatMap((ancestry) => ancestry.traitTags?.filter(Boolean) ?? []))
    ).sort((a, b) => a.localeCompare(b))

    const originOptions = Array.from(
      new Set(ancestries.map((ancestry) => ancestry.source).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    return [
      {
        id: "trait",
        label: "Trait Tag",
        options: [
          { value: "all", label: "All Traits" },
          ...traitOptions.map((tag) => ({ value: tag, label: tag }))
        ]
      },
      {
        id: "origin",
        label: "Origin",
        options: [
          { value: "all", label: "All Origins" },
          ...originOptions.map((origin) => ({ value: origin, label: origin }))
        ]
      }
    ]
  }, [ancestries])

  const isPendingSelectionValid = pendingAncestryId ? ancestryIds.includes(pendingAncestryId) : false

  const handleConfirm = useCallback(() => {
    if (!isPendingSelectionValid || !pendingAncestryId) {
      return
    }

    const selection = ancestries.find((ancestry) => ancestry.id === pendingAncestryId)
    onConfirmSelection(selection ?? pendingAncestryId)
    onClose()
  }, [ancestries, isPendingSelectionValid, onClose, onConfirmSelection, pendingAncestryId])

  return (
    <SelectionModal
      open={open}
      onClose={onClose}
      title="Browse Ancestries"
      description="Search and filter the available ancestries to find the perfect cultural fit."
      searchPlaceholder="Search ancestries..."
      filters={filters}
      renderContent={({ searchTerm, filters }) => {
        const traitFilter = filters.trait ?? "all"
        const originFilter = filters.origin ?? "all"

        if (loading && ancestries.length === 0) {
          return <p className="text-sm text-slate-600 dark:text-slate-300">Loading ancestries...</p>
        }

        if (error && ancestries.length === 0) {
          return (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
              <button
                type="button"
                onClick={refresh}
                className="text-sm font-medium text-blue-600 underline-offset-2 transition hover:underline dark:text-blue-400"
              >
                Try again
              </button>
            </div>
          )
        }

        return (
          <AncestrySelector
            ancestries={ancestries}
            searchTerm={searchTerm}
            traitFilter={traitFilter}
            originFilter={originFilter}
            selectedId={pendingAncestryId}
            onSelect={(ancestry) => setPendingAncestryId(ancestry.id)}
          />
        )
      }}
      renderFooter={({ filters }) => {
        const traitFilter = filters.trait ?? "all"
        const originFilter = filters.origin ?? "all"

        return (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing ancestries filtered by {traitFilter === "all" ? "all traits" : `trait: ${traitFilter}`} and{" "}
              {originFilter === "all" ? "all origins" : `origin: ${originFilter}`}.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isPendingSelectionValid}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
              >
                Confirm ancestry
              </button>
            </div>
          </div>
        )
      }}
    />
  )
}
