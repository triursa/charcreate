import dynamic from 'next/dynamic'
const AdminDuplicates = dynamic(() => import('./AdminDuplicates'), { ssr: false })

export default async function AdminPage() {
  // Default to spells for demo
  const prisma = new (await import('@prisma/client')).PrismaClient()
  const model = 'spell'
  const delegate = prisma[model]
  // Get all entries
  const allEntries = await delegate.findMany()
  // Group by name
  const entries: Record<string, any[]> = {}
  for (const entry of allEntries) {
    if (!entry.name) continue
    if (!entries[entry.name]) entries[entry.name] = []
    entries[entry.name].push(entry)
  }
  // Filter to only duplicates
  const duplicates = Object.entries(entries).filter(([name, group]) => group.length > 1)

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <AdminDuplicates duplicates={duplicates} />
    </div>
  )
}
