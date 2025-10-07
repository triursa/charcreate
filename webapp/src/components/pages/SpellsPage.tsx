"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Filter, Loader2, Sparkles, Search } from "lucide-react"

import { DataTable, type ColumnConfig } from "@/components/DataTable"
import { DetailDrawer } from "@/components/DetailDrawer"
import { FilterPanel } from "@/components/FilterPanel"
import { SpellDetail } from "@/components/details/SpellDetail"
import { searchAllContent, filterContent, getFilterOptions } from "@/lib/search"
import { formatRange, formatSpellLevel, getSchoolName } from "@/lib/textParser"
import { useContentData } from "@/state/content-data"

interface SpellsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function SpellsPage({ searchQuery, onSearch }: SpellsPageProps) {
  const [filteredSpells, setFilteredSpells] = useState<any[]>([])
  const { content, getCategoryData } = useContentData()
  const cachedSpells = content.spells
  const spells = useMemo(() => cachedSpells ?? [], [cachedSpells])
  const hasLoadedSpells = cachedSpells !== undefined
  const [loading, setLoading] = useState(!hasLoadedSpells)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [selectedSpell, setSelectedSpell] = useState<any | null>(null)

  useEffect(() => {
    if (hasLoadedSpells) {
      setLoading(false)
      return
    }

    let isMounted = true

    setLoading(true)
    getCategoryData("spells")
      .catch((error) => {
        console.error("Error loading spells:", error)
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [getCategoryData, hasLoadedSpells])

  useEffect(() => {
    if (!hasLoadedSpells) {
      return
    }

    const options = getFilterOptions(spells, "spells")
    setFilterOptions(options)
  }, [hasLoadedSpells, spells])

  const applyFiltersAndSearch = useCallback(() => {
    let result = [...spells]

    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ spells }, searchQuery, 100)
      result = searchResults.map((r) => r.item)
    }

    result = filterContent(result, "spells", filters)

    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))

    setFilteredSpells(result)
  }, [filters, searchQuery, spells])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [applyFiltersAndSearch])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const spellStats = useMemo(() => {
    const total = spells.length
    const cantrips = spells.filter((spell) => spell.level === 0).length
    const highLevel = spells.filter((spell) => spell.level >= 6).length
    const schools = new Set(spells.map((spell) => getSchoolName(spell.school || ""))).size

    return [
      { label: "Total Spells", value: total.toLocaleString() },
      { label: "Cantrips", value: cantrips.toLocaleString() },
      { label: "High Level", value: highLevel.toLocaleString() },
      { label: "Schools", value: schools.toLocaleString() }
    ]
  }, [spells])

  const columns: ColumnConfig<any>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Spell",
        accessor: (spell) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{spell.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatSpellLevel(spell.level ?? 0)} • {getSchoolName(spell.school ?? "")}
            </span>
          </div>
        ),
        sortable: true,
        sortValue: (spell) => spell.name ?? "",
        minWidth: "220px"
      },
      {
        id: "level",
        label: "Level",
        accessor: (spell) => formatSpellLevel(spell.level ?? 0),
        sortable: true,
        sortValue: (spell) => spell.level ?? 0,
        align: "center",
        minWidth: "120px"
      },
      {
        id: "school",
        label: "School",
        accessor: (spell) => getSchoolName(spell.school ?? ""),
        sortable: true,
        sortValue: (spell) => getSchoolName(spell.school ?? "")
      },
      {
        id: "casting",
        label: "Casting Time",
        accessor: (spell) => {
          if (!spell.time?.[0]) return "—"
          const time = spell.time[0]
          return `${time.number} ${time.unit}${time.number > 1 ? "s" : ""}`
        },
        sortable: true,
        sortValue: (spell) => {
          if (!spell.time?.[0]) return ""
          const time = spell.time[0]
          return `${time.number}-${time.unit}`
        },
        minWidth: "150px"
      },
      {
        id: "range",
        label: "Range",
        accessor: (spell) => formatRange(spell.range),
        sortable: true,
        sortValue: (spell) => formatRange(spell.range),
        minWidth: "140px"
      },
      {
        id: "components",
        label: "Components",
        accessor: (spell) => {
          const components = []
          if (spell.components?.v) components.push("V")
          if (spell.components?.s) components.push("S")
          if (spell.components?.m) components.push("M")
          return components.join(", ") || "—"
        },
        defaultVisible: false,
        minWidth: "120px"
      },
      {
        id: "source",
        label: "Source",
        accessor: (spell) => `${spell.source}${spell.page ? ` • p.${spell.page}` : ""}`,
        sortable: true,
        sortValue: (spell) => spell.source ?? "",
        minWidth: "160px"
      }
    ],
    []
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <p>Loading spells…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-950">
      <header className="border-b border-gray-200/70 dark:border-dark-700/60 bg-white/80 dark:bg-dark-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary-600/90 p-4 text-white shadow-lg">
              <Sparkles size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Spell Compendium</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Explore every spell in the 5e ruleset, tailor your results with precision filters, and drill into full spell details with a single click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {spellStats.map((stat) => (
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
            <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="spells" />
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
                    placeholder="Search spells by name, effect, or description…"
                    className="w-full rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100"
                  />
                </div>

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
              </div>
            </div>

            <DataTable
              data={filteredSpells}
              columns={columns}
              initialSort={{ columnId: "name" }}
              onRowClick={(spell) => setSelectedSpell(spell)}
              emptyState={
                <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                  No spells match your current filters.
                </div>
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
              <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="spells" />
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedSpell)}
        onClose={() => setSelectedSpell(null)}
        title={selectedSpell?.name ?? ""}
        subtitle={selectedSpell ? `${formatSpellLevel(selectedSpell.level ?? 0)} • ${getSchoolName(selectedSpell.school ?? "")}` : undefined}
      >
        {selectedSpell && <SpellDetail spell={selectedSpell} />}
      </DetailDrawer>
    </div>
  )
}

