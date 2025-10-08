import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildAdminRedirectUrl,
  describePrismaError,
  loadAdminDuplicateGroups,
  mergeAdminDuplicateGroup,
  parseAdminModelParam,
  parseIdParam,
  UnsupportedDuplicateOperationError,
} from '../helpers'

export async function POST(request: NextRequest) {
  const baseUrl = new URL(request.url)
  const params = request.nextUrl.searchParams

  const modelResult = parseAdminModelParam(params.get('model'))
  const model = modelResult.ok ? modelResult.model : modelResult.fallback
  const modelMeta = modelResult.meta

  if (!modelResult.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', modelResult.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  const idResult = parseIdParam(params.get('id'))

  if (!idResult.ok) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', idResult.error, { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  const identifier = params.get('name')?.trim()

  if (!identifier) {
    const url = buildAdminRedirectUrl(baseUrl, 'error', 'Missing entry name.', { model })
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const duplicates = await loadAdminDuplicateGroups(model, prisma)
    const match = duplicates.find(group => group.identifier === identifier)

    if (!match) {
      const url = buildAdminRedirectUrl(baseUrl, 'error', `No duplicates found for ${identifier}.`, { model })
      return NextResponse.redirect(url, { status: 303 })
    }

    const canonical = match.entries.find(entry => entry.id === idResult.id)

    if (!canonical) {
      const url = buildAdminRedirectUrl(
        baseUrl,
        'error',
        `${modelMeta.singularLabel} ${idResult.id} does not match ${identifier}.`,
        { model },
      )
      return NextResponse.redirect(url, { status: 303 })
    }

    const { deletedIds } = await mergeAdminDuplicateGroup(model, canonical.id, match, prisma)

    if (deletedIds.length === 0) {
      const url = buildAdminRedirectUrl(
        baseUrl,
        'error',
        `No additional duplicates to merge for ${identifier}.`,
        { model },
      )
      return NextResponse.redirect(url, { status: 303 })
    }

    const url = buildAdminRedirectUrl(
      baseUrl,
      'success',
      `Merged ${deletedIds.length + 1} entries for ${identifier}.`,
      { model },
    )
    return NextResponse.redirect(url, { status: 303 })
  } catch (error) {
    if (error instanceof UnsupportedDuplicateOperationError) {
      const url = buildAdminRedirectUrl(
        baseUrl,
        'error',
        `Merging duplicates is not supported for ${modelMeta.label}.`,
        { model },
      )
      return NextResponse.redirect(url, { status: 303 })
    }

    console.error('Failed to merge duplicates', error)
    const message = describePrismaError(error)
    const url = buildAdminRedirectUrl(baseUrl, 'error', message, { model })
    return NextResponse.redirect(url, { status: 303 })
  }
}
