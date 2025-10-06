"use client"

import { extractPlainText } from "@/lib/textParser"

interface GenericDetailProps {
  record: any
  fields?: { label: string; value: string | string[] | undefined }[]
}

export function GenericDetail({ record, fields = [] }: GenericDetailProps) {
  const description = extractPlainText(record.entries ?? record.description ?? "")

  return (
    <div className="space-y-8">
      {fields.length > 0 && (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {fields.map(({ label, value }) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null
            const displayValue = Array.isArray(value) ? value.join(", ") : value
            return (
              <div key={label} className="rounded-xl border border-gray-200/70 dark:border-dark-700/70 bg-white/70 dark:bg-dark-900/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{displayValue}</p>
              </div>
            )
          })}
        </section>
      )}

      {description && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-200">{description}</p>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</h3>
        <p className="mt-2 text-base text-gray-700 dark:text-gray-200">
          {record.source}
          {record.page && ` • Page ${record.page}`}
        </p>
      </section>
    </div>
  )
}

