"use client"

import { type ReactNode, useEffect } from "react"
import { X } from "lucide-react"

interface DetailDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  subtitle?: ReactNode
}

export function DetailDrawer({ open, onClose, title, subtitle, children }: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative h-full w-full max-w-3xl overflow-y-auto bg-white dark:bg-dark-900 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200/60 dark:border-dark-700/60 bg-white/95 dark:bg-dark-900/95 backdrop-blur px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
              {subtitle && <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {children}
          </div>
        </div>
      </aside>
    </div>
  )
}

