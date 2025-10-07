import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

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

  const columns = getColumns(model)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const makeHref = (p: number) => {
    const params = new URLSearchParams()
    params.set('model', model)
    params.set('page', String(p))
    if (q) params.set('q', q)
    return `?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Data Browser</h1>
          <p className="text-sm text-slate-600">Select a dataset, search by name, and paginate through results.</p>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Planner</Link>
      </div>

      <form method="get" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Dataset</span>
          <select name="model" defaultValue={model} className="w-full rounded border px-3 py-2">
            {MODELS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Search by name</span>
          <input name="q" defaultValue={q} placeholder="e.g. Fireball, Elf, Longsword" className="w-full rounded border px-3 py-2" />
        </label>
        <input type="hidden" name="page" value="1" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Apply</button>
      </form>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, idx: number) => (
              <tr key={row.id ?? idx} className="odd:bg-white even:bg-slate-50">
                {columns.map(col => {
                  const val = row[col]
                  let display = val
                  if (val === null || typeof val === 'undefined') display = ''
                  if (typeof val === 'object') display = JSON.stringify(val)
                  return <td key={col} className="px-4 py-2 text-sm">{String(display)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
