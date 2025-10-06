"use client"

import { useEffect, useMemo, useState } from "react"
import { Filter, Footprints, Loader2, Search } from "lucide-react"

import { DataTable, type ColumnConfig } from "@/components/DataTable"
import { DetailDrawer } from "@/components/DetailDrawer"
import { FilterPanel } from "@/components/FilterPanel"
import { RaceDetail } from "@/components/details/RaceDetail"
import { getContentByCategory } from "@/lib/clientDataLoader"
import { getFilterOptions, searchAllContent, filterContent } from "@/lib/search"

interface RacesPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function RacesPage({ searchQuery, onSearch }: RacesPageProps) {
  const [races, setRaces] = useState<any[]>([])
  const [filteredRaces, setFilteredRaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [selectedRace, setSelectedRace] = useState<any | null>(null)

  useEffect(() => {
    loadRaces()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, races])

  const loadRaces = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory("races")
      setRaces(data)
      const options = getFilterOptions(data, "races")
      setFilterOptions(options)
    } catch (error) {
      console.error("Error loading races:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...races]

    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ races }, searchQuery, 100)
      result = searchResults.map((r) => r.item)
    }

    result = filterContent(result, "races", filters)
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    setFilteredRaces(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const raceStats = useMemo(() => {
    const total = races.length
    const withFlight = races.filter((race) => race.speed?.fly).length
    const withDarkvision = races.filter((race) =>
      race.entries?.some((entry: any) =>
        Array.isArray(entry.entries)
          ? entry.entries.some((subEntry: any) => typeof subEntry === "string" && subEntry.toLowerCase().includes("darkvision"))
          : typeof entry === "string" && entry.toLowerCase().includes("darkvision")
      )
    ).length
    const sources = new Set(races.map((race) => race.source)).size

    return [
      { label: "Total Races", value: total.toLocaleString() },
      { label: "Flight", value: withFlight.toLocaleString() },
      { label: "Darkvision", value: withDarkvision.toLocaleString() },
      { label: "Sources", value: sources.toLocaleString() }
    ]
  }, [races])

  const columns: ColumnConfig<any>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Race",
        accessor: (race) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{race.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{race.source}</span>
          </div>
        ),
        sortable: true,
        sortValue: (race) => race.name ?? "",
        minWidth: "220px"
      },
      {
        id: "size",
        label: "Size",
        accessor: (race) => (Array.isArray(race.size) ? race.size.join(", ") : race.size || "Medium"),
        sortable: true,
        sortValue: (race) => (Array.isArray(race.size) ? race.size.join(",") : race.size || "")
      },
      {
        id: "speed",
        label: "Speed",
        accessor: (race) => {
          const speeds = []
          if (race.speed?.walk) speeds.push(`${race.speed.walk} ft.`)
          if (race.speed?.fly) speeds.push(`Fly ${race.speed.fly}`)
          if (race.speed?.swim) speeds.push(`Swim ${race.speed.swim}`)
          return speeds.join(" • ") || "30 ft."
        },
        defaultVisible: true,
        minWidth: "140px"
      },
      {
        id: "abilities",
        label: "Ability Boosts",
        accessor: (race) => {
          const bonuses: string[] = []
          race.ability?.forEach((abilityObj: any) => {
            Object.entries(abilityObj).forEach(([ability, value]) => {
              if (ability !== "choose") {
                bonuses.push(`${ability.toUpperCase()} +${value}`)
              }
            })
          })
          return bonuses.join(", ") || "—"
        },
        defaultVisible: false,
        minWidth: "160px"
      },
      {
        id: "traits",
        label: "Traits",
        accessor: (race) => race.traitTags?.slice(0, 3).join(", ") ?? "—",
        defaultVisible: false,
        minWidth: "180px"
      }
    ],
    []
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <p>Loading races…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-950">
      <header className="border-b border-gray-200/70 dark:border-dark-700/60 bg-white/80 dark:bg-dark-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-600/90 p-4 text-white shadow-lg">
              <Footprints size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Lineages & Races</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Compare every published ancestry at a glance. Filter by source, flight, darkvision, and more to find the perfect lineage for your next character.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {raceStats.map((stat) => (
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
            <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="races" />
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
                    placeholder="Search races by name, features, or heritage…"
                    className="w-full rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-emerald-700"
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredRaces}
              columns={columns}
              initialSort={{ columnId: "name" }}
              onRowClick={(race) => setSelectedRace(race)}
              emptyState={
                <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">No races match your current filters.</div>
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
              <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="races" />
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedRace)}
        onClose={() => setSelectedRace(null)}
        title={selectedRace?.name ?? ""}
        subtitle={selectedRace?.source}
      >
        {selectedRace && <RaceDetail race={selectedRace} />}
      </DetailDrawer>
    </div>
  )
}

