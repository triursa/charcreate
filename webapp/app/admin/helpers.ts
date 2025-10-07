import { Prisma, PrismaClient, Spell } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type DuplicateGroup = [string, Spell[]]

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

export function buildAdminRedirectUrl(baseUrl: URL, status: 'success' | 'error', message: string) {
  const url = new URL('/admin', baseUrl.origin)
  url.searchParams.set('status', status)
  url.searchParams.set('message', message)
  return url
}

export function describePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return 'The requested entry could not be found.'
  }
  return 'An unexpected error occurred. Please try again.'
}
