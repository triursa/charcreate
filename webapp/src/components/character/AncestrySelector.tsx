import { useMemo, useState } from "react"
import { Info } from "lucide-react"

export interface AncestryRecord {
  id: string
  name: string
  source?: string
  size?: any
  speed?: any
  ability?: any
  traitTags?: string[]
  languageProficiencies?: any
  entries?: any
}

interface AncestrySelectorProps {
  ancestries: AncestryRecord[]
  searchTerm: string
  traitFilter?: string
  originFilter?: string
  selectedId?: string | null
  onSelect: (ancestry: AncestryRecord) => void
}

function formatAbilitySummary(ability: any): string | null {
  if (!ability) return null

  if (Array.isArray(ability)) {
    const parts = ability
      .map((entry) => {
        if (typeof entry === "object" && entry !== null) {
          return Object.entries(entry)
            .filter(([_, value]) => typeof value === "number")
            .map(([key, value]) => `${key.toUpperCase()} +${value}`)
            .join(", ")
        }
        if (typeof entry === "string") {
          return entry
        }
        return null
      })
      .filter(Boolean)

    if (parts.length > 0) {
      return parts.join(", ")
    }
  }

  if (typeof ability === "object" && ability !== null) {
    const numeric = Object.entries(ability)
      .filter(([_, value]) => typeof value === "number")
      .map(([key, value]) => `${key.toUpperCase()} +${value}`)

    if (numeric.length > 0) {
      return numeric.join(", ")
    }
  }

  if (typeof ability === "string") {
    return ability
  }

  return null
}

function formatSpeedSummary(speed: any): string | null {
  if (!speed) return null

  if (typeof speed === "number") {
    return `${speed} ft speed`
  }

  if (typeof speed === "object") {
    if (typeof speed.walk === "number") {
      return `${speed.walk} ft speed`
    }

    const entries = Object.entries(speed)
      .filter(([key]) => key !== "choose")
      .map(([key, value]) => `${key} ${value}`)

    if (entries.length > 0) {
      return entries.join(", ")
    }
  }

  return null
}

function flattenEntries(entries: any): string[] {
  if (!entries) return []

  if (typeof entries === "string") {
    return [entries]
  }

  if (Array.isArray(entries)) {
    return entries.flatMap((entry) => flattenEntries(entry)).filter(Boolean)
  }

  if (typeof entries === "object") {
    if (Array.isArray(entries.entries)) {
      return flattenEntries(entries.entries)
    }

    if (typeof entries.entries === "string") {
      return [entries.entries]
    }

    const values = Object.values(entries)
    if (values.length > 0) {
      return values.flatMap((value) => flattenEntries(value)).filter(Boolean)
    }
  }

  return []
}

function buildSummary(ancestry: AncestryRecord): string {
  const abilitySummary = formatAbilitySummary(ancestry.ability)
  const speedSummary = formatSpeedSummary(ancestry.speed)
  const traitSummary = ancestry.traitTags?.slice(0, 2).join(", ")

  const parts = [abilitySummary, speedSummary, traitSummary].filter(Boolean)

  if (parts.length === 0) {
    const entry = flattenEntries(ancestry.entries)[0]
    if (entry) {
      return entry.slice(0, 140)
    }
    return "No additional summary available"
  }

  return parts.join(" • ")
}

export function getAncestrySummary(ancestry: AncestryRecord): string {
  return buildSummary(ancestry)
}

export function AncestrySelector({
  ancestries,
  searchTerm,
  traitFilter = "all",
  originFilter = "all",
  selectedId,
  onSelect
}: AncestrySelectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredAncestries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return ancestries.filter((ancestry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        ancestry.name.toLowerCase().includes(normalizedSearch) ||
        buildSummary(ancestry).toLowerCase().includes(normalizedSearch)

      const matchesTrait =
        traitFilter === "all" ||
        (Array.isArray(ancestry.traitTags) && ancestry.traitTags.some((tag) => tag.toLowerCase() === traitFilter.toLowerCase()))

      const originValue = ancestry.source ?? ""
      const matchesOrigin =
        originFilter === "all" || originValue.toLowerCase().includes(originFilter.toLowerCase())

      return matchesSearch && matchesTrait && matchesOrigin
    })
  }, [ancestries, originFilter, searchTerm, traitFilter])

  if (filteredAncestries.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        No ancestries match your filters. Try adjusting the search text or filter values.
      </p>
    )
  }

  return (
    <ul className="space-y-3" role="list">
      {filteredAncestries.map((ancestry) => {
        const summary = buildSummary(ancestry)
        const detailParagraphs = flattenEntries(ancestry.entries)
        const isExpanded = expandedId === ancestry.id
        const detailId = `ancestry-detail-${ancestry.id}`

        return (
          <li key={ancestry.id}>
            <div
              className={`rounded-xl border bg-white/60 p-4 shadow-sm transition dark:bg-slate-900/70 ${
                selectedId === ancestry.id
                  ? "border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-500/40"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(ancestry)}
                  className="flex-1 text-left"
                  aria-pressed={selectedId === ancestry.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{ancestry.name}</h3>
                      {ancestry.source && (
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {ancestry.source}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{summary}</p>
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setExpandedId((current) => (current === ancestry.id ? null : ancestry.id))
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={detailId}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  <Info size={16} />
                  <span className="sr-only">Toggle details for {ancestry.name}</span>
                </button>
              </div>

              {isExpanded && detailParagraphs.length > 0 && (
                <div
                  id={detailId}
                  role="region"
                  aria-live="polite"
                  className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  {detailParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
