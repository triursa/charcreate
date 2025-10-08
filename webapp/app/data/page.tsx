
import Link from 'next/link'
import dynamic from 'next/dynamic'

import { ADMIN_MODELS, normalizeAdminModel } from '../admin/models'
import { getAdminColumns, getAdminDelegate } from '../admin/helpers'

const DataBrowserClient = dynamic(() => import('./DataBrowserPlannerClient'), { ssr: false })

const PAGE_SIZE = 20
const MODELS = ADMIN_MODELS.map(({ key, label }) => ({ key, label }))

type RawSearchParams = { [key: string]: string | string[] | undefined }

type FilterState = {
  trait: string[]
  origin: string[]
  source: string[]
  tag: string[]
}

type FilterOptions = FilterState

const DEFAULT_FILTER_STATE: FilterState = {
  trait: [],
  origin: [],
  source: [],
  tag: [],
}

const SORT_FALLBACK = 'name:asc'

function parseMultiParam(value: string | string[] | undefined): string[] {
  if (!value) return []
  const normalized = Array.isArray(value) ? value : value.split(',')
  const flat = normalized
    .flatMap(entry => entry.split(','))
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)
  return Array.from(new Set(flat))
}

type SortField = 'name' | 'source' | 'popularity' | 'origin'
type SortDirection = 'asc' | 'desc'

function parseSortParam(raw: string | undefined): { field: SortField; direction: SortDirection; value: string } {
  if (!raw) {
    return { field: 'name', direction: 'asc', value: SORT_FALLBACK }
  }

  const [fieldPart, directionPart] = raw.split(':')
  const field = (['name', 'source', 'popularity', 'origin'] as SortField[]).includes(fieldPart as SortField)
    ? (fieldPart as SortField)
    : 'name'
  const direction = directionPart === 'desc' ? 'desc' : 'asc'
  return { field, direction, value: `${field}:${direction}` }
}

function buildJsonArrayCondition(field: string, value: string) {
  return {
    [field]: {
      path: '$',
      array_contains: value,
    },
  }
}

function buildStringMatchCondition(field: string, values: string[]) {
  return {
    OR: values.map(value => ({ [field]: value })),
  }
}

async function loadFilterOptions(delegate: any, columnSet: Set<string>): Promise<FilterOptions> {
  const selection: Record<string, boolean> = {}

  if (columnSet.has('traitTags')) selection.traitTags = true
  if (columnSet.has('origin')) selection.origin = true
  if (columnSet.has('source')) selection.source = true
  if (columnSet.has('tags')) selection.tags = true
  if (columnSet.has('miscTags')) selection.miscTags = true
  if (columnSet.has('areaTags')) selection.areaTags = true
  if (columnSet.has('featureType')) selection.featureType = true
  if (columnSet.has('skillProficiencies')) selection.skillProficiencies = true
  if (columnSet.has('damageInflict')) selection.damageInflict = true
  if (columnSet.has('damageResist')) selection.damageResist = true
  if (columnSet.has('damageImmune')) selection.damageImmune = true
  if (columnSet.has('damageVulnerable')) selection.damageVulnerable = true

  if (Object.keys(selection).length === 0) {
    return DEFAULT_FILTER_STATE
  }

  const records: any[] = await delegate.findMany({ select: selection })

  const traitSet = new Set<string>()
  const originSet = new Set<string>()
  const sourceSet = new Set<string>()
  const tagSet = new Set<string>()

  const addFromJson = (value: unknown, target: Set<string>) => {
    if (!value) return
    if (Array.isArray(value)) {
      value.filter((entry): entry is string => typeof entry === 'string').forEach(entry => target.add(entry))
      return
    }
    if (typeof value === 'string') {
      target.add(value)
    }
  }

  for (const record of records) {
    if ('traitTags' in record) {
      addFromJson(record.traitTags, traitSet)
      addFromJson(record.traitTags, tagSet)
    }
    if ('featureType' in record) {
      addFromJson(record.featureType, traitSet)
    }
    if ('skillProficiencies' in record) {
      addFromJson(record.skillProficiencies, traitSet)
    }
    if ('origin' in record && typeof record.origin === 'string') {
      originSet.add(record.origin)
    }
    if ('source' in record && typeof record.source === 'string') {
      sourceSet.add(record.source)
    }
    if ('tags' in record) addFromJson(record.tags, tagSet)
    if ('miscTags' in record) addFromJson(record.miscTags, tagSet)
    if ('areaTags' in record) addFromJson(record.areaTags, tagSet)
    if ('damageInflict' in record) addFromJson(record.damageInflict, tagSet)
    if ('damageResist' in record) addFromJson(record.damageResist, tagSet)
    if ('damageImmune' in record) addFromJson(record.damageImmune, tagSet)
    if ('damageVulnerable' in record) addFromJson(record.damageVulnerable, tagSet)
  }

  const toSortedArray = (set: Set<string>) => Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b))

  return {
    trait: toSortedArray(traitSet),
    origin: toSortedArray(originSet),
    source: toSortedArray(sourceSet),
    tag: toSortedArray(tagSet),
  }
}

