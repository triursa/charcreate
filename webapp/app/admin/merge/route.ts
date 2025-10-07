import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildAdminRedirectUrl, describePrismaError, loadSpellDuplicates, parseIdParam } from '../helpers'

export async function POST(request: NextRequest) {
  const baseUrl = new URL(request.url)
  const idParam = parseIdParam(request.nextUrl.searchParams.get('id'))

  if (!idParam.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', idParam.error)
    return NextResponse.redirect(url, { status: 303 })
  }

  const rawName = request.nextUrl.searchParams.get('name')?.trim()

  if (!rawName) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', 'Missing entry name.')
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const duplicates = await loadSpellDuplicates()
    const match = duplicates.find(([name]) => name === rawName)

    if (!match) {
      const url = buildAdminRedirectUrl(baseUrl, 'error', `No duplicates found for ${rawName}.`)
      return NextResponse.redirect(url, { status: 303 })
    }

    const [name, entries] = match
    const canonical = entries.find(entry => entry.id === idParam.id)

    if (!canonical) {
      const url = buildAdminRedirectUrl(baseUrl, 'error', `Entry ${idParam.id} does not match ${name}.`)
      return NextResponse.redirect(url, { status: 303 })
    }

    const idsToDelete = entries.filter(entry => entry.id !== canonical.id).map(entry => entry.id)

    if (idsToDelete.length === 0) {
      const url = buildAdminRedirectUrl(baseUrl, 'error', `No additional duplicates to merge for ${name}.`)
      return NextResponse.redirect(url, { status: 303 })
    }

    await prisma.spell.deleteMany({ where: { id: { in: idsToDelete } } })

    const url = buildAdminRedirectUrl(baseUrl, 'success', `Merged ${idsToDelete.length + 1} entries for ${name}.`)
    return NextResponse.redirect(url, { status: 303 })
  } catch (error) {
    console.error('Failed to merge duplicates', error)
    const message = describePrismaError(error)
    const url = buildAdminRedirectUrl(baseUrl, 'error', message)
    return NextResponse.redirect(url, { status: 303 })
  }
}
