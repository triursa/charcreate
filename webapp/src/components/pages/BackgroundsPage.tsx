"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Book, Search } from "lucide-react"

import { DataTable, type ColumnConfig } from "@/components/DataTable"
import { getContentByCategory } from "@/lib/clientDataLoader"
import { searchAllContent } from "@/lib/search"

interface BackgroundsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

const formatProficiencyValue = (value: any): string => {
  if (!value) return "—"

  const normalizeFrom = (from: any): string => {
    if (!from) return ""
    if (Array.isArray(from)) {
      return from
        .map((entry) => {
          if (typeof entry === "string") return entry
          if (entry && typeof entry === "object") {
            const record = entry as Record<string, any>
            if (record.item) return String(record.item)
            if (record.name) return String(record.name)
            return Object.keys(record).join(", ")
          }
          return String(entry)
        })
        .filter(Boolean)
        .join(", ")
    }
    if (typeof from === "object") {
      return Object.values(from as Record<string, any>)
        .map((entry) => {
          if (typeof entry === "string") return entry
          if (entry && typeof entry === "object") {
            const record = entry as Record<string, any>
            if (record.item) return String(record.item)
            if (record.name) return String(record.name)
            return Object.keys(record).join(", ")
          }
          return String(entry ?? "")
        })
        .filter(Boolean)
        .join(", ")
    }
    return String(from)
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry) return ""
        if (entry.choose) {
          const choices = normalizeFrom(entry.choose.from)
          return `Choose ${entry.choose.count}${choices ? ` from ${choices}` : ""}`
        }
        if (entry && typeof entry === "object") {
          const record = entry as Record<string, any>
          return Object.keys(record)
            .filter((key) => key !== "choose")
            .join(", ")
        }
        return String(entry)
      })
      .filter(Boolean)
      .join("; ")
  }

  if (typeof value === "object" && value.choose) {
    const choices = normalizeFrom(value.choose.from)
    return `Choose ${value.choose.count}${choices ? ` from ${choices}` : ""}`
  }

  return String(value)
}

const formatStartingEquipment = (value: any): string => {
  if (!value) return "—"

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry) return ""
        if (entry && typeof entry === "object" && "choose" in entry) {
          const record = entry as Record<string, any>
          const from = Array.isArray(record.choose?.from)
            ? record.choose.from
                .map((choice: any) => {
                  if (typeof choice === "string") return choice
                  if (choice && typeof choice === "object") {
                    const choiceRecord = choice as Record<string, any>
                    if (choiceRecord.item) return String(choiceRecord.item)
                    if (choiceRecord.name) return String(choiceRecord.name)
                    return Object.keys(choiceRecord).join(", ")
                  }
                  return String(choice)
                })
                .filter(Boolean)
                .join(", ")
            : String(record.choose?.from ?? "")
          return `Choose ${record.choose?.count ?? ""}${from ? ` from ${from}` : ""}`.trim()
        }
        if (typeof entry === "string") return entry
        if (entry && typeof entry === "object") {
          const record = entry as Record<string, any>
          if (record.item) return String(record.item)
          if (record.entry) return String(record.entry)
          if (record.count && record.from) {
            const fromList = Array.isArray(record.from)
              ? record.from
                  .map((option: any) => {
                    if (typeof option === "string") return option
                    if (option && typeof option === "object") {
                      const optionRecord = option as Record<string, any>
                      if (optionRecord.item) return String(optionRecord.item)
                      if (optionRecord.name) return String(optionRecord.name)
                      return Object.keys(optionRecord).join(", ")
                    }
                    return String(option)
                  })
                  .filter(Boolean)
                  .join(", ")
              : String(record.from)
            return `Choose ${record.count}${fromList ? ` from ${fromList}` : ""}`
          }
          return Object.values(record)
            .map((val) => (typeof val === "string" ? val : ""))
            .filter(Boolean)
            .join(", ")
        }
        return String(entry)
      })
      .filter(Boolean)
      .join(", ")
  }

  return String(value)
}

export function BackgroundsPage({ searchQuery, onSearch }: BackgroundsPageProps) {
  const [backgrounds, setBackgrounds] = useState<any[]>([])
  const [filteredBackgrounds, setFilteredBackgrounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBackgroundsData = async () => {
      try {
        const backgroundData = await getContentByCategory("backgrounds")
        setBackgrounds(backgroundData)
      } catch (error) {
        console.error("Error loading backgrounds:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBackgroundsData()
  }, [])

  const applySearch = useCallback(() => {
    let result = [...backgrounds]

    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ backgrounds }, searchQuery, 100)
      result = searchResults.map((match) => match.item)
    }

    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    setFilteredBackgrounds(result)
  }, [backgrounds, searchQuery])

  useEffect(() => {
    applySearch()
  }, [applySearch])

  const columns: ColumnConfig<any>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Background",
        accessor: (background) => (
          <div className="font-medium text-indigo-600 dark:text-indigo-400">
            {background.name ?? "—"}
          </div>
        ),
        sortable: true,
        sortValue: (background) => background.name ?? "",
        minWidth: "200px"
      },
      {
        id: "skills",
        label: "Skill Proficiencies",
        accessor: (background) => formatProficiencyValue(background.skillProficiencies),
        minWidth: "260px"
      },
      {
        id: "languages",
        label: "Languages",
        accessor: (background) => formatProficiencyValue(background.languageProficiencies),
        minWidth: "200px"
      },
      {
        id: "tools",
        label: "Tool Proficiencies",
        accessor: (background) => formatProficiencyValue(background.toolProficiencies),
        minWidth: "220px"
      },
      {
        id: "equipment",
        label: "Starting Equipment",
        accessor: (background) => formatStartingEquipment(background.startingEquipment),
        minWidth: "260px"
      },
      {
        id: "source",
        label: "Source",
        accessor: (background) => background.source ?? "—",
        sortable: true,
        sortValue: (background) => background.source ?? "",
        minWidth: "120px"
      }
    ],
    []
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600">
          <Book className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backgrounds</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore {backgrounds.length.toLocaleString()} character backgrounds and their features
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm dark:border-dark-700/60 dark:bg-dark-900/70">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search backgrounds by name or proficiencies…"
            className="w-full rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100"
          />
        </div>
      </div>

      <DataTable
        data={filteredBackgrounds}
        columns={columns}
        initialSort={{ columnId: "name" }}
        emptyState={
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No backgrounds match your search.
          </div>
        }
      />
    </div>
  )
}