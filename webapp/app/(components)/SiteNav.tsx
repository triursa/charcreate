"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useTheme } from '@/app/providers'
import { Moon, Sun } from 'lucide-react'

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/charcreate', label: 'Character Creator' },
  { href: '/data', label: 'Data' },
  { href: '/admin', label: 'Admin' },
  { href: '/documentation', label: 'Documentation' }
]

export function SiteNav() {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const pathname = usePathname()
  const ThemeIcon = isDarkMode ? Sun : Moon
  const toggleLabel = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/75">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 transition hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-300"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-sm font-bold text-white shadow-md">
            CC
          </span>
          <span className="text-lg">CharCreate</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium sm:gap-x-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-md px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300'
                    : 'text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={toggleLabel}
            aria-pressed={isDarkMode}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900"
          >
            <ThemeIcon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

export default SiteNav

