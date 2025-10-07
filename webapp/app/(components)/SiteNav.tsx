import Link from 'next/link'

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/charcreate', label: 'Character Creator' },
  { href: '/data', label: 'Data' },
  { href: '/admin', label: 'Admin' },
]

export function SiteNav() {
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
        <nav aria-label="Primary" className="flex flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1 text-slate-700 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-200 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default SiteNav

