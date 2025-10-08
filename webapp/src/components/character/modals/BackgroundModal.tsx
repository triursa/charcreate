"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { BackgroundSelector, extractBackgroundValues } from "@/components/character/BackgroundSelector"
import { SelectionModal, type SelectionModalFilterConfig } from "@/components/character/SelectionModal"
import { useBackgrounds } from "@/hooks/useBackgrounds"
import type { BackgroundRecord } from "@/types/character-builder"

interface BackgroundModalProps {
  open: boolean
  selectedId?: string | null
  onClose: () => void
  onConfirmSelection: (selection: BackgroundRecord | string) => void
}

export function BackgroundModal({ open, selectedId, onClose, onConfirmSelection }: BackgroundModalProps) {
  const { backgrounds, backgroundIds, loading, error, refresh } = useBackgrounds({ enabled: open })
  const [pendingBackgroundId, setPendingBackgroundId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPendingBackgroundId(selectedId ?? null)
    }
  }, [open, selectedId])

  const filters: SelectionModalFilterConfig[] = useMemo(() => {
    const skillOptions = Array.from(
      new Set(
        backgrounds
          .flatMap((background) => extractBackgroundValues(background.skillProficiencies))
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))

    const originOptions = Array.from(
      new Set(backgrounds.map((background) => background.source).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    return [
      {
        id: "trait",
        label: "Skills",
        options: [
          { value: "all", label: "All Skills" },
          ...skillOptions.map((skill) => ({ value: skill, label: skill }))
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
  }, [backgrounds])

  const isPendingSelectionValid = pendingBackgroundId ? backgroundIds.includes(pendingBackgroundId) : false

  const handleConfirm = useCallback(() => {
    if (!isPendingSelectionValid || !pendingBackgroundId) {
      return
    }

    const selection = backgrounds.find((background) => background.id === pendingBackgroundId)
    onConfirmSelection(selection ?? pendingBackgroundId)
    onClose()
  }, [backgrounds, isPendingSelectionValid, onClose, onConfirmSelection, pendingBackgroundId])

  return (
    <SelectionModal
      open={open}
      onClose={onClose}
      title="Browse Backgrounds"
      description="Explore backgrounds to uncover the skills and story hooks that shaped your hero."
      searchPlaceholder="Search backgrounds..."
      filters={filters}
      renderContent={({ searchTerm, filters }) => {
        const traitFilter = filters.trait ?? "all"
        const originFilter = filters.origin ?? "all"

        if (loading && backgrounds.length === 0) {
          return <p className="text-sm text-slate-600 dark:text-slate-300">Loading backgrounds...</p>
        }

        if (error && backgrounds.length === 0) {
          return (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
              <button
                type="button"
                onClick={refresh}
                className="text-sm font-medium text-indigo-600 underline-offset-2 transition hover:underline dark:text-indigo-400"
              >
                Try again
              </button>
            </div>
          )
        }

        return (
          <BackgroundSelector
            backgrounds={backgrounds}
            searchTerm={searchTerm}
            traitFilter={traitFilter}
            originFilter={originFilter}
            selectedId={pendingBackgroundId}
            onSelect={(background) => setPendingBackgroundId(background.id)}
          />
        )
      }}
      renderFooter={({ filters }) => {
        const traitFilter = filters.trait ?? "all"
        const originFilter = filters.origin ?? "all"

        return (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing backgrounds filtered by {traitFilter === "all" ? "all skills" : `skill: ${traitFilter}`} and{" "}
              {originFilter === "all" ? "all origins" : `origin: ${originFilter}`}.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isPendingSelectionValid}
                className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
              >
                Confirm background
              </button>
            </div>
          </div>
        )
      }}
    />
  )
}
