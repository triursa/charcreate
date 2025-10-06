"use client"

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Columns3 } from "lucide-react"

export interface ColumnConfig<T> {
  id: string
  label: string
  accessor: (row: T) => ReactNode
  /**
   * Optional value used for sorting. If not provided the accessor result will be used
   * when it is a primitive string/number.
   */
  sortValue?: (row: T) => string | number
  sortable?: boolean
  align?: "left" | "right" | "center"
  defaultVisible?: boolean
  minWidth?: string
}

type SortDirection = "asc" | "desc"

interface DataTableProps<T> {
  data: T[]
  columns: ColumnConfig<T>[]
  initialSort?: {
    columnId: string
    direction?: SortDirection
  }
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  initialSort,
  onRowClick,
  emptyState,
  className
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    columnId: string
    direction: SortDirection
  } | null>(() => {
    if (!initialSort) return null
    return {
      columnId: initialSort.columnId,
      direction: initialSort.direction ?? "asc"
    }
  })

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaults = columns
      .filter((column) => column.defaultVisible !== false)
      .map((column) => column.id)
    return new Set(defaults.length ? defaults : columns.map((column) => column.id))
  })

  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false)
  const columnMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!columnsMenuOpen) return

    const handleClick = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setColumnsMenuOpen(false)
      }
    }

    window.addEventListener("mousedown", handleClick)
    return () => window.removeEventListener("mousedown", handleClick)
  }, [columnsMenuOpen])

  useEffect(() => {
    if (!sortConfig) return
    const columnExists = columns.some((column) => column.id === sortConfig.columnId)
    if (!columnExists) {
      setSortConfig(null)
    }
  }, [columns, sortConfig])

  useEffect(() => {
    setVisibleColumns((current) => {
      const next = new Set<string>()
      columns.forEach((column) => {
        if (current.has(column.id) || column.defaultVisible !== false) {
          next.add(column.id)
        }
      })

      if (next.size === current.size && Array.from(next).every((id) => current.has(id))) {
        return current
      }

      return next
    })
  }, [columns])

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const column = columns.find((col) => col.id === sortConfig.columnId)
    if (!column || !column.sortable) return data

    const direction = sortConfig.direction === "asc" ? 1 : -1

    const getValue = (row: T) => {
      if (column.sortValue) return column.sortValue(row)
      const cell = column.accessor(row)
      if (typeof cell === "string" || typeof cell === "number") {
        return cell
      }
      return ""
    }

    return [...data].sort((a, b) => {
      const aValue = getValue(a)
      const bValue = getValue(b)

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction
      }

      return String(aValue).localeCompare(String(bValue)) * direction
    })
  }, [columns, data, sortConfig])

  const handleSort = (column: ColumnConfig<T>) => {
    if (!column.sortable) return

    setSortConfig((current) => {
      if (!current || current.columnId !== column.id) {
        return { columnId: column.id, direction: "asc" }
      }
      if (current.direction === "asc") {
        return { columnId: column.id, direction: "desc" }
      }
      return null
    })
  }

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((current) => {
      const next = new Set(current)
      if (next.has(columnId)) {
        next.delete(columnId)
      } else {
        next.add(columnId)
      }
      return next
    })
  }

  const visibleColumnsArray = columns.filter((column) => visibleColumns.has(column.id))

  return (
    <div className={`rounded-2xl border border-gray-200/60 dark:border-dark-700/60 bg-white/80 dark:bg-dark-900/70 backdrop-blur ${className ?? ""}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 dark:border-dark-700/60">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-gray-200">{sortedData.length.toLocaleString()}</span> {sortedData.length === 1 ? "entry" : "entries"}
        </p>

        <div className="relative" ref={columnMenuRef}>
          <button
            type="button"
            onClick={() => setColumnsMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50 dark:hover:border-dark-500 dark:hover:bg-dark-700"
          >
            <Columns3 size={16} />
            Columns
          </button>

          {columnsMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-gray-200/70 dark:border-dark-600/70 bg-white/95 dark:bg-dark-900/95 p-3 shadow-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Visible columns</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {columns.map((column) => (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={visibleColumns.has(column.id)}
                      onChange={() => toggleColumnVisibility(column.id)}
                    />
                    <span>{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/70 dark:divide-dark-700/60">
          <thead className="bg-gray-50/60 dark:bg-dark-800/60">
            <tr>
              {visibleColumnsArray.map((column) => {
                const isSorted = sortConfig?.columnId === column.id
                const direction = sortConfig?.direction ?? "asc"

                return (
                  <th
                    key={column.id}
                    scope="col"
                    onClick={() => handleSort(column)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 ${
                      column.sortable ? "cursor-pointer select-none" : ""
                    } ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                    style={{ minWidth: column.minWidth }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <span className="text-gray-400 dark:text-gray-500">
                          {isSorted ? (
                            direction === "asc" ? <ArrowUpNarrowWide size={14} /> : <ArrowDownNarrowWide size={14} />
                          ) : (
                            <ArrowUpNarrowWide size={14} className="opacity-30" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/70 dark:divide-dark-800/70 bg-white/60 dark:bg-dark-900/40">
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={visibleColumnsArray.length} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  {emptyState ?? "No entries match your filters."}
                </td>
              </tr>
            )}

            {sortedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? "cursor-pointer" : ""
                } transition-colors duration-150 hover:bg-primary-50/70 dark:hover:bg-primary-900/30`}
              >
                {visibleColumnsArray.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-200 ${
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

