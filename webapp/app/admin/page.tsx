import AdminTableManager from './AdminTableManager'
import { ADMIN_MODELS, normalizeAdminModel } from './models'
import { getAdminColumns, getAdminDelegate } from './helpers'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const rawModelParam = searchParams.model
  const model = normalizeAdminModel(Array.isArray(rawModelParam) ? rawModelParam[0] : rawModelParam)
  const delegate = getAdminDelegate(model)

  const rows = await delegate.findMany({
    orderBy: { name: 'asc' },
  })

  const columns = getAdminColumns(model)

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <AdminTableManager model={model} rows={rows} columns={columns} models={ADMIN_MODELS} />
    </div>
  )
}
