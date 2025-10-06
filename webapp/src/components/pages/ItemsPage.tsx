"use client"

import { useEffect, useMemo, useState } from "react"
import { Filter, Loader2, Package, Search } from "lucide-react"

import { DataTable, type ColumnConfig } from "@/components/DataTable"
import { DetailDrawer } from "@/components/DetailDrawer"
import { FilterPanel } from "@/components/FilterPanel"
import { ItemDetail } from "@/components/details/ItemDetail"
import { getContentByCategory } from "@/lib/clientDataLoader"
import { filterContent, getFilterOptions, searchAllContent } from "@/lib/search"

interface ItemsPageProps {
  searchQuery: string
  onSearch: (query: string) => void
}

const rarityOrder = ["common", "uncommon", "rare", "very rare", "legendary", "artifact"]

export function ItemsPage({ searchQuery, onSearch }: ItemsPageProps) {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    source: [],
    level: [],
    rarity: [],
    school: []
  })
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, items])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getContentByCategory("items")
      setItems(data)
      const options = getFilterOptions(data, "items")
      setFilterOptions(options)
    } catch (error) {
      console.error("Error loading items:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let result = [...items]

    if (searchQuery.trim()) {
      const searchResults = searchAllContent({ items }, searchQuery, 100)
      result = searchResults.map((r) => r.item)
    }

    result = filterContent(result, "items", filters)
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    setFilteredItems(result)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const itemStats = useMemo(() => {
    const total = items.length
    const magic = items.filter((item) => item.rarity && item.rarity !== "None").length
    const weapons = items.filter((item) => item.type?.toLowerCase().includes("weapon")).length
    const sources = new Set(items.map((item) => item.source)).size

    return [
      { label: "Total Items", value: total.toLocaleString() },
      { label: "Magic Items", value: magic.toLocaleString() },
      { label: "Weapons", value: weapons.toLocaleString() },
      { label: "Sources", value: sources.toLocaleString() }
    ]
  }, [items])

  const columns: ColumnConfig<any>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Item",
        accessor: (item) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.source}</span>
          </div>
        ),
        sortable: true,
        sortValue: (item) => item.name ?? "",
        minWidth: "220px"
      },
      {
        id: "type",
        label: "Type",
        accessor: (item) => item.type || "—",
        sortable: true,
        sortValue: (item) => item.type ?? "",
        minWidth: "160px"
      },
      {
        id: "rarity",
        label: "Rarity",
        accessor: (item) => item.rarity || "—",
        sortable: true,
        sortValue: (item) => rarityOrder.indexOf((item.rarity || "common").toLowerCase()),
        minWidth: "140px"
      },
      {
        id: "attunement",
        label: "Attunement",
        accessor: (item) => (item.reqAttune ? "Required" : "—"),
        defaultVisible: false,
        minWidth: "120px"
      },
      {
        id: "value",
        label: "Value (gp)",
        accessor: (item) => (item.value ? item.value : "—"),
        align: "center",
        defaultVisible: false,
        minWidth: "120px"
      },
      {
        id: "weight",
        label: "Weight",
        accessor: (item) => (item.weight ? `${item.weight} lb.` : "—"),
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
          <p>Loading items…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-950">
      <header className="border-b border-gray-200/70 dark:border-dark-700/60 bg-white/80 dark:bg-dark-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-indigo-600/90 p-4 text-white shadow-lg">
              <Package size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Magic Items & Equipment</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                Browse a refined catalogue of D&D gear. Toggle visibility of key stats, filter by rarity or source, and open full item descriptions in place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {itemStats.map((stat) => (
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
            <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="items" />
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
                    placeholder="Search items by name, effect, or rarity…"
                    className="w-full rounded-full border border-gray-200 bg-white px-12 py-3 text-sm font-medium text-gray-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-indigo-700"
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredItems}
              columns={columns}
              initialSort={{ columnId: "name" }}
              onRowClick={(item) => setSelectedItem(item)}
              emptyState={
                <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">No items match your current filters.</div>
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
              <FilterPanel filters={filters} filterOptions={filterOptions} onFilterChange={handleFilterChange} category="items" />
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name ?? ""}
        subtitle={selectedItem?.source}
      >
        {selectedItem && <ItemDetail item={selectedItem} />}
      </DetailDrawer>
    </div>
  )
}

