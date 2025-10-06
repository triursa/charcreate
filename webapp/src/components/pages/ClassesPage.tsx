"use client"

import { useEffect, useMemo, useState } from "react"
import { Filter, Loader2, Sword, Search } from "lucide-react"

import { DataTable, type ColumnConfig } from "@/components/DataTable"
import { DetailDrawer } from "@/components/DetailDrawer"
import { FilterPanel } from "@/components/FilterPanel"
import { ClassDetail } from "@/components/details/ClassDetail"
import { getContentByCategory } from "@/lib/clientDataLoader"
import { getFilterOptions, filterContent, searchAllContent } from "@/lib/search"

interface ClassesPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function ClassesPage({ searchQuery, onSearch }: ClassesPageProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [selectedClass, setSelectedClass] = useState<any | null>(null)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, classes])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory("classes")
      setClasses(data)
      const options = getFilterOptions(data, "classes")
      setFilterOptions(options)
    } catch (error) {
      console.error("Error loading classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...classes]

    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ classes }, searchQuery, 100)
      result = searchResults.map((r) => r.item)
    }

    result = filterContent(result, "classes", filters)
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    setFilteredClasses(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const classStats = useMemo(() => {
    const total = classes.length
    const spellcasters = classes.filter((klass) => klass.spellcastingAbility).length
    const martial = classes.filter((klass) =>
      ["fighter", "barbarian", "paladin", "monk", "ranger"].some((keyword) => klass.name?.toLowerCase().includes(keyword))
    ).length
    const sources = new Set(classes.map((klass) => klass.source)).size

    return [
      { label: "Total Classes", value: total.toLocaleString() },
      { label: "Spellcasters", value: spellcasters.toLocaleString() },
      { label: "Martial", value: martial.toLocaleString() },
      { label: "Sources", value: sources.toLocaleString() }
    ]
  }, [classes])

  const columns: ColumnConfig<any>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Class",
        accessor: (klass) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{klass.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{klass.source}</span>
          </div>
        ),
        sortable: true,
        sortValue: (klass) => klass.name ?? "",
        minWidth: "220px"
      },
      {
        id: "hitdie",
        label: "Hit Die",
        accessor: (klass) => `d${klass.hd?.number ?? 8}`,
        sortable: true,
        sortValue: (klass) => klass.hd?.number ?? 8,
        align: "center",
        minWidth: "100px"
      },
      {
        id: "primary",
        label: "Primary Ability",
        accessor: (klass) => (klass.primaryAbility ? klass.primaryAbility.map((ability: string) => ability.toUpperCase()).join(", ") : "—"),
        defaultVisible: true,
        minWidth: "160px"
      },
      {
        id: "spellcasting",
        label: "Spellcasting",
        accessor: (klass) => (klass.spellcastingAbility ? klass.spellcastingAbility.toUpperCase() : "—"),
        defaultVisible: false,
        minWidth: "140px"
      },
      {
        id: "subclasses",
        label: "Subclasses",
        accessor: (klass) => (klass.subclasses ? klass.subclasses.length : 0),
        sortable: true,
        sortValue: (klass) => klass.subclasses?.length ?? 0,
        align: "center",
        defaultVisible: false,
        minWidth: "120px"
      }
    ],
    []
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <p>Loading classes…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-rose-50 via-white to-amber-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-950">
      <header className="border-b border-gray-200/70 dark:border-dark-700/60 bg-white/80 dark:bg-dark-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-rose-600/90 p-4 text-white shadow-lg">
              <Sword size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Character Classes</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Weigh your class options with sortable stats, quick filters, and instant access to class features, spellcasting, and equipment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {classStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-center shadow-sm dark:border-dark-700/60 dark:bg-dark-900/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {showFilters && (
          <aside className="hidden w-72 shrink-0 border-r border-gray-200/70 bg-white/80 backdrop-blur dark:border-dark-700/70 dark:bg-dark-900/70 lg:block">
            <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="classes" />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
            <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm dark:border-dark-700/60 dark:bg-dark-900/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder="Search classes by name or archetype…"
                    className="w-full rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-rose-700"
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredClasses}
              columns={columns}
              initialSort={{ columnId: "name" }}
              onRowClick={(klass) => setSelectedClass(klass)}
              emptyState={
                <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">No classes match your current filters.</div>
              }
            />
          </div>
        </main>
      </div>

      {showFilters && (
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
              <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="classes" />
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        title={selectedClass?.name ?? ""}
        subtitle={selectedClass?.source}
      >
        {selectedClass && <ClassDetail klass={selectedClass} />}
      </DetailDrawer>
    </div>
  )
}

