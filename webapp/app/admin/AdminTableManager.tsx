"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ClientTable from '../data/ClientTable'

export type AdminModelOption = {
  key: string
  label: string
  singularLabel: string
}

export type AdminTableManagerProps = {
  model: string
  rows: any[]
  columns: string[]
  models: ReadonlyArray<AdminModelOption>
}

type FlashState = { status: 'success' | 'error'; message: string } | null

type PendingAction = { type: 'add' | 'edit'; entry?: any } | null

export default function AdminTableManager({ model, rows, columns, models }: AdminTableManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [flash, setFlash] = useState<FlashState>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  useEffect(() => {
    const statusParam = searchParams.get('status')
    const messageParam = searchParams.get('message')

    if (!statusParam || !messageParam) return

    const normalizedStatus: 'success' | 'error' = statusParam === 'success' ? 'success' : 'error'
    setFlash({ status: normalizedStatus, message: messageParam })

    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('message')
    router.replace(params.size > 0 ? `/admin?${params.toString()}` : '/admin', { scroll: false })
  }, [router, searchParams])

  const fallbackModel = useMemo(() => models[0] ?? { key: model, label: model, singularLabel: model }, [models, model])
  const activeModel = useMemo(
    () => models.find(option => option.key === model) ?? fallbackModel,
    [fallbackModel, model, models],
  )

  const handleModelChange = (nextModel: string) => {
    if (nextModel === model) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('model', nextModel)
    params.delete('status')
    params.delete('message')
    router.push(`/admin?${params.toString()}`, { scroll: false })
  }

  const renderActions = (entry: any) => {
    const entryId = entry?.id
    const hasId = typeof entryId === 'number' || typeof entryId === 'string'

    return (
      <>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => setPendingAction({ type: 'add' })}
        >
          Add
        </button>
        <button
          type="button"
          className="rounded border border-blue-600 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
          onClick={() => setPendingAction({ type: 'edit', entry })}
        >
          Edit
        </button>
        {hasId ? (
          <form method="post" action={`/admin/delete?model=${model}&id=${entryId}`}>
            <button
              type="submit"
              className="rounded border border-red-600 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="rounded border border-red-300 px-3 py-1 text-sm font-medium text-red-300"
            disabled
          >
            Delete
          </button>
        )}
      </>
    )
  }

  const closeActionModal = () => setPendingAction(null)

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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Manager</h1>
          <p className="text-sm text-slate-600">Manage core datasets and perform quick maintenance tasks.</p>
        </div>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          onClick={() => setPendingAction({ type: 'add' })}
        >
          Add New {activeModel.singularLabel}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b">
        {models.map(option => {
          const isActive = option.key === activeModel.key
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleModelChange(option.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-blue-600 text-blue-700'
                  : 'border-b-2 border-transparent text-slate-600 hover:text-blue-600'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No entries found for this dataset.
        </div>
      ) : (
        <ClientTable rows={rows} columns={columns} renderActions={renderActions} />
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeActionModal}>
          <div className="relative w-full max-w-lg rounded bg-white p-6 shadow-lg" onClick={event => event.stopPropagation()}>
            <button
              type="button"
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-900"
              onClick={closeActionModal}
            >
              &times;
            </button>
            <h2 className="mb-4 text-lg font-semibold">
              {pendingAction.type === 'add' ? `Add new ${activeModel.singularLabel}` : `Edit ${activeModel.singularLabel} #${pendingAction.entry?.id}`}
            </h2>
            <p className="text-sm text-slate-600">
              {pendingAction.type === 'add'
                ? 'Creation tooling will be added soon. In the meantime, compile the details you would like to add.'
                : 'Editing workflows are coming soon. Review the selected entry below as reference.'}
            </p>
            {pendingAction.entry && (
              <pre className="mt-4 max-h-64 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800">
                {JSON.stringify(pendingAction.entry, null, 2)}
              </pre>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={closeActionModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
