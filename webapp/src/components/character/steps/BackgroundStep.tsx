'use client'

export interface BackgroundStepProps {
  selectedName?: string
  summary?: string
  placeholderSummary: string
  error?: string | null
  onBrowse: () => void
  onClear?: () => void
}

export function BackgroundStep({
  selectedName,
  summary,
  placeholderSummary,
  error,
  onBrowse,
  onClear
}: BackgroundStepProps) {
  const hasSelection = Boolean(selectedName)

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Choose a Background</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Backgrounds grant proficiencies, gear, and roleplaying hooks that inform your hero&apos;s past.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Selection</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {selectedName ?? 'No background selected yet'}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {hasSelection ? summary ?? placeholderSummary : placeholderSummary}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-300/60 bg-red-100/70 p-4 text-sm text-red-700 shadow-sm dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBrowse}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            >
              Browse backgrounds
            </button>
            {hasSelection && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:underline dark:text-slate-300"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
