"use client"

import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react"
import { Search, X } from "lucide-react"

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export interface SelectionModalFilterOption {
  label: string
  value: string
}

export interface SelectionModalFilterConfig {
  id: string
  label: string
  options: SelectionModalFilterOption[]
}

export interface SelectionModalRenderContext {
  searchTerm: string
  setSearchTerm: (value: string) => void
  filters: Record<string, string>
  setFilter: (id: string, value: string) => void
}

interface SelectionModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  searchPlaceholder?: string
  filters?: SelectionModalFilterConfig[]
  renderContent: (context: SelectionModalRenderContext) => ReactNode
  renderFooter?: (context: SelectionModalRenderContext) => ReactNode
}

export function SelectionModal({
  open,
  onClose,
  title,
  description,
  searchPlaceholder = "Search",
  filters = [],
  renderContent,
  renderFooter
}: SelectionModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const defaultFilters = useMemo(() => {
    return filters.reduce<Record<string, string>>((accumulator, filter) => {
      const [firstOption] = filter.options
      accumulator[filter.id] = firstOption ? firstOption.value : ""
      return accumulator
    }, {})
  }, [filters])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>(defaultFilters)

  useEffect(() => {
    setFilterValues((current) => ({
      ...defaultFilters,
      ...current
    }))
  }, [defaultFilters])

  useEffect(() => {
    if (!open) {
      setSearchTerm("")
      setFilterValues(defaultFilters)
      return
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const dialog = containerRef.current

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector)
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    const focusTimeout = window.setTimeout(() => {
      const focusable = dialog?.querySelectorAll<HTMLElement>(focusableSelector)
      if (focusable && focusable.length > 0) {
        (searchInputRef.current ?? focusable[0]).focus()
      }
    }, 0)

    return () => {
      window.clearTimeout(focusTimeout)
      document.removeEventListener("keydown", handleKeyDown)
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [defaultFilters, onClose, open])

  if (!open) {
    return null
  }

  const context: SelectionModalRenderContext = {
    searchTerm,
    setSearchTerm,
    filters: filterValues,
    setFilter: (id, value) =>
      setFilterValues((current) => ({
        ...current,
        [id]: value
      }))
  }

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="flex-1 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside
        ref={containerRef}
        className="relative flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl outline-none dark:bg-slate-900"
      >
        <div className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/95">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 id={titleId} className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              aria-label="Close selection modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="min-w-[200px] flex-1">
              <span className="sr-only">{searchPlaceholder}</span>
              <div className="relative">
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </label>

            {filters.map((filter) => (
              <label key={filter.id} className="min-w-[160px] text-sm">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {filter.label}
                </span>
                <select
                  value={filterValues[filter.id] ?? ""}
                  onChange={(event) => context.setFilter(filter.id, event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6" aria-describedby={description ? descriptionId : undefined}>
          {renderContent(context)}
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          {renderFooter ? renderFooter(context) : null}
        </div>
      </aside>
    </div>
  )
}
