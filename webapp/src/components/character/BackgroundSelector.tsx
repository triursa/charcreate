import { useMemo, useState } from "react"
import { Info } from "lucide-react"

export type BackgroundRecord = {
  id: string
  name: string
  entries?: any
  skillProficiencies?: any
  toolProficiencies?: any
  languages?: any
  feature?: any
  source?: string
}

interface BackgroundSelectorProps {
  backgrounds: BackgroundRecord[]
  searchTerm: string
  traitFilter?: string
  originFilter?: string
  selectedId?: string | null
  onSelect: (background: BackgroundRecord) => void
}

function parseList(value: any): string[] {
  if (!value) return []

  if (typeof value === "string") {
    return [value]
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return entry
        }

        if (typeof entry === "object" && entry !== null) {
          if (typeof entry.choose === "object" && Array.isArray(entry.from)) {
            const count = entry.choose.count ?? 1
            return `Choose ${count} from ${entry.from.join(", ")}`
          }

          if (typeof entry.name === "string") {
            return entry.name
          }

          return Object.values(entry)
            .filter((value): value is string => typeof value === "string")
            .join(" ")
        }

        return null
      })
      .filter((entry): entry is string => Boolean(entry))
  }

  if (typeof value === "object") {
    return Object.values(value)
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry)
  }

  return []
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

function buildSummary(background: BackgroundRecord): string {
  const skills = parseList(background.skillProficiencies)
  const tools = parseList(background.toolProficiencies)
  const languages = parseList(background.languages)
  const feature = parseList(background.feature)

  const parts: string[] = []

  if (skills.length > 0) {
    parts.push(`Skills: ${skills.slice(0, 2).join(", ")}`)
  }

  if (tools.length > 0) {
    parts.push(`Tools: ${tools.slice(0, 2).join(", ")}`)
  }

  if (languages.length > 0) {
    parts.push(`Languages: ${languages.slice(0, 2).join(", ")}`)
  }

  if (parts.length === 0 && feature.length > 0) {
    parts.push(feature[0])
  }

  if (parts.length === 0) {
    const entry = flattenEntries(background.entries)[0]
    if (entry) {
      return entry.slice(0, 140)
    }
    return "No additional summary available"
  }

  return parts.join(" • ")
}

export function extractBackgroundValues(value: any): string[] {
  return parseList(value)
}

export function getBackgroundSummary(background: BackgroundRecord): string {
  return buildSummary(background)
}

export function BackgroundSelector({
  backgrounds,
  searchTerm,
  traitFilter = "all",
  originFilter = "all",
  selectedId,
  onSelect
}: BackgroundSelectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredBackgrounds = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return backgrounds.filter((background) => {
      const summary = buildSummary(background)
      const matchesSearch =
        normalizedSearch.length === 0 ||
        background.name.toLowerCase().includes(normalizedSearch) ||
        summary.toLowerCase().includes(normalizedSearch)

      const skills = parseList(background.skillProficiencies).map((skill) => skill.toLowerCase())
      const matchesTrait =
        traitFilter === "all" || skills.some((skill) => skill.includes(traitFilter.toLowerCase()))

      const originValue = background.source ?? ""
      const matchesOrigin =
        originFilter === "all" || originValue.toLowerCase().includes(originFilter.toLowerCase())

      return matchesSearch && matchesTrait && matchesOrigin
    })
  }, [backgrounds, originFilter, searchTerm, traitFilter])

  if (filteredBackgrounds.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        No backgrounds match your filters. Adjust the search text or filters to explore more options.
      </p>
    )
  }

  return (
    <ul className="space-y-3" role="list">
      {filteredBackgrounds.map((background) => {
        const summary = buildSummary(background)
        const details = [
          ...parseList(background.skillProficiencies).map((value) => `Skill: ${value}`),
          ...parseList(background.toolProficiencies).map((value) => `Tool: ${value}`),
          ...parseList(background.languages).map((value) => `Language: ${value}`),
          ...parseList(background.feature)
        ]
        const entryDetails = flattenEntries(background.entries)
        const isExpanded = expandedId === background.id
        const detailId = `background-detail-${background.id}`

        return (
          <li key={background.id}>
            <div
              className={`rounded-xl border bg-white/60 p-4 shadow-sm transition dark:bg-slate-900/70 ${
                selectedId === background.id
                  ? "border-indigo-500 ring-2 ring-indigo-200 dark:border-indigo-400 dark:ring-indigo-500/40"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(background)}
                  className="flex-1 text-left"
                  aria-pressed={selectedId === background.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{background.name}</h3>
                      {background.source && (
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {background.source}
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
                    setExpandedId((current) => (current === background.id ? null : background.id))
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={detailId}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  <Info size={16} />
                  <span className="sr-only">Toggle details for {background.name}</span>
                </button>
              </div>

              {isExpanded && (details.length > 0 || entryDetails.length > 0) && (
                <div
                  id={detailId}
                  role="region"
                  aria-live="polite"
                  className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  {details.map((detail, index) => (
                    <p key={`detail-${index}`}>{detail}</p>
                  ))}
                  {entryDetails.map((paragraph, index) => (
                    <p key={`entry-${index}`}>{paragraph}</p>
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
