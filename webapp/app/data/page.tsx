
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const ClientTable = dynamic(() => import('./ClientTable'), { ssr: false })

const prisma = new PrismaClient()
const PAGE_SIZE = 20
const MODELS = [
  { key: 'spell', label: 'Spells' },
  { key: 'race', label: 'Races' },
  { key: 'item', label: 'Items' },
  { key: 'background', label: 'Backgrounds' },
  { key: 'feat', label: 'Feats' },
  { key: 'class', label: 'Classes' },
]

type SearchParams = {
  model?: string
  page?: string
  q?: string
}

function getDelegate(model: string | undefined) {
  switch (model) {
    case 'spell': return prisma.spell
    case 'race': return prisma.race
    case 'item': return prisma.item
    case 'background': return prisma.background
    case 'feat': return prisma.feat
    case 'class': return prisma.class
    default: return prisma.spell
  }
}

export default async function DataPage({ searchParams }: { searchParams: SearchParams }) {
  const model = searchParams.model ?? 'spell'
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const q = (searchParams.q ?? '').trim()

  const delegate = getDelegate(model)

  const where: any = q
    ? { name: { contains: q, mode: 'insensitive' } }
    : undefined

  const total = await delegate.count({ where })
  const rows = await delegate.findMany({
    where,
    orderBy: { name: 'asc' },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  })

  function getColumns(model: string | undefined) {
    switch (model) {
      case 'spell': return ['name', 'level', 'school']
      case 'race': return ['name', 'source']
      case 'item': return ['name', 'type', 'rarity', 'value', 'weight']
      case 'background': return ['name']
      case 'feat': return ['name']
      case 'class': return ['name', 'hitDice']
      default: return ['name']
    }
  }
  const columns = getColumns(model)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const makeHref = (p: number) => {
    const params = new URLSearchParams()
    params.set('model', model)
    params.set('page', String(p))
    if (q) params.set('q', q)
    return `?${params.toString()}`
  }

  // Modal state must be client-side, so wrap table in a client component
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Data Browser</h1>
          <p className="text-sm text-slate-600">Browse and search all datasets.</p>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Planner</Link>
      </div>

      <div className="mb-6 flex gap-2 border-b">
        {MODELS.map(m => {
          const isActive = m.key === model
          const params = new URLSearchParams()
          params.set('model', m.key)
          params.set('page', '1')
          if (q) params.set('q', q)
          return (
            <Link
              key={m.key}
              href={`?${params.toString()}`}
              className={
                'px-4 py-2 -mb-px border-b-2 text-sm font-medium ' +
                (isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-600 hover:text-blue-600')
              }
              scroll={false}
            >
              {m.label}
            </Link>
          )
        })}
      </div>

      <form method="get" className="mb-6 flex gap-2 items-center">
        <input name="q" defaultValue={q} placeholder="Search by name..." className="w-full rounded border px-3 py-2" />
        <input type="hidden" name="model" value={model} />
        <input type="hidden" name="page" value="1" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Search</button>
      </form>

      <ClientTable rows={rows} columns={columns} />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">Total: {total} · Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <Link href={makeHref(Math.max(1, page - 1))} className="rounded border px-3 py-1 text-sm disabled:opacity-50" aria-disabled={page <= 1}>Prev</Link>
          <Link href={makeHref(Math.min(totalPages, page + 1))} className="rounded border px-3 py-1 text-sm disabled:opacity-50" aria-disabled={page >= totalPages}>Next</Link>
        </div>
      </div>
    </div>
  )
}

// All client code is now in ClientTable.tsx
