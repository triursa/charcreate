"use client"

import { type ComponentType, useCallback, useEffect, useMemo, useState } from "react"
import { BookOpen, Compass, Filter, Loader2, Map, Search as SearchIcon, Sparkles, Award } from "lucide-react"

import { DataTable, type ColumnConfig } from "@/components/DataTable"
import { DetailDrawer } from "@/components/DetailDrawer"
import { FilterPanel } from "@/components/FilterPanel"
import { GenericDetail } from "@/components/details/GenericDetail"
import { CONTENT_CATEGORIES } from "@/lib/clientDataLoader"
import { filterContent, getFilterOptions, searchAllContent } from "@/lib/search"
import { extractPlainText } from "@/lib/textParser"
import { hasAllCategories, isContentCategory, useContentData } from "@/state/content-data"

interface ContentViewProps {
  category: string
  searchQuery: string
  onSearch: (query: string) => void
}

interface CategoryConfig {
  title: string
  description: string
  accentClass: string
  icon: ComponentType<{ size?: number }>
}

const categoryConfig: Record<string, CategoryConfig> = {
  backgrounds: {
    title: "Character Backgrounds",
    description: "Tailor your hero's origin story with ready-to-use backgrounds and customisable proficiencies.",
    accentClass: "bg-amber-500",
    icon: BookOpen
  },
  adventures: {
    title: "Published Adventures",
    description: "Review published campaigns and scenarios to plan your next tabletop journey.",
    accentClass: "bg-indigo-500",
    icon: Map
  },
  feats: {
    title: "Feats & Talents",
    description: "Discover potent character upgrades, prerequisites, and mechanical effects.",
    accentClass: "bg-violet-500",
    icon: Award
  },
  search: {
    title: "Search Results",
    description: "See matching results from every compendium source in a single table.",
    accentClass: "bg-sky-500",
    icon: Compass
  }
}

const defaultConfig: CategoryConfig = {
  title: "Compendium",
  description: "Explore the compendium with modern filters and instant detail drawers.",
  accentClass: "bg-primary-600",
  icon: Sparkles
}

type RecordWithType = any & { _type?: string }

