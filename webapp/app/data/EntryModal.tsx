"use client"

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

type EntryModalProps = {
  id?: string
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function EntryModal({ id, open, onClose, title, description, children, footer }: EntryModalProps) {
  const titleId = useId()
  const descriptionId = useMemo(() => (description ? `${titleId}-description` : undefined), [description, titleId])
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'Tab' && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector)
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const focusTimeout = window.setTimeout(() => {
      const focusable = dialog?.querySelectorAll<HTMLElement>(focusableSelector)
      if (focusable && focusable.length > 0) {
        ;(closeButtonRef.current ?? focusable[0]).focus()
      } else {
        dialog?.focus()
      }
    }, 0)

    return () => {
      window.clearTimeout(focusTimeout)
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-900"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200/70 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/95">
          <div className="space-y-1">
            <h2 id={titleId} className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
            aria-label="Close entry details"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-slate-800 dark:text-slate-200">{children}</div>

        {footer ? (
          <footer className="border-t border-slate-200/70 bg-white/95 px-6 py-4 dark:border-slate-800/70 dark:bg-slate-900/95">
            <div className="flex flex-wrap justify-end gap-3">{footer}</div>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