export default async function DataPage({ searchParams }: { searchParams: RawSearchParams }) {
  const rawModel = Array.isArray(searchParams.model) ? searchParams.model[0] : searchParams.model
  const model = normalizeAdminModel(rawModel)
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const qParam = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q
  const q = (qParam ?? '').trim()

  const selectedFilters: FilterState = {
    trait: parseMultiParam(searchParams.trait),
    origin: parseMultiParam(searchParams.origin),
    source: parseMultiParam(searchParams.source),
    tag: parseMultiParam(searchParams.tag),
  }

  const sortParamRaw = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort
  const parsedSort = parseSortParam(sortParamRaw)

  const delegate = getAdminDelegate(model)
  const columns = getAdminColumns(model)
  const columnSet = new Set(columns)

  const whereClauses: any[] = []

  if (q) {
    whereClauses.push({ name: { contains: q, mode: 'insensitive' } })
  }

  if (selectedFilters.trait.length) {
    const traitFields = ['traitTags', 'traits', 'featureType', 'skillProficiencies'].filter(field => columnSet.has(field))
    if (traitFields.length) {
      whereClauses.push({
        OR: selectedFilters.trait.map(value => ({
          OR: traitFields.map(field => buildJsonArrayCondition(field, value)),
        })),
      })
    }
  }

  if (selectedFilters.origin.length) {
    const originField = columnSet.has('origin') ? 'origin' : columnSet.has('source') ? 'source' : null
    if (originField) {
      whereClauses.push(buildStringMatchCondition(originField, selectedFilters.origin))
    }
  }

  if (selectedFilters.source.length && columnSet.has('source')) {
    whereClauses.push(buildStringMatchCondition('source', selectedFilters.source))
  }

  if (selectedFilters.tag.length) {
    const tagFields = [
      'tags',
      'miscTags',
      'areaTags',
      'damageInflict',
      'damageResist',
      'damageImmune',
      'damageVulnerable',
      'traitTags',
    ].filter(field => columnSet.has(field))
    if (tagFields.length) {
      whereClauses.push({
        OR: selectedFilters.tag.map(value => ({
          OR: tagFields.map(field => buildJsonArrayCondition(field, value)),
        })),
      })
    }
  }

  const where = whereClauses.length ? { AND: whereClauses } : undefined

  const orderByEntries: any[] = []
  const requestedSortField = parsedSort.field === 'origin' && !columnSet.has('origin') && columnSet.has('source')
    ? 'source'
    : parsedSort.field

  if (requestedSortField === 'source' && columnSet.has('source')) {
    orderByEntries.push({ source: parsedSort.direction })
  } else if (requestedSortField === 'origin' && columnSet.has('origin')) {
    orderByEntries.push({ origin: parsedSort.direction })
  } else if (requestedSortField === 'popularity' && columnSet.has('popularity')) {
    orderByEntries.push({ popularity: parsedSort.direction })
  } else {
    orderByEntries.push({ name: parsedSort.direction })
  }

  if (!orderByEntries.some(entry => 'name' in entry)) {
    orderByEntries.push({ name: 'asc' })
  }

  const orderBy = orderByEntries.length === 1 ? orderByEntries[0] : orderByEntries

  const [filterOptions, total] = await Promise.all([
    loadFilterOptions(delegate, columnSet),
    delegate.count({ where }),
  ])

  const rows = await delegate.findMany({
    where,
    orderBy,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentModel = MODELS.find(entry => entry.key === model)

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-slate-700 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/data" className="hover:text-slate-700 hover:underline">
                Data
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">{currentModel?.label ?? 'All Data'}</li>
          </ol>
        </nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Data Browser</h1>
            <p className="text-sm text-slate-600">Browse and search all datasets.</p>
          </div>
          <Link href="/charcreate" className="text-sm text-blue-600 hover:underline">Back to Planner</Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[220px,1fr]">
        <aside>
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Categories
            </p>
            <nav className="flex flex-col gap-1 text-sm" aria-label="Data categories">
              {MODELS.map(m => {
                const isActive = m.key === model
                const params = new URLSearchParams()
                params.set('model', m.key)
                params.set('page', '1')
                if (q) params.set('q', q)
                if (parsedSort.value && parsedSort.value !== SORT_FALLBACK) params.set('sort', parsedSort.value)
                return (
                  <Link
                    key={m.key}
                    href={`?${params.toString()}`}
                    className={`rounded-md px-3 py-2 font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    scroll={false}
                  >
                    {m.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0">
          <DataBrowserClient
            model={model}
            rows={rows}
            columns={columns}
            searchTerm={q}
            total={total}
            page={page}
            totalPages={totalPages}
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            sort={parsedSort.value}
          />
        </div>
      </div>
    </div>
  )
}