export function ContentView({ category, searchQuery, onSearch }: ContentViewProps) {
  const { content: cachedContent, getAllContent, getCategoryData } = useContentData()
  const isSearch = category === "search"
  const knownCategory = isContentCategory(category)
  const categoryData = cachedContent[category]
  const hasCategoryData = categoryData !== undefined
  const hasFullContent = hasAllCategories(cachedContent)

  const [content, setContent] = useState<RecordWithType[]>([])
  const [filteredContent, setFilteredContent] = useState<RecordWithType[]>([])
  const [loading, setLoading] = useState(() => {
    if (isSearch || !knownCategory) {
      return !hasFullContent
    }
    return !hasCategoryData
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [selectedRecord, setSelectedRecord] = useState<RecordWithType | null>(null)

  const aggregatedContent = useMemo(() => {
    const base: Record<string, any[]> = {}

    CONTENT_CATEGORIES.forEach((contentCategory) => {
      base[contentCategory] = cachedContent[contentCategory] ?? []
    })

    Object.entries(cachedContent).forEach(([key, value]) => {
      if (!(key in base)) {
        base[key] = value ?? []
      }
    })

    return base
  }, [cachedContent])

  useEffect(() => {
    setFilters({
      source: [],
      level: [],
      rarity: [],
      school: []
    })
  }, [category])

  useEffect(() => {
    let isMounted = true

    const ensureContent = async () => {
      try {
        if (isSearch) {
          if (hasFullContent) {
            setLoading(false)
            return
          }

          setLoading(true)
          await getAllContent()
          return
        }

        if (knownCategory) {
          if (hasCategoryData) {
            setLoading(false)
            return
          }

          setLoading(true)
          await getCategoryData(category)
          return
        }

        if (hasFullContent) {
          setLoading(false)
          return
        }

        setLoading(true)
        await getAllContent()
      } catch (error) {
        console.error("Error loading content:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    ensureContent()

    return () => {
      isMounted = false
    }
  }, [category, getAllContent, getCategoryData, hasCategoryData, hasFullContent, isSearch, knownCategory])

  const getFilteredCategoryContent = useCallback((sourceContent: RecordWithType[]) => {
    let result = [...sourceContent]

    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ [category]: sourceContent }, searchQuery, 100)
      result = searchResults.map((r) => ({ ...r.item, _type: r.type, _score: r.score }))
    }

    result = filterContent(result, category, filters)
    result.sort((a, b) => (a.name || a.title || "").localeCompare(b.name || b.title || ""))
    return result
  }, [category, filters, searchQuery])

  useEffect(() => {
    if (isSearch) {
      setContent([])
      setFilterOptions({})
      return
    }

    if (!knownCategory) {
      const data = aggregatedContent[category] || []
      setContent(data)
      setFilterOptions(getFilterOptions(data, category))
      setFilteredContent(getFilteredCategoryContent(data))
      return
    }

    if (!hasCategoryData) {
      setContent([])
      setFilterOptions({})
      setFilteredContent([])
      return
    }

    const data = (categoryData ?? []) as RecordWithType[]
    setContent(data)
    const options = getFilterOptions(data, category)
    setFilterOptions(options)
    setFilteredContent(getFilteredCategoryContent(data))
  }, [aggregatedContent, category, categoryData, getFilteredCategoryContent, hasCategoryData, isSearch, knownCategory])

  const applySearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredContent([])
      return
    }

    const results = searchAllContent(aggregatedContent, searchQuery, 200).map(({ item, type, score }) => ({
      ...item,
      _type: type,
      _score: score
    }))

    results.sort((a, b) => (a._score || 0) - (b._score || 0))
    setFilteredContent(results)
  }, [aggregatedContent, searchQuery])

  useEffect(() => {
    if (isSearch) {
      applySearch()
    } else {
      const filtered = getFilteredCategoryContent(content)
      setFilteredContent(filtered)
    }
  }, [applySearch, category, content, getFilteredCategoryContent, isSearch, searchQuery])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const config = categoryConfig[category] ?? defaultConfig

  const columns: ColumnConfig<RecordWithType>[] = useMemo(() => {
    const baseColumns: ColumnConfig<RecordWithType>[] = [
      {
        id: "name",
        label: category === "search" ? "Result" : "Name",
        accessor: (record) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{record.name || record.title}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{record.source || "Unknown source"}</span>
          </div>
        ),
        sortable: true,
        sortValue: (record) => record.name || record.title || "",
        minWidth: "220px"
      }
    ]

    if (category === "search") {
      baseColumns.push({
        id: "type",
        label: "Type",
        accessor: (record) => record._type?.charAt(0).toUpperCase() + record._type?.slice(1),
        sortable: true,
        sortValue: (record) => record._type ?? "",
        minWidth: "140px"
      })
    }

    baseColumns.push(
      {
        id: "summary",
        label: "Summary",
        accessor: (record) => {
          const text = extractPlainText(record.entries || record.description || record.text || "")
          if (!text) return "—"
          return text.length > 160 ? `${text.slice(0, 160)}…` : text
        },
        defaultVisible: true,
        minWidth: "280px"
      },
      {
        id: "page",
        label: "Source Page",
        accessor: (record) => (record.page ? `p.${record.page}` : "—"),
        defaultVisible: false,
        minWidth: "120px"
      }
    )

    if (category === "backgrounds") {
      baseColumns.push({
        id: "skills",
        label: "Skill Proficiencies",
        accessor: (record) => {
          if (!Array.isArray(record.skillProficiencies)) return "—"
          const values = record.skillProficiencies.flatMap((prof: any) =>
            typeof prof === "string"
              ? [prof]
              : Object.keys(prof).filter((key) => prof[key] === true)
          )
          return values.length ? values.join(", ") : "—"
        },
        defaultVisible: false,
        minWidth: "200px"
      })
    }

    if (category === "feats") {
      baseColumns.push({
        id: "prerequisite",
        label: "Prerequisite",
        accessor: (record) => record.prerequisite ? extractPlainText(record.prerequisite).replace(/\s+/g, " ") : "—",
        defaultVisible: false,
        minWidth: "200px"
      })
    }

    if (category === "adventures") {
      baseColumns.push({
        id: "levels",
        label: "Recommended Levels",
        accessor: (record) => {
          if (record.level?.min && record.level?.max) {
            return `${record.level.min} – ${record.level.max}`
          }
          return record.level ? JSON.stringify(record.level) : "—"
        },
        defaultVisible: false,
        minWidth: "150px"
      })
    }

    return baseColumns
  }, [category])

  const shouldShowFilters = category !== "search"

  const detailFields = useMemo(() => {
    if (!selectedRecord) return []

    const type = category === "search" ? selectedRecord._type : category

    switch (type) {
      case "backgrounds":
        return [
          { label: "Source", value: selectedRecord.source },
          {
            label: "Skill Proficiencies",
            value: Array.isArray(selectedRecord.skillProficiencies)
              ? selectedRecord.skillProficiencies.flatMap((prof: any) =>
                  typeof prof === "string"
                    ? [prof]
                    : Object.keys(prof).filter((key) => prof[key] === true)
                )
              : undefined
          },
          {
            label: "Tool Proficiencies",
            value: Array.isArray(selectedRecord.toolProficiencies)
              ? selectedRecord.toolProficiencies.flatMap((prof: any) =>
                  typeof prof === "string" ? [prof] : Object.keys(prof).filter((key) => prof[key] === true)
                )
              : undefined
          },
          {
            label: "Languages",
            value: Array.isArray(selectedRecord.languageProficiencies)
              ? selectedRecord.languageProficiencies.flatMap((lang: any) =>
                  typeof lang === "string"
                    ? [lang]
                    : lang.from ?? Object.keys(lang).filter((key) => lang[key] === true)
                )
              : undefined
          }
        ]
      case "feats":
        return [
          { label: "Source", value: selectedRecord.source },
          { label: "Prerequisite", value: extractPlainText(selectedRecord.prerequisite || "") },
          { label: "Tags", value: selectedRecord.featTags }
        ]
      case "adventures":
        return [
          { label: "Storyline", value: selectedRecord.storyline },
          { label: "Setting", value: selectedRecord.setting },
          { label: "Published", value: selectedRecord.published },
          { label: "Levels", value: selectedRecord.level ? `${selectedRecord.level.min ?? "?"} – ${selectedRecord.level.max ?? "?"}` : undefined }
        ]
      default:
        return [
          { label: "Source", value: selectedRecord.source }
        ]
    }
  }, [category, selectedRecord])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <p>Loading content…</p>
        </div>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-950">
      <header className="border-b border-gray-200/70 dark:border-dark-700/60 bg-white/80 dark:bg-dark-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl ${config.accentClass} p-4 text-white shadow-lg`}> 
              <Icon size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{config.title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {showFilters && shouldShowFilters && (
          <aside className="hidden w-72 shrink-0 border-r border-gray-200/70 bg-white/80 backdrop-blur dark:border-dark-700/70 dark:bg-dark-900/70 lg:block">
            <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category={category} />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
            <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm dark:border-dark-700/60 dark:bg-dark-900/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder={category === "search" ? "Search the entire compendium…" : `Search ${category}…`}
                    className="w-full rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100"
                  />
                </div>

                {shouldShowFilters && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFilters((value) => !value)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-primary-700"
                    >
                      <Filter size={16} />
                      Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            <DataTable
              data={filteredContent}
              columns={columns}
              initialSort={{ columnId: "name" }}
              onRowClick={(record) => setSelectedRecord(record)}
              emptyState={
                <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">No results match your current filters.</div>
              }
            />
          </div>
        </main>
      </div>

      {showFilters && shouldShowFilters && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-full">
            <div className="relative flex-1 overflow-y-auto border-l border-gray-200 bg-white shadow-xl dark:border-dark-700 dark:bg-dark-900">
              <button
                type="button"
                className="absolute right-3 top-3 rounded-full border border-gray-200 bg-white p-1.5 text-gray-500 shadow-sm hover:text-gray-900 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:text-gray-100"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                ×
              </button>
              <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category={category} />
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.name || selectedRecord?.title || ""}
        subtitle={selectedRecord?.source}
      >
        {selectedRecord && <GenericDetail record={selectedRecord} fields={detailFields} />}
      </DetailDrawer>
    </div>
  )
}

