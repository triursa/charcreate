"use client"
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
const ClientTable = dynamic(() => import('../data/ClientTable'), { ssr: false })

function diffEntries(a: any, b: any) {
  const diffs: Array<{ key: string, a: any, b: any }> = []
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]))
  for (const key of keys) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      diffs.push({ key, a: a[key], b: b[key] })
    }
  }
  return diffs
}

export default function AdminDuplicates({ duplicates }: { duplicates: [string, any[]][] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modal, setModal] = useState<{ entry: any, label: string } | null>(null)
  const [flash, setFlash] = useState<{ status: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    const status = searchParams.get('status')
    const message = searchParams.get('message')

    if (!status || !message) return

    const normalizedStatus: 'success' | 'error' = status === 'success' ? 'success' : 'error'
    setFlash({ status: normalizedStatus, message })

    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('message')
    const queryString = params.toString()
    router.replace(queryString ? `/admin?${queryString}` : '/admin', { scroll: false })
  }, [router, searchParams])

  return (
    <div>
      {flash && (
        <div
          className={`mb-4 flex items-start justify-between gap-4 rounded border px-4 py-3 text-sm ${
            flash.status === 'success'
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          <span>{flash.message}</span>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide text-current/80 hover:text-current"
            onClick={() => setFlash(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {duplicates.length === 0 ? (
        <div className="text-slate-500">No duplicates found.</div>
      ) : (
        duplicates.map(([name, group]) => (
          <div key={name} className="mb-8 border rounded p-4">
            <div className="mb-2 font-bold text-lg">{name}</div>
            <div className="grid gap-2">
              {group.map((entry: any, idx: number) => (
                <div key={entry.id} className="border rounded p-2 flex flex-col gap-1 bg-slate-50">
                  <div className="text-sm text-slate-700">ID: {entry.id}</div>
                  <div className="text-sm text-slate-700">Source: {entry.source ?? 'N/A'}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-blue-600 text-white text-xs"
                      onClick={() => setModal({ entry, label: `${name} (ID ${entry.id})` })}
                    >
                      View Full Entry
                    </button>
                    <form method="post" action={`/admin/delete?id=${entry.id}`}>
                      <button type="submit" className="px-2 py-1 rounded bg-red-600 text-white text-xs">
                        Delete
                      </button>
                    </form>
                    <form method="post" action={`/admin/merge?id=${entry.id}&name=${encodeURIComponent(name)}`}>
                      <button type="submit" className="px-2 py-1 rounded bg-green-600 text-white text-xs">
                        Merge
                      </button>
                    </form>
                  </div>
                  {idx > 0 && (
                    <div className="mt-2 text-xs text-slate-700">
                      <span className="font-semibold">Unique fields vs previous:</span>
                      <ul className="list-disc ml-4">
                        {diffEntries(group[idx - 1], entry).map(diff => (
                          <li key={diff.key}><b>{diff.key}</b>: <span className="text-red-700">{JSON.stringify(diff.b)}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(null)}>
          <div className="max-w-lg w-full rounded bg-white p-6 shadow-lg relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-slate-500 hover:text-slate-900" onClick={() => setModal(null)}>&times;</button>
            <h2 className="mb-4 text-lg font-bold">{modal.label}</h2>
            <ClientTable rows={[modal.entry]} columns={Object.keys(modal.entry)} />
          </div>
        </div>
      )}
    </div>
  )
}
