import dynamic from 'next/dynamic'
import { loadSpellDuplicates } from './helpers'

const AdminDuplicates = dynamic(() => import('./AdminDuplicates'), { ssr: false })

export default async function AdminPage() {
  const duplicates = await loadSpellDuplicates()

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <AdminDuplicates duplicates={duplicates} />
    </div>
  )
}
