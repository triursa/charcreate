import { Prisma, PrismaClient, Spell } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type DuplicateGroup = [string, Spell[]]

export const ADMIN_MODELS = [
  { key: 'spell', label: 'Spells', singularLabel: 'Spell', prismaModel: 'Spell' },
  { key: 'race', label: 'Races', singularLabel: 'Race', prismaModel: 'Race' },
  { key: 'item', label: 'Items', singularLabel: 'Item', prismaModel: 'Item' },
  { key: 'background', label: 'Backgrounds', singularLabel: 'Background', prismaModel: 'Background' },
  { key: 'feat', label: 'Feats', singularLabel: 'Feat', prismaModel: 'Feat' },
  { key: 'class', label: 'Classes', singularLabel: 'Class', prismaModel: 'Class' },
] as const

export type AdminModelKey = typeof ADMIN_MODELS[number]['key']

const ADMIN_DELEGATE_MAP: Record<AdminModelKey, (client: PrismaClient) => any> = {
  spell: client => client.spell,
  race: client => client.race,
  item: client => client.item,
  background: client => client.background,
  feat: client => client.feat,
  class: client => client.class,
}

const ADMIN_COLUMN_CACHE = new Map<AdminModelKey, string[]>()

export function normalizeAdminModel(model: string | null | undefined): AdminModelKey {
  if (!model) return 'spell'
  const match = ADMIN_MODELS.find(option => option.key === model)
  return match ? match.key : 'spell'
}

export function getAdminDelegate(model: AdminModelKey, client: PrismaClient = prisma) {
  return ADMIN_DELEGATE_MAP[model](client)
}

export function getAdminColumns(model: AdminModelKey): string[] {
  const cached = ADMIN_COLUMN_CACHE.get(model)
  if (cached) return cached

  const prismaModelName = ADMIN_MODELS.find(option => option.key === model)?.prismaModel
  if (!prismaModelName) return []

  const prismaModel = Prisma.dmmf.datamodel.models.find(entry => entry.name === prismaModelName)
  if (!prismaModel) return []

  const columns = prismaModel.fields.map(field => field.name)
  ADMIN_COLUMN_CACHE.set(model, columns)
  return columns
}

export async function loadSpellDuplicates(client: PrismaClient = prisma): Promise<DuplicateGroup[]> {
  const allEntries = await client.spell.findMany()
  const grouped: Record<string, Spell[]> = {}

  for (const entry of allEntries) {
    if (!entry.name) continue
    if (!grouped[entry.name]) grouped[entry.name] = []
    grouped[entry.name].push(entry)
  }

  return Object.entries(grouped).filter(([, group]) => group.length > 1)
}

export type ParseIdResult =
  | { ok: true, id: number }
  | { ok: false, error: string }

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
