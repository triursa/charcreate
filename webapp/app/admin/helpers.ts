import { Prisma, PrismaClient, Spell } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminModelMeta, type AdminModelKey } from './models'

export {
  ADMIN_MODELS,
  DEFAULT_ADMIN_MODEL,
  getAdminModelMeta,
  normalizeAdminModel,
  parseAdminModelParam,
  type AdminModelKey,
  type AdminModelMeta,
} from './models'

export type DuplicateEntry = { id: number; [key: string]: unknown }
export type DuplicateGroup<T extends DuplicateEntry = DuplicateEntry> = {
  identifier: string
  entries: T[]
}

type AdminDuplicateHandler<T extends DuplicateEntry = DuplicateEntry> = {
  load(client?: PrismaClient): Promise<DuplicateGroup<T>[]>
  merge(params: {
    canonicalId: number
    group: DuplicateGroup<T>
    client?: PrismaClient
  }): Promise<{ deletedIds: number[] }>
}

export class UnsupportedDuplicateOperationError extends Error {}

const ADMIN_DELEGATE_MAP: Record<AdminModelKey, (client: PrismaClient) => any> = {
  spell: client => client.spell,
  race: client => client.race,
  item: client => client.item,
  background: client => client.background,
  feat: client => client.feat,
  class: client => client.class,
}

const ADMIN_COLUMN_CACHE = new Map<AdminModelKey, string[]>()

const ADMIN_DUPLICATE_HANDLERS: Partial<Record<AdminModelKey, AdminDuplicateHandler<any>>> = {
  spell: {
    async load(client = prisma) {
      const allEntries: Spell[] = await client.spell.findMany()
      const grouped = new Map<string, Spell[]>()

      for (const entry of allEntries) {
        const identifier = entry.name?.trim()
        if (!identifier) continue
        const entries = grouped.get(identifier) ?? []
        entries.push(entry)
        grouped.set(identifier, entries)
      }

      return Array.from(grouped.entries())
        .filter(([, entries]) => entries.length > 1)
        .map(([identifier, entries]) => ({ identifier, entries }))
    },
    async merge({ canonicalId, group, client = prisma }) {
      const idsToDelete = group.entries
        .filter(entry => entry.id !== canonicalId)
        .map(entry => entry.id)

      if (idsToDelete.length === 0) {
        return { deletedIds: [] }
      }

      await client.spell.deleteMany({ where: { id: { in: idsToDelete } } })
      return { deletedIds: idsToDelete }
    },
  },
}

function requireDuplicateHandler(model: AdminModelKey): AdminDuplicateHandler<any> {
  const handler = ADMIN_DUPLICATE_HANDLERS[model]
  if (!handler) {
    throw new UnsupportedDuplicateOperationError(
      `Duplicate merging is not supported for model "${model}".`,
    )
  }
  return handler
}

export function getAdminDelegate(model: AdminModelKey, client: PrismaClient = prisma) {
  return ADMIN_DELEGATE_MAP[model](client)
}

export function getAdminColumns(model: AdminModelKey): string[] {
  const cached = ADMIN_COLUMN_CACHE.get(model)
  if (cached) return cached

  const prismaModelName = getAdminModelMeta(model).prismaModel
  const prismaModel = Prisma.dmmf.datamodel.models.find(entry => entry.name === prismaModelName)
  if (!prismaModel) return []

  const columns = prismaModel.fields.map(field => field.name)
  ADMIN_COLUMN_CACHE.set(model, columns)
  return columns
}

export async function loadAdminDuplicateGroups(
  model: AdminModelKey,
  client: PrismaClient = prisma,
): Promise<DuplicateGroup[]> {
  const handler = requireDuplicateHandler(model)
  return handler.load(client)
}

export async function mergeAdminDuplicateGroup(
  model: AdminModelKey,
  canonicalId: number,
  group: DuplicateGroup,
  client: PrismaClient = prisma,
): Promise<{ deletedIds: number[] }> {
  const handler = requireDuplicateHandler(model)
  return handler.merge({ canonicalId, group, client })
}

export type ParseIdResult =
  | { ok: true; id: number }
  | { ok: false; error: string }

export function parseIdParam(value: string | null): ParseIdResult {
  if (!value) {
    return { ok: false, error: 'Missing entry ID.' }
  }

  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: 'Invalid entry ID.' }
  }

  return { ok: true, id }
}

export function buildAdminRedirectUrl(
  baseUrl: URL,
  status: 'success' | 'error',
  message: string,
  extraParams: Record<string, string | undefined> = {},
) {
  const url = new URL('/admin', baseUrl.origin)
  url.searchParams.set('status', status)
  url.searchParams.set('message', message)
  for (const [key, value] of Object.entries(extraParams)) {
    if (!value) continue
    url.searchParams.set(key, value)
  }
  return url
}

export function describePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return 'The requested entry could not be found.'
  }
  return 'An unexpected error occurred. Please try again.'
}
